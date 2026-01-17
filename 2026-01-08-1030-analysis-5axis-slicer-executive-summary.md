<!--
MODEL: deepseek/deepseek-v3.2 + claude-sonnet-4-5-20250929
TIMESTAMP: 2026-01-08T10:30:18+01:00
PROMPT_HASH: executive-summary-5axis-tcp-slicer-rust-svelte
CONTEXT: Executive summary of problem definition and implementation strategy
-->

# 5-Axis FDM Slicer - Executive Summary & Action Plan

**Date:** 2026-01-08
**Target Stack:** Rust backend + Svelte frontend
**Target Machines:** Bambu Lab (locked), Modded Vorons (Klipper + TCP)
**Full Problem Definition:** See `2026-01-08-1019-plan-5axis-slicer-problem-definition.md`

---

## The Core Problem (One Sentence)

**Current 3D printer slicers discard 3D spatial information after slicing, treating the print head as a dimensionless point rather than a spatially-aware tool with orientation, making true multi-axis printing impossible.**

---

## What's Broken in Current Slicers

### Information Loss Pipeline:
```
STL Mesh (3D)
    ↓
[SLICE] ← ❌ INFORMATION LOSS POINT
    ↓
2D Polygons (independent layers, no adjacency)
    ↓
Toolpaths (X, Y per layer)
    ↓
G-code (X, Y, Z, E only)
```

### Specific Problems:
1. **Lost:** Surface normals, curvature, feature adjacency
2. **Result:** No tool orientation data
3. **Consequence:** Cannot output A/B/C axis commands
4. **Limitation:** Cannot do non-planar or multi-axis printing

---

## What We're Building

### Preserved Information Pipeline:
```
STL Mesh (3D)
    ↓
Geometry Analysis (preserve normals, curvature, features)
    ↓
Curved Layer Generation (preserve layer connectivity)
    ↓
Toolpath with Orientation (preserve tool vectors)
    ↓
[NEW] TCP Kinematics Transform ← The Missing Piece
    ↓
Machine Coordinates (X, Y, Z, A, C)
    ↓
G-code (full 5-axis or simulated for Bambu)
```

### Key Innovation:
**Preserve 3D spatial data throughout the entire pipeline** + **Add TCP kinematics module from CNC world**

---

## Critical Gaps We Must Fill

| Gap | What's Missing | Why It Matters |
|-----|----------------|----------------|
| **1. TCP Kinematics** | Transform (position + orientation) → machine axes | Can't generate 5-axis G-code without it |
| **2. Information Preservation** | Keep normals, adjacency, curvature through pipeline | Current slicers flatten to 2D too early |
| **3. Singularity Handling** | Detect/avoid gimbal lock during orientation changes | FDM needs gradual changes (layer adhesion) |
| **4. Feed Rate Compensation** | Adjust speed for rotary motion | Rotary axes affect TCP velocity |
| **5. FDM-Specific TCP Model** | Deposition point ≠ nozzle tip (flow-dependent) | CNC TCP models don't account for extrusion |
| **6. Collision Detection** | Nozzle + hotend vs printed part | Safety requirement for 5-axis |

---

## What CNC Machines Already Do (That We Need)

### From 50+ Years of CNC Development:

| CNC Concept | FDM Adaptation |
|-------------|----------------|
| **TCP (Tool Center Point)** | Nozzle tip deposition point + flow offset |
| **Forward/Inverse Kinematics** | (X,Y,Z,A,C) ↔ (position, orientation) |
| **Singularity Avoidance** | Detect A-axis near ±90° (gimbal lock) |
| **Feed Rate Compensation** | Maintain constant TCP velocity during rotation |
| **Machine Configuration System** | Separate part geometry from machine kinematics |
| **Calibration Procedures** | Align software model to physical machine |

### Key Insight:
**CNC has solved multi-axis coordination for decades. We just need to adapt it for FDM's unique constraints (compliant material, thermal effects, layer adhesion).**

---

## Target Machine Strategies

### Bambu Lab (Closed Firmware):
```
Reality Check:
❌ No rotary axes available (locked hardware)
❌ G-code only interface
❌ No A/C axis commands accepted

Workaround - "3.5-axis" Mode:
✅ Generate non-planar paths on fixed orientation
✅ Dense XYZE moves following curved surfaces
✅ Simulate orientation changes via coordinate system tilting
✅ Conservative toolpaths (rely on firmware smoothing)

Limitations:
- Not true 5-axis (no physical rotation)
- Can do non-planar layers
- Better than planar, not as good as true 5-axis
```

### Modded Voron with Klipper:
```
Reality Check:
✅ Can add rotary axes (A/C hardware)
✅ Open firmware (full control)
✅ Custom macros possible

Implementation - True 5-axis:
✅ Generate tool-agnostic paths (position + orientation)
✅ Implement TCP in Klipper macros (Python/C++)
✅ Let firmware handle kinematic transformation
✅ Real-time feed rate compensation
✅ Full X Y Z A C E output

Advantages:
- True 5-axis printing
- Real-time adjustments
- Full collision detection possible
```

---

## 16-Week Implementation Roadmap

### Phase 1: Core Infrastructure (Weeks 1-4) - Rust Backend

**Week 1: Mesh Processing**
- STL/3MF parsing (`stl_io` crate)
- Mesh validation (manifold check)
- Normal computation + adjacency graph
- Feature detection (edges, holes)

**Week 2: Geometry Analysis**
- Voxelization
- Overhang detection
- Basic orientation field (constant first)
- Debug visualization export

**Week 3: Layer Generation**
- Planar slicing (prove pipeline works)
- Isosurface extraction (marching cubes)
- Layer connectivity tracking
- Non-planar layers (after planar validated)

**Week 4: Toolpath Generation**
- Offset curves on surfaces
- Perimeter generation
- Simple line infill
- Layer transition planning

---

### Phase 2: TCP Kinematics (Weeks 5-8) - The Critical Module

**Week 5: Forward/Inverse Kinematics**
```rust
pub trait Kinematics {
    fn inverse(&self, pos: Point3, tool_vec: Vec3) -> MachineAxes;
    fn forward(&self, axes: MachineAxes) -> (Point3, Vec3);
}

// From your TCP implementation guide:
pub struct TiltingBedKinematics {
    bed_pivot: Point3,
    tool_length: f32,
}

impl Kinematics for TiltingBedKinematics {
    fn inverse(&self, pos: Point3, tool_vec: Vec3) -> MachineAxes {
        let a_rad = f32::atan2(tool_vec.z,
                              (tool_vec.x.powi(2) + tool_vec.y.powi(2)).sqrt());
        let c_rad = f32::atan2(-tool_vec.y, tool_vec.x);

        let pivot = pos + tool_vec * self.tool_length;

        MachineAxes {
            x: pivot.x,
            y: pivot.y,
            z: pivot.z - self.bed_pivot.z,
            a: a_rad.to_degrees(),
            c: c_rad.to_degrees(),
        }
    }
}
```

**Week 6: Singularity Detection + Avoidance**
```rust
pub enum SingularityRisk { Safe, Warning, Critical }

pub fn detect_singularity(a_deg: f32, threshold: f32) -> SingularityRisk {
    let a_abs = a_deg.abs();
    if (a_abs - 90.0).abs() < threshold {
        SingularityRisk::Critical  // Near gimbal lock
    } else if (a_abs - 90.0).abs() < threshold * 2.0 {
        SingularityRisk::Warning
    } else {
        SingularityRisk::Safe
    }
}

pub fn avoid_singularity(
    toolpath: &mut ToolpathSegment,
    config: &MachineConfig
) {
    // Strategy: Reparameterize path to go "around" singularity
    // Add intermediate orientations if needed
}
```

**Week 7: Feed Rate Compensation**
```rust
pub fn compensate_feedrate(
    nominal_feed: f32,
    axes: MachineAxes,
    prev_axes: MachineAxes,
    dt: f32,
    tool_length: f32
) -> f32 {
    // Angular velocities
    let omega_a = (axes.a - prev_axes.a).to_radians() / dt;
    let omega_c = (axes.c - prev_axes.c).to_radians() / dt;

    // TCP velocity from rotation: v = ω × r
    let v_rot = compute_rotational_velocity(omega_a, omega_c, tool_length);

    // Compensate to maintain constant TCP velocity
    nominal_feed * (1.0 + v_rot / nominal_feed)
}
```

**Week 8: Integration + Testing**
- Connect kinematics to toolpath pipeline
- LinuxCNC simulation validation
- Unit tests (edge cases, singularities)
- Performance benchmarking

---

### Phase 3: Svelte Frontend (Weeks 9-12)

**Week 9: Basic UI**
- File upload (STL/3MF drag-and-drop)
- Machine configuration editor (JSON)
- Slicing parameters (layer height, etc.)
- Progress indicators

**Week 10: 3D Visualization**
- Three.js integration (`threlte` for Svelte)
- Mesh display with normals
- Layer preview (scrub through layers)
- Toolpath visualization with orientation arrows

**Week 11: Advanced Features**
- Orientation field visualization (quaternion field as vector field)
- Collision detection highlights (red zones)
- G-code preview with path simulation
- Print time + material estimation

**Week 12: Polish**
- Save/load project files (.json)
- Export G-code with metadata
- User documentation (tooltips, help)
- Example models + machine presets

---

### Phase 4: Production Hardening (Weeks 13-16)

**Week 13: Collision Detection**
```rust
pub struct CollisionChecker {
    nozzle_mesh: TriMesh,      // Hotend + cooling geometry
    part_voxels: SpatialHash,  // Fast spatial queries
}

impl CollisionChecker {
    pub fn check_path(&self, toolpath: &ToolpathSegment) -> Vec<Collision> {
        let mut collisions = Vec::new();

        // Swept volume checking
        for (i, state) in toolpath.to_machine_states().enumerate() {
            if self.intersects_part(&state) {
                collisions.push(Collision {
                    index: i,
                    severity: Severity::High
                });
            }
        }

        collisions
    }
}
```

**Week 14: Calibration Procedures**
- Pivot point calibration wizard
- Tool length measurement (touch-off)
- Test print generation (calibration cube)
- Error compensation models

**Week 15: G-code Generation**
```rust
pub trait GcodeGenerator {
    fn generate(&self, toolpath: &ToolpathSegment) -> String;
}

// For Klipper (true 5-axis)
pub struct KlipperGenerator {
    use_tcp_macros: bool,
}

impl GcodeGenerator for KlipperGenerator {
    fn generate(&self, toolpath: &ToolpathSegment) -> String {
        if self.use_tcp_macros {
            // Use custom TCP_MOVE macro
            format!("TCP_MOVE X{} Y{} Z{} TX{} TY{} TZ{}\n", ...)
        } else {
            // Pre-compute kinematics, output X Y Z A C
            let axes = self.kinematics.inverse(pos, tool_vec);
            format!("G1 X{} Y{} Z{} A{} C{} E{} F{}\n", ...)
        }
    }
}

// For Bambu (3.5-axis simulation)
pub struct BambuGenerator;

impl GcodeGenerator for BambuGenerator {
    fn generate(&self, toolpath: &ToolpathSegment) -> String {
        // Dense XYZE moves, no A/C
        // Approximate curved surfaces with many small segments
        format!("G1 X{} Y{} Z{} E{} F{}\n", ...)
    }
}
```

**Week 16: Testing + Documentation**
- Hardware validation (test on real 5-axis printer)
- Test prints (different materials, geometries)
- User guide (getting started, troubleshooting)
- Developer docs (architecture, APIs)
- Open source release (GitHub, MIT/Apache-2.0)

---

## Critical Research Areas (Parallel to Development)

### High Priority (Blocks MVP):

#### 1. FDM-Specific TCP Models
**Question:** Where is the actual deposition point?

**Why It Matters:**
- CNC: TCP = tool tip (rigid contact)
- FDM: TCP = deposition point (varies with flow, temp)

**Research Needed:**
```
Experiment: Print calibration test at various:
- Flow rates (90%, 100%, 110%)
- Temperatures (190°C, 210°C, 230°C)
- Speeds (20mm/s, 50mm/s, 100mm/s)

Measure: Actual vs expected deposition point offset
Build model: tcp_offset = f(flow, temp, speed, material)
Validate: Print complex geometry, measure accuracy
```

#### 2. Singularity Handling for FDM
**Question:** How fast can we change orientation without breaking adhesion?

**Why It Matters:**
- CNC: Can stop and reorient instantly
- FDM: Must maintain continuous deposition for layer adhesion

**Research Needed:**
```
Test: Print with varying orientation change rates
- 5°/sec, 10°/sec, 20°/sec, 50°/sec
- Different layer heights (0.1mm, 0.2mm, 0.3mm)

Observe: Layer adhesion quality, delamination
Find: Maximum safe orientation change rate
Implement: Path reparameterization near singularities
```

#### 3. Collision Detection Models
**Question:** How to model hotend geometry accurately?

**Why It Matters:**
- Nozzle is small, but heater block + fans are large
- Must account for full swept volume during rotation

**Research Needed:**
```
Create: 3D models of common hotends
- E3D Revo, V6, Volcano
- Dragon, Rapido
- BMG extruder geometries

Test: Collision checker accuracy
- Known collision scenarios
- False positive rate
- Performance (real-time vs pre-computed)
```

---

## 4 Critical Decisions Needed Now

### Decision 1: TCP Implementation Approach
**Options:**
- **A. Quaternion-based** (S3 paper approach) - Better for optimization
- **B. Denavit-Hartenberg** (standard robotics) - Standard, well-understood

**Recommendation:** **Start with B** (Denavit-Hartenberg)
- Simpler to implement and debug
- Standard robotics textbooks cover it
- Can add quaternion optimization later if needed

**Your choice:** _____________

---

### Decision 2: Initial Hardware Target
**Options:**
- **A. Tilting bed** (A-axis rotates bed) - Simpler, cheaper
- **B. Tilting head** (A/C axes on toolhead) - More complex, better performance

**Recommendation:** **Start with A** (Tilting bed)
- Lower cost (fewer rotary axes)
- Simpler kinematics (fewer degrees of freedom)
- Safer for MVP (printed part doesn't fall off)
- Can validate concepts before moving to B

**Your choice:** _____________

---

### Decision 3: TCP Integration Depth
**Options:**
- **A. Post-processing module** (toolpath → TCP → G-code)
- **B. Deep integration** (TCP-aware from geometry analysis stage)

**Recommendation:** **Start with A** (Post-processing)
- Clean separation of concerns
- Easier to test (can validate toolpaths before kinematics)
- Can swap kinematics models without changing slicing
- Migrate to B if optimization requires it

**Your choice:** _____________

---

### Decision 4: Research Focus Priority
**Areas:**
- **Critical:** FDM-specific TCP models (experimental validation)
- **Parallel:** Collision detection (safety requirement)
- **Future:** Adaptive slicing with computer vision feedback

**Recommendation:** **Critical + Parallel**
- Start TCP model experiments early (Week 1-2)
- Implement basic collision detection by Week 13
- Defer adaptive slicing to post-MVP

**Your choice:** _____________

---

## Immediate Next Steps (This Week)

### 1. Set Up Rust Project:
```bash
# Create core library
cargo new slicercore --lib
cd slicercore

# Add dependencies
cargo add nalgebra        # Vec3, Quaternion, Matrix math
cargo add stl_io          # STL parsing
cargo add serde           # JSON serialization
cargo add serde_json      # Config files
cargo add rayon           # Parallelization
cargo add thiserror       # Error handling

# Project structure
mkdir -p src/{mesh,volume,layer,toolpath,kinematics,gcode}
touch src/mesh/mod.rs
touch src/kinematics/mod.rs
# etc...
```

### 2. Set Up Svelte Frontend:
```bash
# Create UI
npm create vite@latest slicer-ui -- --template svelte-ts
cd slicer-ui

# Add dependencies
npm install three @threlte/core @threlte/extras
npm install @tauri-apps/api  # For Rust<->JS bridge

# Project structure
mkdir -p src/{components,lib,stores}
```

### 3. Define Core Data Structures (Rust):
```rust
// slicercore/src/lib.rs
pub mod mesh;
pub mod volume;
pub mod layer;
pub mod toolpath;
pub mod kinematics;
pub mod gcode;

// slicercore/src/mesh/mod.rs
use nalgebra::Vector3;

pub type Vec3 = Vector3<f32>;
pub type Face = [usize; 3];

pub struct Mesh {
    pub vertices: Vec<Vec3>,
    pub faces: Vec<Face>,
    pub normals: Vec<Vec3>,
}

impl Mesh {
    pub fn from_stl(path: &str) -> Result<Self, MeshError> {
        // Use stl_io crate
        todo!()
    }

    pub fn validate(&self) -> Result<(), MeshError> {
        // Check manifold, orientation, etc.
        todo!()
    }
}
```

### 4. Create Machine Configuration Schema:
```json
// machines/voron_tilting_bed.json
{
  "machine": {
    "name": "Voron 2.4 with Tilting Bed Mod",
    "kinematics": "tilting_bed",
    "firmware": "klipper",
    "tcp_support": true,
    "axes": {
      "x": { "min": 0.0, "max": 350.0, "max_speed": 300.0, "max_accel": 3000.0 },
      "y": { "min": 0.0, "max": 350.0, "max_speed": 300.0, "max_accel": 3000.0 },
      "z": { "min": 0.0, "max": 300.0, "max_speed": 10.0, "max_accel": 100.0 },
      "a": { "min": -45.0, "max": 45.0, "max_speed": 30.0, "max_accel": 50.0 },
      "c": { "min": -180.0, "max": 180.0, "max_speed": 60.0, "max_accel": 100.0 }
    },
    "tool": {
      "length": 50.0,
      "diameter": 0.4,
      "hotend_model": "E3D Revo Voron",
      "cooling_shroud_stl": "assets/revo_shroud.stl"
    },
    "tcp_model": {
      "flow_delay_ms": 20.0,
      "thermal_expansion_coeff": 0.0001,
      "pressure_advance": 0.05
    },
    "build_volume": {
      "x": 350.0,
      "y": 350.0,
      "z": 300.0
    }
  }
}
```

```json
// machines/bambu_x1c.json
{
  "machine": {
    "name": "Bambu Lab X1 Carbon",
    "kinematics": "cartesian",
    "firmware": "proprietary",
    "tcp_support": false,
    "axes": {
      "x": { "min": 0.0, "max": 256.0, "max_speed": 500.0, "max_accel": 10000.0 },
      "y": { "min": 0.0, "max": 256.0, "max_speed": 500.0, "max_accel": 10000.0 },
      "z": { "min": 0.0, "max": 256.0, "max_speed": 20.0, "max_accel": 500.0 }
    },
    "tool": {
      "length": 40.0,
      "diameter": 0.4,
      "hotend_model": "Bambu proprietary",
      "note": "No A/C axes - 3.5-axis simulation only"
    },
    "build_volume": {
      "x": 256.0,
      "y": 256.0,
      "z": 256.0
    }
  }
}
```

### 5. Begin Week 1 Development:
- [ ] Implement `Mesh::from_stl()` using `stl_io` crate
- [ ] Add mesh validation (manifold check, face orientation)
- [ ] Compute vertex normals (average face normals)
- [ ] Build adjacency graph (which faces share edges)
- [ ] Write unit tests for mesh operations
- [ ] Create debug export (OBJ format for visualization)

---

## Success Metrics

### MVP (16 weeks):
- ✅ Slices STL into non-planar layers
- ✅ Generates toolpaths with orientation data preserved
- ✅ Transforms via TCP kinematics
- ✅ Outputs Klipper G-code (X Y Z A C E)
- ✅ Detects singularities + warns user
- ✅ Basic collision detection (swept volume)
- ✅ 3D visualization with orientation vectors

### Production (24 weeks):
- ✅ All MVP features +
- ✅ Multiple machine profiles (Voron, Fractal-5-Pro, etc.)
- ✅ Automatic calibration procedures
- ✅ Feed rate compensation working
- ✅ Real-time collision avoidance
- ✅ Material-specific TCP models (PLA, ABS, PETG)
- ✅ Bambu support (3.5-axis simulation)
- ✅ Community machine profiles (GitHub contributions)

### Research Contributions:
- 📄 Published paper on FDM-specific TCP models
- 📦 Open-source Rust crates (kinematics, geometry)
- 📊 Benchmark comparison vs Cura/PrusaSlicer
- 🔬 Hardware validation (3+ different machines)

---

## Key Files Created

1. **Problem Definition (Full):**
   `2026-01-08-1019-plan-5axis-slicer-problem-definition.md` (16,000+ words)

2. **This Executive Summary:**
   `2026-01-08-1030-analysis-5axis-slicer-executive-summary.md`

3. **Previous TCP Technical Guide:**
   `C:\Users\Egusto\code\20260108-tcp-implementation-guide.md`

4. **Previous Codebase Analysis:**
   `2026-01-08-0949-analysis-slicerresearch-5axis-tcp-integration.md`

---

## Final Thoughts

### What Makes This Different:

**Current slicers** (Cura, PrusaSlicer):
- Think in 2D layers only
- Discard spatial information early
- Cannot do multi-axis

**Your slicer**:
- Think in 3D throughout pipeline
- Preserve all spatial data (normals, curvature, adjacency)
- Add TCP from CNC world
- Support both planar and non-planar
- Target both locked (Bambu) and open (Voron) machines

### The Path Forward:

1. ✅ **Problem is well-defined** (this document)
2. ⏭️ **Make the 4 decisions** (TCP approach, hardware target, etc.)
3. ⏭️ **Set up projects** (Rust + Svelte)
4. ⏭️ **Start Week 1** (Mesh processing in Rust)
5. ⏭️ **Iterate weekly** (16-week roadmap)

### You're Ready to Start Building!

---

**Next Actions:**
1. Review the 4 decision points above and provide your choices
2. Set up the Rust and Svelte projects
3. Begin Week 1: Mesh processing module
4. Start TCP model experiments (parallel research track)

Let's build the future of 5-axis FDM printing! 🚀
