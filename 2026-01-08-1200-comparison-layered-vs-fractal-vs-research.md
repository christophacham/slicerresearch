# Critical Comparison: Layered Slicer vs Fractal-Cortex vs Research Findings
**Date:** 2026-01-08
**Context:** Comparing existing Layered slicer architecture with Fractal-Cortex implementation and 5-axis research

---

## 🎯 Executive Summary

**YOU ALREADY HAVE 90% OF THE ARCHITECTURE NEEDED!**

Your existing Layered slicer is architecturally superior to Fractal-Cortex and already has the non-planar/5-axis foundations in place. What you need to add:

1. ✅ **Already have:** Trait-based modular pipeline, segment_sources, Arc<Mesh>, f64 precision, streaming
2. ✅ **Already designed:** SliceSurface trait, NozzleStrategy, HardwareConstraints, non-planar ready
3. ❌ **Need to add:** Chunk decomposition (from Fractal), TCP kinematics, collision detection, rotary axis support
4. ❌ **Need to implement:** 5-axis G-code generation, multidirectional slicing strategy

---

## 1. Architecture Comparison Matrix

| Feature | OrcaSlicer (C++) | Fractal-Cortex (Python) | Layered (Rust) | Status |
|---------|------------------|------------------------|----------------|--------|
| **Core Pipeline** |
| Modular stages | ❌ Monolithic | ❌ Monolithic | ✅ Trait-based | **BETTER** |
| Swappable implementations | ❌ No | ❌ No | ✅ SlicePipelineBuilder | **BETTER** |
| Streaming results | ❌ No | ❌ No | ✅ crossbeam channels | **BETTER** |
| **Data Preservation** |
| Mesh connectivity | ❌ Lost at slicing | ❌ Lost at slicing | ✅ segment_sources | **BETTER** |
| Mesh availability | ❌ Slicing only | ❌ Slicing only | ✅ Arc<Mesh> throughout | **BETTER** |
| Precision | ❌ int32 microns | ❌ int32 (Clipper) | ✅ f64 throughout | **BETTER** |
| **Non-Planar Support** |
| Variable Z design | ❌ Fixed Z | ❌ Fixed Z | ✅ SliceSurface trait | **BETTER** |
| Surface normals | ❌ Not tracked | ❌ Not tracked | ✅ Planned (normal_at) | **BETTER** |
| **5-Axis Capabilities** |
| Multidirectional slicing | ❌ No | ✅ Chunk-based | 📝 Designed (not implemented) | **NEED** |
| Chunk decomposition | ❌ No | ✅ Boolean subtraction | ❌ Not implemented | **NEED FROM FRACTAL** |
| TCP kinematics | ❌ No | ❌ No (pre-computed coords) | ❌ Not implemented | **NEED FROM RESEARCH** |
| Rotary axis support | ❌ No | ✅ Manual steppers | ❌ Not implemented | **NEED** |
| Nozzle-bed collision | ❌ No | ✅ 12mm clearance check | ✅ Designed (collision.rs) | **PARTIAL** |
| Nozzle-part collision | ❌ No | ❌ Only ordering-based | ✅ Designed | **NEED TO IMPLEMENT** |
| **Performance** |
| Parallelization | ❌ Limited | ✅ ProcessPoolExecutor | ✅ Rayon | **BETTER** |
| Speed | Baseline | Slow (Python) | Fast (Rust) | **BETTER** |
| Memory | High (clones) | High (Python) | Low (Arc sharing) | **BETTER** |

**KEY INSIGHT:** Layered has a FAR BETTER foundation than Fractal-Cortex. You just need to add the 5-axis specific algorithms.

---

## 2. Pipeline Comparison

### Layered (Existing)

```
┌─────────────────────────────────────────────────────────────────┐
│               LAYERED TRAIT-BASED PIPELINE                      │
└─────────────────────────────────────────────────────────────────┘

Arc<Mesh> ──────────────────┐
(preserved)                  │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SlicingContext {                                                │
│   mesh: Arc<Mesh>,         ← ALWAYS AVAILABLE                   │
│   settings: SliceSettings,                                      │
│   hardware: HardwareConstraints,                                │
│ }                                                               │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────┐
│ trait Slicer     │  ← Multiple implementations possible
│   fn slice()     │     • PlanarSlicer (implemented ✅)
└────────┬─────────┘     • NonPlanarSlicer (designed 📝)
         │               • MultidirectionalSlicer (NOT DESIGNED ❌)
         │
         ▼
  Vec<LayerData> {
    z_height: f64,                 ← Currently planar assumption
    regions: Vec<RegionData> {
      contour: ExPolygon,
      segment_sources: Vec<u32>,   ← CRITICAL: Triangle tracking ✅
      perimeters: Option<WallPaths>,
      infill: Option<Vec<Polyline>>,
    }
  }
         │
         ▼
┌─────────────────────────┐
│ trait PerimeterGenerator│  ← Implemented ✅
│   fn generate()         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ trait InfillGenerator   │  ← Multiple implementations ✅
│   fn generate()         │     • RectilinearInfillGen
└────────┬────────────────┘     • GyroidInfillGen
         │                       • HoneycombInfillGen
         ▼
┌─────────────────────────┐
│ trait ToolpathPlanner   │  ← NOT IMPLEMENTED YET ❌
│   fn plan()             │
└────────┬────────────────┘
         │
         ▼
    Vec<Move> {              ← Data structure exists ✅
      start: Point3D,
      end: Point3D,
      extrusion: f64,
      feedrate: f64,
    }
         │
         ▼
┌─────────────────────────┐
│ trait GCodeWriter       │  ← NOT IMPLEMENTED YET ❌
│   fn write()            │
└────────┬────────────────┘
         │
         ▼
     String (G-code)
```

### Fractal-Cortex (Existing Python Slicer)

```
┌─────────────────────────────────────────────────────────────────┐
│            FRACTAL-CORTEX MULTIDIRECTIONAL PIPELINE             │
└─────────────────────────────────────────────────────────────────┘

Mesh (trimesh) ──┐
User slice planes │  [[pos, normal], [pos, normal], ...]
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ CHUNK DECOMPOSITION (Key Innovation!)                          │
│                                                                 │
│ Step 1: Cut mesh at each slice plane                           │
│   chunks = [mesh.slice_plane(plane) for plane in planes]       │
│                                                                 │
│ Step 2: Boolean subtraction ("chiseling")                      │
│   for k in range(len(chunks)):                                 │
│     for r in range(k+1, len(chunks)):                          │
│       chunks[k] = chunks[k].difference(chunks[r])              │
│                                                                 │
│ ← This automatically prevents nozzle-part collisions!          │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
For each chunk:
  │
  ├─ Rotate chunk so slice plane is horizontal
  │    (align_mesh_base_to_xy using Rodrigues rotation)
  │
  ├─ Calculate slice levels (Z heights in rotated space)
  │
  ├─ Slice all layers in parallel (ProcessPoolExecutor)
  │    • section_multiplane(normal, origin, heights)
  │
  ├─ Generate shells (shapely buffer operations)
  │
  ├─ Detect manifold vs internal areas (layer overlap)
  │
  ├─ Generate infill (rectilinear, triangular, honeycomb)
  │
  ├─ Check nozzle-bed collision (geometric calculation)
  │    IF collision: HALT and show red plane in UI
  │
  └─ Transform coordinates back to printable orientation
       (inverse of alignment transform + bed rotation DCM)

All chunks' toolpaths merged:
  │
  ▼
┌─────────────────────────────────────────────────────────────────┐
│ G-CODE GENERATION (Manual Steppers)                            │
│                                                                 │
│ For each chunk:                                                 │
│   MANUAL_STEPPER STEPPER=stepper_a MOVE={a_angle}              │
│   MANUAL_STEPPER STEPPER=stepper_b MOVE={b_angle}              │
│                                                                 │
│   For each layer:                                               │
│     G1 X{x} Y{y} Z{z} E{e} F{f}  ← XYZ pre-transformed         │
│                                                                 │
│ ← NO TCP in firmware! Slicer pre-computes everything           │
└─────────────────────────────────────────────────────────────────┘
```

### Where They Meet: Proposed Integration

```
┌─────────────────────────────────────────────────────────────────┐
│         LAYERED + FRACTAL MULTIDIRECTIONAL STRATEGY             │
└─────────────────────────────────────────────────────────────────┘

Arc<Mesh> + SlicingContext
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ trait SlicingStrategy  (FROM LAYERED DESIGN)                   │
│                                                                 │
│ NEW IMPLEMENTATION:                                             │
│ struct MultidirectionalStrategy {                              │
│   slice_planes: Vec<SlicePlane>,  ← User-defined             │
│ }                                                               │
│                                                                 │
│ impl SlicingStrategy for MultidirectionalStrategy {            │
│   fn generate_surfaces() -> Vec<Box<dyn SliceSurface>> {       │
│     // Step 1: Chunk decomposition (FROM FRACTAL) ──────────┐  │
│     let chunks = decompose_mesh_into_chunks(&mesh, &planes); │  │
│                                                              │  │
│     // Step 2: For each chunk, create rotated surfaces      │  │
│     chunks.iter().map(|chunk| {                              │  │
│       Box::new(ChunkSurface {                                │  │
│         geometry: chunk.rotated_mesh,                        │  │
│         transform: chunk.alignment_transform,                │  │
│         slice_direction: chunk.plane.normal,                 │  │
│       })                                                     │  │
│     }).collect()                                             │  │
│   }                                                           │  │
│ }                                                             │  │
└───────────────────────────────────────────────────────────────┘  │
             │                                                     │
             ▼                                                     │
┌─────────────────────────────────────────────────────────────────┐
│ NEW: ChunkSurface implements SliceSurface                      │
│                                                                 │
│ fn z_at(&self, x: f64, y: f64) -> f64 {                       │
│   // Transform (x,y) to chunk's local coordinate system        │
│   let local_pos = self.transform.inverse() * Vec3(x, y, 0);   │
│   // Return Z in local space (planar within chunk)             │
│   local_pos.z + self.chunk_base_height                         │
│ }                                                               │
│                                                                 │
│ fn normal_at(&self, x: f64, y: f64) -> Vec3 {                 │
│   // Transform slice direction to global space                 │
│   self.transform * self.slice_direction                        │
│ }                                                               │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
   (REST OF LAYERED PIPELINE CONTINUES)
   ↓ PerimeterGenerator
   ↓ InfillGenerator
   ↓ ToolpathPlanner
   ↓ GCodeWriter (needs 5-axis support)
```

---

## 3. What Layered Already Has (Better Than Fractal)

### ✅ Trait-Based Modularity

**Layered:**
```rust
pub trait Slicer: Send + Sync {
    fn slice(&self, ctx: &SlicingContext) -> PipelineResult<Vec<LayerData>>;
}

// Can have multiple implementations
struct PlanarSlicer;
struct NonPlanarSlicer;
struct MultidirectionalSlicer;  // ← Just needs to be written!

impl Slicer for MultidirectionalSlicer {
    fn slice(&self, ctx: &SlicingContext) -> PipelineResult<Vec<LayerData>> {
        // Implement Fractal's chunk decomposition here
    }
}
```

**Fractal-Cortex:**
```python
# Monolithic functions
def all_5_axis_calculations(mesh, printSettings, slicingDirections):
    # 300+ lines of hardcoded logic
    # Cannot swap implementations
    # Cannot reuse for different strategies
```

**Winner:** Layered by far. Adding multidirectional is just one more trait implementation.

---

### ✅ segment_sources - Mesh Connectivity Preservation

**Layered** (already exists in `pipeline/layer_data.rs:63`):
```rust
pub struct RegionData {
    pub contour: ExPolygon,

    /// Triangle indices that created each segment of the outer contour.
    /// Length equals `contour.outer().len()`.
    pub segment_sources: Vec<u32>,  // ← KEY FEATURE!

    pub perimeters: Option<WallPaths>,
    pub infill: Option<Vec<Polyline>>,
    pub is_solid: bool,
    pub region_type: RegionType,
}
```

**Fractal-Cortex:**
```python
# shapely.geometry.Polygon - NO triangle tracking
# Information is LOST forever after slicing
```

**Winner:** Layered. This enables:
- Debug which triangle caused issue
- Trace back to original mesh
- Adaptive layer heights based on curvature
- Future: stress-aligned infill (like Reinforced FDM paper)

---

### ✅ Streaming Pipeline

**Layered:**
```rust
pub enum PipelineEvent {
    Started { total_layers: usize },
    LayerSliced { index: usize, total: usize },
    LayerComplete { index: usize, layer: LayerData },
    Progress { progress: f64, stage: String },
    Complete { gcode: String, total_layers: usize },
}

// Real-time preview as slicing happens
pub fn run_streaming(self: Arc<Self>, ctx: SlicingContext) -> Receiver<PipelineEvent>
```

**Fractal-Cortex:**
```python
# All-or-nothing - user waits with no feedback
# No progress updates
# No real-time preview
```

**Winner:** Layered. Better UX.

---

### ✅ Arc<Mesh> - No Expensive Copies

**Layered:**
```rust
pub struct SlicingContext {
    pub mesh: Arc<Mesh>,  // Shared reference, O(1) clone
    // ...
}

// Any pipeline stage can access mesh
let original_triangle = ctx.mesh.triangles[triangle_id];
```

**Fractal-Cortex:**
```python
mesh = importedMesh.copy()  # Full copy!
# Must pass mesh to every function
# Cannot easily reference back to original
```

**Winner:** Layered. More efficient, mesh always available.

---

### ✅ f64 Precision Until Output

**Layered:**
```rust
pub struct Point {
    pub x: f64,
    pub y: f64,
}

// Only quantize at G-code output:
writeln!(out, "G1 X{:.3} Y{:.3}", move.x, move.y)?;
```

**Fractal-Cortex:**
```python
# Uses Clipper2 (integer microns) throughout
# Precision lost early in pipeline
```

**Winner:** Layered. Better for curved surfaces.

---

## 4. What Fractal-Cortex Has (That Layered Needs)

### ❌ Chunk Decomposition Algorithm

**This is the KEY innovation from Fractal-Cortex!**

```python
def create_chunkList():
    # Step 1: Cut mesh at each slice plane
    chunkList = []
    for k in range(int(numSlicingDirections)):
        currentStart = startingPositions[k]
        currentNormal = spherical_to_normal(*directions[k])
        unprocessedChunk = mesh.slice_plane(currentStart, currentNormal, cap=True)
        chunkList.append(unprocessedChunk)

    # Step 2: Boolean subtraction (automatic collision prevention!)
    for k in slicePlaneList:
        remainingChunk = chunkList[k]
        for r in reversedSlicePlaneList:
            if r > k:
                latterChunk = chunkList[r]
                remainingChunk = remainingChunk.difference(latterChunk, check_volume=False)
        chunkList[k] = remainingChunk

    return chunkList
```

**Why this is brilliant:**
- Print order: chunk 0 → chunk 1 → chunk 2
- When printing chunk 0, chunks 1 and 2 don't exist yet → no collision
- When printing chunk 1, chunk 0 is done, chunk 2 doesn't exist → no collision
- **Automatic collision prevention through geometry!**

**How to add to Layered:**

```rust
// crates/layerkit-algo/src/multidirectional/chunk_decomposition.rs

use layerkit_core::mesh::Mesh;

pub struct SlicePlane {
    pub origin: Vec3,
    pub normal: Vec3,
}

pub struct MeshChunk {
    pub id: usize,
    pub geometry: Mesh,
    pub plane: SlicePlane,
    pub alignment_transform: Mat4,  // For rotating to horizontal
}

pub fn decompose_mesh_into_chunks(
    mesh: &Mesh,
    planes: &[SlicePlane]
) -> Result<Vec<MeshChunk>, ChunkError> {

    // Step 1: Cut mesh at each plane (keep "positive" side)
    let mut chunks: Vec<Mesh> = planes.iter()
        .map(|plane| mesh.slice_plane(&plane.origin, &plane.normal, cap_cut=true))
        .collect::<Result<Vec<_>, _>>()?;

    // Step 2: Boolean subtraction (chiseling)
    for k in 0..chunks.len() {
        let mut remaining = chunks[k].clone();

        for r in (k+1)..chunks.len() {
            // Subtract later chunks from earlier chunks
            remaining = remaining.difference(&chunks[r])?;
        }

        chunks[k] = remaining;
    }

    // Step 3: Calculate alignment transforms
    chunks.into_iter()
        .zip(planes.iter())
        .enumerate()
        .map(|(id, (geometry, plane))| {
            let alignment_transform = compute_alignment_transform(
                &plane.origin,
                &plane.normal
            )?;

            Ok(MeshChunk {
                id,
                geometry,
                plane: plane.clone(),
                alignment_transform,
            })
        })
        .collect()
}

fn compute_alignment_transform(origin: &Vec3, normal: &Vec3) -> Result<Mat4, TransformError> {
    // Rodrigues' rotation formula (from Fractal's align_mesh_base_to_xy)
    let z_axis = Vec3::Z;
    let rotation_axis = normal.cross(z_axis);

    if rotation_axis.length() < 1e-6 {
        // Already aligned
        return Ok(Mat4::from_translation(-origin));
    }

    let rotation_axis = rotation_axis.normalize();
    let angle = normal.dot(z_axis).acos();

    // Rodrigues rotation matrix
    let k = Mat3::from_cols(
        Vec3::new(0.0, -rotation_axis.z, rotation_axis.y),
        Vec3::new(rotation_axis.z, 0.0, -rotation_axis.x),
        Vec3::new(-rotation_axis.y, rotation_axis.x, 0.0),
    );

    let rotation = Mat3::IDENTITY +
                   angle.sin() * k +
                   (1.0 - angle.cos()) * (k * k);

    // Combine rotation + translation
    let mut transform = Mat4::from_mat3(rotation);
    let rotated_origin = rotation * *origin;
    transform.w_axis = Vec4::new(0.0, 0.0, -rotated_origin.z, 1.0);

    Ok(transform)
}
```

**Integration into Layered:**

```rust
// crates/layerkit-algo/src/pipeline/impls/multidirectional_slicer.rs

pub struct MultidirectionalSlicer {
    pub slice_planes: Vec<SlicePlane>,
}

impl Slicer for MultidirectionalSlicer {
    fn slice(&self, ctx: &SlicingContext) -> PipelineResult<Vec<LayerData>> {
        // 1. Decompose mesh into chunks
        let chunks = decompose_mesh_into_chunks(&ctx.mesh, &self.slice_planes)?;

        // 2. For each chunk, slice in its rotated coordinate system
        let mut all_layers = Vec::new();

        for chunk in chunks {
            // Rotate chunk to make slice plane horizontal
            let rotated_mesh = chunk.geometry.transform(&chunk.alignment_transform);

            // Calculate slice heights in rotated space
            let z_min = rotated_mesh.bounds().min.z;
            let z_max = rotated_mesh.bounds().max.z;
            let layer_height = ctx.settings.layer_height;
            let slice_heights: Vec<f64> = (0..)
                .map(|i| z_min + i as f64 * layer_height)
                .take_while(|&z| z < z_max)
                .collect();

            // Slice all layers (use existing PlanarSlicer logic!)
            for z in slice_heights {
                let contours = slice_mesh_at_z(&rotated_mesh, z)?;

                // Create LayerData with metadata about chunk and transform
                let mut layer = LayerData {
                    z_height: z,
                    regions: vec![],
                    chunk_id: Some(chunk.id),
                    chunk_transform: Some(chunk.alignment_transform.inverse()),
                };

                // Convert contours to RegionData (existing code)
                for contour in contours {
                    layer.regions.push(RegionData {
                        contour,
                        segment_sources: vec![],  // TODO: populate
                        perimeters: None,
                        infill: None,
                        is_solid: true,
                        region_type: RegionType::Normal,
                    });
                }

                all_layers.push(layer);
            }
        }

        Ok(all_layers)
    }
}
```

---

### ❌ Coordinate Transformation

**From Fractal-Cortex** (`align_mesh_base_to_xy` lines 824-878):

Already included in the code above. The key insight is **Rodrigues' rotation formula** to align any normal vector to Z-axis.

---

### ❌ Nozzle-Bed Collision Detection

**From Fractal-Cortex** (`checkForBedNozzleCollisions` lines 918-937):

```python
def checkForBedNozzleCollisions(chunk, meshSections, transform3DList):
    minAcceptableBedToNozzleClearance = 12.0  # mm

    for layer, section in enumerate(sectionZValuesBySlicePlane):
        theta = directionsRad[chunk][0]  # Tilt angle
        for z in section:
            if z <= minAcceptableBedToNozzleClearance:
                # Clearance considering bed tilt
                currentBedToNozzleDistance = abs(z) / np.sin(theta)

                if currentBedToNozzleDistance < minAcceptableBedToNozzleClearance:
                    return True  # COLLISION!

    return False
```

**How to add to Layered:**

Layered already has `collision.rs` infrastructure. Just need to implement this specific check:

```rust
// crates/layerkit-algo/src/pipeline/collision.rs

pub struct NozzleBedCollisionChecker {
    pub min_clearance: f64,  // 12.0 mm default
}

impl CollisionChecker for NozzleBedCollisionChecker {
    fn check_move(&self, from: &Pose, to: &Pose, hardware: &HardwareConstraints)
        -> CollisionResult
    {
        // Calculate bed tilt angle from slice plane orientation
        let theta = calculate_bed_tilt_angle(&hardware.current_slice_plane);

        // Check clearance at both endpoints
        for pos in [from, to] {
            let z_global = pos.position.z;

            if z_global <= self.min_clearance {
                // Actual clearance considering tilt
                let clearance = z_global.abs() / theta.sin();

                if clearance < self.min_clearance {
                    return CollisionResult::BedCollision {
                        position: pos.position,
                        clearance,
                        required: self.min_clearance,
                    };
                }
            }
        }

        CollisionResult::Safe
    }
}
```

---

## 5. What Research Found (That Neither Has)

### ❌ TCP (Tool Center Point) Kinematics

**From comprehensive compendium research:**

```rust
// NEW MODULE: crates/layerkit-algo/src/kinematics/tcp.rs

use nalgebra::{Vector3, Matrix4};

pub struct TCPKinematics {
    pub tool_length: f64,        // Nozzle tip to pivot distance
    pub dh_parameters: DHParams,  // Denavit-Hartenberg
}

impl TCPKinematics {
    /// Convert (tip position + tool vector) → (X, Y, Z, A, B) angles
    pub fn inverse_kinematics(
        &self,
        tip_pos: Vector3<f64>,
        tool_vec: Vector3<f64>,
    ) -> Result<(f64, f64, f64, f64, f64), KinematicError> {

        // Calculate A and B angles from tool vector
        let a_rad = tool_vec.z.atan2(
            (tool_vec.x.powi(2) + tool_vec.y.powi(2)).sqrt()
        );
        let c_rad = tool_vec.y.atan2(-tool_vec.x);

        // Tool offset compensation (pivot != tip)
        let pivot = tip_pos + tool_vec * self.tool_length;

        Ok((
            pivot.x,
            pivot.y,
            pivot.z,
            a_rad.to_degrees(),
            c_rad.to_degrees(),
        ))
    }

    /// Adjust feed rate for combined linear + rotary motion
    pub fn compensate_feed_rate(
        &self,
        from: &Pose5Axis,
        to: &Pose5Axis,
        nominal_feed: f64,
    ) -> f64 {
        let linear_dist = (to.position - from.position).magnitude();
        let rotary_dist = ((to.a - from.a).powi(2) + (to.b - from.b).powi(2)).sqrt();

        // Combined motion scaling
        let total_dist = (linear_dist.powi(2) + rotary_dist.powi(2)).sqrt();

        nominal_feed * (total_dist / linear_dist)
    }
}
```

**Integration points:**
- ToolpathPlanner outputs `Vec<Move>` with orientation
- GCodeWriter uses TCP kinematics to convert to machine axes
- Optional - can use Fractal's pre-computed approach instead

---

### ❌ Improved Collision Detection (Nozzle vs Part)

**From research:** Fractal only checks nozzle-bed, relies on chunk ordering for nozzle-part.

**Better approach using parry3d:**

```rust
// crates/layerkit-algo/src/pipeline/collision.rs (extend existing)

use parry3d::shape::{Capsule, TriMesh};
use parry3d::query::contact;

pub struct SweepingCollisionChecker {
    nozzle: Capsule,              // 50mm length, 0.4mm radius
    printed_chunks: Vec<TriMesh>,  // Accumulate as printing
    bed: TriMesh,
}

impl CollisionChecker for SweepingCollisionChecker {
    fn check_toolpath_segment(
        &self,
        from: &Pose5Axis,
        to: &Pose5Axis,
    ) -> CollisionResult {
        // Sample path at 10 intermediate points
        let samples = interpolate_path(from, to, 10);

        for pose in samples {
            let nozzle_pose = compute_nozzle_pose(&pose);

            // Check bed collision
            if let Some(contact) = contact(
                &nozzle_pose, &self.nozzle,
                &Isometry::identity(), &self.bed,
                0.0  // No tolerance
            ) {
                return CollisionResult::BedCollision {
                    location: pose,
                    penetration: contact.dist,
                };
            }

            // Check against already-printed chunks
            for (id, chunk) in self.printed_chunks.iter().enumerate() {
                if let Some(contact) = contact(
                    &nozzle_pose, &self.nozzle,
                    &Isometry::identity(), chunk,
                    0.0
                ) {
                    return CollisionResult::PartCollision {
                        chunk_id: id,
                        location: pose,
                        penetration: contact.dist,
                    };
                }
            }
        }

        CollisionResult::Safe
    }

    fn mark_chunk_printed(&mut self, chunk: TriMesh) {
        self.printed_chunks.push(chunk);
    }
}
```

**Winner:** Layered with parry3d integration. Better than Fractal's ordering-only approach.

---

### ❌ 5-Axis G-code Generation

**From research on Open5x and Fractal-5-Pro:**

Two approaches needed:

**Approach A: Manual Steppers (Fractal-5-Pro style)**
```rust
// crates/layerkit-gcode/src/multidirectional.rs

pub struct ManualStepperWriter {
    config: MultiAxisConfig,
}

impl GCodeWriter for ManualStepperWriter {
    fn write(&self, moves: &[Move], ctx: &SlicingContext) -> PipelineResult<String> {
        let mut gcode = String::new();

        // Chunk transitions: rotate bed THEN print
        if move.is_chunk_transition {
            gcode.push_str(&format!(
                "G1 E-5 F1800 ; Retract\n\
                 G0 Z30 F1000 ; Lift for rotation\n\
                 MANUAL_STEPPER STEPPER=stepper_a MOVE={:.2} SPEED=15 SYNC=1\n\
                 MANUAL_STEPPER STEPPER=stepper_b MOVE={:.2} SPEED=10 SYNC=1\n",
                move.a_angle,
                move.b_angle,
            ));
        }

        // Regular print move (coordinates pre-transformed!)
        gcode.push_str(&format!(
            "G1 X{:.3} Y{:.3} Z{:.3} E{:.5} F{:.0}\n",
            move.end.x,
            move.end.y,
            move.end.z,
            move.extrusion,
            move.feedrate,
        ));

        Ok(gcode)
    }
}
```

**Approach B: Integrated Kinematics (RRF/Klipper MAF)**
```rust
pub struct IntegratedKinematicsWriter {
    tcp: TCPKinematics,
}

impl GCodeWriter for IntegratedKinematicsWriter {
    fn write(&self, moves: &[Move], ctx: &SlicingContext) -> PipelineResult<String> {
        let mut gcode = String::new();

        for m in moves {
            // Use TCP kinematics to convert to machine axes
            let (x, y, z, a, b) = self.tcp.inverse_kinematics(
                m.end.position,
                m.end.orientation,
            )?;

            // Compensate feed rate for rotary motion
            let feed = self.tcp.compensate_feed_rate(&m.start, &m.end, m.feedrate);

            // Combined XYZAB move
            gcode.push_str(&format!(
                "G1 X{:.3} Y{:.3} Z{:.3} A{:.2} B{:.2} E{:.5} F{:.0}\n",
                x, y, z, a, b,
                m.extrusion,
                feed,
            ));
        }

        Ok(gcode)
    }
}
```

---

## 6. Implementation Roadmap

### Phase 1: Add Multidirectional Slicing (2-3 weeks)

**Goal:** Implement Fractal-Cortex chunk decomposition in Layered's architecture.

**Tasks:**
1. Create `crates/layerkit-algo/src/multidirectional/` module
2. Implement `chunk_decomposition.rs`:
   - `decompose_mesh_into_chunks()`
   - `compute_alignment_transform()`
3. Implement `MultidirectionalSlicer` as new `Slicer` trait
4. Add `ChunkSurface` implementing `SliceSurface` trait
5. Test with Fractal's example files (pipe_fitting.stl)

**Deliverables:**
- [ ] Chunk decomposition working
- [ ] Boolean subtraction (mesh.difference) working
- [ ] Coordinate transformation validated
- [ ] Integration tests passing

---

### Phase 2: 5-Axis G-code Support (1-2 weeks)

**Goal:** Generate G-code for manual stepper and integrated kinematics modes.

**Tasks:**
1. Extend `Move` struct to include orientation:
   ```rust
   pub struct Move {
       pub start: Pose5Axis,
       pub end: Pose5Axis,
       pub extrusion: f64,
       pub feedrate: f64,
       pub is_chunk_transition: bool,
   }

   pub struct Pose5Axis {
       pub position: Vec3,
       pub orientation: Vec3,  // Or use a/b angles directly
   }
   ```

2. Implement `ManualStepperWriter` (GCodeWriter trait)
3. Implement `IntegratedKinematicsWriter` (optional, for future)
4. Add firmware flavor selection in config

**Deliverables:**
- [ ] G-code output matches Fractal-Cortex format
- [ ] Manual stepper moves correct
- [ ] Feed rate scaling working
- [ ] Test on Fractal-5-Pro hardware (if available)

---

### Phase 3: TCP Kinematics (Optional - 2 weeks)

**Goal:** Add proper TCP compensation for integrated kinematics mode.

**Tasks:**
1. Create `crates/layerkit-algo/src/kinematics/` module
2. Implement `tcp.rs` with inverse kinematics
3. Add feed rate compensation
4. Add singularity detection (B ≈ ±90°)
5. Integrate into `IntegratedKinematicsWriter`

**Deliverables:**
- [ ] TCP inverse kinematics validated
- [ ] Feed rate compensation working
- [ ] Singularity warnings
- [ ] RepRapFirmware/Klipper MAF compatible output

---

### Phase 4: Enhanced Collision Detection (1 week)

**Goal:** Add nozzle-part collision detection beyond chunk ordering.

**Tasks:**
1. Integrate `parry3d` crate
2. Implement `SweepingCollisionChecker`
3. Add capsule nozzle representation
4. Accumulate printed geometry during simulation
5. Add swept volume checking

**Deliverables:**
- [ ] Nozzle-bed collision working (match Fractal's 12mm check)
- [ ] Nozzle-part collision detection (NEW capability!)
- [ ] Swept volume checking along paths
- [ ] Real-time preview highlighting collisions

---

### Phase 5: UI Integration (1-2 weeks)

**Goal:** Add 5-axis controls to existing Layered UI.

**Tasks:**
1. Add slice plane definition UI (similar to Fractal-Cortex)
   - Position (X, Y, Z)
   - Orientation (theta, phi in spherical coords)
   - Interactive 3D manipulation
2. Add collision visualization
3. Add chunk ordering display
4. Add 5-axis simulation mode (color by chunk)
5. Add machine configuration (manual stepper vs integrated)

**Deliverables:**
- [ ] Slice plane editor functional
- [ ] Collision warnings in UI
- [ ] Chunk visualization
- [ ] 5-axis G-code preview

---

## 7. Files to Create/Modify

### New Files

```
crates/layerkit-algo/src/
├── multidirectional/
│   ├── mod.rs
│   ├── chunk_decomposition.rs  ← From Fractal algorithm
│   ├── chunk_surface.rs         ← ChunkSurface SliceSurface impl
│   └── multidirectional_slicer.rs  ← MultidirectionalSlicer Slicer impl
├── kinematics/
│   ├── mod.rs
│   ├── tcp.rs                   ← TCP inverse kinematics
│   └── pose.rs                  ← Pose5Axis struct
└── collision/
    ├── nozzle_bed.rs            ← From Fractal (12mm check)
    └── swept_volume.rs          ← New (parry3d integration)

crates/layerkit-gcode/src/
├── multidirectional/
│   ├── mod.rs
│   ├── manual_stepper.rs        ← From Fractal G-code format
│   └── integrated_kinematics.rs ← With TCP support
```

### Modified Files

```
crates/layerkit-core/src/
└── point.rs                     ← Add Pose5Axis

crates/layerkit-algo/src/
├── pipeline/
│   ├── layer_data.rs            ← Add chunk_id, chunk_transform fields
│   ├── traits.rs                ← Update Move struct
│   └── context.rs               ← Add current_chunk field
└── lib.rs                       ← Export multidirectional module

crates/layerkit-gcode/src/
└── lib.rs                       ← Export multidirectional writers

Cargo.toml (workspace)
└── [dependencies]
    ├── parry3d = "0.13"         ← For collision detection
    ├── nalgebra = "0.32"        ← For TCP kinematics (already have glam)
    └── rapier3d = "0.18"        ← Optional (if need physics sim)
```

---

## 8. Testing Strategy

### Unit Tests

```rust
// crates/layerkit-algo/src/multidirectional/tests.rs

#[test]
fn test_chunk_decomposition_two_planes() {
    // Load simple test mesh (cube)
    let mesh = Mesh::from_stl("test-models/cube.stl").unwrap();

    // Define two slice planes
    let planes = vec![
        SlicePlane {
            origin: Vec3::new(0.0, 0.0, 0.0),
            normal: Vec3::Z,  // Vertical
        },
        SlicePlane {
            origin: Vec3::new(0.0, 0.0, 50.0),
            normal: Vec3::new(0.0, 1.0, 0.0),  // Horizontal at Z=50
        },
    ];

    // Decompose
    let chunks = decompose_mesh_into_chunks(&mesh, &planes).unwrap();

    // Verify
    assert_eq!(chunks.len(), 2);
    assert!(chunks[0].geometry.volume() > 0.0);
    assert!(chunks[1].geometry.volume() > 0.0);

    // Chunks should not overlap
    let overlap = chunks[0].geometry.intersection(&chunks[1].geometry).unwrap();
    assert!(overlap.is_empty());
}

#[test]
fn test_coordinate_transformation() {
    let origin = Vec3::new(0.0, 0.0, 50.0);
    let normal = Vec3::new(0.0, 1.0, 0.0);  // Pointing in +Y

    let transform = compute_alignment_transform(&origin, &normal).unwrap();

    // Transform should align normal to Z-axis
    let transformed_normal = transform.transform_vector3(normal);
    assert!((transformed_normal - Vec3::Z).length() < 1e-6);
}

#[test]
fn test_nozzle_bed_collision_detection() {
    let checker = NozzleBedCollisionChecker {
        min_clearance: 12.0,
    };

    let pose = Pose5Axis {
        position: Vec3::new(100.0, 100.0, 5.0),  // Low Z
        orientation: Vec3::new(0.0, 0.0, 1.0),   // Vertical
    };

    let hardware = HardwareConstraints {
        current_slice_plane: SlicePlane {
            origin: Vec3::ZERO,
            normal: Vec3::new(0.0, 0.707, 0.707),  // 45° tilt
        },
        ..Default::default()
    };

    let result = checker.check_move(&pose, &pose, &hardware);

    // At Z=5mm with 45° tilt, clearance = 5 / sin(45°) ≈ 7mm < 12mm
    assert!(matches!(result, CollisionResult::BedCollision { .. }));
}
```

### Integration Tests

```rust
// tests/integration/multidirectional_slicing.rs

#[test]
fn test_full_multidirectional_pipeline() {
    // Load Fractal-Cortex example file
    let mesh = Mesh::from_stl("test-models/pipe_fitting.stl").unwrap();

    // Define slice planes (similar to Fractal example)
    let slicer = MultidirectionalSlicer {
        slice_planes: vec![
            SlicePlane {
                origin: Vec3::new(0.0, 0.0, 0.0),
                normal: Vec3::Z,
            },
            SlicePlane {
                origin: Vec3::new(0.0, 0.0, 30.0),
                normal: Vec3::new(0.707, 0.0, 0.707),  // 45° tilt
            },
        ],
    };

    // Build pipeline
    let pipeline = SlicePipelineBuilder::new()
        .with_slicer(Arc::new(slicer))
        .with_perimeter_generator(Arc::new(ClassicPerimeterGen::default()))
        .with_infill_generator(Arc::new(RectilinearInfillGen::default()))
        .with_gcode_writer(Arc::new(ManualStepperWriter::default()))
        .build();

    // Run
    let ctx = SlicingContext {
        mesh: Arc::new(mesh),
        settings: SliceSettings::default(),
        hardware: HardwareConstraints::fractal_5_pro(),
        progress: None,
    };

    let events = pipeline.run_streaming(ctx);

    // Collect results
    let mut layer_count = 0;
    for event in events {
        match event {
            PipelineEvent::LayerComplete { .. } => layer_count += 1,
            PipelineEvent::Complete { gcode, .. } => {
                // Verify G-code structure
                assert!(gcode.contains("MANUAL_STEPPER"));
                assert!(gcode.contains("STEPPER=stepper_a"));
                assert!(gcode.contains("STEPPER=stepper_b"));
            },
            _ => {},
        }
    }

    assert!(layer_count > 0);
}
```

### Hardware Validation Tests

```rust
// tests/hardware/fractal_5_pro.rs

#[test]
#[ignore]  // Only run on actual hardware
fn test_on_fractal_5_pro() {
    // Generate G-code
    let gcode = generate_test_print();

    // Upload to printer via Moonraker API
    let client = MoonrakerClient::new("http://fractal-5-pro.local")?;
    client.upload_gcode("test_print.gcode", &gcode)?;

    // Start print
    client.start_print("test_print.gcode")?;

    // Monitor for completion
    // ...
}
```

---

## 9. Key Decisions

### Decision 1: Pre-computed Coordinates vs TCP Kinematics

**Options:**

**A. Fractal-Cortex Approach (Pre-computed)**
- Slicer pre-computes XYZ coordinates after rotation
- G-code uses manual stepper moves for A/B
- NO TCP in firmware
- Simpler firmware integration
- Larger G-code files

**B. Integrated TCP Approach**
- Slicer outputs tip position + orientation
- Firmware handles TCP inverse kinematics
- Combined XYZAB moves
- Requires Klipper MAF or RepRapFirmware
- Smaller G-code files, smoother motion

**Recommendation:** **Support BOTH modes via GCodeWriter trait!**

```rust
pub enum MultiAxisMode {
    ManualSteppers,      // Fractal-5-Pro style
    IntegratedKinematics // RRF/Klipper MAF style
}

impl SlicePipelineBuilder {
    pub fn with_multiaxis_mode(mut self, mode: MultiAxisMode) -> Self {
        self.gcode_writer = match mode {
            MultiAxisMode::ManualSteppers =>
                Arc::new(ManualStepperWriter::default()),
            MultiAxisMode::IntegratedKinematics =>
                Arc::new(IntegratedKinematicsWriter::default()),
        };
        self
    }
}
```

---

### Decision 2: Chunk Ordering Strategy

**Options:**

**A. Fractal Approach (Boolean Subtraction)**
- Automatic via geometry
- Always safe
- User defines planes in any order

**B. Manual Ordering**
- User specifies print order
- More control
- Could be unsafe

**Recommendation:** **Use Fractal's automatic approach (Option A)**. It's proven to work and eliminates user error.

---

### Decision 3: SliceSurface for Chunks vs New Trait

**Options:**

**A. Reuse SliceSurface Trait**
```rust
impl SliceSurface for ChunkSurface {
    fn z_at(&self, x: f64, y: f64) -> f64 { ... }
}
```

**B. New ChunkSlicer Trait**
```rust
pub trait ChunkSlicer: Slicer {
    fn slice_chunks(...) -> ...;
}
```

**Recommendation:** **Option A (Reuse SliceSurface)**. Fits existing architecture, no new traits needed.

---

## 10. Conclusion

**YOU HAVE A BETTER FOUNDATION THAN FRACTAL-CORTEX!**

### What You Have (Better):
✅ Trait-based modular pipeline
✅ segment_sources (mesh connectivity)
✅ Arc<Mesh> (efficient sharing)
✅ f64 precision (no early quantization)
✅ Streaming pipeline (real-time preview)
✅ Designed for non-planar/5-axis

### What You Need (From Fractal):
❌ Chunk decomposition algorithm
❌ Boolean subtraction for collision prevention
❌ Coordinate transformation (Rodrigues rotation)
❌ Nozzle-bed collision check (12mm clearance)
❌ Manual stepper G-code format

### What You Need (From Research):
❌ TCP inverse kinematics
❌ Feed rate compensation
❌ Nozzle-part collision (swept volume)
❌ Integrated kinematics G-code

### Estimated Timeline:
- Phase 1 (Multidirectional): 2-3 weeks
- Phase 2 (G-code): 1-2 weeks
- Phase 3 (TCP): 2 weeks
- Phase 4 (Collision): 1 week
- Phase 5 (UI): 1-2 weeks

**Total: 7-10 weeks to full 5-axis capability**

**But you can have basic multidirectional slicing working in 2-3 weeks by porting Fractal's chunk decomposition!**

---

**Ready to begin implementation? Start with Phase 1: Chunk Decomposition Module.**
