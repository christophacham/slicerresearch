# IMPORTANT: Collision Detection Strategies for 5-Axis Printing
**Date:** 2026-01-08
**Priority:** CRITICAL - Safety requirement for multi-axis printing

---

## Executive Summary

**What:** Detect when the nozzle/hotend would collide with the bed or already-printed part during 5-axis motion.

**Why:** Multi-axis printers can self-destruct if toolpaths cause collisions. Unlike 3-axis (where Z only increases), 5-axis can approach from any angle.

**Where Implemented:**
- Fractal-Cortex: `slicing_functions.py:918-937` (nozzle-bed only, 12mm clearance check)
- Layered: `crates/layerkit-algo/src/pipeline/collision.rs` (infrastructure exists, needs implementation)

**Status:** ❌ Not fully implemented in either system - critical gap!

---

## 1. Types of Collisions

### 1.1 Nozzle-Bed Collision

**Scenario:** Tilted bed causes nozzle to hit build surface at edges.

```
Side view with tilted bed:

           ↓ Nozzle
          ---
         |   |
        /     \
       /_______\  ← Hotend

       /  COLLISION!
      /
     /_______________  ← Tilted bed (30°)
```

**When it happens:**
- Bed tilted at angle
- Nozzle at low Z height
- Printing near edge of build volume

**Detection:** Geometric calculation considering bed angle and nozzle height.

---

### 1.2 Nozzle-Part Collision

**Scenario:** Nozzle hits already-printed sections when approaching from new angle.

```
Top view:

  Chunk 2 (not printed yet)
       │
       │
       ▼
    ┌─────┐
    │     │
    │  1  │  ← Chunk 1 (already printed)
    │     │
    └─────┘
      ▲
      │ Nozzle approaching from bottom
      │ Would hit Chunk 1!
```

**When it happens:**
- Printing later chunks with different orientation
- Nozzle approaches from side/below
- Travel moves between sections

**Detection:** 3D swept volume checking with printed geometry.

---

### 1.3 Hotend-Part Collision

**Scenario:** The wider hotend body (not just nozzle tip) hits part.

```
Side view:

    ┌───────────┐  ← Hotend body (20mm diameter)
    │           │
    │    ●      │  ← Heater block
    └─────┬─────┘
          │
          └─ ← Nozzle (0.4mm)

       ┌──────┐
       │ Part │  ← Collision with body, not tip!
       └──────┘
```

**When it happens:**
- Nozzle clears but body doesn't
- Overhangs or complex geometry
- Tight spaces

**Detection:** Model hotend as capsule or cylinder, not just point.

---

## 2. Fractal-Cortex Implementation

### 2.1 Code Reference

**File:** `slicing_functions.py`
**Function:** `checkForBedNozzleCollisions(chunk, meshSections, transform3DList)`
**Lines:** 918-937

```python
def checkForBedNozzleCollisions(chunk, meshSections, transform3DList):
    global stopSlicing
    minAcceptableBedToNozzleClearance = 12.0  # mm

    # Convert 2D paths to 3D global coordinates
    paths_3D = []
    for layer, path2D in enumerate(meshSections):
        currentTransform = transform3DList[layer]
        paths_3D.append(path2D.to_3D(currentTransform))

    # Extract all Z values
    sectionPoints = [path.vertices for path in paths_3D]
    sectionZValuesBySlicePlane = [[point[2] for point in section]
                                  for section in sectionPoints]

    # Check each point
    for layer, section in enumerate(sectionZValuesBySlicePlane):
        theta = directionsRad[chunk][0]  # Bed tilt angle (in radians)

        for z in section:
            if stopSlicing == False:
                # Only check low points
                if z <= minAcceptableBedToNozzleClearance:
                    # Calculate actual clearance considering bed tilt
                    currentBedToNozzleDistance = abs(z) / np.sin(theta)

                    if currentBedToNozzleDistance < minAcceptableBedToNozzleClearance:
                        stopSlicing = True  # Halt slicing!
                        return stopSlicing

    return stopSlicing
```

### 2.2 Algorithm Explanation

**Geometry:**

```
Tilted bed at angle θ:

    Nozzle
      ↓
     z │
       │ ╱  Actual clearance = z / sin(θ)
       │╱
      ╱│
     ╱θ│
    ╱──┴─────  Tilted bed
```

**Mathematical derivation:**

```
Given:
  z = vertical distance from bed origin to nozzle (global Z)
  θ = bed tilt angle from horizontal

The perpendicular distance from nozzle to bed surface is:
  d = z / sin(θ)

Example:
  z = 10mm
  θ = 30° (0.524 radians)
  d = 10 / sin(30°) = 10 / 0.5 = 20mm

If minClearance = 12mm, this is safe.

But if z = 5mm:
  d = 5 / 0.5 = 10mm < 12mm  → COLLISION!
```

### 2.3 Limitations

**What Fractal checks:**
- ✅ Nozzle-bed collision (single point)
- ✅ Considers bed tilt angle

**What Fractal DOESN'T check:**
- ❌ Nozzle-part collision (relies on chunk ordering)
- ❌ Hotend body collision (only checks nozzle tip)
- ❌ Swept volume during moves (only checks endpoints)
- ❌ Travel moves vs print moves

**Quote from Fractal README:**
> "You do not have to worry about collisions between the nozzle and in-process part because the slicer orders slicing directions in a safe manner no matter how you define them."

This is **NOT always true** - chunk ordering prevents *most* collisions, but not all (e.g., travel moves, part overhangs).

---

## 3. Layered Implementation (Enhanced)

### 3.1 File Structure

```
crates/layerkit-algo/src/collision/
├── mod.rs                    # Public API
├── bed.rs                    # Nozzle-bed collision (from Fractal)
├── part.rs                   # Nozzle-part collision (NEW)
├── swept_volume.rs           # Swept volume checking (NEW)
├── hotend_geometry.rs        # Hotend models (capsule, cylinder)
└── bvh.rs                    # Spatial acceleration (BVH)
```

### 3.2 Core Trait

**File:** `crates/layerkit-algo/src/collision/mod.rs`

```rust
use glam::Vec3;
use layerkit_core::mesh::Mesh;

/// Represents a pose in 5-axis space
#[derive(Debug, Clone)]
pub struct Pose5Axis {
    pub position: Vec3,          // X, Y, Z (nozzle tip)
    pub orientation: Vec3,       // Tool vector (unit)
    pub a_angle: f32,            // Rotation around Y (deg)
    pub b_angle: f32,            // Rotation around X (deg)
}

/// Result of collision check
#[derive(Debug, PartialEq)]
pub enum CollisionResult {
    /// No collision detected
    Safe,

    /// Nozzle would hit bed
    BedCollision {
        location: Pose5Axis,
        clearance: f32,          // Actual clearance (mm)
        required: f32,           // Minimum required (mm)
    },

    /// Nozzle would hit already-printed part
    PartCollision {
        location: Pose5Axis,
        chunk_id: usize,         // Which chunk was hit
        penetration: f32,        // How far it penetrates (mm)
    },

    /// Hotend body would hit (not nozzle)
    HotendCollision {
        location: Pose5Axis,
        object: String,          // "bed" or "part"
    },
}

/// Trait for collision checkers
pub trait CollisionChecker: Send + Sync {
    /// Check a single move for collisions
    fn check_move(
        &self,
        from: &Pose5Axis,
        to: &Pose5Axis,
        hardware: &HardwareConstraints,
    ) -> CollisionResult;

    /// Check entire toolpath
    fn check_toolpath(
        &self,
        moves: &[Move],
        hardware: &HardwareConstraints,
    ) -> Vec<CollisionResult> {
        moves.iter()
            .enumerate()
            .filter_map(|(i, m)| {
                let from = if i > 0 { &moves[i-1].end } else { &m.start };
                let to = &m.end;

                match self.check_move(from, to, hardware) {
                    CollisionResult::Safe => None,
                    collision => Some(collision),
                }
            })
            .collect()
    }
}

/// Hardware configuration for collision checking
#[derive(Debug, Clone)]
pub struct HardwareConstraints {
    pub bed_tilt_angle: f32,     // Current bed tilt (radians)
    pub min_bed_clearance: f32,  // Minimum Z clearance (mm)
    pub hotend: HotendGeometry,
    pub build_volume: BoundingBox,
}

#[derive(Debug, Clone)]
pub struct HotendGeometry {
    pub nozzle_length: f32,      // Tip to heater block (mm)
    pub body_radius: f32,        // Hotend body radius (mm)
    pub body_length: f32,        // Body length (mm)
}
```

### 3.3 Bed Collision Checker

**File:** `crates/layerkit-algo/src/collision/bed.rs`

```rust
use super::*;

pub struct NozzleBedChecker {
    pub min_clearance: f32,  // Default: 12.0mm (from Fractal)
}

impl CollisionChecker for NozzleBedChecker {
    fn check_move(
        &self,
        from: &Pose5Axis,
        to: &Pose5Axis,
        hardware: &HardwareConstraints,
    ) -> CollisionResult {
        // Sample path at multiple points
        let samples = interpolate_poses(from, to, 10);

        for pose in samples {
            // Get global Z coordinate of nozzle tip
            let z_global = pose.position.z;

            // Only check low positions
            if z_global <= self.min_clearance {
                // Calculate perpendicular distance to bed
                let theta = hardware.bed_tilt_angle;

                // Actual clearance considering tilt
                let clearance = if theta.abs() < 1e-6 {
                    // No tilt - clearance is just Z
                    z_global.abs()
                } else {
                    // Perpendicular distance
                    z_global.abs() / theta.sin()
                };

                if clearance < self.min_clearance {
                    return CollisionResult::BedCollision {
                        location: pose.clone(),
                        clearance,
                        required: self.min_clearance,
                    };
                }
            }
        }

        CollisionResult::Safe
    }
}

/// Interpolate poses along path
fn interpolate_poses(from: &Pose5Axis, to: &Pose5Axis, num_samples: usize) -> Vec<Pose5Axis> {
    (0..=num_samples)
        .map(|i| {
            let t = i as f32 / num_samples as f32;

            Pose5Axis {
                position: from.position.lerp(to.position, t),
                orientation: from.orientation.slerp(to.orientation, t),
                a_angle: from.a_angle + t * (to.a_angle - from.a_angle),
                b_angle: from.b_angle + t * (to.b_angle - from.b_angle),
            }
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_collision_high_z() {
        let checker = NozzleBedChecker { min_clearance: 12.0 };

        let from = Pose5Axis {
            position: Vec3::new(0.0, 0.0, 50.0),  // High above bed
            orientation: Vec3::Z,
            a_angle: 0.0,
            b_angle: 0.0,
        };

        let hardware = HardwareConstraints {
            bed_tilt_angle: 0.0,  // No tilt
            min_bed_clearance: 12.0,
            hotend: HotendGeometry::default(),
            build_volume: BoundingBox::default(),
        };

        let result = checker.check_move(&from, &from, &hardware);
        assert_eq!(result, CollisionResult::Safe);
    }

    #[test]
    fn test_collision_low_z_with_tilt() {
        let checker = NozzleBedChecker { min_clearance: 12.0 };

        let from = Pose5Axis {
            position: Vec3::new(0.0, 0.0, 5.0),  // Low Z
            orientation: Vec3::Z,
            a_angle: 0.0,
            b_angle: 30.0,  // 30° tilt
        };

        let hardware = HardwareConstraints {
            bed_tilt_angle: 30.0_f32.to_radians(),
            min_bed_clearance: 12.0,
            hotend: HotendGeometry::default(),
            build_volume: BoundingBox::default(),
        };

        let result = checker.check_move(&from, &from, &hardware);

        // At Z=5mm with 30° tilt:
        // clearance = 5 / sin(30°) = 5 / 0.5 = 10mm < 12mm
        match result {
            CollisionResult::BedCollision { clearance, .. } => {
                assert!((clearance - 10.0).abs() < 0.1);
            }
            _ => panic!("Expected bed collision"),
        }
    }
}
```

### 3.4 Part Collision Checker (NEW)

**File:** `crates/layerkit-algo/src/collision/part.rs`

Uses **parry3d** for 3D collision detection:

```toml
# Cargo.toml
[dependencies]
parry3d = "0.13"
```

```rust
use parry3d::shape::{Capsule, TriMesh};
use parry3d::query::{contact, Ray, RayCast};
use parry3d::na::{Isometry3, Point3, Vector3};
use std::sync::Arc;

pub struct PartCollisionChecker {
    /// Nozzle geometry (modeled as capsule)
    nozzle: Capsule,

    /// Already-printed chunks (accumulated during print)
    printed_chunks: Vec<TriMesh>,

    /// Spatial acceleration structure
    bvh: Option<BVH>,
}

impl PartCollisionChecker {
    pub fn new(hotend: &HotendGeometry) -> Self {
        // Model nozzle as capsule (cylinder with rounded ends)
        let nozzle = Capsule::new(
            hotend.nozzle_length / 2.0,  // Half-height
            hotend.body_radius,          // Radius
        );

        Self {
            nozzle,
            printed_chunks: Vec::new(),
            bvh: None,
        }
    }

    /// Add a chunk that has been printed
    pub fn mark_chunk_printed(&mut self, chunk_mesh: TriMesh) {
        self.printed_chunks.push(chunk_mesh);

        // Rebuild BVH for faster queries
        self.rebuild_bvh();
    }

    fn rebuild_bvh(&mut self) {
        // Build spatial acceleration structure
        // (Simplified - real implementation would use proper BVH)
        self.bvh = Some(BVH::from_meshes(&self.printed_chunks));
    }
}

impl CollisionChecker for PartCollisionChecker {
    fn check_move(
        &self,
        from: &Pose5Axis,
        to: &Pose5Axis,
        hardware: &HardwareConstraints,
    ) -> CollisionResult {
        // Sample path densely
        let samples = interpolate_poses(from, to, 20);

        for pose in samples {
            // Compute nozzle position and orientation in world space
            let nozzle_pose = compute_nozzle_pose(&pose, hardware);

            // Check against all printed chunks
            for (chunk_id, chunk_mesh) in self.printed_chunks.iter().enumerate() {
                // Check for contact
                if let Some(contact) = contact(
                    &nozzle_pose,
                    &self.nozzle,
                    &Isometry3::identity(),
                    chunk_mesh,
                    0.0,  // No tolerance - exact contact
                ) {
                    return CollisionResult::PartCollision {
                        location: pose.clone(),
                        chunk_id,
                        penetration: contact.dist.abs(),
                    };
                }
            }
        }

        CollisionResult::Safe
    }
}

/// Compute nozzle pose in world space
fn compute_nozzle_pose(pose: &Pose5Axis, hardware: &HardwareConstraints) -> Isometry3<f32> {
    // Nozzle tip is at pose.position
    // Nozzle points in direction of pose.orientation

    // Offset nozzle geometry so tip is at position
    let capsule_center = pose.position +
                         pose.orientation * (hardware.hotend.nozzle_length / 2.0);

    // Build isometry (position + rotation)
    let translation = Vector3::new(
        capsule_center.x,
        capsule_center.y,
        capsule_center.z,
    );

    // Rotation to align capsule axis with tool orientation
    let rotation = rotation_from_to(Vector3::z(), Vector3::new(
        pose.orientation.x,
        pose.orientation.y,
        pose.orientation.z,
    ));

    Isometry3::from_parts(translation.into(), rotation)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_collision_empty_scene() {
        let hotend = HotendGeometry {
            nozzle_length: 50.0,
            body_radius: 10.0,
            body_length: 60.0,
        };

        let checker = PartCollisionChecker::new(&hotend);

        let pose = Pose5Axis {
            position: Vec3::new(50.0, 50.0, 20.0),
            orientation: Vec3::Z,
            a_angle: 0.0,
            b_angle: 0.0,
        };

        let hardware = HardwareConstraints::default();

        // No printed chunks yet - should be safe
        let result = checker.check_move(&pose, &pose, &hardware);
        assert_eq!(result, CollisionResult::Safe);
    }

    #[test]
    fn test_collision_with_printed_cube() {
        let hotend = HotendGeometry {
            nozzle_length: 50.0,
            body_radius: 10.0,
            body_length: 60.0,
        };

        let mut checker = PartCollisionChecker::new(&hotend);

        // Add a printed cube at (50, 50, 0) to (60, 60, 10)
        let cube = create_cube_mesh(Vec3::new(50.0, 50.0, 0.0), 10.0);
        checker.mark_chunk_printed(cube);

        // Try to move nozzle into the cube
        let pose = Pose5Axis {
            position: Vec3::new(55.0, 55.0, 5.0),  // Inside cube!
            orientation: Vec3::Z,
            a_angle: 0.0,
            b_angle: 0.0,
        };

        let hardware = HardwareConstraints::default();

        let result = checker.check_move(&pose, &pose, &hardware);

        match result {
            CollisionResult::PartCollision { .. } => {
                // Expected
            }
            _ => panic!("Expected part collision"),
        }
    }
}
```

### 3.5 Swept Volume Checker (Advanced)

**File:** `crates/layerkit-algo/src/collision/swept_volume.rs`

For even more accurate collision detection, check the VOLUME swept by the nozzle:

```rust
pub struct SweptVolumeChecker {
    part_checker: PartCollisionChecker,
    sample_rate: usize,  // Samples per mm of travel
}

impl CollisionChecker for SweptVolumeChecker {
    fn check_move(
        &self,
        from: &Pose5Axis,
        to: &Pose5Axis,
        hardware: &HardwareConstraints,
    ) -> CollisionResult {
        // Calculate move distance
        let distance = (to.position - from.position).length();

        // Sample densely based on distance
        let num_samples = (distance * self.sample_rate as f32).ceil() as usize;
        let samples = interpolate_poses(from, to, num_samples.max(10));

        // Check each sample
        for pose in samples {
            let result = self.part_checker.check_move(&pose, &pose, hardware);
            if result != CollisionResult::Safe {
                return result;
            }
        }

        CollisionResult::Safe
    }
}
```

---

## 4. Performance Optimization

### 4.1 Bounding Volume Hierarchy (BVH)

Checking every triangle is slow. Use spatial acceleration:

```rust
use bvh::bvh::BVH;
use bvh::aabb::{AABB, Bounded};
use bvh::bounding_hierarchy::BHShape;

pub struct MeshBVH {
    bvh: BVH,
    triangles: Vec<Triangle>,
}

impl MeshBVH {
    pub fn from_mesh(mesh: &TriMesh) -> Self {
        let triangles: Vec<_> = mesh.triangles()
            .enumerate()
            .map(|(i, tri)| TriangleShape { index: i, triangle: tri })
            .collect();

        let bvh = BVH::build(&triangles);

        Self { bvh, triangles }
    }

    pub fn ray_intersect(&self, ray: &Ray) -> Option<f32> {
        // Fast ray-BVH intersection
        self.bvh.traverse_iterator(ray, &self.triangles)
            .map(|hit| hit.distance)
            .min_by(|a, b| a.partial_cmp(b).unwrap())
    }
}

struct TriangleShape {
    index: usize,
    triangle: Triangle,
}

impl Bounded for TriangleShape {
    fn aabb(&self) -> AABB {
        AABB::with_bounds(
            self.triangle.min_point(),
            self.triangle.max_point(),
        )
    }
}
```

**Performance improvement:** O(log n) instead of O(n) for collision queries.

### 4.2 Conservative Checks First

```rust
impl CollisionChecker for OptimizedChecker {
    fn check_move(&self, from: &Pose5Axis, to: &Pose5Axis, hardware: &HardwareConstraints)
        -> CollisionResult
    {
        // STEP 1: Cheap bounding box check
        if !self.bounding_box_intersects(from, to) {
            return CollisionResult::Safe;
        }

        // STEP 2: Sphere-based conservative check
        if !self.sphere_intersects(from, to) {
            return CollisionResult::Safe;
        }

        // STEP 3: Expensive exact check (only if needed)
        self.exact_collision_check(from, to, hardware)
    }
}
```

### 4.3 GPU Acceleration (Future)

For real-time preview, offload to GPU:

```rust
// Using wgpu for GPU compute shaders

struct GPUCollisionChecker {
    device: wgpu::Device,
    collision_pipeline: wgpu::ComputePipeline,
}

impl GPUCollisionChecker {
    pub async fn check_batch(&self, poses: &[Pose5Axis]) -> Vec<bool> {
        // Upload poses to GPU
        // Run compute shader
        // Download results
        todo!()
    }
}
```

---

## 5. Integration with Pipeline

### 5.1 During Slicing

```rust
impl Slicer for MultidirectionalSlicer {
    fn slice(&self, ctx: &SlicingContext) -> PipelineResult<Vec<LayerData>> {
        let chunks = decompose_mesh_into_chunks(&ctx.mesh, &self.slice_planes)?;

        let bed_checker = NozzleBedChecker { min_clearance: 12.0 };

        for chunk in chunks {
            // Check if slice plane would cause bed collision
            let test_pose = Pose5Axis {
                position: chunk.plane.origin,
                orientation: chunk.plane.normal,
                a_angle: 0.0,
                b_angle: calculate_bed_tilt(&chunk.plane.normal),
            };

            let hardware = HardwareConstraints {
                bed_tilt_angle: test_pose.b_angle.to_radians(),
                ..ctx.hardware
            };

            match bed_checker.check_move(&test_pose, &test_pose, &hardware) {
                CollisionResult::BedCollision { clearance, required } => {
                    return Err(PipelineError::IllegalSlicePlane {
                        chunk_id: chunk.id,
                        reason: format!(
                            "Bed collision: clearance {:.1}mm < required {:.1}mm",
                            clearance, required
                        ),
                    });
                }
                _ => {}
            }

            // Continue slicing...
        }

        Ok(all_layers)
    }
}
```

### 5.2 During G-code Generation

```rust
impl GCodeWriter for ManualStepperWriter {
    fn write(&self, moves: &[Move], ctx: &SlicingContext) -> PipelineResult<String> {
        let mut gcode = String::new();

        let checker = CompositeChecker::new()
            .with_bed_checker(NozzleBedChecker { min_clearance: 12.0 })
            .with_part_checker(PartCollisionChecker::new(&ctx.hardware.hotend));

        // Check all moves
        let collisions = checker.check_toolpath(moves, &ctx.hardware);

        if !collisions.is_empty() {
            return Err(PipelineError::CollisionDetected {
                count: collisions.len(),
                first: collisions[0].clone(),
            });
        }

        // Safe - generate G-code
        for move in moves {
            gcode.push_str(&format!("G1 X{} Y{} Z{} ...\n", ...));
        }

        Ok(gcode)
    }
}
```

### 5.3 Real-Time Preview

```rust
pub struct CollisionPreview {
    checker: Arc<dyn CollisionChecker>,
    highlighted_moves: Vec<usize>,  // Move indices with collisions
}

impl CollisionPreview {
    pub fn update(&mut self, moves: &[Move], hardware: &HardwareConstraints) {
        self.highlighted_moves.clear();

        for (i, m) in moves.iter().enumerate() {
            let from = if i > 0 { &moves[i-1].end } else { &m.start };
            let result = self.checker.check_move(from, &m.end, hardware);

            if result != CollisionResult::Safe {
                self.highlighted_moves.push(i);
            }
        }
    }

    pub fn render(&self, renderer: &mut Renderer) {
        // Render collision zones in red
        for &i in &self.highlighted_moves {
            renderer.set_color(Color::RED);
            renderer.draw_move(&self.moves[i]);
        }
    }
}
```

---

## 6. Testing

### 6.1 Unit Tests

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_bed_collision_at_extreme_tilt() {
        // At 80° tilt, even moderate Z causes collision
        let checker = NozzleBedChecker { min_clearance: 12.0 };

        let pose = Pose5Axis {
            position: Vec3::new(100.0, 100.0, 8.0),
            orientation: Vec3::Z,
            a_angle: 0.0,
            b_angle: 80.0,
        };

        let hardware = HardwareConstraints {
            bed_tilt_angle: 80.0_f32.to_radians(),
            min_bed_clearance: 12.0,
            ..Default::default()
        };

        let result = checker.check_move(&pose, &pose, &hardware);

        // clearance = 8 / sin(80°) ≈ 8 / 0.985 ≈ 8.1mm < 12mm
        match result {
            CollisionResult::BedCollision { .. } => {},
            _ => panic!("Expected collision at extreme tilt"),
        }
    }
}
```

### 6.2 Integration Tests

```rust
#[test]
fn test_fractal_example_no_collisions() {
    let mesh = Mesh::from_stl("test-models/pipe_fitting.stl").unwrap();

    // Use same planes as Fractal example
    let planes = vec![
        SlicePlane::from_spherical(Vec3::ZERO, 0.0, 0.0),
        SlicePlane::from_spherical(Vec3::new(0.0, 0.0, 30.0), 45.0, 0.0),
    ];

    let chunks = decompose_mesh_into_chunks(&mesh, &planes).unwrap();

    // Check all chunks for collisions
    let checker = NozzleBedChecker { min_clearance: 12.0 };

    for chunk in chunks {
        // Simulate checking all layers
        // (Simplified - real test would check actual toolpaths)
        assert_no_collisions(&chunk, &checker);
    }
}
```

---

## 7. UI Integration

### 7.1 Visual Warnings

```jsx
// Svelte UI component
<script>
  import { CollisionChecker } from './collision';

  let collisions = [];

  function onSlicePlaneMoved(plane) {
    // Check collision in real-time as user drags plane
    const result = checkCollision(plane);

    if (result.hasCollision) {
      plane.color = 'red';
      showWarning(`Collision: ${result.reason}`);
    } else {
      plane.color = 'green';
    }
  }
</script>

<SlicePlaneEditor {planes} on:planeMove={onSlicePlaneMoved} />
```

### 7.2 Collision Report

```rust
pub struct CollisionReport {
    pub total_moves: usize,
    pub safe_moves: usize,
    pub bed_collisions: Vec<CollisionDetail>,
    pub part_collisions: Vec<CollisionDetail>,
}

pub struct CollisionDetail {
    pub move_index: usize,
    pub layer_index: usize,
    pub chunk_id: usize,
    pub severity: CollisionSeverity,
    pub description: String,
}

pub enum CollisionSeverity {
    Warning,   // < 2mm clearance
    Error,     // < 0mm (actual collision)
    Critical,  // > 5mm penetration
}
```

---

## 8. References

### Code References

- **Fractal-Cortex:** `slicing_functions.py:918-937`
- **Layered (existing):** `crates/layerkit-algo/src/pipeline/collision.rs`

### Libraries

- **parry3d:** https://docs.rs/parry3d/
- **bvh:** https://docs.rs/bvh/
- **ncollide3d (deprecated):** Predecessor to parry3d

### Papers

1. **Ericson, C.** (2004). "Real-Time Collision Detection"
   - Chapter 4: Bounding Volume Hierarchies
   - Chapter 5: Spatial Partitioning

2. **Akenine-Möller, T.** (2018). "Real-Time Rendering" (4th ed.)
   - Chapter 16.6: Collision and Intersection Methods

---

## 9. Summary

### What to Implement

**Phase 1 (Critical):**
- [ ] `NozzleBedChecker` - Port from Fractal (12mm clearance)
- [ ] Integration with slicing pipeline
- [ ] UI warnings for illegal slice planes

**Phase 2 (Important):**
- [ ] `PartCollisionChecker` - Using parry3d
- [ ] Accumulated printed geometry tracking
- [ ] Swept volume checking

**Phase 3 (Advanced):**
- [ ] BVH spatial acceleration
- [ ] Conservative multi-stage checks
- [ ] Real-time preview with collision highlighting

**Phase 4 (Future):**
- [ ] GPU acceleration for real-time
- [ ] Machine learning collision prediction
- [ ] Automatic slice plane adjustment to avoid collisions

---

**Next:** [important-04-gcode-generation-5axis.md](important-04-gcode-generation-5axis.md)
