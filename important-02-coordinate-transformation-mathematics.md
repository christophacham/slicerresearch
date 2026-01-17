# IMPORTANT: Coordinate Transformation Mathematics for 5-Axis Slicing
**Date:** 2026-01-08
**Priority:** CRITICAL - Required for chunk-based slicing

---

## Executive Summary

**What:** Transform mesh coordinates so arbitrary slice planes become horizontal (parallel to XY plane), enabling standard planar slicing algorithms to work.

**Why:** Each chunk has a different slicing direction. Rather than modify all slicing algorithms to work with arbitrary planes, we rotate the chunk so slicing is always perpendicular to Z-axis.

**Where:** Fractal-Cortex `slicing_functions.py` lines 824-878 (`align_mesh_base_to_xy`)

**Mathematics:** Rodrigues' rotation formula + translation

---

## 1. The Problem

### 1.1 Input

A mesh and a slice plane that's NOT horizontal:

```
Slice plane:
  Origin: (0, 0, 50)
  Normal: (0.707, 0, 0.707)  ← Points 45° up-right

Current mesh orientation:
    ┌─────┐
   /│    /│
  / │   / │
 /  └──/──┘
/     /
└────┘

Slice direction →  (tilted 45°)
```

### 1.2 Desired Output

Same mesh, rotated so slice plane is horizontal:

```
After transformation:
    ┌────┐
    │    │
    │    │  ← Slice plane is now Z=0 (horizontal)
    │    │
    └────┘

Slice direction ↓  (vertical, perpendicular to XY)
```

Now standard planar slicing (slice_mesh_at_z) works!

---

## 2. Mathematical Foundation

### 2.1 Rodrigues' Rotation Formula

**Problem:** Rotate vector **v** around axis **k** by angle θ.

**Formula (vector form):**
```
v_rot = v·cos(θ) + (k × v)·sin(θ) + k·(k·v)·(1 - cos(θ))
```

**Formula (matrix form):**
```
R = I + sin(θ)·[K] + (1 - cos(θ))·[K]²

Where [K] is the skew-symmetric cross-product matrix of k:
      │  0   -k_z   k_y │
 [K] =│  k_z   0   -k_x │
      │ -k_y   k_x   0  │
```

### 2.2 Derivation

**Given:**
- Current normal: **n** = (n_x, n_y, n_z)
- Target normal: **z** = (0, 0, 1)

**Step 1: Find rotation axis**

The axis perpendicular to both normals:
```
k = n × z = │ i    j    k   │
            │ n_x  n_y  n_z │
            │ 0    0    1   │

  = (n_y·1 - n_z·0)i - (n_x·1 - n_z·0)j + (n_x·0 - n_y·0)k
  = n_y·i - n_x·j + 0·k
  = (n_y, -n_x, 0)
```

**Step 2: Find rotation angle**

Using dot product:
```
cos(θ) = n · z / (|n| |z|)
       = n_z / 1  (assuming n is unit vector)
       = n_z

θ = arccos(n_z)
```

**Step 3: Normalize rotation axis**

```
|k| = √(n_y² + n_x²)
k̂ = k / |k| = (n_y/|k|, -n_x/|k|, 0)
```

**Step 4: Construct skew-symmetric matrix**

```
      │  0       -0        -n_x/|k| │     │  0       0        -n_x/|k| │
 [K] =│  0        0         n_y/|k| │  =  │  0       0         n_y/|k| │
      │  n_x/|k| -n_y/|k|   0      │     │  n_x/|k| -n_y/|k|   0      │
```

**Step 5: Compute [K]²**

Matrix multiplication [K]·[K]:
```
[K]² = │  -(n_x²)/|k|²    -(n_x·n_y)/|k|²   0 │
       │  -(n_x·n_y)/|k|²  -(n_y²)/|k|²      0 │
       │   0                 0                 0 │
```

**Step 6: Build rotation matrix**

```
R = I + sin(θ)·[K] + (1 - cos(θ))·[K]²
```

### 2.3 Worked Example

**Given:** Align normal **n** = (0.707, 0, 0.707) with **z** = (0, 0, 1)

**Step 1:** Rotation axis
```
k = n × z = (0, -0.707, 0)
|k| = 0.707
k̂ = (0, -1, 0)
```

**Step 2:** Rotation angle
```
cos(θ) = n · z = 0.707
θ = arccos(0.707) = 45° = π/4 radians
```

**Step 3:** Skew-symmetric matrix
```
      │  0   0   0 │
 [K] =│  0   0  -1 │
      │  0   1   0 │
```

**Step 4:** [K]²
```
       │ 0  0   0 │
[K]² = │ 0 -1   0 │
       │ 0  0  -1 │
```

**Step 5:** Rotation matrix
```
R = I + sin(45°)·[K] + (1 - cos(45°))·[K]²

  = │ 1  0  0 │   │ 0    0      0 │   │ 0     0       0    │
    │ 0  1  0 │ + │ 0    0   -0.707│ + │ 0  -0.293    0    │
    │ 0  0  1 │   │ 0  0.707   0 │   │ 0     0    -0.293 │

  = │ 1    0       0    │
    │ 0  0.707  -0.707 │
    │ 0  0.707   0.707 │
```

**Verification:**
```
R · n = │ 1    0       0    │   │ 0.707 │   │ 0.707 │
        │ 0  0.707  -0.707 │ · │  0    │ = │  0    │  ← Correct!
        │ 0  0.707   0.707 │   │ 0.707 │   │  1    │
```

---

## 3. Fractal-Cortex Implementation

### 3.1 Code Reference

**File:** `slicing_functions.py`
**Function:** `align_mesh_base_to_xy(mesh, base_point, base_normal)`
**Lines:** 824-878

```python
def align_mesh_base_to_xy(mesh, base_point, base_normal):
    """Transform a mesh so its base (defined by a point and normal)
       aligns with XY plane at Z=0."""

    # Convert inputs to numpy arrays
    base_point = np.array(base_point, dtype=float)
    base_normal = np.array(base_normal, dtype=float)

    # Normalize the base normal vector
    base_normal = base_normal / np.linalg.norm(base_normal)

    # Calculate rotation to align the base normal with the Z axis (0, 0, 1)
    z_axis = np.array([0, 0, 1])

    # Find rotation axis and angle
    rotation_axis = np.cross(base_normal, z_axis)

    # If base_normal is already aligned with z_axis
    if np.allclose(rotation_axis, 0):
        # Already aligned with Z axis, only need translation
        rotation_matrix = np.eye(3)
    else:
        # Normal case: compute rotation using axis-angle formula
        rotation_axis = rotation_axis / np.linalg.norm(rotation_axis)
        cos_angle = np.dot(base_normal, z_axis)
        angle = np.arccos(np.clip(cos_angle, -1.0, 1.0))

        # Rodrigues' rotation formula
        K = np.array([
            [0, -rotation_axis[2], rotation_axis[1]],
            [rotation_axis[2], 0, -rotation_axis[0]],
            [-rotation_axis[1], rotation_axis[0], 0]
        ])
        rotation_matrix = np.eye(3) + np.sin(angle) * K + (1 - np.cos(angle)) * (K @ K)

    # Create a homogeneous transformation matrix with rotation
    transform = np.eye(4)
    transform[:3, :3] = rotation_matrix

    # Apply this rotation
    rotated_mesh = mesh.copy()
    rotated_mesh.apply_transform(transform)

    # After rotation, find the z-coordinate of the rotated base point
    rotated_point = rotation_matrix @ base_point
    z_offset = rotated_point[2]

    # Create translation matrix to move the base to z=0
    translation = np.eye(4)
    translation[2, 3] = -z_offset

    # Apply the translation
    rotated_mesh.apply_transform(translation)

    # Combine transforms
    final_transform = translation @ transform
    return rotated_mesh, final_transform
```

### 3.2 Key Points

1. **Line 830:** Normalize normal vector (critical for numerical stability)
2. **Line 838:** Check if already aligned (avoid division by zero)
3. **Line 846:** `np.clip` prevents arccos domain error (cos ∈ [-1, 1])
4. **Lines 850-854:** Build skew-symmetric matrix K
5. **Line 855:** Rodrigues formula: I + sin(θ)K + (1-cos(θ))K²
6. **Line 867:** After rotation, translate origin to Z=0
7. **Line 877:** Return both rotated mesh AND transform matrix

---

## 4. Layered (Rust) Implementation

### 4.1 Core Function

**File:** `crates/layerkit-algo/src/multidirectional/transforms.rs`

```rust
use glam::{Vec3, Mat3, Mat4, Quat};

/// Compute transformation to align plane with XY plane (Z = 0)
///
/// # Arguments
/// * `plane_origin` - Point on the plane
/// * `plane_normal` - Plane normal (will be normalized)
///
/// # Returns
/// Transformation matrix that:
/// 1. Rotates plane normal to align with Z-axis
/// 2. Translates plane origin to Z = 0
///
/// # Algorithm
/// Uses Rodrigues' rotation formula to find minimal rotation
pub fn compute_alignment_transform(
    plane_origin: Vec3,
    plane_normal: Vec3,
) -> Result<Mat4, TransformError> {
    const EPSILON: f32 = 1e-6;

    // Normalize normal vector
    let normal = plane_normal.normalize();
    if !normal.is_finite() {
        return Err(TransformError::InvalidNormal);
    }

    let z_axis = Vec3::Z;

    // Find rotation axis (perpendicular to both)
    let rotation_axis = normal.cross(z_axis);
    let axis_length = rotation_axis.length();

    // Check if already aligned
    if axis_length < EPSILON {
        // Parallel or anti-parallel to Z
        let dot = normal.dot(z_axis);

        if dot > 0.0 {
            // Same direction - only translation needed
            return Ok(Mat4::from_translation(-plane_origin));
        } else {
            // Opposite direction - 180° rotation
            // Rotate around X or Y axis
            let rotation = Mat4::from_rotation_x(std::f32::consts::PI);
            let translation = Mat4::from_translation(-plane_origin);
            return Ok(rotation * translation);
        }
    }

    // Normalize rotation axis
    let rotation_axis = rotation_axis / axis_length;

    // Calculate rotation angle
    let cos_angle = normal.dot(z_axis);
    let angle = cos_angle.acos();

    // Build rotation matrix using Rodrigues' formula
    let rotation_matrix = rodrigues_rotation(rotation_axis, angle);

    // Apply rotation to plane origin to find its new Z coordinate
    let rotated_origin = rotation_matrix * plane_origin;
    let z_offset = rotated_origin.z;

    // Build combined transformation:
    // 1. Rotate to align normal with Z
    // 2. Translate so plane is at Z = 0
    let rotation_4x4 = Mat4::from_mat3(rotation_matrix);
    let translation = Mat4::from_translation(Vec3::new(0.0, 0.0, -z_offset));

    Ok(translation * rotation_4x4)
}

/// Rodrigues' rotation formula: rotate around axis by angle
///
/// Formula: R = I + sin(θ)K + (1 - cos(θ))K²
/// Where K is the skew-symmetric cross-product matrix
fn rodrigues_rotation(axis: Vec3, angle: f32) -> Mat3 {
    let k_x = axis.x;
    let k_y = axis.y;
    let k_z = axis.z;

    // Skew-symmetric matrix K
    #[rustfmt::skip]
    let k = Mat3::from_cols_array(&[
         0.0, k_z, -k_y,
        -k_z, 0.0,  k_x,
         k_y, -k_x, 0.0,
    ]);

    // K² = K * K
    let k_squared = k * k;

    // R = I + sin(θ)K + (1 - cos(θ))K²
    let sin_angle = angle.sin();
    let cos_angle = angle.cos();

    Mat3::IDENTITY + sin_angle * k + (1.0 - cos_angle) * k_squared
}

#[derive(Debug, thiserror::Error)]
pub enum TransformError {
    #[error("Invalid plane normal (zero length or non-finite)")]
    InvalidNormal,
}
```

### 4.2 Alternative: Using Quaternions

For some applications, quaternions are more numerically stable:

```rust
/// Alternative: Compute alignment using quaternions
pub fn compute_alignment_transform_quat(
    plane_origin: Vec3,
    plane_normal: Vec3,
) -> Result<Mat4, TransformError> {
    let normal = plane_normal.normalize();
    if !normal.is_finite() {
        return Err(TransformError::InvalidNormal);
    }

    let z_axis = Vec3::Z;

    // Find rotation quaternion from normal to Z
    let rotation = Quat::from_rotation_arc(normal, z_axis);

    // Apply rotation to origin
    let rotated_origin = rotation * plane_origin;

    // Build combined transform
    let rotation_matrix = Mat4::from_quat(rotation);
    let translation = Mat4::from_translation(Vec3::new(0.0, 0.0, -rotated_origin.z));

    Ok(translation * rotation_matrix)
}
```

**Comparison:**

| Method | Pros | Cons |
|--------|------|------|
| Rodrigues | Exact, minimal rotation | Singularity at θ=180° |
| Quaternion | No singularities, numerically stable | Slightly more complex |

**Recommendation:** Use quaternions for production code.

### 4.3 Inverse Transform

To convert coordinates BACK to world space after slicing:

```rust
impl MeshChunk {
    /// Get inverse transformation (rotated → world coordinates)
    pub fn inverse_transform(&self) -> Mat4 {
        self.alignment_transform.inverse()
    }

    /// Transform a point from chunk-local to world coordinates
    pub fn to_world_space(&self, local_point: Vec3) -> Vec3 {
        self.inverse_transform().transform_point3(local_point)
    }

    /// Transform a vector (direction) from chunk-local to world
    pub fn to_world_direction(&self, local_dir: Vec3) -> Vec3 {
        self.inverse_transform().transform_vector3(local_dir)
    }
}
```

---

## 5. Testing and Validation

### 5.1 Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use approx::assert_relative_eq;

    #[test]
    fn test_rodrigues_identity() {
        // Rotation by 0 should be identity
        let axis = Vec3::X;
        let angle = 0.0;

        let rot = rodrigues_rotation(axis, angle);

        assert_relative_eq!(rot, Mat3::IDENTITY, epsilon = 1e-6);
    }

    #[test]
    fn test_rodrigues_90_degrees() {
        // Rotate 90° around Z should map X to Y
        let axis = Vec3::Z;
        let angle = std::f32::consts::FRAC_PI_2;  // 90°

        let rot = rodrigues_rotation(axis, angle);
        let result = rot * Vec3::X;

        assert_relative_eq!(result, Vec3::Y, epsilon = 1e-5);
    }

    #[test]
    fn test_align_vertical_plane() {
        // Vertical plane (already aligned)
        let origin = Vec3::new(0.0, 0.0, 50.0);
        let normal = Vec3::Z;

        let transform = compute_alignment_transform(origin, normal).unwrap();

        // Origin should map to (0, 0, 0)
        let transformed_origin = transform.transform_point3(origin);
        assert_relative_eq!(transformed_origin.z, 0.0, epsilon = 1e-5);

        // Normal should still point up
        let transformed_normal = transform.transform_vector3(normal);
        assert_relative_eq!(transformed_normal, Vec3::Z, epsilon = 1e-5);
    }

    #[test]
    fn test_align_45_degree_plane() {
        // Plane tilted 45° in XZ plane
        let origin = Vec3::new(0.0, 0.0, 50.0);
        let normal = Vec3::new(0.707, 0.0, 0.707).normalize();

        let transform = compute_alignment_transform(origin, normal).unwrap();

        // Normal should align with Z
        let transformed_normal = transform.transform_vector3(normal);
        assert_relative_eq!(transformed_normal.z, 1.0, epsilon = 1e-4);
        assert_relative_eq!(transformed_normal.x, 0.0, epsilon = 1e-4);
        assert_relative_eq!(transformed_normal.y, 0.0, epsilon = 1e-4);

        // Origin Z should be 0
        let transformed_origin = transform.transform_point3(origin);
        assert_relative_eq!(transformed_origin.z, 0.0, epsilon = 1e-4);
    }

    #[test]
    fn test_align_horizontal_plane() {
        // Horizontal plane (90° from vertical)
        let origin = Vec3::new(0.0, 0.0, 50.0);
        let normal = Vec3::X;  // Pointing horizontally

        let transform = compute_alignment_transform(origin, normal).unwrap();

        // Normal should align with Z
        let transformed_normal = transform.transform_vector3(normal);
        assert_relative_eq!(transformed_normal, Vec3::Z, epsilon = 1e-5);
    }

    #[test]
    fn test_align_opposite_direction() {
        // Normal pointing down (-Z)
        let origin = Vec3::new(0.0, 0.0, 50.0);
        let normal = -Vec3::Z;

        let transform = compute_alignment_transform(origin, normal).unwrap();

        // Should rotate 180° to point up
        let transformed_normal = transform.transform_vector3(normal);
        assert_relative_eq!(transformed_normal, Vec3::Z, epsilon = 1e-5);
    }

    #[test]
    fn test_roundtrip() {
        // Transform then inverse should give identity
        let origin = Vec3::new(10.0, 20.0, 30.0);
        let normal = Vec3::new(0.6, 0.0, 0.8).normalize();

        let transform = compute_alignment_transform(origin, normal).unwrap();
        let inverse = transform.inverse();

        let test_point = Vec3::new(1.0, 2.0, 3.0);
        let roundtrip = inverse.transform_point3(
            transform.transform_point3(test_point)
        );

        assert_relative_eq!(roundtrip, test_point, epsilon = 1e-4);
    }
}
```

### 5.2 Property-Based Tests

Using `proptest` to test invariants:

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn test_alignment_preserves_normal_length(
        origin in prop::array::uniform3(-100.0f32..100.0),
        normal in prop::array::uniform3(-1.0f32..1.0),
    ) {
        let origin = Vec3::from(origin);
        let normal = Vec3::from(normal).normalize();

        if normal.is_finite() {
            let transform = compute_alignment_transform(origin, normal).unwrap();
            let transformed = transform.transform_vector3(normal);

            // Length should be preserved (rotation is orthogonal)
            prop_assert!((transformed.length() - 1.0).abs() < 1e-5);
        }
    }

    #[test]
    fn test_alignment_gives_unit_z(
        origin in prop::array::uniform3(-100.0f32..100.0),
        theta in 0.0f32..std::f32::consts::PI,
        phi in 0.0f32..std::f32::consts::TAU,
    ) {
        // Generate random normal using spherical coordinates
        let normal = Vec3::new(
            theta.sin() * phi.cos(),
            theta.sin() * phi.sin(),
            theta.cos(),
        );

        let origin = Vec3::from(origin);

        let transform = compute_alignment_transform(origin, normal).unwrap();
        let transformed_normal = transform.transform_vector3(normal);

        // Should align with (0, 0, 1)
        prop_assert!((transformed_normal.z - 1.0).abs() < 1e-4);
        prop_assert!(transformed_normal.x.abs() < 1e-4);
        prop_assert!(transformed_normal.y.abs() < 1e-4);
    }
}
```

### 5.3 Visual Validation

Create a test that exports meshes before/after transformation:

```rust
#[test]
fn test_visual_alignment() {
    use std::fs;

    let mesh = Mesh::from_stl("test-models/cube.stl").unwrap();

    let plane = SlicePlane::new(
        Vec3::new(0.0, 0.0, 50.0),
        Vec3::new(0.707, 0.0, 0.707),  // 45° tilt
    );

    let transform = compute_alignment_transform(plane.origin, plane.normal).unwrap();

    // Transform mesh
    let transformed_mesh = mesh.transform(&transform);

    // Export both
    mesh.export_stl("test-output/original.stl").unwrap();
    transformed_mesh.export_stl("test-output/aligned.stl").unwrap();

    // Verify the plane is now horizontal
    // (manually check in MeshLab or similar)
}
```

---

## 6. Performance Considerations

### 6.1 Benchmarking

```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn bench_alignment_transform(c: &mut Criterion) {
    let origin = Vec3::new(10.0, 20.0, 30.0);
    let normal = Vec3::new(0.6, 0.0, 0.8).normalize();

    c.bench_function("compute_alignment_transform", |b| {
        b.iter(|| {
            compute_alignment_transform(
                black_box(origin),
                black_box(normal)
            )
        })
    });
}

fn bench_rodrigues_rotation(c: &mut Criterion) {
    let axis = Vec3::new(0.6, 0.0, 0.8).normalize();
    let angle = std::f32::consts::FRAC_PI_4;  // 45°

    c.bench_function("rodrigues_rotation", |b| {
        b.iter(|| {
            rodrigues_rotation(
                black_box(axis),
                black_box(angle)
            )
        })
    });
}

criterion_group!(benches, bench_alignment_transform, bench_rodrigues_rotation);
criterion_main!(benches);
```

**Expected performance:**
- `compute_alignment_transform`: ~50-100 ns
- `rodrigues_rotation`: ~30-50 ns
- Transform entire mesh (10k triangles): ~1-2 ms

### 6.2 Optimization: Precompute for Chunks

```rust
pub struct ChunkTransformCache {
    transforms: HashMap<SlicePlane, Mat4>,
}

impl ChunkTransformCache {
    pub fn get_or_compute(&mut self, plane: &SlicePlane) -> Mat4 {
        *self.transforms.entry(plane.clone())
            .or_insert_with(|| {
                compute_alignment_transform(plane.origin, plane.normal)
                    .expect("Invalid plane")
            })
    }
}
```

### 6.3 SIMD Optimization

For transforming many points at once, use SIMD:

```rust
use glam::Vec3A;  // 16-byte aligned version

pub fn transform_points_simd(
    points: &[Vec3],
    transform: &Mat4,
) -> Vec<Vec3> {
    // Convert to aligned vectors
    let aligned: Vec<Vec3A> = points.iter()
        .map(|&p| Vec3A::from(p))
        .collect();

    // Transform in batches (compiler will use SIMD)
    aligned.iter()
        .map(|&p| Vec3::from(transform.transform_point3a(p)))
        .collect()
}
```

---

## 7. Common Pitfalls and Solutions

### 7.1 Gimbal Lock at 180°

**Problem:** When normal points opposite to Z (-Z), rotation axis is undefined.

**Solution:** Special case for anti-parallel vectors:

```rust
if axis_length < EPSILON {
    let dot = normal.dot(z_axis);
    if dot < 0.0 {
        // Rotate 180° around any perpendicular axis
        return Ok(Mat4::from_rotation_x(PI) * Mat4::from_translation(-plane_origin));
    }
}
```

### 7.2 Numerical Instability Near Alignment

**Problem:** When normal is nearly aligned with Z, small errors are amplified.

**Solution:** Use quaternion method for near-aligned cases:

```rust
const NEAR_ALIGNED_THRESHOLD: f32 = 0.01;  // ~0.5°

if axis_length < NEAR_ALIGNED_THRESHOLD {
    // Use quaternion approach
    return compute_alignment_transform_quat(plane_origin, plane_normal);
}
```

### 7.3 Non-Normalized Normals

**Problem:** Input normal might not be unit length.

**Solution:** Always normalize:

```rust
let normal = plane_normal.normalize();
if !normal.is_finite() {
    return Err(TransformError::InvalidNormal);
}
```

### 7.4 Precision Loss in Chained Transforms

**Problem:** Multiple transformations accumulate floating-point error.

**Solution:** Combine transforms algebraically before applying:

```rust
// BAD: Apply transforms sequentially
let p1 = transform1.transform_point3(point);
let p2 = transform2.transform_point3(p1);
let p3 = transform3.transform_point3(p2);

// GOOD: Combine first, then apply once
let combined = transform3 * transform2 * transform1;
let result = combined.transform_point3(point);
```

---

## 8. Integration with Slicing Pipeline

### 8.1 Usage in MultidirectionalSlicer

```rust
impl Slicer for MultidirectionalSlicer {
    fn slice(&self, ctx: &SlicingContext) -> PipelineResult<Vec<LayerData>> {
        let chunks = decompose_mesh_into_chunks(&ctx.mesh, &self.slice_planes)?;

        for chunk in chunks {
            // Apply alignment transform
            let rotated_mesh = chunk.geometry.transform(&chunk.alignment_transform);

            // Now slice as if plane were horizontal
            for z in slice_heights {
                let layer = slice_mesh_at_z(&rotated_mesh, z)?;

                // Store inverse transform for G-code generation
                layer.chunk_transform = Some(chunk.alignment_transform.inverse());
            }
        }

        Ok(all_layers)
    }
}
```

### 8.2 Usage in G-code Generation

```rust
impl GCodeWriter for ManualStepperWriter {
    fn write(&self, moves: &[Move], ctx: &SlicingContext) -> PipelineResult<String> {
        for move in moves {
            // If this move has a chunk transform, apply it
            let world_pos = if let Some(chunk_transform) = move.chunk_transform {
                chunk_transform.transform_point3(move.end.position)
            } else {
                move.end.position
            };

            // Calculate bed angles from chunk orientation
            let (a_angle, b_angle) = if let Some(plane) = move.chunk_plane {
                calculate_bed_angles(&plane.normal)
            } else {
                (0.0, 0.0)
            };

            gcode.push_str(&format!(
                "G1 X{:.3} Y{:.3} Z{:.3} E{:.5} F{:.0}\n",
                world_pos.x, world_pos.y, world_pos.z,
                move.extrusion, move.feedrate
            ));
        }

        Ok(gcode)
    }
}
```

---

## 9. References

### Academic Papers

1. **Rodrigues, O.** (1840). "Des lois géométriques qui régissent les déplacements d'un système solide dans l'espace"
   - Original formulation of the rotation formula

2. **Shoemake, K.** (1985). "Animating rotation with quaternion curves"
   - SIGGRAPH '85, shows quaternion alternative

3. **Eberly, D.** (2001). "3D Game Engine Design"
   - Chapter on rotations, numerical stability considerations

### Online Resources

- **Wikipedia - Rodrigues' rotation formula:** https://en.wikipedia.org/wiki/Rodrigues%27_rotation_formula
- **Wolfram MathWorld - Rotation Matrix:** https://mathworld.wolfram.com/RotationMatrix.html
- **3Blue1Brown - Quaternions and 3D rotation:** https://www.youtube.com/watch?v=d4EgbgTm0Bg

### Code References

- **Fractal-Cortex:** `slicing_functions.py:824-878`
- **NumPy implementation:** Uses `@` operator for matrix multiplication (line 855)
- **trimesh library:** `mesh.apply_transform()` method applies 4×4 homogeneous transform

---

## 10. Summary

### Key Takeaways

1. **Rodrigues' formula is the standard method** for computing rotation from one vector to another
2. **Always normalize inputs** to avoid numerical issues
3. **Handle special cases** (aligned, anti-parallel) explicitly
4. **Quaternions are more stable** for production code
5. **Combine transforms algebraically** before applying to minimize error
6. **Cache transforms** when the same planes are used repeatedly

### Implementation Checklist

- [ ] Implement `rodrigues_rotation()` function
- [ ] Implement `compute_alignment_transform()` with special cases
- [ ] Add quaternion alternative for numerical stability
- [ ] Write comprehensive unit tests
- [ ] Add property-based tests for invariants
- [ ] Benchmark performance
- [ ] Add SIMD optimization for batch transforms
- [ ] Integrate with chunk decomposition
- [ ] Test with Fractal example files
- [ ] Document edge cases and numerical considerations

---

**Next:** [important-03-collision-detection-strategies.md](important-03-collision-detection-strategies.md)
