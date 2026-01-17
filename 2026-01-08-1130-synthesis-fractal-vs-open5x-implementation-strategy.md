# Critical Discovery: Fractal-Cortex Existing Open-Source 5-Axis Slicer Analysis
**Date:** 2026-01-08
**Context:** Analysis of Fractal-5-Pro hardware + Fractal-Cortex slicer to inform Rust + Svelte implementation strategy

---

## 🚨 CRITICAL FINDING: Open-Source 5-Axis Slicer Already Exists

**Fractal-Cortex** (https://github.com/fractalrobotics/Fractal-Cortex) is an open-source multidirectional 5-axis FDM slicer released January 2025 by Dan Brogan (Fractal Robotics).

**This changes everything.** We can now:
1. Study a working implementation
2. Learn from its limitations (explicitly documented)
3. Build improvements in Rust + Svelte with better architecture
4. Collaborate with author (dan@fractalrobotics.com)

---

## 1. Fractal-Cortex Overview

### What It Is

**Multidirectional 5-axis slicing** - fundamentally different from non-planar:
- Divide 3D model into **sub-volumes (chunks)**
- Slice each chunk in a **different direction**
- Layers within each chunk are **planar** (not curved)
- Reorient part between chunks via A/B rotary axes

**Example:**
```
Model: Pipe fitting with overhangs
Chunk 1: Slice vertically (normal 3-axis, layers perpendicular to Z)
Chunk 2: Slice at 45° angle (rotate bed, then slice perpendicular to new "up" direction)
Chunk 3: Slice horizontally (90° bed tilt, then slice)
Result: No supports needed - always printing perpendicular to surface
```

### Tech Stack

```python
# System Requirements
OS: Windows 10
Python: 3.10.11

# Core Libraries
glooey==0.3.6         # GUI framework (built on pyglet)
numpy==1.26.4          # Numerical operations
numpy-stl==3.1.1       # STL file handling
pyglet==1.5.28         # OpenGL rendering
pyOpenGL==3.1.0        # 3D graphics
shapely==2.0.4         # 2D geometry operations
trimesh==4.3.1         # 3D mesh processing
```

### Key Features

✅ **Works:**
- 3-axis mode (backward compatible)
- 5-axis mode with user-defined slicing directions
- Interactive slice plane positioning (5 DOF: 3 position + 2 orientation)
- Collision detection (nozzle vs bed only)
- Automatic ordering of slicing directions (prevents nozzle-part collision)
- G-code preview visualization
- Multi-part support

❌ **Known Limitations (from author):**
- "Sometimes slicing calculations will encounter challenging geometry that halts the slicing process" (most important issue)
- Needs better error handling in `slicing_functions.py`
- Efficiency improvements needed (already parallelized)
- NO support generation (neither 3-axis nor 5-axis)
- Windows-only
- No TCP compensation (relies on firmware - but Fractal-5-Pro firmware doesn't have it either!)

---

## 2. Fractal-5-Pro Hardware

### Architecture

**Configuration: CoreXY + Gimbal Bed**
- **X/Y axes:** CoreXY gantry (VORON-inspired, 30x30mm extrusions)
- **Z axis:** 3× independent lead screws (VORON Trident-style)
- **A axis (Stepper A):** Spins bed infinitely (slip ring for power)
- **B axis (Stepper B):** Tilts bed ±90° (large gear drive)

**Build Volume:**
- 300mm diameter × 250mm height
- Circular build surface (magnetically removable PEI spring steel)

**Cost:**
- $1,900 BOM (excluding taxes/shipping)
- Affordable for makers and educators

### Klipper Configuration

**Critical: Uses manual_stepper, NOT integrated kinematics!**

```python
[printer]
kinematics: corexy  # Only XYZ, NOT corexyab!
max_velocity: 300
max_accel: 3000

# X, Y, Z are standard steppers
[stepper_x]
# ... standard config ...

# A and B are MANUAL steppers (not part of kinematic chain)
[manual_stepper stepper_a]
step_pin: PC13
dir_pin: !PF0
microsteps: 32
rotation_distance: 90  # mm/rev (converts steps to degrees)
velocity: 10           # deg/s default
accel: 100             # deg/s² default

[manual_stepper stepper_b]
step_pin: PE2
dir_pin: PE3
microsteps: 16
rotation_distance: 24  # mm/rev
velocity: 20           # deg/s
accel: 100             # deg/s²
endstop_pin: !PG13     # B axis has limit switch, A does not
```

**Implications:**
- Firmware does NOT handle forward kinematics
- Slicer must generate pre-computed XYZE coordinates + explicit A/B moves
- NO TCP compensation in firmware
- NO feed rate adjustment for rotary motion
- Manual homing macro: `[gcode_macro home_ab]`

### Calibration Macros

**Complex diagonal centering procedure** (lines 305-1167 in printer.cfg):
- Uses inductive probe to find bed center via edge detection
- 4× diagonal approaches (FL, BR, FR, BL)
- Compensates for probe offset and sensor radii
- **Author notes:** "inductive probe is not ideal for this application because of its difficult to characterize electromagnetic field shape"

**Recommended alternative:** Use sensor with better-defined sensing radii

---

## 3. Comparison: Open5x vs Fractal

### Hardware Comparison

| Aspect | Open5x (Jubilee) | Fractal-5-Pro |
|--------|------------------|---------------|
| **Base Platform** | Retrofit existing printers (Prusa, Voron, Jubilee) | Purpose-built from scratch |
| **Cost** | Variable (uses existing printer + $300-500 parts) | $1,900 complete BOM |
| **CoreXY** | Depends on base printer | Yes (VORON-inspired) |
| **Rotary Config** | B/C (tilt forward-back / spin) | A/B (spin / tilt) |
| **Axis Naming** | B = tilt, C = spin | A = spin, B = tilt |
| **A/C Limits** | B: ±200°, C: unlimited | A: unlimited (slip ring), B: ±90° (limit switch) |
| **Z-Leveling** | 2-point (front screws only) | 3-point (VORON Trident style) |
| **Build Surface** | Various (heated or unheated) | Circular, magnetically removable PEI |

### Firmware Comparison

| Aspect | Open5x (Jubilee) | Fractal-5-Pro |
|--------|------------------|---------------|
| **Firmware** | RepRapFirmware 3.x | Klipper |
| **Kinematics** | CoreXYBC (M669 K8) | CoreXY (manual steppers for A/B) |
| **TCP Compensation** | NO (forward kinematics only) | NO (manual steppers) |
| **Feed Rate Compensation** | NO | NO |
| **Homing** | Manual macros (homeb.g, homec.g) | Manual macro (home_ab) |
| **Bed Centering** | Manual leveling bar + standoff adjustment | Automated inductive probe edge-finding |

### Slicer Comparison

| Aspect | Open5x | Fractal-Cortex |
|--------|--------|----------------|
| **Software** | Grasshopper (Rhino 3D plugin) | Python + pyglet + OpenGL |
| **Cost** | $1,000+ Rhino license (90-day trial) | **FREE** (open source) |
| **Platform** | Windows/Mac (Rhino requirement) | Windows only (planned: cross-platform) |
| **Slicing Method** | Support-free orientation + surface-based | Multidirectional (chunk-based) |
| **Collision Detection** | Simulation in Rhino (manual checking) | Automated (nozzle vs bed only) |
| **User Experience** | Visual scripting (requires CAD knowledge) | Traditional slicer UI (familiar) |
| **Limitations** | Proprietary, not extensible | Geometry errors, no supports, efficiency |
| **Open Source** | NO | YES ✅ |
| **Developer Notes** | "Goal is to migrate off Rhino to open source" | "Prioritize ease of use and simplicity" |

---

## 4. Critical Analysis: What Fractal-Cortex Does Differently

### Architectural Decisions

**1. Multidirectional != Non-Planar**

We initially planned **non-planar slicing** (curved layers following surface curvature):
```
Traditional: Flat horizontal layers
Non-planar: Curved layers following surface (like topographic map)
Multidirectional: Flat layers, but direction changes between chunks
```

**Why Fractal chose multidirectional:**
> "While non-planar 5-axis addresses both the supports issue and the interlaminar shear strength issue posed by 3-axis FDM, that approach typically requires significant training in advanced CAM software and tends to be computationally expensive. By contrast, multidirectional 5-axis focuses primarily on mitigating the need for support structures, but has the potential for providing a much more accessible user experience compared to non-planar 5-axis."

**Hardware benefit:**
> "From a hardware standpoint, multidirectional 5-axis 3D printers avoid an important mechanical limitation of non-planar 5-axis 3D printers. Since they don't require the printhead to be long and thin to achieve tight angles, multidirectional printers can achieve much higher print speeds with far less vibration."

**2. No TCP Compensation**

Fractal-Cortex generates G-code like:
```gcode
G1 X100 Y100 Z50 E0.05 F3000  ; Print move
MANUAL_STEPPER STEPPER=stepper_a MOVE=45 SPEED=15 SYNC=1  ; Rotate bed 45°
MANUAL_STEPPER STEPPER=stepper_b MOVE=30 SPEED=10 SYNC=1  ; Tilt bed 30°
G1 X95 Y105 Z48 E0.05 F3000   ; Next print move (coordinates pre-compensated)
```

**NOT:**
```gcode
G1 X100 Y100 Z50 A45 B30 E0.05 F3000  ; Combined move (would require TCP)
```

**Why this works:**
- Slicer pre-computes XYZ coordinates after each rotation
- Firmware just moves axes independently (no inverse kinematics needed)
- Simpler firmware integration
- Compatible with any Klipper/RRF printer (no special kinematic module)

**Drawback:**
- Larger G-code files (separate moves for rotation + translation)
- No feed rate compensation for rotary motion
- Potential for vibration/artifacts at transition points

**3. Collision Detection Strategy**

**Fractal approach:**
- **Nozzle vs bed:** Automated (halts slicing if slice plane causes collision)
- **Nozzle vs part:** Automatic ordering (slicer orders chunks to prevent collision)
- **NO swept volume checking** (assumes ordering is sufficient)

**From README:**
> "If Fractal Cortex detects that a slice plane will cause a collision between the nozzle and print bed, it will halt slicing calculations and color the 'illegal' slice plane red until you redefine it to a 'legal' position and orientation. You do not have to worry about collisions between the nozzle and in-process part because the slicer orders slicing directions in a safe manner no matter how you define them."

**Limitation:**
- Only checks final slice plane orientation, not intermediate moves
- Could still collide during travel moves or reorientation
- No real-time swept volume checking

**4. User Workflow**

**Fractal-Cortex UI:**
1. Load STL(s)
2. Choose "3-Axis Mode" or "5-Axis Mode"
3. If 5-axis: Set number of slicing directions (minimum 2)
4. Visually position blue slice planes using 5-entry boxes (3 position + 2 orientation)
5. Add/remove slice planes with +/trash buttons
6. Set print parameters (temp, layer height, speed, retraction)
7. Slice (calculations halt if illegal geometry detected)
8. Preview toolpath
9. Export G-code

**Comparison to traditional slicers:**
- **Similar:** File loading, parameter settings, preview, export
- **New:** Interactive slice plane positioning (unique to 5-axis)
- **Missing:** Support generation, brim/skirt/raft, variable layer height, tree supports

---

## 5. Implementation Strategy Update

### Decision Point: Build on Fractal-Cortex or Start Fresh?

**Option A: Fork and Improve Fractal-Cortex**
✅ Pros:
- Working codebase with proven algorithms
- Author explicitly invites contributions
- Faster time to working prototype
- Can study `slicing_functions.py` to understand multidirectional approach

❌ Cons:
- Python (slower than Rust, especially for geometry operations)
- Architecture may not support advanced features (TCP, collision, non-planar)
- Windows-only dependencies (pyglet, glooey)
- GUI framework (glooey) is niche, not maintained
- Hard to port to web (no WASM support for Python GUI)

**Option B: Rust + Svelte from Scratch (Original Plan)**
✅ Pros:
- Performance (Rust 10-100× faster for geometry operations)
- Modern architecture (can integrate TCP, collision, non-planar)
- Cross-platform (desktop + web via WASM)
- Modern UI (Svelte vs glooey)
- Type safety and memory safety (Rust vs Python)
- Better long-term maintainability

❌ Cons:
- Longer development time
- Need to reimplement slicing algorithms
- More complex build system

**Option C: Hybrid Approach (RECOMMENDED)**
✅ Study Fractal-Cortex's algorithms
✅ Implement in Rust with better architecture
✅ Add missing features (TCP, collision, supports, non-planar)
✅ Collaborate with Fractal author (share findings, cross-test)
✅ Target Fractal-5-Pro AND Open5x hardware

**Rationale:**
- Fractal-Cortex proves multidirectional approach works
- We can learn from `slicing_functions.py` without being constrained by Python
- Rust architecture allows future expansion (non-planar, scalar-field, neural approaches)
- Svelte UI provides better UX than glooey
- Author wants community improvements - we can deliver that via Rust rewrite

### Updated Roadmap

#### **Phase 0: Fractal-Cortex Code Study (NEW - Weeks 0-2)**

**Goal:** Understand multidirectional slicing algorithms

**Tasks:**
1. Clone Fractal-Cortex repo
2. Read `slicing_functions.py` in depth
3. Document key algorithms:
   - Chunk decomposition (how model is divided)
   - Slice plane intersection (STL plane cutting)
   - Ordering algorithm (safe sequencing)
   - Collision detection (nozzle-bed checking)
4. Identify failure modes ("challenging geometry")
5. Test with provided examples (pipe_fitting.stl)
6. Document G-code structure and coordinate transformations

**Deliverables:**
- Algorithm documentation (Markdown)
- Flow diagrams (Mermaid or similar)
- Test case library (STL + expected behavior)

#### **Phase 1: Core Infrastructure (Weeks 3-6)**

**Updated from original plan - now includes multidirectional support**

```toml
# Cargo.toml
[workspace]
members = [
    "crates/mesh",
    "crates/kinematics",
    "crates/collision",
    "crates/slicing",
    "crates/gcode",
    "crates/ui"
]

[dependencies]
# Mesh processing
nalgebra = "0.32"
baby_shark = "0.1"      # Mesh representation
trimesh-rs = "0.1"      # Alternative to numpy-stl
boolmesh = "0.1"        # Boolean operations

# Collision detection
parry3d = "0.13"
rapier3d = "0.18"

# 2D geometry (for slicing)
geo = "0.27"            # Shapely equivalent in Rust
lyon = "1.0"            # Path tessellation

# Serialization
serde = { version = "1.0", features = ["derive"] }
bincode = "1.3"

# Parallelization
rayon = "1.8"

# UI (backend for Svelte frontend)
tauri = "1.5"           # Desktop app framework
wasm-bindgen = "0.2"    # Web target
```

**Crate Structure:**

```rust
// crates/slicing/src/multidirectional.rs
pub struct SlicePlane {
    pub position: Vector3<f32>,     // Point on plane
    pub normal: Vector3<f32>,       // Plane orientation
    pub layer_height: f32,
    pub chunk_id: usize,
}

pub struct MultidirectionalSlicer {
    mesh: Mesh,
    slice_planes: Vec<SlicePlane>,
    layer_height: f32,
    collision_checker: CollisionChecker,
}

impl MultidirectionalSlicer {
    pub fn new(mesh: Mesh) -> Self {
        Self {
            mesh,
            slice_planes: vec![
                // Default: first plane is always perpendicular to build plate
                SlicePlane {
                    position: Vector3::new(0.0, 0.0, 0.0),
                    normal: Vector3::new(0.0, 0.0, 1.0),
                    layer_height: 0.2,
                    chunk_id: 0,
                }
            ],
            collision_checker: CollisionChecker::new(),
        }
    }

    pub fn add_slice_plane(&mut self, plane: SlicePlane) -> Result<(), SlicingError> {
        // Check if plane causes nozzle-bed collision
        if !self.collision_checker.check_plane_vs_bed(&plane) {
            return Err(SlicingError::IllegalSlicePlane {
                plane_id: self.slice_planes.len(),
                reason: "Nozzle would collide with bed at this orientation".to_string(),
            });
        }

        self.slice_planes.push(plane);
        Ok(())
    }

    pub fn decompose_mesh(&mut self) -> Result<Vec<MeshChunk>, SlicingError> {
        // Divide mesh into chunks based on slice planes
        // Algorithm from Fractal-Cortex slicing_functions.py

        let mut chunks = Vec::new();

        for (i, plane) in self.slice_planes.iter().enumerate() {
            // Find intersection of mesh with plane
            let intersection = intersect_mesh_plane(&self.mesh, plane)?;

            // Extract sub-volume above plane (or below for last plane)
            let chunk = if i < self.slice_planes.len() - 1 {
                extract_chunk_between_planes(
                    &self.mesh,
                    plane,
                    &self.slice_planes[i + 1]
                )?
            } else {
                extract_final_chunk(&self.mesh, plane)?
            };

            chunks.push(MeshChunk {
                id: i,
                geometry: chunk,
                slice_direction: plane.normal,
                layer_height: plane.layer_height,
            });
        }

        Ok(chunks)
    }

    pub fn order_chunks(&self, chunks: &[MeshChunk]) -> Vec<usize> {
        // Automatic ordering to prevent nozzle-part collisions
        // From Fractal: "slicer orders slicing directions in a safe manner
        // no matter how you define them"

        // Build dependency graph: chunk A must print before chunk B
        // if B's slicing direction would cause nozzle to collide with A

        let mut order = Vec::new();
        let mut printed = vec![false; chunks.len()];

        // Greedy approach: always pick chunk with lowest Z-min that
        // doesn't collide with already-printed chunks
        while order.len() < chunks.len() {
            let next_chunk = chunks.iter()
                .enumerate()
                .filter(|(i, _)| !printed[*i])
                .min_by_key(|(i, chunk)| {
                    // Score based on Z-height and collision risk
                    let z_min = chunk.geometry.bounds().min.z;
                    let collision_risk = self.compute_collision_risk(chunk, &order);
                    (z_min * 1000.0) as i32 + collision_risk
                })
                .map(|(i, _)| i)
                .expect("No valid next chunk found");

            order.push(next_chunk);
            printed[next_chunk] = true;
        }

        order
    }

    pub fn slice_chunk(&self, chunk: &MeshChunk) -> Result<Vec<Layer>, SlicingError> {
        // Planar slicing within each chunk (standard algorithm)
        // Slice perpendicular to chunk.slice_direction

        let mut layers = Vec::new();
        let bounds = chunk.geometry.bounds();

        // Project bounds onto slice direction to find Z range
        let z_min = bounds.min.dot(&chunk.slice_direction);
        let z_max = bounds.max.dot(&chunk.slice_direction);

        let num_layers = ((z_max - z_min) / chunk.layer_height).ceil() as usize;

        for i in 0..num_layers {
            let z = z_min + (i as f32) * chunk.layer_height;

            // Create slice plane perpendicular to slice_direction at height z
            let plane_origin = chunk.slice_direction * z;
            let plane_normal = chunk.slice_direction;

            // Intersect chunk mesh with plane
            let contours = intersect_mesh_plane(&chunk.geometry, &SlicePlane {
                position: plane_origin,
                normal: plane_normal,
                layer_height: chunk.layer_height,
                chunk_id: chunk.id,
            })?;

            // Generate infill and perimeters (standard slicer algorithms)
            let layer = Layer {
                height: z,
                chunk_id: chunk.id,
                perimeters: generate_perimeters(&contours),
                infill: generate_infill(&contours, chunk.layer_height),
            };

            layers.push(layer);
        }

        Ok(layers)
    }

    pub fn generate_gcode(&self, chunks: &[MeshChunk], chunk_order: &[usize]) -> Result<String, SlicingError> {
        let mut gcode = String::new();

        // Start sequence
        gcode.push_str("; Generated by RustFDM5x\n");
        gcode.push_str("; Multidirectional 5-axis slicing\n");
        gcode.push_str("G28 X Y Z  ; Home XYZ\n");
        gcode.push_str("home_ab    ; Home rotary axes (Klipper macro)\n");
        gcode.push_str("G29        ; Bed leveling\n");
        gcode.push_str("M104 S210  ; Set hotend temp\n");
        gcode.push_str("M140 S60   ; Set bed temp\n");
        gcode.push_str("G1 Z5 F1000 ; Lift Z\n");

        for &chunk_idx in chunk_order {
            let chunk = &chunks[chunk_idx];

            // Rotate to slice orientation
            let (a_angle, b_angle) = self.compute_rotary_angles(&chunk.slice_direction)?;

            gcode.push_str(&format!(
                "\n; Chunk {} (A={:.2}° B={:.2}°)\n",
                chunk_idx, a_angle, b_angle
            ));

            // Fractal-Cortex style: manual stepper moves
            gcode.push_str(&format!(
                "MANUAL_STEPPER STEPPER=stepper_a MOVE={:.2} SPEED=15 SYNC=1\n",
                a_angle
            ));
            gcode.push_str(&format!(
                "MANUAL_STEPPER STEPPER=stepper_b MOVE={:.2} SPEED=10 SYNC=1\n",
                b_angle
            ));

            // Slice and print chunk
            let layers = self.slice_chunk(chunk)?;
            for layer in layers {
                gcode.push_str(&self.generate_layer_gcode(&layer)?);
            }
        }

        // End sequence
        gcode.push_str("\n; Print complete\n");
        gcode.push_str("G1 E-5 F1800  ; Retract\n");
        gcode.push_str("G1 Z100 F1000 ; Lift Z\n");
        gcode.push_str("MANUAL_STEPPER STEPPER=stepper_a MOVE=0 SPEED=15 SYNC=1\n");
        gcode.push_str("MANUAL_STEPPER STEPPER=stepper_b MOVE=0 SPEED=10 SYNC=1\n");
        gcode.push_str("M104 S0  ; Turn off hotend\n");
        gcode.push_str("M140 S0  ; Turn off bed\n");

        Ok(gcode)
    }

    fn compute_rotary_angles(&self, slice_direction: &Vector3<f32>) -> Result<(f32, f32), SlicingError> {
        // Convert slice direction to A/B angles
        // For Fractal: A = spin (around Z), B = tilt (around Y)

        // B angle: tilt from vertical
        let b_angle = slice_direction.z.acos().to_degrees();

        // A angle: rotation in XY plane
        let a_angle = slice_direction.y.atan2(slice_direction.x).to_degrees();

        Ok((a_angle, b_angle))
    }
}
```

#### **Phase 2: TCP Kinematics (Optional Enhancement - Weeks 7-10)**

**Note:** Fractal-Cortex does NOT use TCP. This phase adds it as an enhancement for:
- Smoother motion (combined XYZAB moves instead of separate)
- Feed rate compensation
- Better acceleration planning
- Klipper MAF integration (not Fractal hardware, but other platforms)

**Only implement if targeting Klipper MAF or RepRapFirmware platforms.**

#### **Phase 3: Collision Detection (Weeks 11-14)**

**Improvements over Fractal-Cortex:**

```rust
pub struct CollisionChecker {
    nozzle: Capsule,            // Hotend geometry (50mm length, 0.4mm radius)
    bed: TriMesh,
    part_chunks: Vec<TriMesh>,  // In-process chunks (updated as printing)
    bvh: BVH,                   // Spatial acceleration structure
}

impl CollisionChecker {
    pub fn check_plane_vs_bed(&self, plane: &SlicePlane) -> bool {
        // Fractal approach: check if nozzle orientation would hit bed
        // at extreme positions

        let (a_angle, b_angle) = compute_rotary_angles(&plane.normal);

        // Simulate nozzle at bed edges with this orientation
        let test_positions = [
            Vector3::new(-150.0, -150.0, 0.0),  // Build volume corners
            Vector3::new(150.0, -150.0, 0.0),
            Vector3::new(150.0, 150.0, 0.0),
            Vector3::new(-150.0, 150.0, 0.0),
        ];

        for pos in &test_positions {
            let nozzle_pose = compute_nozzle_pose(pos, a_angle, b_angle);
            if contact(&nozzle_pose, &self.nozzle, &Isometry::identity(), &self.bed, 0.0).is_some() {
                return false;  // Collision detected
            }
        }

        true  // Safe
    }

    pub fn check_toolpath_segment(&self, from: &Pose, to: &Pose) -> CollisionResult {
        // NEW: Check nozzle vs in-process part (Fractal doesn't do this!)

        let samples = interpolate_path(from, to, 10);

        for pose in samples {
            let nozzle_pose = compute_nozzle_pose(&pose.position, pose.a, pose.b);

            // Check against all printed chunks
            for chunk_mesh in &self.part_chunks {
                if let Some(contact) = contact(&nozzle_pose, &self.nozzle,
                                              &Isometry::identity(), chunk_mesh, 0.0) {
                    return CollisionResult::Collision {
                        location: pose,
                        penetration: contact.dist,
                        object: "printed part",
                    };
                }
            }

            // Check bed
            if let Some(contact) = contact(&nozzle_pose, &self.nozzle,
                                          &Isometry::identity(), &self.bed, 0.0) {
                return CollisionResult::Collision {
                    location: pose,
                    penetration: contact.dist,
                    object: "bed",
                };
            }
        }

        CollisionResult::Safe
    }

    pub fn update_printed_geometry(&mut self, new_layer: &Layer, chunk_id: usize) {
        // Add newly printed layer to collision mesh
        // This allows checking future moves against in-process part

        let layer_mesh = convert_layer_to_mesh(new_layer);
        self.part_chunks[chunk_id] = merge_meshes(&self.part_chunks[chunk_id], &layer_mesh);
    }
}
```

#### **Phase 4: UI (Weeks 15-18)**

**Svelte frontend with Tauri backend**

```javascript
// src/App.svelte
<script>
  import { invoke } from '@tauri-apps/api/tauri';
  import MeshViewer from './components/MeshViewer.svelte';
  import SlicePlaneEditor from './components/SlicePlaneEditor.svelte';
  import ParameterPanel from './components/ParameterPanel.svelte';

  let meshPath = '';
  let slicePlanes = [
    { position: [0, 0, 0], normal: [0, 0, 1], layerHeight: 0.2, chunkId: 0 }
  ];
  let mode = '5-axis';  // or '3-axis'

  async function loadMesh() {
    await invoke('load_mesh', { path: meshPath });
  }

  async function addSlicePlane() {
    slicePlanes = [...slicePlanes, {
      position: [0, 0, 10],
      normal: [0, 1, 0],
      layerHeight: 0.2,
      chunkId: slicePlanes.length
    }];
  }

  async function slice() {
    const result = await invoke('slice_multidirectional', {
      slicePlanes,
      parameters: { /* temp, speed, etc. */ }
    });

    if (result.error) {
      alert(`Slicing failed: ${result.error}`);
    } else {
      // Show preview
      showPreview(result.toolpath);
    }
  }
</script>

<main>
  <div class="toolbar">
    <button on:click={() => mode = '3-axis'}>3-Axis Mode</button>
    <button on:click={() => mode = '5-axis'}>5-Axis Mode</button>
    <input type="file" bind:value={meshPath} on:change={loadMesh} />
  </div>

  <div class="workspace">
    <MeshViewer {slicePlanes} />

    {#if mode === '5-axis'}
      <SlicePlaneEditor bind:planes={slicePlanes} />
      <button on:click={addSlicePlane}>+ Add Slice Plane</button>
    {/if}

    <ParameterPanel />

    <button on:click={slice}>Slice</button>
  </div>
</main>
```

---

## 6. Key Decisions

### Decision 1: Multidirectional First, Non-Planar Later

**Rationale:**
- Fractal-Cortex proves multidirectional works and is accessible
- Non-planar is more complex (curved layers, surface following)
- Start with proven approach, add non-planar as Phase 5 enhancement
- Multidirectional already eliminates supports for most geometries

**Implementation:**
- Phase 1-4: Multidirectional (Fractal-inspired)
- Phase 5 (future): Non-planar top patches (Ahlers et al.)
- Phase 6 (future): Scalar-field slicing (S3-Slicer)
- Phase 7 (future): Neural optimization (Neural Slicer)

### Decision 2: Hybrid Firmware Integration

**Support multiple modes:**

**Mode A: Manual Steppers (Fractal-5-Pro style)**
```gcode
MANUAL_STEPPER STEPPER=stepper_a MOVE=45 SPEED=15 SYNC=1
MANUAL_STEPPER STEPPER=stepper_b MOVE=30 SPEED=10 SYNC=1
G1 X100 Y100 Z50 E0.05 F3000
```

**Mode B: Integrated Kinematics (Klipper MAF / RepRapFirmware)**
```gcode
G1 X100 Y100 Z50 A45 B30 E0.05 F3000
```

**Mode C: Bambu Workaround (Dense XYZE sampling)**
```gcode
G1 X100.0 Y100.0 Z50.0 E0.05 F3000
G1 X99.8 Y99.9 Z50.1 E0.05 F3000
; ... many micro-moves to approximate rotation ...
```

**Configuration:**
```toml
[machine]
name = "Fractal-5-Pro"
firmware = "klipper"
kinematics_mode = "manual_steppers"  # or "integrated" or "dense_sampling"

[axes.a]
type = "rotary"
mode = "manual_stepper"
rotation_distance = 90  # mm/rev
max_speed = 10          # deg/s
max_accel = 100         # deg/s²

[axes.b]
type = "rotary"
mode = "manual_stepper"
rotation_distance = 24
max_speed = 20
max_accel = 100
has_endstop = true
```

### Decision 3: Collaborate with Fractal Author

**Outreach plan:**
1. Email dan@fractalrobotics.com with:
   - Acknowledgment of Fractal-Cortex work
   - Our Rust + Svelte implementation proposal
   - Offer to collaborate and share findings
2. Test our slicer on Fractal-5-Pro hardware (if possible)
3. Share algorithm improvements back to Python codebase
4. Cross-reference documentation (link to each other's repos)
5. Joint testing and validation

---

## 7. Immediate Next Steps

### Week 0 (This Week)

1. **Clone Fractal-Cortex repository**
   ```bash
   cd C:\Users\Egusto\code\slicerresearch\external-repos
   git clone https://github.com/fractalrobotics/Fractal-Cortex.git
   ```

2. **Set up Python environment and test**
   ```bash
   python -m venv fractal-env
   fractal-env\Scripts\activate
   pip install glooey==0.3.6 numpy==1.26.4 numpy-stl==3.1.1 pyglet==1.5.28 pyOpenGL==3.1.0 shapely==2.0.4 trimesh==4.3.1
   cd Fractal-Cortex/fractal-cortex
   python slicer_main.py
   ```

3. **Study slicing_functions.py**
   - Read line-by-line with comments
   - Document key functions:
     - Mesh-plane intersection
     - Chunk decomposition
     - Ordering algorithm
     - Collision checking

4. **Test with example file**
   ```bash
   # Load examples/pipe_fitting.stl in GUI
   # Add slice planes, slice, preview
   # Export G-code and analyze structure
   ```

5. **Document findings in new file**
   ```bash
   # Create: 2026-01-08-fractal-cortex-algorithm-analysis.md
   ```

### Week 1-2

1. **Create Rust project structure**
   ```bash
   cd C:\Users\Egusto\code
   cargo new --lib rust5x
   cd rust5x
   mkdir -p crates/{mesh,kinematics,collision,slicing,gcode,ui}
   ```

2. **Implement multidirectional slicing core**
   - Start with `crates/slicing/src/multidirectional.rs`
   - Port key algorithms from `slicing_functions.py`
   - Write unit tests for each function

3. **Set up Svelte UI prototype**
   ```bash
   npm create tauri-app@latest rust5x-ui
   cd rust5x-ui
   npm install
   npm run tauri dev
   ```

4. **Email Dan Brogan**
   - Introduce project
   - Request collaboration
   - Share initial findings

---

## 8. Success Metrics

### Phase 1 Success (Weeks 3-6)
- [ ] Rust can parse STL files (using trimesh-rs or baby_shark)
- [ ] Manual slice plane definition works (5 DOF: 3 pos + 2 orient)
- [ ] Mesh-plane intersection produces correct contours
- [ ] Chunk decomposition divides model correctly
- [ ] Collision checker detects illegal slice planes (nozzle vs bed)
- [ ] G-code output matches Fractal-Cortex format (manual steppers)

### Phase 2 Success (Weeks 7-10)
- [ ] TCP inverse kinematics converts (tip, orientation) → XYZAB
- [ ] Feed rate compensation works for combined rotary + linear motion
- [ ] Singularity detection warns at B ≈ ±90°
- [ ] Both manual stepper and integrated kinematics modes work

### Phase 3 Success (Weeks 11-14)
- [ ] Collision detection: nozzle vs bed (parity with Fractal)
- [ ] Collision detection: nozzle vs in-process part (NEW feature)
- [ ] Swept volume checking along toolpaths
- [ ] BVH acceleration for fast collision queries
- [ ] Preview highlights collision regions in red

### Phase 4 Success (Weeks 15-18)
- [ ] Svelte UI matches Fractal-Cortex UX familiarity
- [ ] Interactive 3D mesh viewer with slice plane visualization
- [ ] Drag-and-drop slice plane positioning
- [ ] Parameter panel for temp, speed, layer height
- [ ] Real-time preview updates
- [ ] Cross-platform: Windows, Linux, Mac, Web (WASM)

### Overall Success
- [ ] Can slice pipe_fitting.stl successfully (Fractal example)
- [ ] Output G-code prints correctly on Fractal-5-Pro hardware
- [ ] No "challenging geometry" failures (improvement over Fractal)
- [ ] Performance: 10× faster than Fractal-Cortex (Rust vs Python)
- [ ] Author endorsement from Dan Brogan

---

## 9. Conclusion

**We discovered a working open-source 5-axis slicer** (Fractal-Cortex) that validates the multidirectional approach. Our Rust + Svelte implementation will:

1. **Build upon** Fractal-Cortex's proven algorithms
2. **Improve** robustness ("challenging geometry" errors)
3. **Add** missing features (supports, TCP, nozzle-part collision)
4. **Modernize** tech stack (Rust performance, Svelte UX, cross-platform)
5. **Collaborate** with author for mutual benefit

**This is not competition - it's evolution.** Fractal-Cortex proved the concept. We're building the production-ready, extensible, high-performance successor.

**Ready to begin Phase 0 (Fractal-Cortex algorithm study) immediately.**

---

**Files Created Today:**
1. `2026-01-08-1019-plan-5axis-slicer-problem-definition.md` - Original problem statement
2. `2026-01-08-1030-analysis-5axis-slicer-executive-summary.md` - Executive summary
3. `2026-01-08-1045-research-5axis-slicer-comprehensive-compendium.md` - Master research document
4. `2026-01-08-1115-analysis-open5x-practical-implementation.md` - Open5x analysis
5. `2026-01-08-1130-synthesis-fractal-vs-open5x-implementation-strategy.md` - **THIS FILE**

**Next:** Clone Fractal-Cortex and begin algorithm study.
