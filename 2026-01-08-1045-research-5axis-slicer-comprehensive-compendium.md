<!--
MODEL: perplexity/sonar-pro-search + claude-sonnet-4-5-20250929
TIMESTAMP: 2026-01-08T10:45:08+01:00
PROMPT_HASH: comprehensive-5axis-fdm-research-compendium
CONTEXT: Complete research compendium for building Rust+Svelte 5-axis FDM slicer with TCP
-->

# 5-Axis FDM Slicer: Comprehensive Research Compendium
## Libraries, Algorithms, and Implementations to Build Upon

**Research Date:** 2026-01-08
**Models Used:** perplexity/sonar-pro-search (6 research queries), claude-sonnet-4-5-20250929 (synthesis)
**Purpose:** Reference guide for building production 5-axis FDM slicer in Rust + Svelte

---

## Table of Contents

1. [TCP Kinematics Implementations](#1-tcp-kinematics-implementations)
2. [Rust Mesh Processing & Geometry](#2-rust-mesh-processing--geometry)
3. [Collision Detection Systems](#3-collision-detection-systems)
4. [Slicing Algorithms](#4-slicing-algorithms)
5. [G-code Generation & Firmware](#5-g-code-generation--firmware)
6. [5-Axis FDM Hardware & Research](#6-5-axis-fdm-hardware--research)
7. [Integration Architecture](#7-integration-architecture)
8. [Implementation Recommendations](#8-implementation-recommendations)

---

## 1. TCP Kinematics Implementations

### 1.1 Core TCP-Capable Kinematics Libraries

#### **rs-opw-kinematics** (Rust) ⭐ RECOMMENDED FOR RUST
- **GitHub:** https://github.com/bourumir-wyngs/rs-opw-kinematics
- **Purpose:** Analytic forward/inverse kinematics for 6-DOF industrial robots with OPW geometry
- **Key Features:**
  - Explicit TCP abstraction via `Tool` and `Base` wrappers
  - Built-in Cartesian stroke planning with configuration continuity
  - Jacobian computation for velocities/torques
  - Collision checking and constraint primitives
  - Uses nalgebra (Isometry3, quaternions, rotation matrices)

**Why Use It:**
- Strong TCP abstraction: pose is explicitly the TCP, not an intermediate flange
- Designed for continuous deposition along surfaces (exactly FDM's use case)
- Already has collision/constraint primitives
- Pure Rust with no C++ FFI overhead

**When to Use:**
- If your 5-axis printer resembles an OPW robot arm (parallel base + spherical wrist)
- For production code where performance and safety (Rust) matter

**How to Integrate:**
```rust
use rs_opw_kinematics::{kinematics_impl::OPWKinematics, Parameters};
use nalgebra::{Isometry3, Vector3};

// Define machine geometry
let params = Parameters {
    a1: 0.15,  // Link offsets
    a2: -0.13,
    b: 0.0,
    c1: 0.55,
    c2: 0.615,
    c3: 0.20,
    c4: 0.0,
};

let kin = OPWKinematics::new(params);

// TCP inverse kinematics
let tcp_pose = Isometry3::translation(100.0, 50.0, 200.0);
let solutions = kin.inverse(&tcp_pose);  // Up to 8 solutions

// Choose best (closest to current config, collision-free)
let joints = select_best_solution(solutions, current_joints);
```

**Limitations:**
- Assumes OPW geometry; non-OPW 5-axis machines need custom implementation
- Use as architecture reference even if geometry doesn't match

---

#### **MoveIt + KDL** (C++/ROS) - Production Reference
- **Purpose:** Mature robotics kinematics and motion planning
- **GitHub:** https://github.com/ros-planning/moveit2
- **TCP Handling:** End-effector link in URDF/SRDF or tip offset pose

**Why Use It:**
- Decades of robustness; proven in industrial robotics
- Easy to define multiple TCPs and switch during planning
- Direct support for Cartesian paths keeping TCP on surface

**When to Use:**
- For validation and testing (run your Rust impl against MoveIt's results)
- If willing to use ROS stack (heavy dependency)
- As reference for understanding industrial TCP patterns

**How to Integrate (as reference):**
```cpp
// MoveIt TCP definition in SRDF
<group_state name="tcp_offset" group="manipulator">
  <joint name="tool_tip_joint" value="0.05"/>  // TCP offset
</group_state>

// Or programmatically:
robot_state::RobotState state(robot_model);
Eigen::Isometry3d tcp_pose;
tcp_pose.translation() = Eigen::Vector3d(x, y, z);
state.setFromIK(joint_model_group, tcp_pose);
```

---

#### **LinuxCNC 5-Axis Kinematics** (C/C++) - CNC Reference
- **Documentation:** LinuxCNC 5-axis kinematics manual
- **GitHub:** https://github.com/LinuxCNC/linuxcnc (see `src/emc/kinematics/`)
- **Community Examples:** Forum threads with TCP kinematics components

**Why Use It:**
- Directly applicable to CNC-style 5-axis (which FDM multi-axis resembles)
- Switchable identity/TCP modes (3+2 vs full 5-axis)
- Well-tested by CNC community for decades

**When to Use:**
- As reference implementation for tilting bed/tilting head kinematics
- To understand G-code→kinematics→motion pipeline architecture
- For simulation testing (LinuxCNC sim mode)

**Architecture Pattern:**
```
G-code Interpreter (RS274NGC)
    ↓
Kinematics Layer (converts TCP → joints)
    ↓
Motion Planner (trapezoid generation)
    ↓
Step Generators
```

**Key Files to Study:**
- `src/emc/kinematics/xyzac-trt-kins.c` - XYZAC tilting rotary table
- `src/emc/kinematics/5axiskins.c` - General 5-axis
- Community thread: "TCP 5-axis kinematics" with switchable modes

---

### 1.2 Kinematics Algorithms

#### **Denavit-Hartenberg (DH) Parameterization**
- **Standard Reference:** Craig, *Introduction to Robotics*, Spong & Vidyasagar, Siciliano et al.
- **Implementation:** Most robotics libraries (KDL, many ROS URDFs)

**Why Use It:**
- Simple parameterization for serial chains
- Huge literature support
- Easy to auto-generate from CAD/URDF

**When to Use:**
- For standard serial kinematic chains
- When you need to document/communicate machine geometry clearly

**How to Implement:**
```rust
struct DHParams {
    a: f32,      // Link length
    alpha: f32,  // Link twist
    d: f32,      // Link offset
    theta: f32,  // Joint angle (variable for revolute)
}

fn dh_transform(dh: &DHParams) -> Matrix4<f32> {
    // Standard DH transformation matrix
    Matrix4::new(
        theta.cos(), -theta.sin() * alpha.cos(),  theta.sin() * alpha.sin(), a * theta.cos(),
        theta.sin(),  theta.cos() * alpha.cos(), -theta.cos() * alpha.sin(), a * theta.sin(),
        0.0,          alpha.sin(),                alpha.cos(),               d,
        0.0,          0.0,                        0.0,                       1.0
    )
}
```

**Limitations:**
- Can be awkward for some geometries (gantries, hybrid linkages)
- DH alone doesn't give analytic IK

---

#### **Quaternion / SE(3) Representation**
- **Libraries:** nalgebra (Rust), Eigen (C++), scipy.spatial.transform (Python)
- **Paper:** "Quaternions and Rotation Sequences" by Kuipers

**Why Use It:**
- No gimbal lock
- Smooth interpolation (slerp) for orientation
- Cleaner composition of transforms

**When to Use:**
- Internally for planning and smoothing nozzle orientation
- When interpolating between tool orientations along curved surfaces

**How to Implement:**
```rust
use nalgebra::{UnitQuaternion, Vector3};

// Orientation interpolation
let q0 = UnitQuaternion::from_euler_angles(0.0, 0.0, 0.0);
let q1 = UnitQuaternion::from_euler_angles(0.0, 0.5, 0.1);

// Smooth interpolation
for t in 0..=10 {
    let interp = q0.slerp(&q1, t as f32 / 10.0);
    let euler = interp.euler_angles();  // For G-code
    println!("A:{:.2} B:{:.2} C:{:.2}", euler.0, euler.1, euler.2);
}
```

**Trade-offs:**
- Less intuitive than Euler angles
- Still need Euler for G-code output
- Worth the complexity for robust orientation handling

---

#### **IK Solvers: Analytic vs Numerical**

**Analytic IK (rs-opw-kinematics, IKFast):**
- **Pros:** Very fast, exact, enumerates all solutions
- **Cons:** Machine-specific derivation required
- **When:** Production real-time path following

**Reference Implementation (simplified inverse for tilting bed):**
```rust
pub fn inverse_kinematics_xyzac(
    tip_pos: Vector3<f32>,
    tool_vec: Vector3<f32>,
    tool_length: f32
) -> (f32, f32, f32, f32, f32) {
    // From your TCP implementation guide
    let a_rad = f32::atan2(
        tool_vec.z,
        (tool_vec.x.powi(2) + tool_vec.y.powi(2)).sqrt()
    );
    let c_rad = f32::atan2(-tool_vec.y, tool_vec.x);

    // Tool offset compensation
    let pivot = tip_pos + tool_vec * tool_length;

    (pivot.x, pivot.y, pivot.z, a_rad.to_degrees(), c_rad.to_degrees())
}
```

**Numerical IK (KDL, Jacobian-based, damped least squares):**
- **Pros:** General, works for arbitrary chains
- **Cons:** Risk of convergence failures, slower
- **When:** Prototyping, unusual geometries, closed loops

---

### 1.3 Papers and References

| Paper | Citation | URL | Key Contribution |
|-------|----------|-----|------------------|
| OPW Analytic IK | Brandstötter et al., 2014 | - | Analytic solution for OPW robots (basis of rs-opw) |
| TriP Kinematics | Baumgärtner & Miller, JOSS 2022 | https://joss.theoj.org | General-purpose kinematics library framework |
| Robot Modeling | Craig, *Intro to Robotics* | - | Standard DH and Jacobian reference |
| Quaternions | Kuipers, *Quaternions and Rotation* | - | Comprehensive quaternion math |

---

## 2. Rust Mesh Processing & Geometry

### 2.1 Mesh Processing Crates

#### **baby_shark** ⭐ RECOMMENDED
- **GitHub:** https://github.com/dima634/baby_shark
- **crates.io:** https://crates.io/crates/baby_shark
- **Focus:** Pure-Rust geometry processing with corner-table meshes

**Key Capabilities:**
- Corner-table representation (`CornerTableF`) with adjacency built-in
- STL I/O (binary read/write)
- Implicit modeling: boolean ops (union/subtract/intersect) via SDF
- Volume offsets for robust operations

**Why Use It:**
- Pure Rust (no FFI overhead or safety concerns)
- Corner-table provides adjacency for normal computation and mesh traversal
- Implicit booleans more robust than explicit mesh CSG

**When to Use:**
- Primary mesh data structure for your slicer
- Mesh validation and repair operations
- Boolean operations (supports, model subtraction)

**How to Integrate:**
```rust
use baby_shark::{
    io::stl::{StlReader, StlWriter},
    mesh::corner_table::prelude::CornerTableF,
};
use std::path::Path;

// Load STL
let mut reader = StlReader::new();
let mesh: CornerTableF = reader
    .read_stl_from_file(Path::new("./model.stl"))?;

// Access adjacency for normal computation
for corner in mesh.corners() {
    let triangle = mesh.triangle_of_corner(corner);
    let adjacent = mesh.opposite_corner(corner);  // Neighbor across edge
}

// Write result
let writer = StlWriter::new();
writer.write_stl_to_file(&mesh, Path::new("./output.stl"))?;
```

**Limitations:**
- Only STL format officially (no 3MF/OBJ yet)
- No built-in curvature/geodesic analysis
- Mesh repair beyond boolean/implicit is limited

**Gaps to Fill Yourself:**
- 3MF/OBJ parsers (use `threeread` crate)
- Curvature computation (implement atop adjacency)
- Geodesic distances (Dijkstra on mesh graph)

---

#### **mesh_rs**
- **crates.io:** https://crates.io/crates/mesh_rs
- **Focus:** 3D mesh processing tagged for 3D printing

**Key Capabilities:**
- STL and OBJ read/write
- Basic scaling/transforms
- Analysis utilities for 3D printing (dimensions, volume)

**Why Use It:**
- Pragmatic mesh I/O layer
- "3dprinting" tag suggests attention to real-world robustness

**When to Use:**
- Lightweight alternative to baby_shark
- When you only need I/O + basic operations

**Limitations:**
- No advanced topology repair
- No boolean operations or offsets

---

#### **morph3d** - Multi-Format Loader
- **crates.io:** https://crates.io/crates/morph3d
- **Focus:** OBJ, GLTF, DAE, USDZ, STL loader

**Why Use It:**
- Frontend for user input supporting many formats
- Convert to internal mesh representation after loading

**When to Use:**
- User-facing file import
- Prototyping with various CAD outputs

---

#### **threecrate** - Point Cloud & Mesh
- **GitHub:** https://github.com/rajgandhi1/threecrate
- **Focus:** High-performance point cloud and mesh processing

**Why Use It:**
- KD-trees/BVH for spatial queries
- Point cloud ↔ mesh conversions
- Decimation/smoothing

**When to Use:**
- Distance queries (surface proximity for toolpath offsetting)
- Acceleration structures for collision or ray-casting
- Resampling surfaces

---

### 2.2 Computational Geometry & Booleans

#### **boolmesh** ⭐ RECOMMENDED
- **crates.io:** https://crates.io/crates/boolmesh
- **Purpose:** Pure Rust mesh boolean operations

**Why Use It:**
- Robust CSG operations (union/intersection/difference)
- No FFI to C++ (CGAL/Carve)
- Coherent memory management with other Rust code

**When to Use:**
- Support generation (subtract from model)
- Model cleanup (self-union to fix self-intersections)
- Subtractive operations (holes, negative volumes)

**How to Integrate:**
```rust
use boolmesh::{BoolOp, Mesh};

let mesh_a = Mesh::from_stl("part.stl")?;
let mesh_b = Mesh::from_stl("support.stl")?;

// Boolean subtract for support-free regions
let result = mesh_a.boolean_op(&mesh_b, BoolOp::Difference)?;
result.write_stl("part_minus_support.stl")?;
```

**Limitations:**
- Lacks CGAL's exact-arithmetic robustness
- Manage numeric tolerances with heuristics

---

### 2.3 Voxelization & SDF

#### **parry3d** Voxelization ⭐ RECOMMENDED
- **Docs:** https://docs.rs/parry3d-f64/latest/parry3d_f64/transformation/voxelization/
- **Purpose:** Voxelize triangle meshes into 3D grids

**Why Use It:**
- Already used by rs-opw-kinematics (compatible ecosystem)
- Basis for booleans, distance fields, shape analysis

**When to Use:**
- Support region computation
- Volumetric infill masking
- Conservative collision checking
- Approximate SDF construction

**How to Integrate:**
```rust
use parry3d::shape::TriMesh;
use parry3d::transformation::voxelize;

let trimesh = TriMesh::from_stl("model.stl")?;
let resolution = 0.5;  // mm per voxel

let voxels = voxelize(&trimesh, resolution);
// Use voxel grid for collision, SDF, or infill
```

**SDF from Voxels (Implement Yourself):**
```rust
// For each voxel, compute signed distance to surface
for voxel in voxels.iter() {
    let dist = trimesh.distance_to_point(&voxel.center);
    let inside = trimesh.contains_point(&voxel.center);
    voxel.sdf = if inside { -dist } else { dist };
}
```

---

### 2.4 What You Need to Build

**Essential Missing Pieces:**
1. **Surface Analysis:**
   - Curvature (Gaussian, mean) - implement atop adjacency graph
   - Feature detection (sharp edges by dihedral angle)
   - Hole detection (connected components of boundary edges)

2. **Mesh Repair:**
   - Self-intersection resolution via boolmesh
   - Small feature removal (filter tiny triangles)
   - Manifold enforcement

3. **Curved Surface Offsetting:**
   - Extend 2D polygon offsetting to tangent planes of curved surfaces
   - Use nearest-point queries from threecrate or custom BVH

4. **5-Axis Specific:**
   - Map surface normals → nozzle orientation field
   - Joint-space feasibility checking
   - Curved layer→toolpath projection

---

### 2.5 Comparison to C++ Ecosystems

| Feature | Rust Ecosystem | C++ (CGAL/libigl/OpenMesh) |
|---------|----------------|----------------------------|
| **Breadth** | Growing, modular | Decades of algorithms, comprehensive |
| **Maturity** | Production-usable but gaps exist | Battle-tested, extremely robust |
| **Safety** | Memory-safe by default | Requires careful manual management |
| **Integration** | Clean with Rust kinematics/motion | FFI overhead, unsafe blocks |
| **Exact Predicates** | Not yet (floating point) | CGAL has exact arithmetic |

**Pragmatic Strategy:**
- Use Rust crates for 80% (I/O, basic mesh/topology, booleans, voxels)
- Implement your own slicer-specific logic (5-axis path generation)
- Selectively wrap C++ for specific algorithms only if robustness demands it

---

## 3. Collision Detection Systems

### 3.1 Rust Collision Detection

#### **Parry3d** (formerly ncollide3d) ⭐ RECOMMENDED
- **Website:** https://parry.rs
- **GitHub:** https://github.com/dimforge/parry
- **Purpose:** Rich collision detection primitives

**Key Capabilities:**
- Rich primitive set: spheres, capsules, convex polyhedra, triangle meshes, heightfields
- Bounding volumes: AABBs, bounding spheres
- **Continuous collision detection (CCD):** Time of impact for moving shapes (sweep tests)
- Contact generation: closest points, penetration depth
- Ray casting

**Why Use It:**
- BVH-based broad phase, GJK/EPA narrow phase
- Designed for real-time robotics/game workloads
- Perfect for tool-motion CCD along toolpaths

**When to Use:**
- Moving tool vs static machine geometry (continuous CCD)
- Self-collision checking (rotating carriage vs gantry)
- Real-time collision queries during path execution

**How to Integrate:**
```rust
use parry3d::shape::{Capsule, TriMesh, Compound};
use parry3d::query::{time_of_impact, TOIStatus};
use nalgebra::{Isometry3, Vector3};

// Define nozzle as capsule
let nozzle = Capsule::new(50.0, 0.4);  // length, radius

// Define printed part as mesh
let part = TriMesh::from_stl("part.stl")?;

// Tool motion from pose0 to pose1
let pose0 = Isometry3::translation(100.0, 50.0, 200.0);
let pose1 = Isometry3::translation(105.0, 52.0, 201.0);
let motion = pose1 * pose0.inverse();

// Check for collision along path
match time_of_impact(&pose0, &motion, &nozzle, &part, 1.0, true) {
    Some(TOIStatus::Converged(toi)) => {
        println!("Collision at t={}", toi.toi);
    },
    _ => println!("Path is collision-free"),
}
```

**Performance:**
- 10⁵–10⁶ simple queries/s on single core
- Your 5-axis printer paths are tiny relative to that

---

#### **Rapier3d** - Physics Engine with Collision
- **Website:** https://rapier.rs
- **Docs:** https://docs.rs/rapier3d
- **Purpose:** Full physics engine using Parry underneath

**Key Capabilities:**
- BroadPhase + NarrowPhase separation
- Contact manifolds, event callbacks
- **Compound colliders:** BVH over child shapes (perfect for hotend + fan shroud + carriage)

**Why Use It:**
- For complex multi-part geometry (nozzle + block + fan + duct)
- Clean API for collision-only use (no full dynamics needed)

**When to Use:**
- Modeling entire toolhead assembly as single compound collider
- Want event-driven contact callbacks

**How to Integrate:**
```rust
use rapier3d::prelude::*;

// Build compound collider for hotend
let mut compound = Vec::new();
compound.push((
    Isometry3::identity(),
    SharedShape::capsule(50.0, 0.4),  // Nozzle
));
compound.push((
    Isometry3::translation(0.0, 0.0, 30.0),
    SharedShape::cuboid(10.0, 10.0, 15.0),  // Heater block
));

let toolhead = ColliderBuilder::compound(compound).build();

// Add to collision world
let mut collision_pipeline = CollisionPipeline::new();
// ... check collisions per frame
```

---

### 3.2 Swept Volume Collision Checking

#### **Voxel-Based Approach** (GPU-Friendly)
- **Paper:** "Voxel-Based Collision Avoidance for 5-Axis Additive Manufacturing"
- **Method:** Voxelize in-progress part, test convex head vs voxel blocks with GJK/EPA

**Why Use It:**
- Naturally incremental (mark new voxels as filled during printing)
- Extremely GPU-friendly (parallel tests)
- Good for real-time checking with growing geometry

**When to Use:**
- For head vs printed part collision
- When you have GPU compute available
- During actual printing (incremental updates)

**How to Implement:**
```rust
// Voxel grid (from parry3d voxelization)
struct VoxelGrid {
    voxels: Vec<Vec<Vec<bool>>>,
    resolution: f32,
}

// Check head collision
fn check_collision(
    head_pose: &Isometry3<f32>,
    head_shape: &Compound,
    voxel_grid: &VoxelGrid
) -> bool {
    let head_aabb = head_shape.aabb(head_pose);

    // Broad phase: check only nearby voxels
    for voxel in voxel_grid.query_region(&head_aabb) {
        if voxel.filled {
            let voxel_box = Cuboid::new(Vector3::repeat(voxel_grid.resolution / 2.0));
            if parry3d::query::intersection_test(
                head_pose, head_shape,
                &voxel.pose, &voxel_box
            )? {
                return true;  // Collision!
            }
        }
    }
    false
}
```

**Trade-offs:**
- Resolution vs memory/latency (sub-mm voxels recommended for accuracy)
- Grid-limited precision

---

#### **Analytic TOI/CCD** (Parry Sweep Tests)
**Why Use It:**
- Continuous in time for convex vs convex
- No grid discretization artifacts

**When to Use:**
- Head vs machine envelope (frame, build plate)
- Self-collision (head parts vs each other)

**How to Integrate:**
```rust
// From earlier Parry example - sweep test between poses
let toi = parry3d::query::time_of_impact(
    &start_pose, &motion,
    &head_shape, &obstacle_shape,
    max_toi, stop_at_penetration
)?;
```

---

### 3.3 Robotics Collision Detection Patterns (MoveIt Reference)

**Self-Collision Matrix:**
- Precompute which link pairs can never collide
- Skip those checks at runtime

**Implementation Pattern:**
```rust
struct SelfCollisionMatrix {
    never_collide: HashSet<(LinkId, LinkId)>,
}

impl SelfCollisionMatrix {
    fn precompute(robot: &Robot, num_samples: usize) -> Self {
        let mut matrix = SelfCollisionMatrix::default();

        // Sample random configurations
        for _ in 0..num_samples {
            let config = robot.random_configuration();
            let poses = robot.forward_kinematics(&config);

            // Check all link pairs
            for (i, link_i) in robot.links.iter().enumerate() {
                for (j, link_j) in robot.links.iter().skip(i+1).enumerate() {
                    if !collision_test(&poses[i], link_i, &poses[j], link_j) {
                        // Never collided in any sample
                        // (Be conservative: only mark after many samples)
                    }
                }
            }
        }
        matrix
    }
}
```

---

### 3.4 GPU Acceleration

**Mochi: Fast & Exact Collision Detection**
- Uses RTX ray-tracing cores
- 5×–28× speedups on real meshes

**Approach for 5-Axis FDM:**
- Use CUDA/compute shaders for voxel or BVH collision
- Parallel over many candidate path samples
- On NVIDIA RTX: treat voxels as RTX geometry, cast rays along swept paths

**When to Use:**
- Offline path validation (batch many candidates)
- Real-time if you have spare GPU cycles
- For very complex geometries (thousands of print head poses/second)

---

### 3.5 FDM-Specific Considerations

**Nozzle + Hotend Geometry:**
```rust
// Model complete toolhead assembly
struct ToolheadGeometry {
    nozzle: Capsule,           // Long slender cone/capsule
    heater_block: Cuboid,      // Box around heater
    fan_shroud: ConvexMesh,    // Part cooling duct
    carriage: ConvexMesh,      // X/Y carriage
    safety_envelope: f32,      // Extra clearance (0.2-0.5mm)
}

impl ToolheadGeometry {
    fn to_compound(&self) -> Compound {
        let mut shapes = vec![];

        // Nozzle with safety envelope
        shapes.push((
            Isometry3::identity(),
            SharedShape::capsule_y(self.nozzle.height, self.nozzle.radius + self.safety_envelope)
        ));

        // Heater block (thicker where it sticks out)
        shapes.push((
            Isometry3::translation(0.0, 0.0, 30.0),
            SharedShape::cuboid(
                self.heater_block.hx + self.safety_envelope,
                self.heater_block.hy + self.safety_envelope,
                self.heater_block.hz
            )
        ));

        // ... add fan shroud, carriage, etc.

        Compound::new(shapes)
    }
}
```

**Deposition Swell Considerations:**
- Deposited filament swells beyond nozzle diameter (die swelling β > 1)
- Add virtual clearance shell (+0.2–0.5mm) to collision model
- Asymmetric padding: thicker where block sticks out, thinner on nozzle

---

## 4. Slicing Algorithms

### 4.1 Planar Slicing (Baseline Reference)

**Existing Implementations:**
- **CuraEngine:** https://github.com/Ultimaker/CuraEngine (C++)
- **PrusaSlicer:** https://github.com/prusa3d/PrusaSlicer (C++)
- **Slic3r:** https://github.com/slic3r/Slic3r (C++)

**Core Algorithm:**
```pseudo
function slice_planar(mesh, layer_height):
    zs = [0, layer_height, 2*layer_height, ..., max_z]
    layers = []

    for z in zs:
        // Intersect mesh with plane z
        contours = intersect_mesh_with_plane(mesh, z)

        // Generate perimeters (inward offsets)
        perimeters = []
        for contour in contours:
            offset = contour
            for i in 0..num_perimeters:
                offset = offset_inward(offset, extrusion_width)
                perimeters.append(offset)

        // Generate infill in remaining area
        infill_region = contours - union(perimeters)
        infill = generate_infill(infill_region, pattern, density)

        layers.append({perimeters, infill})

    // Generate supports
    supports = generate_supports(mesh, layers)

    // Order paths and emit G-code
    return emit_gcode(layers, supports)
```

**Complexity:** O(N_triangles × N_layers) with spatial acceleration
**Performance:** < seconds for typical models

---

### 4.2 Non-Planar Slicing

#### **Non-Planar Top Patches (Ahlers et al., CASE 2019)**
- **Paper:** https://tams.informatik.uni-hamburg.de/publications/2019/case_ahlers_2019.pdf
- **Implementation:** Slic3r fork: https://github.com/Zip-o-mat/Slic3r/tree/nonplanar

**Algorithm:**
1. **Region Detection:**
   - Find near-horizontal facets where non-planar improves surface quality
   - Cluster connected facets into candidate NP surfaces

2. **Floating NP Layers:**
   - Move top shell regions to topmost layer
   - Generate 2D planar toolpaths for lifted regions

3. **Project to Mesh:**
   - Project 2D paths vertically onto mesh facets
   - Assign correct Z per point
   - Insert vertices at triangle boundaries

4. **Extrusion Correction:**
   - Adjust flow: `m = cos(arctan(Δz/ℓ))` to compensate spacing

5. **Collision Checking:**
   - Layer-by-layer collider expansion
   - Reject NP surface if collides with lower layers

**Why Use It:**
- Compatible with 3-axis machines (no extra axes needed)
- Proven quality improvements on curved tops
- Well-documented collision avoidance

**When to Use:**
- As first step toward non-planar (before full 5-axis)
- For Bambu Lab (3-axis locked hardware)
- Quick wins on surface quality

---

#### **Scalar-Field Slicing (S3-Slicer, Neural Slicer)**
- **S3 Paper:** Zhang et al., SIGGRAPH Asia 2022, DOI: 10.1145/3550454.3555516
  - https://research.manchester.ac.uk/en/publications/ssup3sup-slicer-a-general-slicing-framework-for-multi-axis-3d-pri/
- **Neural Slicer:** Liu et al., SIGGRAPH 2024, arXiv:2404.15061
  - https://arxiv.org/abs/2404.15061

**Core Concept:**
- Define scalar field G(x) over volume
- Layers are isosurfaces of G
- Gradient ∇G gives local print direction

**Algorithm:**
```pseudo
function slice_scalar_field(mesh, objectives):
    // 1. Compute objective field (support-free, stress-aligned, etc.)
    direction_field = optimize_directions(mesh, objectives)

    // 2. Find deformation that matches direction field
    deformation = solve_rotation_driven_deformation(direction_field)

    // 3. Planar slice in deformed space
    deformed_mesh = apply_deformation(mesh, deformation)
    planar_layers = slice_planar(deformed_mesh, layer_height)

    // 4. Map isosurfaces back to original geometry
    curved_layers = []
    for layer in planar_layers:
        original_layer = inverse_deform(layer, deformation)
        curved_layers.append(original_layer)

    // 5. Generate oriented toolpaths
    for layer in curved_layers:
        for point in layer:
            tool_vector = direction_field(point)  // Nozzle orientation
            toolpath.append(ToolpathPoint {
                position: point,
                tool_vector: tool_vector,
                feed_rate: ...
            })

    return toolpath
```

**Why Use It:**
- Handles arbitrary curved layers
- Unified framework for support-free, strength, surface quality
- State-of-the-art results (SIGGRAPH papers)

**When to Use:**
- For true 5-axis FDM with complex objectives
- When you need stress-aligned reinforcement
- Production multi-axis printing

**Implementation Complexity:**
- High: requires PDE-like optimization, tetrahedral meshes
- Neural Slicer adds neural network training
- Best for post-MVP when core pipeline works

---

### 4.3 Multi-Axis Specific Algorithms

#### **Support-Free Volume Printing (Dai et al., SIGGRAPH 2018)**
- **Paper:** https://mewangcl.github.io/pubs/SIG18RobotVolPrint.pdf
- **DOI:** 10.1145/3197517.3201342

**Key Ideas:**
- Scalar field G(x) optimized so:
  - Each point is locally supported
  - Front is convex for collision-free tool access
- Decompose 3D→2D (volume to curved surfaces) then 2D→1D (surface to paths)

**When to Use:**
- 6-DOF robot arm FDM
- Complex topology requiring zero supports
- Research/academic work

---

#### **Reinforced FDM (Fang et al., SIGGRAPH Asia 2020)**
- **Paper:** https://mewangcl.github.io/pubs/SIGAsia2020ReinforcedFDM.pdf
- **DOI:** 10.1145/3414685.3417834
- **Code:** https://github.com/KIKI007/ReinforcedFDM

**Key Ideas:**
- Compute stress field via FEA
- Optimize scalar field G(x) whose gradient aligns with principal stress
- Curved layers as isosurfaces of G
- Toolpaths follow designed filament directions

**Results:**
- Up to 6.35× higher load capacity vs best planar orientation
- Tensile/compression tests validate

**When to Use:**
- Parts with critical strength requirements
- When you have FEA capability
- Production parts needing mechanical validation

**How to Integrate:**
```rust
// Simplified workflow
fn reinforced_fdm_slicing(mesh: &Mesh, loads: &LoadCase) -> Toolpath {
    // 1. Run FEA to get stress field
    let stress_field = run_fea(mesh, loads)?;

    // 2. Optimize scalar field aligned to principal stress
    let scalar_field = optimize_scalar_field(
        mesh,
        stress_field,
        Objectives {
            stress_alignment: 0.7,
            support_free: 0.2,
            smoothness: 0.1,
        }
    )?;

    // 3. Extract isosurfaces
    let layers = extract_isosurfaces(&scalar_field, num_layers)?;

    // 4. Generate toolpaths with stress-aligned directions
    let toolpath = generate_stress_aligned_paths(&layers, &stress_field)?;

    toolpath
}
```

---

### 4.4 Key Algorithmic Components

**Layer Generation:**
- Planar: Planes z = k·h, intersect with triangles
- Curved: Isosurfaces of scalar field, extract via marching cubes/tets

**Perimeter Generation:**
- 2D: Polygon offsetting (Clipper library)
- Curved: Project 2D offsets to 3D or intrinsic surface offsetting

**Infill Patterns:**
- Standard: Rectilinear, honeycomb, gyroid, Hilbert
- Conformal: Parametric on surface, follow geodesics
- Stress-aligned: Follow principal stress directions

**Support Generation:**
- Planar: Overhang angle threshold, project downwards
- Multi-axis: Decompose into sub-volumes with different orientations (Wu et al.)
- Minimize via orientation optimization (S3, Neural Slicer)

**Path Ordering:**
- Minimize travel distance (TSP heuristics)
- Alternate print direction per layer
- Cluster by orientation to reduce head reorientation

---

### 4.5 Performance & Complexity

| Algorithm | Complexity | Typical Runtime | Quality |
|-----------|------------|-----------------|---------|
| Planar | O(N·L) with BVH | < 1 second | Good for vertical |
| NP Patches | O(N·L + projection) | 10-100 seconds | Better curved tops |
| Scalar Field | O(optimization) | Minutes to hours | Best multi-axis |
| Neural | O(training + inference) | Training: hours, Inference: minutes | State-of-art |

---

## 5. G-code Generation & Firmware

### 5.1 G-code Standards

**Basic Commands:**
```gcode
G0 X.. Y.. Z.. A.. B.. C..          ; Rapid move
G1 X.. Y.. Z.. A.. B.. C.. E.. F..  ; Coordinated move with extrusion
G2/G3 X.. Y.. I.. J.. F..           ; Arc (CW/CCW) with center offsets
G17/G18/G19                         ; Plane selection (XY/ZX/YZ)
G90/G91                             ; Absolute/relative positioning
M82/M83                             ; Absolute/relative extrusion
M104/M109 S..                       ; Set/wait hotend temperature
M140/M190 S..                       ; Set/wait bed temperature
G28                                 ; Home axes
G92 X.. Y.. Z.. E..                 ; Set position
```

**5-Axis Specific:**
- A, B, C = rotation about X, Y, Z axes (degrees in G-code)
- Example: `G1 X120.0 Y40.0 Z35.0 A15.0 C-20.0 E0.42 F2400`

---

### 5.2 Klipper Firmware (Open Platform) ⭐ RECOMMENDED

#### **Multi-Axis Framework (MAF)**
- **Gist:** MAF 0.2.1 macro framework
- **Blog:** https://xyzdims.com/2025/06/05/3d-printing-multi-axis-with-klipper/

**Purpose:** Extend Klipper with extra axes (U, V, W, A, B, C) via macros

**How It Works:**
- Binds `MANUAL_STEPPER ... GCODE_AXIS=A` to add axes
- Overrides G0/G1 to handle relative/absolute, G92, multi-tool syntax
- Tool mapping for IDEX and multi-gantry systems

**Configuration Example:**
```ini
[include maf.cfg]

[gcode_macro MY_MAF]
variable_maf = {
  "X": { "motor": "stepper_x"  },
  "Y": { "motor": "stepper_y"  },
  "Z": { "motor": "stepper_z"  },
  "E": { "motor": "extruder"   },
  "A": { "motor": "manual_stepper a_axis" },
  "C": { "motor": "manual_stepper c_axis" }
}
gcode:

[manual_stepper a_axis]
step_pin: PF9
dir_pin: PF10
enable_pin: !PG2
microsteps: 16
rotation_distance: 8  # For rotary: degrees per full step
endstop_pin: ^PG10
position_endstop: 0
position_max: 90
position_min: -90
homing_speed: 20
GCODE_AXIS: A  # Enable G1 A.. commands
```

**When to Use:**
- Quick prototyping of multi-axis on existing hardware
- Testing toolpaths without custom firmware builds
- For 3-axis + rotary table setups

**Limitations:**
- Treats axes independently (no full TCP in macros)
- For true TCP, need custom kinematics

---

#### **Custom Kinematics in Klipper**
- **Docs:** https://github.com/Klipper3d/klipper/blob/master/docs/Kinematics.md
- **GitHub:** https://github.com/Klipper3d/klipper

**Architecture:**
```
G-code Parser (gcode_move)
    ↓
Kinematics Module (cartesian.py, corexy.py, custom_5axis.py)
    ↓
Look-ahead (trapq)
    ↓
Step Generation (per-stepper trapezoids)
```

**How to Extend:**
1. Copy `cartesian.py` to `custom_5axis.py`
2. Add A/B rails as "rotors":
```python
self.rails = [stepper.LookupMultiRail(config.getsection('stepper_' + n))
              for n in 'xyz']
self.rotors = [stepper.LookupMultiRail(config.getsection('stepper_' + n))
              for n in 'ac']
```
3. Implement `calc_position()` and `check_move()` for 5 axes
4. Register with `[printer] kinematics: custom_5axis`

**TCP Options:**
- **Option A:** Do TCP offline (post-processor), emit joint-space G-code
- **Option B:** Implement TCP in kinematics module (G-code stays in Cartesian)

**Community Resources:**
- Issue #897: n-axis CNC feature request
- User modifications for 5-axis CoreXY
- Axis twist compensation as reference pattern

---

### 5.3 RepRapFirmware (Duet) - Production 5-Axis

**Documentation:** https://docs.duet3d.com/User_manual/Machine_configuration/robot_5_axis_CNC

**Capabilities:**
- Up to 9 axes (XYZUVWABC)
- Explicit 5-axis robot support: `M669 B"CoreXY5AC"`
- Built-in TCP for specific robot types

**Configuration Example:**
```gcode
; Config.g for XYZAC 5-axis
M584 X0 Y1 Z2 A3 C4 E5      ; Drive mapping
M669 K9 B"CoreXY5AC"        ; 5-axis kinematics
M208 X0:300 Y0:300 Z0:250   ; Linear axis limits
M208 A-45:45 C-180:180      ; Rotary axis limits (degrees)
```

**Why Use It:**
- Most mature open-source 5-axis firmware
- Production-ready TCP handling
- Used successfully in Open5x project

**When to Use:**
- If using Duet hardware (recommended for 5-axis)
- Want turnkey 5-axis motion without custom firmware development
- Production machines

---

### 5.4 Bambu Lab (Locked Platform)

**Supported G-code:**
- Standard: G0/G1, G28, G90/G91, M82/M83, M104/M109, M140/M190
- **NO A/B/C axes support** (3-axis only)
- Limited G2/G3 arc support (unreliable per community)

**Community Docs:**
- https://forum.bambulab.com/t/list-of-supported-g-code-commands/25226
- https://forum.bambulab.com/t/bambu-lab-x1-specific-g-code/666

**Non-Planar on Bambu:**
```gcode
; Dense XYZE "bent G-code" approach
; Vary Z along path to follow curved surface
G1 X100.0 Y50.0 Z10.0 E0.1 F2400
G1 X100.5 Y50.2 Z10.05 E0.12 F2400
G1 X101.0 Y50.4 Z10.08 E0.14 F2400
; etc. - many small moves
```

**Reference:**
- CNC Kitchen: https://www.cnckitchen.com/blog/non-planar-3d-printing-by-bending-g-code
- Bambu A1 Akari lamp example: https://www.youtube.com/watch?v=yiAcP6MDBD4

**Limitations:**
- No true 5-axis (no rotary axes)
- "3.5-axis" simulation only
- Must bypass slicer or treat as raw G-code

---

### 5.5 G-code Post-Processing

**TCP to Machine Coordinates:**
```rust
pub fn generate_5axis_gcode(
    toolpath: &Toolpath3D,
    kinematics: &impl Kinematics,
    machine_config: &MachineConfig
) -> String {
    let mut gcode = String::new();
    gcode.push_str("; Generated by 5-axis slicer\n");
    gcode.push_str("G90 ; Absolute positioning\n");
    gcode.push_str("M82 ; Absolute extrusion\n");

    for segment in &toolpath.segments {
        for (i, point) in segment.points.iter().enumerate() {
            // Inverse kinematics
            let axes = kinematics.inverse(point.position, point.tool_vector)?;

            // Feed rate compensation for rotary motion
            let compensated_feed = if i > 0 {
                let prev_axes = kinematics.inverse(
                    segment.points[i-1].position,
                    segment.points[i-1].tool_vector
                )?;
                compensate_feedrate(
                    point.feed_rate,
                    &axes,
                    &prev_axes,
                    segment.time_delta,
                    machine_config
                )
            } else {
                point.feed_rate
            };

            // Check singularity
            if detect_singularity(axes.a, 5.0) != SingularityRisk::Safe {
                eprintln!("Warning: Near singularity at waypoint {}", i);
            }

            // Emit G-code
            gcode.push_str(&format!(
                "G1 X{:.3} Y{:.3} Z{:.3} A{:.3} C{:.3} E{:.5} F{:.0}\n",
                axes.x, axes.y, axes.z, axes.a, axes.c,
                point.extrusion, compensated_feed
            ));
        }
    }

    gcode
}
```

**Feed Rate Compensation:**
```rust
pub fn compensate_feedrate(
    nominal_feed: f32,
    axes: &MachineAxes,
    prev_axes: &MachineAxes,
    dt: f32,
    config: &MachineConfig
) -> f32 {
    // Angular velocities (rad/s)
    let omega_a = (axes.a - prev_axes.a).to_radians() / dt;
    let omega_c = (axes.c - prev_axes.c).to_radians() / dt;

    // TCP velocity from rotation: v = ω × r
    let r_tool = config.tool_length;
    let v_rot_a = omega_a.abs() * r_tool;
    let v_rot_c = omega_c.abs() * r_tool;
    let v_rot_total = (v_rot_a.powi(2) + v_rot_c.powi(2)).sqrt();

    // Compensate to maintain constant TCP velocity
    nominal_feed * (1.0 + v_rot_total / nominal_feed)
}
```

**Retraction Strategies:**
```gcode
; Before large orientation change
G1 E-0.5 F1800  ; Retract
G1 A30.0 C45.0 F3000  ; Pure rotation
G1 E0.5 F1800  ; Unretract
; Continue printing
```

---

## 6. 5-Axis FDM Hardware & Research

### 6.1 Open-Source Hardware

#### **Fractal-5-Pro** ⭐ RECOMMENDED REFERENCE
- **GitHub:** https://github.com/fractalrobotics/Fractal-5-Pro
- **Slicer:** https://github.com/fractalrobotics/Fractal-Cortex

**Design:**
- CoreXY + 2-axis gimballed build plate (A/B)
- 300mm Ø × 250mm H volume
- Slip-ring on A-axis for infinite rotation
- Octopus Pro + Raspberry Pi
- Direct-drive Volcano hotend

**Philosophy:**
- "Multidirectional" (3+2 re-orientation) not continuously non-planar
- Simpler process transitions, rigid short hotend, higher speeds

**Why Study It:**
- Well-documented open hardware
- Practical design choices (tilting bed safer than tilting head)
- Active community and working prints

**When to Use:**
- As hardware reference for your own build
- Test platform for your slicer
- Proven $1,900 BOM

---

#### **Open5x**
- **GitHub:** https://github.com/FreddieHong19/Open5x
- **Paper:** Hong et al., CHI 2022, DOI: 10.1145/3491101.3519782
  - https://arxiv.org/abs/2202.11426

**Design:**
- Prusa i3 MK3S retrofit
- 2-axis rotary bed (U/V) belt-driven
- Duet 2 + expansion running RepRapFirmware 3
- Grasshopper slicer with collision-aware travel

**Contributions:**
- Conformal printing on curved substrates
- GUI-driven slicer workflow
- Speed compensation for coupled 5-axis motion

**When to Use:**
- If you have existing Prusa/Voron to retrofit
- Want RepRapFirmware 5-axis capabilities
- Need visual/parametric slicer (Grasshopper)

---

#### **Gen5X**
- **GitHub:** https://github.com/GenerativeMachine/Gen5X
- Generatively designed 5-axis printer
- Gimbal-like platform
- Less active but good design reference

---

### 6.2 Key Research Papers

#### **Support-Free Printing**

| Paper | Citation | URL | Key Result |
|-------|----------|-----|-----------|
| Support-Free Volume Printing | Dai et al., SIGGRAPH 2018 | https://mewangcl.github.io/pubs/SIG18RobotVolPrint.pdf | Scalar field optimization for 6-DOF robot, zero supports |
| S³-Slicer | Zhang et al., TOG 2022 | https://research.manchester.ac.uk/en/publications/ssup3sup-slicer-a-general-slicing-framework-for-multi-axis-3d-pri/ | General framework for multi-axis, multiple objectives |
| Open5x | Hong et al., CHI 2022 | https://arxiv.org/abs/2202.11426 | Accessible retrofit, conformal printing |

#### **Stress-Aligned Reinforcement**

| Paper | Citation | URL | Key Result |
|-------|----------|-----|-----------|
| Reinforced FDM | Fang et al., SIGGRAPH Asia 2020 | https://mewangcl.github.io/pubs/SIGAsia2020ReinforcedFDM.pdf | 6.35× higher load capacity, stress-aligned layers |
| Neural Slicer | Liu et al., SIGGRAPH 2024 | https://arxiv.org/abs/2404.15061 | Neural network optimization, 102% strength improvement |

#### **Non-Planar Slicing**

| Paper | Citation | URL | Key Result |
|-------|----------|-----|-----------|
| NP Top Patches | Ahlers et al., CASE 2019 | https://tams.informatik.uni-hamburg.de/publications/2019/case_ahlers_2019.pdf | 3-axis non-planar, collision-aware, Slic3r fork |
| CLAS | Huang & Singamneni, RPJ 2015 | DOI: 10.1108/RPJ-06-2013-0059 | Curved layer adaptive slicing |

---

### 6.3 Validation & Benchmarks

**Test Geometries:**
- **Overhangs:** Bridges, cantilevered beams, toroidal rings
- **Topology:** Shelves (high genus), multi-loop tubes
- **Stress-critical:** Bridge arches under loads, Yoga pose, Bunny Head
- **Conformal:** Hemispherical LED circuits, turbine blades

**Quality Metrics:**
1. **Mechanical Strength:**
   - Tensile/compression tests
   - FEA validation (isotropic and anisotropic)
   - Load capacity vs planar baseline (200-635% gains reported)

2. **Surface Quality:**
   - Angle histogram (printing direction vs surface normals)
   - Staircase reduction on curved surfaces
   - Qualitative photo comparisons

3. **Support Usage:**
   - Total support volume
   - Print time comparison
   - Near-zero supports for optimized multi-axis

4. **Dimensional Accuracy:**
   - Scanned comparisons (few hundred microns typical)
   - Standard FDM calibration procedures

---

### 6.4 Known Limitations & Open Problems

**From Literature Review:**

1. **Anisotropic FEA Integration:**
   - Current: stress fields computed assuming isotropic, validated anisotropically after
   - Needed: Fully coupled, differentiable anisotropic FEA

2. **Production-Ready Slicers:**
   - Gap: S3, Neural Slicer are research codes
   - Fractal Cortex is practical but 3+2 focused
   - Opportunity: General-purpose 5-axis slicer for makers

3. **Material Robustness:**
   - Most results: PLA or simple polymers
   - Needed: Systematic characterization for high-temp, composites, filled filaments

4. **Real-Time Adaptation:**
   - Some work on AI for defect detection
   - Gap: Open implementations for FDM 5-axis adaptive printing

5. **Calibration Standards:**
   - No de-facto test suite for 5-axis FDM
   - Needed: Standard artifacts, acceptance tests

---

## 7. Integration Architecture

### 7.1 Recommended System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Svelte Frontend                          │
│  - File upload (STL/3MF via morph3d)                        │
│  - Machine config editor (JSON)                              │
│  - 3D visualization (Three.js/threlte)                       │
│  - Parameter controls, progress indicators                   │
└───────────────────┬─────────────────────────────────────────┘
                    │ WebSocket / IPC
┌───────────────────▼─────────────────────────────────────────┐
│                   Rust Backend (Slicing Core)                │
│                                                               │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────────┐│
│  │ Mesh Module  │   │ Geometry     │   │ Kinematics      ││
│  │              │   │ Analysis     │   │ Module          ││
│  │ - baby_shark │   │              │   │                 ││
│  │ - mesh_rs    │   │ - Curvature  │   │ - Forward/      ││
│  │ - morph3d    │   │ - Features   │   │   Inverse       ││
│  │              │   │ - Overhang   │   │ - Singularity   ││
│  │ - STL I/O    │   │              │   │ - Feed Rate     ││
│  └──────┬───────┘   └──────┬───────┘   └────────┬────────┘│
│         │                  │                     │         │
│  ┌──────▼──────────────────▼─────────────────────▼───────┐│
│  │            Layer Generation Module                     ││
│  │  - Planar slicing (baseline)                          ││
│  │  - Scalar field optimization (S3-style)               ││
│  │  - Isosurface extraction (marching cubes)             ││
│  └──────┬─────────────────────────────────────────────────┘│
│         │                                                   │
│  ┌──────▼───────────────────────────────────────────────┐ │
│  │         Toolpath Generation Module                     │ │
│  │  - Perimeter generation (offset curves)               │ │
│  │  - Infill patterns (conformal, stress-aligned)        │ │
│  │  - Path ordering and optimization                     │ │
│  │  - Orientation assignment (TCP)                       │ │
│  └──────┬─────────────────────────────────────────────────┘│
│         │                                                   │
│  ┌──────▼───────────────────────────────────────────────┐ │
│  │      Collision Detection Module                        │ │
│  │  - parry3d: Swept volume checks                       │ │
│  │  - rapier3d: Compound colliders                       │ │
│  │  - Voxel-based part collision                         │ │
│  └──────┬─────────────────────────────────────────────────┘│
│         │                                                   │
│  ┌──────▼───────────────────────────────────────────────┐ │
│  │         G-code Generation Module                       │ │
│  │  - TCP waypoint → machine coordinates                 │ │
│  │  - Feed rate compensation                             │ │
│  │  - Klipper / RepRapFirmware / Bambu dialect           │ │
│  └────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────┘
```

---

### 7.2 Data Flow

```rust
// Core data structures
pub struct Mesh {
    vertices: Vec<Vec3>,
    faces: Vec<Face>,
    normals: Vec<Vec3>,
    adjacency: AdjacencyGraph,
}

pub struct VolumeField {
    scalar_field: Grid3D<f32>,      // G(x) for isosurfaces
    direction_field: Grid3D<Vec3>,  // Local print directions
    bounds: BoundingBox,
}

pub struct LayerSurface {
    mesh: TriMesh,
    normals: Vec<Vec3>,
    adjacency: LayerAdjacency,  // Which layer above/below
}

pub struct ToolpathSegment {
    points: Vec<Point3>,
    tool_vectors: Vec<Vec3>,     // ← CRITICAL: Not lost!
    feed_rates: Vec<f32>,
    extrusion_rates: Vec<f32>,
}

pub struct MachineState {
    axes: MachineAxes,  // X, Y, Z, A, C
    extrusion: f32,
    feed_rate: f32,
    singularity_risk: SingularityRisk,
    collision_free: bool,
}
```

**Pipeline:**
```rust
fn slice_5axis(
    input: &Path,
    machine_config: &MachineConfig,
    objectives: &SlicingObjectives
) -> Result<String> {
    // 1. Load and validate
    let mesh = Mesh::from_file(input)?;
    mesh.validate()?;

    // 2. Analyze geometry
    let analysis = analyze_geometry(&mesh, objectives)?;

    // 3. Generate layers (planar or curved)
    let layers = if objectives.use_curved_layers {
        generate_curved_layers(&mesh, &analysis)?
    } else {
        generate_planar_layers(&mesh, analysis.layer_height)?
    };

    // 4. Generate oriented toolpaths
    let toolpath = generate_toolpaths(&layers, &analysis)?;

    // 5. Apply kinematics and check collisions
    let kin = create_kinematics(machine_config)?;
    let machine_states = transform_via_tcp(&toolpath, &kin)?;
    check_collisions(&machine_states, &mesh, machine_config)?;

    // 6. Generate G-code
    let gcode = generate_gcode(&machine_states, machine_config)?;

    Ok(gcode)
}
```

---

## 8. Implementation Recommendations

### 8.1 Phase-Based Approach

**Phase 1: Core Infrastructure (Weeks 1-4)**
- Use `baby_shark` for mesh representation
- Implement planar slicing first (validate pipeline)
- Use `nalgebra` for all linear algebra
- Build modular architecture (separate crates for mesh/geometry/kinematics)

**Phase 2: TCP Kinematics (Weeks 5-8)**
- Implement inverse kinematics for tilting bed (simpler than tilting head)
- Add singularity detection
- Implement feed rate compensation
- Test with LinuxCNC simulation

**Phase 3: Non-Planar (Weeks 9-12)**
- Start with Ahlers-style non-planar top patches
- Then add scalar field optimization (S3-inspired)
- Integrate orientation field with TCP

**Phase 4: Production (Weeks 13-16)**
- Add collision detection (parry3d/rapier3d)
- Calibration procedures
- G-code generation for multiple firmwares
- Testing and validation

---

### 8.2 Key Dependencies (Cargo.toml)

```toml
[dependencies]
# Linear algebra & geometry
nalgebra = "0.32"
parry3d = "0.13"
rapier3d = "0.18"

# Mesh processing
baby_shark = "0.1"  # Check latest version
mesh_rs = "0.1"
morph3d = "0.1"
threeread = "0.1"   # For 3MF/OBJ

# Computational geometry
boolmesh = "0.1"
# geo = "0.27"  # For 2D polygon operations

# Kinematics (if using existing)
# rs-opw-kinematics = "0.2"  # If OPW geometry

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Parallelization
rayon = "1.8"

# Error handling
thiserror = "1.0"
anyhow = "1.0"

# Math utilities
num-traits = "0.2"
approx = "0.5"  # For floating point comparisons

# Optional: GPU acceleration
# wgpu = "0.18"  # For GPU voxelization/collision
```

---

### 8.3 Critical Decision Points

**1. Kinematics Approach:**
- **Recommended:** Start with DH parameterization for tilting bed
- Why: Simpler, well-documented, easier to debug
- Later: Add quaternion optimization if needed

**2. Hardware Target:**
- **Recommended:** Tilting bed (A-axis)
- Why: Lower cost, simpler kinematics, safer for MVP
- Later: Extend to tilting head when confident

**3. TCP Integration:**
- **Recommended:** Post-processing module initially
- Why: Clean separation, easier testing
- Later: Deep integration if optimization requires it

**4. Slicing Strategy:**
- **Recommended:** Start with planar + non-planar top patches
- Why: Proven, simpler than full scalar field
- Later: Add S3-style scalar fields for complex parts

---

### 8.4 Testing Strategy

**Unit Tests:**
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_inverse_kinematics_vertical() {
        let tip = Vector3::new(100.0, 100.0, 50.0);
        let tool_vec = Vector3::new(0.0, 0.0, -1.0);
        let tool_length = 50.0;

        let (x, y, z, a, c) = inverse_kinematics_xyzac(tip, tool_vec, tool_length);

        assert!((a - 0.0).abs() < 0.1);  // Vertical should give A=0
        assert!((z - 0.0).abs() < 0.1);  // Pivot at bed
    }

    #[test]
    fn test_singularity_detection() {
        assert_eq!(detect_singularity(89.0, 5.0), SingularityRisk::Critical);
        assert_eq!(detect_singularity(45.0, 5.0), SingularityRisk::Safe);
    }
}
```

**Integration Tests:**
- Compare against LinuxCNC simulation results
- Validate G-code with MoveIt (if using ROS stack)
- Test with known geometries (calibration cubes, bridges)

**Hardware Validation:**
- Print test geometries on Fractal-5-Pro or similar
- Measure dimensional accuracy
- Mechanical testing (tensile, compression) vs planar baseline

---

### 8.5 Performance Optimization

**Parallelization:**
```rust
use rayon::prelude::*;

// Parallelize layer processing
let layers: Vec<LayerSurface> = (0..num_layers)
    .into_par_iter()
    .map(|i| {
        let z = i as f32 * layer_height;
        slice_at_height(&mesh, z)
    })
    .collect();

// Parallelize collision checks
let collisions: Vec<bool> = toolpath.segments
    .par_iter()
    .map(|segment| check_segment_collision(segment, &part_geometry))
    .collect();
```

**SIMD:**
```rust
// Use nalgebra's SIMD features for bulk operations
use nalgebra::SimdRealField;

// Batch inverse kinematics
fn batch_inverse_kinematics(
    points: &[Point3],
    tool_vecs: &[Vec3],
    tool_length: f32
) -> Vec<MachineAxes> {
    points.par_iter()
        .zip(tool_vecs.par_iter())
        .map(|(p, v)| inverse_kinematics_xyzac(*p, *v, tool_length))
        .collect()
}
```

**GPU Acceleration (Optional):**
- Use `wgpu` for voxelization and SDF computation
- Offload collision checking to GPU
- Parallel sampling of many candidate orientations

---

## Conclusion

This compendium provides a comprehensive roadmap for building a production 5-axis FDM slicer in Rust + Svelte. Key takeaways:

### What Exists (Build Upon):
- **TCP Kinematics:** rs-opw-kinematics (Rust), LinuxCNC (C), MoveIt (C++/ROS)
- **Mesh Processing:** baby_shark, boolmesh, parry3d (all Rust)
- **Collision:** parry3d/rapier3d (Rust, production-ready)
- **Algorithms:** S3-Slicer, Reinforced FDM, Neural Slicer (research, adapt concepts)
- **Firmware:** Klipper MAF, RepRapFirmware (open, 5-axis capable)
- **Hardware:** Fractal-5-Pro, Open5x (open-source, validated)

### What to Build:
- 5-axis aware toolpath generation
- FDM-specific TCP models (flow-dependent offset)
- Curved surface projection and offsetting
- Scalar field optimization (S3-inspired)
- Collision-aware path planning

### Recommended Path:
1. **Weeks 1-4:** Core infrastructure (mesh, planar slicing)
2. **Weeks 5-8:** TCP kinematics (tilting bed)
3. **Weeks 9-12:** Non-planar layers (Ahlers → S3)
4. **Weeks 13-16:** Production (collision, calibration, multi-firmware)

### Success Criteria:
- Slices STL to 5-axis toolpaths
- Outputs validated G-code (Klipper/RRF)
- Detects singularities and collisions
- Prints successfully on real hardware
- Documented and open-sourced

**You now have everything needed to build the future of 5-axis FDM printing.** 🚀

---

## Appendix: Complete Reference List

### Papers (Chronological)
1. Singh & Dutta (2001) - Multi-direction slicing, DOI: 10.1115/1.1375816
2. Singamneni et al. (2012) - Curved layer FDM, DOI: 10.1016/j.jmatprotec.2011.08.001
3. Huang & Singamneni (2015) - CLAS, DOI: 10.1108/RPJ-06-2013-0059
4. Jin et al. (2017) - Curved layer process planning, DOI: 10.1007/s00170-016-9743-5
5. Dai et al. (2018) - Support-free volume printing, DOI: 10.1145/3197517.3201342
6. Zhao et al. (2018) - Nonplanar robotic AM, DOI: 10.1007/s00170-018-1772-9
7. Ahlers et al. (2019) - 3D printing of nonplanar layers, CASE 2019
8. Xu et al. (2019) - Curved layer multi-axis, DOI: 10.1016/j.cad.2019.05.007
9. Wang et al. (2019) - Non-supporting 5-axis, DOI: 10.1016/j.rcim.2019.01.007
10. Wu et al. (2020) - Support-effective decomposition, DOI: 10.1109/TASE.2019.2938219
11. Fang et al. (2020) - Reinforced FDM, DOI: 10.1145/3414685.3417834
12. Pérez-Castillo et al. (2021) - Curved layer survey, DOI: 10.1016/j.addma.2021.102354
13. Hong et al. (2022) - Open5x, DOI: 10.1145/3491101.3519782
14. Zhang et al. (2022) - S³-Slicer, DOI: 10.1145/3550454.3555516
15. Nayyeri et al. (2022) - Planar/nonplanar review, DOI: 10.1007/s00170-021-08347-x
16. Liu et al. (2024) - Neural Slicer, arXiv:2404.15061
17. Insero et al. (2025) - Non-planar filled layers, DOI: 10.1007/s10845-023-02250-w

### Software & Hardware
- **rs-opw-kinematics:** https://github.com/bourumir-wyngs/rs-opw-kinematics
- **baby_shark:** https://github.com/dima634/baby_shark
- **boolmesh:** https://crates.io/crates/boolmesh
- **parry3d:** https://github.com/dimforge/parry
- **rapier3d:** https://github.com/dimforge/rapier
- **Fractal-5-Pro:** https://github.com/fractalrobotics/Fractal-5-Pro
- **Fractal Cortex:** https://github.com/fractalrobotics/Fractal-Cortex
- **Open5x:** https://github.com/FreddieHong19/Open5x
- **LinuxCNC:** https://github.com/LinuxCNC/linuxcnc
- **Klipper:** https://github.com/Klipper3d/klipper
- **MoveIt:** https://github.com/ros-planning/moveit2
- **CuraEngine:** https://github.com/Ultimaker/CuraEngine
- **PrusaSlicer:** https://github.com/prusa3d/PrusaSlicer
- **Slic3r (NP fork):** https://github.com/Zip-o-mat/Slic3r/tree/nonplanar

### Documentation
- **RepRapFirmware 5-axis:** https://docs.duet3d.com/User_manual/Machine_configuration/robot_5_axis_CNC
- **Klipper Kinematics:** https://github.com/Klipper3d/klipper/blob/master/docs/Kinematics.md
- **Parry Docs:** https://docs.rs/parry3d
- **Bambu G-code:** https://forum.bambulab.com/t/list-of-supported-g-code-commands/25226

---

**END OF COMPENDIUM**

*This document should be periodically updated as new libraries and research emerge.*
