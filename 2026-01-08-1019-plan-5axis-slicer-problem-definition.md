<!--
MODEL: deepseek/deepseek-v3.2 (via PAL MCP chat tool) + claude-sonnet-4-5-20250929
TIMESTAMP: 2026-01-08T10:19:39+01:00
PROMPT_HASH: 5axis-fdm-slicer-problem-definition-rust-svelte
CONTEXT: Formal problem definition for building Rust+Svelte 5-axis FDM slicer with TCP
-->

# 5-Axis FDM Slicer: Formal Problem Definition & Technical Architecture

**Analysis Date:** 2026-01-08
**Models Used:** deepseek/deepseek-v3.2 (problem formulation), claude-sonnet-4-5-20250929 (synthesis)
**Target Stack:** Rust backend + Svelte frontend
**Target Machines:** Bambu Lab (locked), Modded Vorons (Klipper + TCP)

---

## 1. Formal Problem Statement

**Fundamental Architectural Gap in Current FDM Slicing Software:**

Current 3D printer slicers (Cura, PrusaSlicer, etc.) are fundamentally limited by their **2D planar slicing paradigm**, which discards essential 3D spatial information early in the pipeline, preventing true multi-axis toolpath generation. These systems:

1. **Treat the print head as a dimensionless point** rather than a spatially-aware tool with orientation
2. **Flatten geometry into independent 2D layers** after slicing, losing surface normal continuity and adjacency relationships
3. **Lack TCP (Tool Center Point) kinematics** for rotary axis coordination
4. **Cannot generate non-planar toolpaths** that follow complex surface geometry
5. **Output only linear XYZE G-code** with no support for rotary A/B/C axes

**Consequences:**
- Support structures required for geometries that could be printed support-free with proper orientation
- Weak layer-line anisotropy in mechanically critical directions
- Surface artifacts from stair-stepping on curved surfaces
- Inability to leverage the full potential of emerging 5-axis FDM hardware

---

## 2. Gap Analysis: Current State vs. Required State

### Current Implementations (From Previous Analysis):
```
Slicer6D:        Python, Good architecture, No TCP/5-axis
S3_DeformFDM:    C++, Production-grade, No TCP, Complex setup
S4_Slicer:       Python demo, 4-axis only, No TCP
fullcontrol:     Library, Explicit paths only, No traditional slicing
Fractal-Cortex:  Python, 5-axis architecture, TCP status unknown
```

### What Exists:
- ✅ **Planar slicing engines** (mature, optimized)
- ✅ **Mesh deformation** for reducing overhangs (S3/Slicer6D)
- ✅ **G-code generation** for 3-axis machines
- ✅ **Basic curved layer generation** (concept proven in S3)
- ✅ **Visualization frameworks** (PyVista in Slicer6D)

### What's Missing (Critical Gaps):

| Gap Category | Specific Missing Components |
|--------------|----------------------------|
| **Kinematics** | TCP module, forward/inverse kinematics, machine config system |
| **Safety** | Singularity detection/avoidance, collision detection |
| **Motion Control** | Feed rate compensation for rotary motion, synchronized axis control |
| **Calibration** | Machine geometry calibration, tool length compensation |
| **Information Architecture** | Preserved 3D spatial data throughout pipeline |

### Research Supporting This:

From **Neural Slicer** (arXiv 2404.15061v2):
- Demonstrates **representation-agnostic slicing** using neural networks
- Optimizes **local printing directions (LPDs)** via gradient-based loss
- Key insight: They optimize orientation fields directly, confirming the need to preserve spatial information

From **Rust Slicer Development** (hanjunyoung.com):
- Confirms Rust ecosystem viable for slicer development
- Highlights need for novel 5-axis algorithms (can't extend 3-axis slicers)

---

## 3. CNC Machine Concepts to Adopt

**CNC machining has solved multi-axis coordination for decades. Key concepts to adapt:**

### Kinematic Chains & TCP:

| Concept | CNC Definition | FDM Adaptation |
|---------|----------------|----------------|
| **TCP (Tool Center Point)** | Contact point between tool and workpiece | Nozzle tip deposition point + offset |
| **Forward Kinematics** | Joint positions → TCP position/orientation | Machine axes (X,Y,Z,A,C) → Nozzle pose |
| **Inverse Kinematics** | TCP position/orientation → Joint positions | Nozzle pose → Machine axes (X,Y,Z,A,C) |
| **WCS (Workpiece Coordinate System)** | Part geometry independent of machine | Model coordinates independent of kinematics |

### Motion Planning & Control:

**From CNC World:**
- ✅ **Singularity avoidance** - Detecting gimbal lock (A-axis near ±90°)
- ✅ **Feed rate optimization** - Constant surface speed along paths
- ✅ **Look-ahead algorithms** - Smoothing transitions between segments
- ✅ **Synchronized motion** - Coordinating linear + rotary axes

**FDM-Specific Additions:**
- 🔧 **Flow delay compensation** - Extruder pressure lag during direction changes
- 🔧 **Thermal compensation** - Temperature effects on flow rate
- 🔧 **Layer adhesion constraints** - Maximum orientation change between layers

### Machine Awareness:

```
CNC Standard Practices → FDM Adaptations:
├─ Soft limits → Axis travel boundaries + print bed boundaries
├─ Collision checking → Nozzle/heater block vs printed part
├─ Tool length comp → Nozzle geometry + hotend dimensions
└─ Kinematic calibration → Pivot point calibration for rotary axes
```

---

## 4. Information Architecture Pipeline

**CRITICAL:** Current slicers lose 3D information after Stage 2. We must preserve it through Stage 6.

### Information Flow Comparison:

**Traditional 3-Axis Slicer (Information Loss):**
```
STL Mesh (3D)
    ↓ [SLICE - Information Loss Point]
2D Polygons per Layer (independent, no adjacency)
    ↓
Toolpaths (X, Y per layer, Z layer height)
    ↓
G-code (X, Y, Z, E)
```

**Proposed 5-Axis Slicer (Information Preserved):**

### Stage 1: Input Processing
```
Input:     STL/3MF mesh + Machine configuration JSON
Preserve:  • Full mesh topology (vertex adjacency, face neighbors)
           • Surface normals at every vertex
           • Edge connectivity
           • Geometric features (sharp edges, holes)
Output:    Validated mesh + Kinematic model
Data:      Mesh (vertices, faces, normals) + MachineConfig struct
```

### Stage 2: Geometry Analysis *(Key divergence - preserve spatial data)*
```
Input:     Validated mesh + User objectives (support-free, strength, etc.)
Preserve:  • Surface curvature (Gaussian + mean curvature)
           • Critical features (bosses, ribs, mounting holes)
           • Stress directions (if strength optimization)
           • Original mesh topology
Compute:   • Overhang map (face angle vs build direction)
           • Optimal tool orientation field (quaternion per voxel)
           • Feature classification (what must stay vertical, etc.)
Output:    Oriented volume field + Feature map
Data:      VoxelGrid<Quaternion> + FeatureMap + OriginalMesh
```

### Stage 3: Layer Generation *(Non-planar layers)*
```
Input:     Oriented volume field
Preserve:  • Continuity between layers (tangent alignment)
           • Tool orientation transitions (gradual, no jumps)
           • Layer adjacency (which layer is above/below)
Compute:   • Isosurfaces of scalar field: G(x) = z_deformed(x)
           • Layer normal vectors from volume field
           • Layer-to-layer transition zones
Output:    Connected layer surfaces (not independent polygons)
Data:      Vec<LayerSurface> where LayerSurface {
               mesh: TriMesh,
               normals: Vec<Vec3>,
               above: Option<LayerID>,
               below: Option<LayerID>
           }
```

### Stage 4: Toolpath Generation
```
Input:     Connected layer surfaces
Preserve:  • Tool vector continuity along path
           • Surface contact constraint (nozzle perpendicular)
           • Deposition rate consistency
Compute:   • Offset curves on curved surfaces
           • Infill patterns following surface curvature
           • Transition paths between layers (gradual orientation change)
Output:    3D toolpath with orientation data
Data:      Vec<ToolpathSegment> where ToolpathSegment {
               points: Vec<Point3>,
               tool_vectors: Vec<Vec3>,  // ← CRITICAL: Not lost!
               feed_rates: Vec<f32>,
               extrusion_rates: Vec<f32>
           }
```

### Stage 5: Kinematic Transformation *(NEW - Missing in all current slicers)*
```
Input:     3D toolpath + Machine configuration
Preserve:  • Synchronized motion requirements
           • Singularity-free zones
           • Collision-free status
Compute:   • Inverse kinematics: (position, tool_vector) → (X, Y, Z, A, C)
           • Singularity detection (A near ±90°?)
           • Feed rate compensation (rotary motion affects TCP speed)
           • Collision swept volume checking
Output:    Machine coordinate stream
Data:      Vec<MachineState> where MachineState {
               axes: [X, Y, Z, A, C],
               feed: f32,
               extrude: f32,
               singularity_risk: f32,
               collision_free: bool
           }
```

### Stage 6: G-code Generation
```
Input:     Machine coordinate stream + Target firmware
Generate:  • Machine-specific G-code dialect
           • Post-processing (retraction, temperature, fans)
           • TCP compensation macros (Klipper)
           • Validation (axis limits, speed limits)
Output:    Validated G-code
Data:      String (G-code) + Metadata (print time, material, etc.)
```

---

## 5. TCP Problem: FDM Context vs CNC Context

### CNC Context (Established):
```
Tool:        Rigid, known length/diameter
TCP:         Offset from spindle by tool length
Workpiece:   Fixed relative to machine coordinates
Forces:      Cutting forces → rigidity requirements
Considerations: Coolant, chip clearance, tool deflection
```

### FDM Context (Unique Challenges):

| Challenge | Description | Impact on TCP |
|-----------|-------------|---------------|
| **Deposition Point ≠ Nozzle Tip** | Material extrudes slightly ahead of tip | TCP offset not constant (flow-dependent) |
| **Compliant System** | Filament has elasticity, bowden lag | Pressure advance needed, TCP moves during accel |
| **Thermal Effects** | Temperature affects viscosity | Flow rate varies, TCP effective position shifts |
| **Layer Adhesion** | Previous layer is soft during deposition | Can't treat as rigid workpiece |
| **Overhang Limits** | ~45° for FDM vs 90° for CNC | Orientation field must respect physics |
| **Speed Constraints** | Plastic flow rate limits | Lower speeds than CNC, different dynamics |

### TCP Compensation Models:

**CNC TCP (Established):**
```rust
struct CncTcp {
    tool_length: f32,           // Fixed
    tool_diameter: f32,         // Fixed
    spindle_offset: Vec3,       // Calibrated once
}

fn transform(tcp_pos: Vec3, tool_vec: Vec3) -> MachineAxes {
    // Simple geometric transform
    let pivot = tcp_pos + tool_vec * tool_length;
    inverse_kinematics(pivot, tool_vec)
}
```

**FDM TCP (Proposed):**
```rust
struct FdmTcp {
    nozzle_length: f32,              // Fixed
    nozzle_diameter: f32,            // Fixed
    hotend_offset: Vec3,             // Calibrated
    flow_delay_compensation: f32,    // Material-dependent
    thermal_expansion_coeff: f32,    // Temperature-dependent
    pressure_advance: f32,           // Tuned per material
}

fn transform(
    tcp_pos: Vec3,
    tool_vec: Vec3,
    feed_rate: f32,
    extrusion_rate: f32,
    temperature: f32
) -> MachineAxes {
    // Complex: accounts for flow dynamics
    let effective_offset = compute_dynamic_offset(
        flow_delay_compensation,
        feed_rate,
        extrusion_rate,
        temperature
    );
    let pivot = tcp_pos + tool_vec * (nozzle_length + effective_offset);
    let axes = inverse_kinematics(pivot, tool_vec);

    // Feed rate compensation for rotary motion
    let compensated_feed = compensate_feed_for_rotation(
        feed_rate, axes.a, axes.c
    );

    MachineAxes { ..axes, feed: compensated_feed }
}
```

---

## 6. Target Machine Constraints

### Bambu Lab Printers (Closed Firmware):

**Constraints:**
- ❌ G-code only interface (no direct machine control)
- ❌ Limited axis commands (likely X, Y, Z, E only - no A/C)
- ❌ Proprietary motion planning (firmware controls acceleration/jerk)
- ❌ No direct TCP control
- ❌ No real-time feedback/calibration

**Workaround Strategy:**
```
Simulation Approach (No physical rotary axes):
1. Pre-compute tool orientations into XYZ paths
2. "Simulate" TCP by tilting the entire coordinate system
3. Generate conservative toolpaths (avoid rapid orientation changes)
4. Rely on firmware for motion smoothing

Limitations:
- Cannot do true 5-axis (no rotary hardware)
- Can do non-planar paths on fixed orientation
- Essentially "3.5-axis" simulation
```

**Implementation Path for Bambu:**
```rust
// For Bambu: Generate non-planar 3-axis paths
fn generate_bambu_gcode(toolpath: Toolpath3D) -> String {
    // Approximate curved surfaces with dense XYZE moves
    // No A/C axes, but can follow non-planar layers
    let mut gcode = String::new();
    for segment in toolpath.segments {
        for point in segment.points {
            gcode.push_str(&format!(
                "G1 X{:.3} Y{:.3} Z{:.3} E{:.5} F{:.0}\n",
                point.x, point.y, point.z,
                compute_extrusion(point), segment.feed_rate
            ));
        }
    }
    gcode
}
```

### Modded Voron with Klipper (Open Firmware):

**Capabilities:**
- ✅ Direct axis control (X, Y, Z, A, C, E)
- ✅ Custom macros for kinematic transformations
- ✅ Real-time tuning/calibration
- ✅ Collision detection possible in firmware
- ✅ Synchronized axis motion

**Implementation Strategy:**
```
Native 5-Axis Approach:
1. Generate tool-agnostic paths (position + orientation)
2. Implement TCP in Klipper macros (Python/C++)
3. Let firmware handle kinematic transformation
4. Enable real-time feed rate compensation

Advantages:
- True 5-axis printing
- Real-time adjustments possible
- Full control over kinematics
```

**Implementation Path for Klipper:**
```python
# Klipper macro for TCP transformation
[gcode_macro TCP_MOVE]
gcode:
    {% set x = params.X|float %}
    {% set y = params.Y|float %}
    {% set z = params.Z|float %}
    {% set tx = params.TX|float %}  # Tool vector X
    {% set ty = params.TY|float %}  # Tool vector Y
    {% set tz = params.TZ|float %}  # Tool vector Z

    # Inverse kinematics
    {% set a = atan2(tz, sqrt(tx**2 + ty**2)) %}
    {% set c = atan2(-ty, tx) %}

    # Tool offset compensation
    {% set tool_length = printer.configfile.settings.tool.length %}
    {% set pivot_x = x + tx * tool_length %}
    {% set pivot_y = y + ty * tool_length %}
    {% set pivot_z = z + tz * tool_length %}

    # Move to computed position
    G1 X{pivot_x} Y{pivot_y} Z{pivot_z} A{a} C{c}
```

### Machine Geometry Types:

**1. Tilting Bed (A-axis rotation):**
```
Pros:
✅ Simple head design (standard 3-axis gantry)
✅ Good for large parts
✅ Lower cost (only one rotary axis typically)

Cons:
❌ Bed motion affects already-printed layers
❌ Part must be balanced on bed
❌ Limited by bed size/weight
```

**2. Tilting Head (A/C axes on head):**
```
Pros:
✅ Stable bed (printed part doesn't move)
✅ Precise orientation control
✅ No part size/weight limits from rotation

Cons:
❌ Complex head design (add weight to gantry)
❌ Cable management challenges
❌ Reduced print volume (rotary mechanism takes space)
```

**3. Trunnion Table (A/B axes on bed):**
```
Pros:
✅ Common in CNC (proven concept)
✅ Good for complex geometries

Cons:
❌ Rare in FDM
❌ Expensive
❌ Not a priority for MVP
```

---

## 7. Research Areas Requiring Investigation

### High Priority (Block MVP):

#### 1. FDM-Specific TCP Models
**Question:** Where is the actual deposition point relative to nozzle tip?
- Experimental measurement needed
- Varies with:
  - Flow rate (volumetric extrusion)
  - Temperature (material viscosity)
  - Nozzle diameter
  - Material (PLA vs ABS vs PETG)

**Research Tasks:**
- [ ] Design experiment: Print known geometry, measure actual vs expected
- [ ] Build model: `tcp_offset = f(flow_rate, temp, nozzle_dia, material)`
- [ ] Validate across materials

#### 2. Singularity Handling for FDM
**Question:** How fast can we change orientation without breaking layer adhesion?
- CNC can stop and reorient instantly
- FDM must maintain continuous deposition

**Research Tasks:**
- [ ] Identify acceptable orientation change rates
- [ ] Path reparameterization strategies near singularities
- [ ] Fallback strategies when avoidance isn't possible

#### 3. Collision Detection for FDM Nozzles
**Question:** How to model nozzle + hotend + cooling fans geometry?
- More complex than CNC tool (just cylinder)
- Must account for:
  - Heater block shape
  - Cooling fan shroud
  - Part cooling ducts
  - Probe (if attached)

**Research Tasks:**
- [ ] Create collision mesh library for common hotends
- [ ] Swept volume calculation during rotary motion
- [ ] Real-time vs pre-computed collision checking trade-offs

### Medium Priority (Post-MVP):

#### 4. Feed Rate Compensation
**Goal:** Maintain consistent volumetric flow during rotary motion

**Equations to Implement:**
```
For pure rotation at A-axis:
v_tcp = v_linear + (ω_a × r_tool)

For combined X/Y/A motion:
v_tcp = v_xyz + (ω_a × r_tool) + (ω_c × r_tool)

Volumetric flow rate:
Q = π * (d_nozzle/2)² * v_tcp * layer_height

Feed rate compensation:
F_compensated = F_desired * (|v_tcp_actual| / |v_tcp_ideal|)
```

**Research Tasks:**
- [ ] Validate compensation model with test prints
- [ ] Measure extruder acceleration limits during orientation changes
- [ ] Pressure advance tuning for non-linear paths

#### 5. Multi-Machine Calibration
**Goal:** Generic calibration procedures for any 5-axis machine

**Research Tasks:**
- [ ] Automatic pivot point detection (where does A-axis rotate?)
- [ ] Tool length measurement procedures
- [ ] Machine-specific error compensation models
- [ ] Closed-loop feedback integration (where available)

### Innovation Opportunities (Research Contributions):

#### 6. Adaptive Slicing with Real-Time Feedback
**Concept:** Use computer vision to adjust toolpaths during printing

**Potential Features:**
- Layer height adjustment based on observed adhesion quality
- Orientation optimization based on actual vs predicted geometry
- Defect detection and correction mid-print

#### 7. Hybrid NN + Explicit Kinematics
**Concept:** Combine Neural Slicer's optimization with explicit TCP

**Advantages:**
- Neural networks optimize orientation field (support-free, strength)
- Explicit kinematics ensure precise TCP transformation
- Best of both worlds: optimization + accuracy

**Implementation Sketch:**
```
1. NN optimizes quaternion field for objectives
2. Extract layer surfaces from optimized field
3. Generate toolpaths following optimized orientations
4. Apply explicit TCP kinematics for machine commands
5. Validate with collision detection
```

---

## 8. Recommended Implementation Roadmap

### Phase 1: Core Infrastructure (Weeks 1-4)

**Rust Backend:**
```rust
// Core data structures
pub struct Mesh {
    vertices: Vec<Vec3>,
    faces: Vec<Face>,
    normals: Vec<Vec3>,
    adjacency: AdjacencyGraph,
}

pub struct VolumeField {
    voxels: Grid3D<Quaternion>,
    resolution: Vec3,
    bounds: BoundingBox,
}

pub struct LayerSurface {
    mesh: TriMesh,
    normals: Vec<Vec3>,
    above: Option<LayerID>,
    below: Option<LayerID>,
}

pub struct ToolpathSegment {
    points: Vec<Point3>,
    tool_vectors: Vec<Vec3>,
    feed_rates: Vec<f32>,
    extrusion_rates: Vec<f32>,
}

pub struct MachineConfig {
    kinematics: KinematicType,  // TiltingBed, TiltingHead
    axes: AxisLimits,
    tool: ToolGeometry,
    tcp_model: TcpModel,
}
```

**Week 1: Mesh Processing**
- [ ] STL/3MF parsing (use existing crate: `stl_io`, `threeread`)
- [ ] Mesh validation (manifold check, orientation)
- [ ] Normal computation and adjacency graph
- [ ] Feature detection (sharp edges, holes)

**Week 2: Geometry Analysis**
- [ ] Voxelization (use `voxelate` or custom)
- [ ] Overhang detection
- [ ] Basic orientation field (constant orientation first)
- [ ] Visualization export (for debugging)

**Week 3: Layer Generation**
- [ ] Planar slicing first (prove pipeline works)
- [ ] Isosurface extraction (marching cubes)
- [ ] Layer connectivity tracking
- [ ] Non-planar layer generation (after planar works)

**Week 4: Toolpath Generation**
- [ ] Offset curve computation on surfaces
- [ ] Perimeter generation
- [ ] Simple infill (line pattern first)
- [ ] Transition path planning between layers

### Phase 2: TCP Kinematics (Weeks 5-8)

**Week 5: Forward/Inverse Kinematics**
```rust
pub trait Kinematics {
    fn forward(&self, axes: MachineAxes) -> (Point3, Vec3);
    fn inverse(&self, pos: Point3, tool_vec: Vec3) -> MachineAxes;
}

pub struct TiltingBedKinematics {
    bed_pivot: Point3,
    tool_length: f32,
}

impl Kinematics for TiltingBedKinematics {
    fn inverse(&self, pos: Point3, tool_vec: Vec3) -> MachineAxes {
        // From your TCP guide:
        let a_rad = f32::atan2(tool_vec.z,
                              f32::sqrt(tool_vec.x.powi(2) + tool_vec.y.powi(2)));
        let c_rad = f32::atan2(-tool_vec.y, tool_vec.x);

        // Tool offset compensation
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

**Week 6: Singularity Detection**
```rust
pub fn detect_singularity(a_deg: f32, threshold: f32) -> SingularityRisk {
    let a_abs = a_deg.abs();
    if (a_abs - 90.0).abs() < threshold {
        SingularityRisk::Critical
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
    // Reparameterize path near singularities
    // Strategy: Add intermediate orientations to go "around" singularity
}
```

**Week 7: Feed Rate Compensation**
```rust
pub fn compensate_feedrate(
    nominal_feed: f32,
    axes: MachineAxes,
    prev_axes: MachineAxes,
    dt: f32,
    config: &MachineConfig
) -> f32 {
    // Angular velocity of rotary axes
    let omega_a = (axes.a - prev_axes.a).to_radians() / dt;
    let omega_c = (axes.c - prev_axes.c).to_radians() / dt;

    // TCP velocity contribution from rotation
    let v_rotational = compute_rotational_velocity(
        omega_a, omega_c, config.tool.length
    );

    // Compensate to maintain constant TCP velocity
    nominal_feed * (1.0 + v_rotational / nominal_feed)
}
```

**Week 8: Integration + Testing**
- [ ] Connect kinematics to toolpath generation
- [ ] LinuxCNC simulation validation
- [ ] Unit tests for edge cases
- [ ] Benchmark performance

### Phase 3: Svelte Frontend (Weeks 9-12)

**Week 9: Basic UI**
- [ ] File upload (STL/3MF)
- [ ] Machine configuration editor
- [ ] Slicing parameter controls
- [ ] Progress indicators

**Week 10: 3D Visualization**
- [ ] Three.js integration (use `threlte` for Svelte)
- [ ] Mesh display
- [ ] Layer preview
- [ ] Toolpath visualization with orientation arrows

**Week 11: Advanced Features**
- [ ] Orientation field visualization (quaternion field as arrows)
- [ ] Collision detection visualization (highlight problem areas)
- [ ] G-code preview with simulation
- [ ] Print time estimation

**Week 12: Polish**
- [ ] Save/load project files
- [ ] Export G-code with metadata
- [ ] User documentation
- [ ] Example models/presets

### Phase 4: Production Hardening (Weeks 13-16)

**Week 13: Collision Detection**
```rust
pub struct CollisionChecker {
    nozzle_mesh: TriMesh,
    part_voxels: SpatialHash,
}

impl CollisionChecker {
    pub fn check_path(&self, toolpath: &ToolpathSegment) -> Vec<Collision> {
        // Swept volume checking
        let mut collisions = Vec::new();
        for (i, state) in toolpath.to_machine_states().enumerate() {
            if self.intersects_part(&state) {
                collisions.push(Collision { index: i, severity: High });
            }
        }
        collisions
    }
}
```

**Week 14: Calibration Procedures**
- [ ] Pivot point calibration wizard
- [ ] Tool length measurement
- [ ] Test print generation (calibration cube)
- [ ] Error compensation models

**Week 15: G-code Generation**
```rust
pub trait GcodeGenerator {
    fn generate(&self, toolpath: &ToolpathSegment) -> String;
}

pub struct KlipperGenerator {
    use_tcp_macros: bool,
}

impl GcodeGenerator for KlipperGenerator {
    fn generate(&self, toolpath: &ToolpathSegment) -> String {
        if self.use_tcp_macros {
            // Use TCP_MOVE macro
            toolpath.segments.iter().map(|seg| {
                format!("TCP_MOVE X{} Y{} Z{} TX{} TY{} TZ{}\n",
                        seg.pos.x, seg.pos.y, seg.pos.z,
                        seg.tool_vec.x, seg.tool_vec.y, seg.tool_vec.z)
            }).collect()
        } else {
            // Pre-compute kinematics, output X Y Z A C directly
            // ...
        }
    }
}

pub struct BambuGenerator;  // 3-axis only

impl GcodeGenerator for BambuGenerator {
    fn generate(&self, toolpath: &ToolpathSegment) -> String {
        // Dense XYZE moves, no A/C axes
        // ...
    }
}
```

**Week 16: Testing + Documentation**
- [ ] Hardware validation (Fractal-5-Pro or similar)
- [ ] Test prints with different materials
- [ ] User guide
- [ ] Developer documentation
- [ ] Open source release

---

## 9. Immediate Next Steps

### This Week:

1. **Set up Rust project structure:**
```bash
cargo new slicercore --lib
cd slicercore
cargo add nalgebra  # Linear algebra (Vec3, Quaternion, etc.)
cargo add stl_io    # STL parsing
cargo add serde     # Serialization for config files
cargo add rayon     # Parallelization
```

2. **Define core data structures:**
```rust
// slicercore/src/lib.rs
pub mod mesh;
pub mod volume;
pub mod layer;
pub mod toolpath;
pub mod kinematics;
pub mod gcode;

// Start with mesh module
```

3. **Set up Svelte frontend:**
```bash
npm create vite@latest slicer-ui -- --template svelte-ts
cd slicer-ui
npm install three @threlte/core @threlte/extras
```

4. **Create machine configuration schema:**
```json
{
  "machine": {
    "name": "Modded Voron 2.4 with Tilting Bed",
    "kinematics": "tilting_bed",
    "axes": {
      "x": { "min": 0, "max": 350, "max_speed": 300 },
      "y": { "min": 0, "max": 350, "max_speed": 300 },
      "z": { "min": 0, "max": 300, "max_speed": 10 },
      "a": { "min": -45, "max": 45, "max_speed": 30 },
      "c": { "min": -180, "max": 180, "max_speed": 60 }
    },
    "tool": {
      "length": 50.0,
      "diameter": 0.4,
      "hotend_model": "E3D Revo",
      "cooling_shroud": "custom_tilting_bed.stl"
    },
    "tcp_model": {
      "flow_delay_ms": 20,
      "thermal_expansion_coeff": 0.0001,
      "pressure_advance": 0.05
    }
  }
}
```

### Decision Points (User Input Needed):

1. **TCP Implementation Approach:**
   - **Option A:** Quaternion-based (S3 paper approach) - Better for optimization
   - **Option B:** Denavit-Hartenberg parameterization - Standard robotics approach
   - **Recommendation:** Start with B (simpler), add A if optimization needed

2. **Initial Hardware Target:**
   - **Option A:** Tilting bed (simpler, safer for MVP)
   - **Option B:** Tilting head (more complex, better for production)
   - **Recommendation:** Start with A (tilting bed)

3. **TCP Integration Depth:**
   - **Option A:** Post-processing module (toolpath → kinematics → G-code)
   - **Option B:** Deep integration (orientation field → TCP-aware slicing)
   - **Recommendation:** Start with A (cleaner separation), migrate to B

4. **Research Focus:**
   - **Critical Path:** FDM-specific TCP models (experimental validation needed)
   - **Parallel Track:** Collision detection (safety requirement)
   - **Future:** Adaptive slicing with feedback (innovation)

---

## 10. Success Criteria

### MVP (16 weeks):
- [ ] Slices STL files into non-planar layers
- [ ] Generates 5-axis toolpaths with orientation data
- [ ] Transforms toolpaths via TCP kinematics
- [ ] Outputs validated G-code for Klipper
- [ ] Detects singularities and warns user
- [ ] Basic collision detection
- [ ] 3D visualization of toolpaths

### Production (24 weeks):
- [ ] All MVP features +
- [ ] Supports multiple machine configurations
- [ ] Automatic calibration procedures
- [ ] Feed rate compensation working
- [ ] Real-time collision avoidance
- [ ] Material-specific TCP models
- [ ] Bambu Lab support (3.5-axis)
- [ ] Community-contributed machine profiles

### Research Contributions:
- [ ] Published paper on FDM-specific TCP models
- [ ] Open-source Rust libraries for 5-axis kinematics
- [ ] Benchmark comparison vs existing slicers
- [ ] Hardware validation on 3+ different machines

---

## Related Permanent Documentation

For ongoing work, distill findings into:
- **Architecture:** `docs/architecture/information-pipeline.md`
- **TCP Implementation:** `docs/technical/tcp-kinematics.md`
- **Machine Profiles:** `docs/machines/` (per-machine JSON + docs)
- **Research:** `docs/research/gaps-and-investigations.md`

---

**END OF PROBLEM DEFINITION**

**Next Actions:**
1. Review this document and provide feedback
2. Make decision on the 4 decision points above
3. Set up Rust + Svelte projects
4. Begin Phase 1, Week 1: Mesh processing module
