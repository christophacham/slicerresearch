# IMPORTANT: Chunk Decomposition Algorithm - Complete Reference
**Date:** 2026-01-08
**Priority:** CRITICAL - This is the core innovation from Fractal-Cortex

---

## Executive Summary

**What:** Divide a 3D mesh into multiple chunks, each sliced in a different direction, with automatic collision prevention through Boolean geometry operations.

**Why:** Enables support-free printing by orienting each section optimally. Chunk ordering prevents nozzle-part collisions automatically.

**Where:** Fractal-Cortex `slicing_functions.py` lines 799-822 (chunk creation and boolean subtraction)

**Status in Layered:** ❌ Not implemented - needs new module `crates/layerkit-algo/src/multidirectional/chunk_decomposition.rs`

---

## 1. Algorithm Overview

### Input
```rust
pub struct SlicePlane {
    pub origin: Vec3,      // Point on the plane
    pub normal: Vec3,      // Plane orientation (unit vector)
}

// Example: User defines 3 slice planes
let planes = vec![
    SlicePlane { origin: Vec3::new(0, 0, 0),  normal: Vec3::new(0, 0, 1) },   // Vertical
    SlicePlane { origin: Vec3::new(0, 0, 30), normal: Vec3::new(0.707, 0, 0.707) }, // 45° tilt
    SlicePlane { origin: Vec3::new(0, 0, 60), normal: Vec3::new(1, 0, 0) },   // Horizontal
];
```

### Output
```rust
pub struct MeshChunk {
    pub id: usize,                    // Chunk index (0, 1, 2, ...)
    pub geometry: Mesh,               // The actual mesh geometry for this chunk
    pub plane: SlicePlane,            // The slice plane that defines this chunk
    pub alignment_transform: Mat4,    // Transform to make plane horizontal
}

// Result: Vec<MeshChunk> where chunks don't overlap
```

### Visual Example

```
Original mesh (cube):
    ┌───────────┐
    │           │
    │           │
    │           │
    └───────────┘

After plane 0 cuts (vertical):
    Chunk 0 = entire mesh above Z=0

After plane 1 cuts (at Z=30, tilted 45°):
    Chunk 0 = mesh from Z=0 to plane 1
    Chunk 1 = mesh from plane 1 upward

After plane 2 cuts (at Z=60, horizontal):
    Chunk 0 = bottom section (Z=0 to plane 1)
    Chunk 1 = middle section (plane 1 to plane 2)
    Chunk 2 = top section (plane 2 upward)

After boolean subtraction:
    Chunk 0 = chunk 0 - chunk 1 - chunk 2
    Chunk 1 = chunk 1 - chunk 2
    Chunk 2 = chunk 2 (unchanged)

Result: No overlaps! Print order 0 → 1 → 2 is collision-free.
```

---

## 2. Fractal-Cortex Implementation (Python)

### Location: `slicing_functions.py` lines 799-822

```python
def create_chunkList():
    '''First define each chunk as the remainder of the mesh
       that's ahead of each respective sliceplane.'''

    chunkList = []
    # STEP 1: Cut mesh at each slice plane
    for k in range(int(numSlicingDirections)):
        currentStart = startingPositions[k]
        currentNormal = spherical_to_normal(*directions[k])

        # trimesh.slice_plane() keeps everything on the "positive" side
        # of the plane (in direction of normal)
        unprocessedChunk = mesh.slice_plane(
            currentStart,         # Origin point on plane
            currentNormal,        # Normal vector (which side to keep)
            cap=True,             # Close the cut with a planar cap
            face_index=None,
            cached_dots=None
        )
        chunkList.append(unprocessedChunk)

    '''
    Then, for each chunk, gradually chisel away material starting
    from the lattermost chunk and working backwards until the
    current chunk index.
    This process ensures no collisions between the printhead
    and the in-process part.
    '''
    # STEP 2: Boolean subtraction (the magic!)
    for k in slicePlaneList:                    # k = 0, 1, 2, ...
        remainingChunk = chunkList[k]
        for r in reversedSlicePlaneList:        # r = ..., 2, 1, 0
            if r > k:                           # Only subtract LATER chunks
                latterChunk = chunkList[r]
                # Boolean difference operation
                remainingChunk = remainingChunk.difference(
                    latterChunk,
                    check_volume=False  # Speed optimization
                )
        if remainingChunk.is_empty == False:
            chunkList[k] = remainingChunk
        else:
            chunkList[k] = None

    return chunkList
```

### Key Libraries Used

**trimesh** (Python 3D mesh library):
- `mesh.slice_plane(origin, normal, cap=True)` - Cuts mesh, keeps one side
- `mesh.difference(other_mesh)` - Boolean subtraction (CSG operation)
- Built on top of **pyglet** for rendering

**Installation:**
```bash
pip install trimesh
```

---

## 3. Algorithm Mathematics

### 3.1 Plane Equation

A plane is defined by:
```
P = { (x, y, z) | n · (p - p₀) = 0 }

Where:
  n = normal vector (unit vector)
  p₀ = point on plane (origin)
  p = any point (x, y, z)
  · = dot product
```

**Example:**
```
Plane: origin = (0, 0, 30), normal = (0, 0, 1)
Equation: 0·(x-0) + 0·(y-0) + 1·(z-30) = 0
Simplified: z = 30  (horizontal plane at Z=30)
```

### 3.2 Mesh-Plane Intersection

**Goal:** Find all triangles that cross the plane.

**For each triangle with vertices v₀, v₁, v₂:**

1. Calculate signed distance from plane:
   ```
   d₀ = n · (v₀ - p₀)
   d₁ = n · (v₁ - p₀)
   d₂ = n · (v₂ - p₀)
   ```

2. Classify triangle:
   ```
   If all d_i > 0: Triangle is entirely above plane (keep)
   If all d_i < 0: Triangle is entirely below plane (discard)
   If mixed signs: Triangle crosses plane (split)
   ```

3. For crossing triangles, find intersection points:
   ```
   Edge v₀→v₁ crosses at: t = d₀ / (d₀ - d₁)
   Intersection point: p = v₀ + t * (v₁ - v₀)
   ```

4. Create new triangles and cap:
   ```
   Above plane: Keep partial triangles + add cap
   Below plane: Discard
   ```

**Reference:** `trimesh.intersections.slice_mesh_plane()` implements this.

### 3.3 Boolean Subtraction

**Goal:** Remove `mesh_B` from `mesh_A` (A - B).

**CSG Algorithm:**

1. **Find intersection volume:**
   ```
   intersection = A ∩ B
   ```

2. **Classify triangles:**
   ```
   For each triangle in A:
     If inside B: discard
     If outside B: keep
     If on boundary: clip
   ```

3. **Invert B's triangles in intersection:**
   ```
   For triangles from B that are inside A:
     Flip normal (reverse winding)
     Add to result
   ```

4. **Merge and repair:**
   ```
   Combine kept triangles from A + inverted triangles from B
   Remove duplicate vertices
   Fix T-junctions
   Ensure manifold mesh
   ```

**Reference:** `trimesh.boolean.difference()` uses **Blender's boolean modifier** or **Cork library** internally.

---

## 4. Layered Implementation (Rust)

### 4.1 File Structure

```
crates/layerkit-algo/src/multidirectional/
├── mod.rs                      # Module exports
├── chunk_decomposition.rs      # Main algorithm
├── plane_intersection.rs       # Mesh-plane cutting
└── boolean_ops.rs              # CSG operations
```

### 4.2 Core Implementation

**File:** `crates/layerkit-algo/src/multidirectional/chunk_decomposition.rs`

```rust
use layerkit_core::mesh::Mesh;
use glam::{Vec3, Mat4};

/// A slice plane in 3D space
#[derive(Debug, Clone)]
pub struct SlicePlane {
    /// Point on the plane
    pub origin: Vec3,
    /// Plane normal (must be unit vector)
    pub normal: Vec3,
}

impl SlicePlane {
    pub fn new(origin: Vec3, normal: Vec3) -> Self {
        Self {
            origin,
            normal: normal.normalize(),  // Ensure unit vector
        }
    }

    /// Convert from spherical coordinates (Fractal-Cortex format)
    /// theta = angle from Z-axis (0° = vertical)
    /// phi = rotation around Z-axis (azimuthal)
    pub fn from_spherical(origin: Vec3, theta_deg: f64, phi_deg: f64) -> Self {
        let theta = theta_deg.to_radians();
        let phi = phi_deg.to_radians();

        let normal = Vec3::new(
            (theta.sin() * phi.cos()) as f32,
            (theta.sin() * phi.sin()) as f32,
            theta.cos() as f32,
        );

        Self { origin, normal }
    }
}

/// A chunk of mesh to be sliced independently
#[derive(Debug)]
pub struct MeshChunk {
    pub id: usize,
    pub geometry: Mesh,
    pub plane: SlicePlane,
    pub alignment_transform: Mat4,
}

/// Errors during chunk decomposition
#[derive(Debug, thiserror::Error)]
pub enum ChunkError {
    #[error("Plane intersection failed: {0}")]
    PlaneIntersection(String),

    #[error("Boolean operation failed: {0}")]
    BooleanOp(String),

    #[error("Invalid plane normal (zero length)")]
    InvalidNormal,

    #[error("Chunk {0} became empty after subtraction")]
    EmptyChunk(usize),
}

/// Main algorithm: decompose mesh into chunks
pub fn decompose_mesh_into_chunks(
    mesh: &Mesh,
    planes: &[SlicePlane],
) -> Result<Vec<MeshChunk>, ChunkError> {
    // Validate inputs
    if planes.is_empty() {
        return Ok(vec![]);
    }

    for plane in planes {
        if plane.normal.length() < 1e-6 {
            return Err(ChunkError::InvalidNormal);
        }
    }

    // STEP 1: Cut mesh at each plane (keep "positive" side)
    tracing::info!("Cutting mesh at {} planes", planes.len());

    let mut chunks: Vec<Mesh> = Vec::with_capacity(planes.len());

    for (i, plane) in planes.iter().enumerate() {
        tracing::debug!("Cutting at plane {}: origin={:?}, normal={:?}",
                       i, plane.origin, plane.normal);

        // Cut mesh, keep everything in direction of normal
        let chunk = slice_plane_keep_positive(mesh, plane)
            .map_err(|e| ChunkError::PlaneIntersection(format!("Plane {}: {}", i, e)))?;

        chunks.push(chunk);
    }

    // STEP 2: Boolean subtraction (chisel away overlaps)
    tracing::info!("Performing boolean subtraction on {} chunks", chunks.len());

    for k in 0..chunks.len() {
        let mut remaining = chunks[k].clone();

        // Subtract all LATER chunks (r > k)
        for r in (k+1)..chunks.len() {
            tracing::debug!("Subtracting chunk {} from chunk {}", r, k);

            remaining = boolean_difference(&remaining, &chunks[r])
                .map_err(|e| ChunkError::BooleanOp(
                    format!("Failed to subtract chunk {} from {}: {}", r, k, e)
                ))?;

            // Check if chunk became empty
            if remaining.is_empty() {
                tracing::warn!("Chunk {} became empty after subtracting chunk {}", k, r);
                // Don't error - empty chunks are valid (might be completely covered)
                break;
            }
        }

        chunks[k] = remaining;
    }

    // STEP 3: Calculate alignment transforms
    tracing::info!("Calculating alignment transforms");

    let result = chunks
        .into_iter()
        .zip(planes.iter())
        .enumerate()
        .filter_map(|(id, (geometry, plane))| {
            // Skip empty chunks
            if geometry.is_empty() {
                tracing::warn!("Skipping empty chunk {}", id);
                return None;
            }

            // Calculate transform to make plane horizontal
            let alignment_transform = compute_alignment_transform(plane)
                .expect("Failed to compute alignment transform");

            Some(MeshChunk {
                id,
                geometry,
                plane: plane.clone(),
                alignment_transform,
            })
        })
        .collect();

    Ok(result)
}

// ============================================================================
// Helper Functions
// ============================================================================

/// Cut mesh at plane, keep everything on positive side (in direction of normal)
fn slice_plane_keep_positive(
    mesh: &Mesh,
    plane: &SlicePlane,
) -> Result<Mesh, String> {
    // This needs to be implemented based on your Mesh representation
    // See section 4.3 below for detailed implementation

    todo!("Implement mesh-plane intersection")
}

/// Boolean difference: A - B
fn boolean_difference(
    mesh_a: &Mesh,
    mesh_b: &Mesh,
) -> Result<Mesh, String> {
    // This needs a CSG library
    // See section 4.4 below for implementation options

    todo!("Implement boolean subtraction")
}

/// Calculate transform to align plane with XY plane (Z becomes plane normal)
fn compute_alignment_transform(plane: &SlicePlane) -> Result<Mat4, String> {
    // See section 5 for detailed mathematics

    let z_axis = Vec3::Z;
    let normal = plane.normal;

    // Find rotation axis (perpendicular to both)
    let rotation_axis = normal.cross(z_axis);

    // Check if already aligned
    if rotation_axis.length() < 1e-6 {
        // Already aligned (or pointing opposite)
        if normal.dot(z_axis) > 0.0 {
            // Same direction - only need translation
            return Ok(Mat4::from_translation(-plane.origin));
        } else {
            // Opposite direction - need 180° rotation
            return Ok(Mat4::from_rotation_x(std::f32::consts::PI)
                     * Mat4::from_translation(-plane.origin));
        }
    }

    // Rodrigues' rotation formula
    let rotation_axis = rotation_axis.normalize();
    let angle = normal.dot(z_axis).acos();

    // Skew-symmetric matrix K
    let k = Mat3::from_cols(
        Vec3::new(0.0, rotation_axis.z, -rotation_axis.y),
        Vec3::new(-rotation_axis.z, 0.0, rotation_axis.x),
        Vec3::new(rotation_axis.y, -rotation_axis.x, 0.0),
    );

    // R = I + sin(θ)K + (1 - cos(θ))K²
    let rotation = Mat3::IDENTITY
                 + angle.sin() * k
                 + (1.0 - angle.cos()) * (k * k);

    // Combine rotation + translation
    let mut transform = Mat4::from_mat3(rotation);

    // After rotation, translate so plane origin is at Z=0
    let rotated_origin = rotation * plane.origin;
    transform = Mat4::from_translation(Vec3::new(0.0, 0.0, -rotated_origin.z)) * transform;

    Ok(transform)
}
```

### 4.3 Mesh-Plane Intersection Implementation

**File:** `crates/layerkit-algo/src/multidirectional/plane_intersection.rs`

```rust
use layerkit_core::mesh::{Mesh, Triangle};
use glam::Vec3;

/// Signed distance from point to plane
#[inline]
fn signed_distance(point: Vec3, plane_origin: Vec3, plane_normal: Vec3) -> f32 {
    plane_normal.dot(point - plane_origin)
}

/// Cut mesh at plane, keep positive side
pub fn slice_plane_keep_positive(
    mesh: &Mesh,
    plane: &SlicePlane,
) -> Result<Mesh, String> {
    let mut kept_triangles = Vec::new();
    let mut cap_edges = Vec::new();  // Edges on the cut surface

    // Process each triangle
    for triangle in mesh.triangles() {
        let v0 = triangle.v0;
        let v1 = triangle.v1;
        let v2 = triangle.v2;

        // Calculate signed distances
        let d0 = signed_distance(v0, plane.origin, plane.normal);
        let d1 = signed_distance(v1, plane.origin, plane.normal);
        let d2 = signed_distance(v2, plane.origin, plane.normal);

        let above_count = [d0 > 0.0, d1 > 0.0, d2 > 0.0]
            .iter()
            .filter(|&&x| x)
            .count();

        match above_count {
            // All vertices above plane - keep entire triangle
            3 => {
                kept_triangles.push(triangle.clone());
            }

            // All vertices below plane - discard
            0 => {
                // Do nothing
            }

            // Triangle crosses plane - split it
            1 | 2 => {
                let (new_tris, edges) = split_triangle_at_plane(
                    [v0, v1, v2],
                    [d0, d1, d2],
                    plane,
                )?;

                kept_triangles.extend(new_tris);
                cap_edges.extend(edges);
            }

            _ => unreachable!(),
        }
    }

    // Cap the cut with a planar surface
    if !cap_edges.is_empty() {
        let cap_triangles = triangulate_cap(&cap_edges, plane)?;
        kept_triangles.extend(cap_triangles);
    }

    // Build new mesh
    Mesh::from_triangles(kept_triangles)
        .map_err(|e| format!("Failed to build mesh: {}", e))
}

/// Split a triangle that crosses the plane
fn split_triangle_at_plane(
    vertices: [Vec3; 3],
    distances: [f32; 3],
    plane: &SlicePlane,
) -> Result<(Vec<Triangle>, Vec<(Vec3, Vec3)>), String> {
    // Find which vertices are above/below
    let signs: Vec<bool> = distances.iter().map(|&d| d > 0.0).collect();
    let above: Vec<usize> = signs.iter().enumerate()
        .filter(|(_, &s)| s)
        .map(|(i, _)| i)
        .collect();
    let below: Vec<usize> = signs.iter().enumerate()
        .filter(|(_, &s)| !s)
        .map(|(i, _)| i)
        .collect();

    let mut new_triangles = Vec::new();
    let mut cap_edges = Vec::new();

    if above.len() == 1 {
        // One vertex above, two below
        // Create one triangle above plane
        let idx_above = above[0];
        let idx_below_1 = below[0];
        let idx_below_2 = below[1];

        let v_above = vertices[idx_above];
        let v_below_1 = vertices[idx_below_1];
        let v_below_2 = vertices[idx_below_2];

        let d_above = distances[idx_above];
        let d_below_1 = distances[idx_below_1];
        let d_below_2 = distances[idx_below_2];

        // Find intersection points
        let t1 = d_above / (d_above - d_below_1);
        let t2 = d_above / (d_above - d_below_2);

        let p1 = v_above + t1 * (v_below_1 - v_above);
        let p2 = v_above + t2 * (v_below_2 - v_above);

        // New triangle above plane
        new_triangles.push(Triangle::new(v_above, p1, p2));

        // Cap edge
        cap_edges.push((p1, p2));

    } else if above.len() == 2 {
        // Two vertices above, one below
        // Create two triangles above plane (quad split)
        let idx_below = below[0];
        let idx_above_1 = above[0];
        let idx_above_2 = above[1];

        let v_below = vertices[idx_below];
        let v_above_1 = vertices[idx_above_1];
        let v_above_2 = vertices[idx_above_2];

        let d_below = distances[idx_below];
        let d_above_1 = distances[idx_above_1];
        let d_above_2 = distances[idx_above_2];

        // Find intersection points
        let t1 = d_above_1 / (d_above_1 - d_below);
        let t2 = d_above_2 / (d_above_2 - d_below);

        let p1 = v_above_1 + t1 * (v_below - v_above_1);
        let p2 = v_above_2 + t2 * (v_below - v_above_2);

        // Two new triangles above plane
        new_triangles.push(Triangle::new(v_above_1, v_above_2, p1));
        new_triangles.push(Triangle::new(v_above_2, p2, p1));

        // Cap edge
        cap_edges.push((p1, p2));
    }

    Ok((new_triangles, cap_edges))
}

/// Triangulate the cap surface (planar polygon on cut)
fn triangulate_cap(
    edges: &[(Vec3, Vec3)],
    plane: &SlicePlane,
) -> Result<Vec<Triangle>, String> {
    // Project edges onto plane's 2D coordinate system
    // Use ear-clipping or Delaunay triangulation
    // This is complex - may want to use a library like 'earcutr'

    todo!("Implement cap triangulation - use earcutr crate")
}
```

### 4.4 Boolean Operations Implementation

**Option A: Use existing Rust CSG library**

**Recommended: Use `truck` crate**

```toml
# Cargo.toml
[dependencies]
truck-modeling = "0.3"  # CAD modeling with CSG
truck-topology = "0.3"  # Topological data structures
```

```rust
// File: crates/layerkit-algo/src/multidirectional/boolean_ops.rs

use truck_modeling::*;
use layerkit_core::mesh::Mesh;

pub fn boolean_difference(mesh_a: &Mesh, mesh_b: &Mesh) -> Result<Mesh, String> {
    // Convert Mesh to truck's Shell type
    let shell_a = mesh_to_shell(mesh_a)?;
    let shell_b = mesh_to_shell(mesh_b)?;

    // Perform boolean difference
    let result_shell = shell_a.difference(&shell_b)
        .map_err(|e| format!("CSG difference failed: {:?}", e))?;

    // Convert back to Mesh
    shell_to_mesh(&result_shell)
}

fn mesh_to_shell(mesh: &Mesh) -> Result<Shell, String> {
    // Convert triangles to truck's topology
    todo!("Convert mesh representation")
}

fn shell_to_mesh(shell: &Shell) -> Result<Mesh, String> {
    // Convert truck's topology back to triangles
    todo!("Convert back to mesh")
}
```

**Option B: Call external library via FFI**

If Rust CSG libraries are insufficient, call **CGAL** (C++ library):

```toml
[dependencies]
cgal-bindings = { path = "../cgal-bindings" }  # Custom FFI bindings
```

**Option C: Voxel-based fallback**

If exact CSG fails, fall back to voxel-based approximate boolean:

```rust
use ndarray::Array3;

pub fn voxel_difference(
    mesh_a: &Mesh,
    mesh_b: &Mesh,
    voxel_size: f32,
) -> Result<Mesh, String> {
    // 1. Voxelize both meshes
    let voxels_a = voxelize_mesh(mesh_a, voxel_size);
    let voxels_b = voxelize_mesh(mesh_b, voxel_size);

    // 2. Boolean difference in voxel space
    let result_voxels = voxels_a & !voxels_b;

    // 3. Convert back to mesh (marching cubes)
    voxels_to_mesh(&result_voxels, voxel_size)
}
```

---

## 5. Alignment Transform Mathematics

### 5.1 Goal

Transform coordinate system so that:
- Slice plane becomes the XY plane (Z = 0)
- Plane normal aligns with Z-axis (0, 0, 1)
- Plane origin moves to Z = 0

### 5.2 Rodrigues' Rotation Formula

**Problem:** Rotate vector `v` around axis `k` by angle `θ`.

**Formula:**
```
v_rot = v·cos(θ) + (k × v)·sin(θ) + k·(k·v)·(1 - cos(θ))

As matrix:
R = I + sin(θ)·K + (1 - cos(θ))·K²

Where K is the skew-symmetric cross-product matrix:
      │  0  -kz   ky │
  K = │  kz  0   -kx │
      │ -ky  kx   0  │
```

**Code reference:** Fractal-Cortex `slicing_functions.py:850-855`

```python
K = np.array([
    [0, -rotation_axis[2], rotation_axis[1]],
    [rotation_axis[2], 0, -rotation_axis[0]],
    [-rotation_axis[1], rotation_axis[0], 0]
])
rotation_matrix = np.eye(3) + np.sin(angle) * K + (1 - np.cos(angle)) * (K @ K)
```

### 5.3 Step-by-Step Derivation

**Given:**
- Plane normal: `n = (nx, ny, nz)`
- Target: Align `n` with `Z = (0, 0, 1)`

**Step 1: Find rotation axis**
```
k = n × Z = (ny, -nx, 0)
```

**Step 2: Find rotation angle**
```
cos(θ) = n · Z = nz
θ = arccos(nz)
```

**Step 3: Normalize rotation axis**
```
k̂ = k / |k|
```

**Step 4: Build skew-symmetric matrix K**
```
      │  0   -0    -nx/|k| │      │  0   0    -nx/|k| │
  K = │  0    0     ny/|k| │  =   │  0   0     ny/|k| │
      │ nx/|k| -ny/|k|  0  │      │ nx/|k| -ny/|k|  0  │
```

**Step 5: Compute rotation matrix**
```
R = I + sin(θ)·K + (1 - cos(θ))·K²
```

**Step 6: Apply translation**
```
After rotation, plane origin is at: p' = R·p₀
To move to Z=0: translate by (0, 0, -p'z)

Final transform: T = Translate(0, 0, -p'z) · R · Translate(-p₀)
```

### 5.4 Special Cases

**Case 1: Normal already aligned (n = Z)**
```rust
if (normal - Vec3::Z).length() < 1e-6 {
    return Mat4::from_translation(-plane.origin);
}
```

**Case 2: Normal pointing opposite (n = -Z)**
```rust
if (normal + Vec3::Z).length() < 1e-6 {
    // 180° rotation around X or Y axis
    return Mat4::from_rotation_x(PI) * Mat4::from_translation(-plane.origin);
}
```

**Case 3: Normal perpendicular to Z (nz ≈ 0)**
```rust
// Use alternative axis (e.g., rotate around Y instead of X)
let rotation_axis = if normal.z.abs() < 0.9 {
    Vec3::Z.cross(normal)
} else {
    Vec3::X.cross(normal)
};
```

---

## 6. Testing Strategy

### 6.1 Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use approx::assert_relative_eq;

    #[test]
    fn test_slice_plane_from_spherical() {
        // Vertical plane (theta=0)
        let plane = SlicePlane::from_spherical(
            Vec3::ZERO,
            0.0,  // theta
            0.0,  // phi
        );
        assert_relative_eq!(plane.normal, Vec3::Z, epsilon = 1e-6);

        // Horizontal plane (theta=90)
        let plane = SlicePlane::from_spherical(
            Vec3::new(0.0, 0.0, 50.0),
            90.0,  // theta
            0.0,   // phi
        );
        assert_relative_eq!(plane.normal, Vec3::X, epsilon = 1e-6);
    }

    #[test]
    fn test_alignment_transform_vertical_plane() {
        let plane = SlicePlane::new(
            Vec3::new(0.0, 0.0, 30.0),
            Vec3::Z,
        );

        let transform = compute_alignment_transform(&plane).unwrap();

        // After transform, origin should be at (0, 0, 0)
        let transformed_origin = transform.transform_point3(plane.origin);
        assert_relative_eq!(transformed_origin.z, 0.0, epsilon = 1e-5);

        // Normal should still point up
        let transformed_normal = transform.transform_vector3(plane.normal);
        assert_relative_eq!(transformed_normal, Vec3::Z, epsilon = 1e-5);
    }

    #[test]
    fn test_alignment_transform_tilted_plane() {
        // 45° tilted plane
        let plane = SlicePlane::new(
            Vec3::new(0.0, 0.0, 50.0),
            Vec3::new(0.707, 0.0, 0.707),
        );

        let transform = compute_alignment_transform(&plane).unwrap();

        // Normal should align with Z
        let transformed_normal = transform.transform_vector3(plane.normal);
        assert_relative_eq!(transformed_normal, Vec3::Z, epsilon = 1e-4);
    }

    #[test]
    fn test_chunk_decomposition_no_overlap() {
        let mesh = Mesh::cube(100.0);  // 100mm cube

        let planes = vec![
            SlicePlane::new(Vec3::new(0.0, 0.0, 0.0), Vec3::Z),
            SlicePlane::new(Vec3::new(0.0, 0.0, 50.0), Vec3::Z),
        ];

        let chunks = decompose_mesh_into_chunks(&mesh, &planes).unwrap();

        assert_eq!(chunks.len(), 2);

        // Verify no overlap by checking bounding boxes
        let bbox0 = chunks[0].geometry.bounds();
        let bbox1 = chunks[1].geometry.bounds();

        // Chunk 0 should be below Z=50
        assert!(bbox0.max.z <= 50.0 + 1e-3);

        // Chunk 1 should be above Z=50
        assert!(bbox1.min.z >= 50.0 - 1e-3);

        // Verify volumes add up approximately
        let total_volume = chunks.iter()
            .map(|c| c.geometry.volume())
            .sum::<f32>();
        assert_relative_eq!(total_volume, mesh.volume(), epsilon = 0.01);
    }
}
```

### 6.2 Integration Tests

```rust
// tests/integration/chunk_decomposition.rs

#[test]
fn test_fractal_example_pipe_fitting() {
    // Load Fractal-Cortex example file
    let mesh = Mesh::from_stl("test-models/pipe_fitting.stl").unwrap();

    // Use same planes as Fractal example
    let planes = vec![
        SlicePlane::from_spherical(Vec3::ZERO, 0.0, 0.0),        // Vertical
        SlicePlane::from_spherical(Vec3::new(0.0, 0.0, 30.0), 45.0, 0.0),  // 45° tilt
    ];

    let chunks = decompose_mesh_into_chunks(&mesh, &planes).unwrap();

    // Should produce 2 chunks
    assert_eq!(chunks.len(), 2);

    // Export for visual verification
    for (i, chunk) in chunks.iter().enumerate() {
        chunk.geometry.export_stl(&format!("test-output/chunk_{}.stl", i)).unwrap();
    }
}
```

### 6.3 Visual Verification

**Create test viewer:**

```rust
// examples/chunk_viewer.rs

use layerkit_algo::multidirectional::*;
use bevy::prelude::*;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_startup_system(setup)
        .run();
}

fn setup(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    // Load and decompose mesh
    let mesh = Mesh::from_stl("models/test.stl").unwrap();
    let planes = vec![/* ... */];
    let chunks = decompose_mesh_into_chunks(&mesh, &planes).unwrap();

    // Render each chunk in different color
    let colors = [Color::RED, Color::GREEN, Color::BLUE];

    for (i, chunk) in chunks.iter().enumerate() {
        commands.spawn(PbrBundle {
            mesh: meshes.add(chunk.geometry.clone()),
            material: materials.add(StandardMaterial {
                base_color: colors[i % colors.len()],
                ..default()
            }),
            ..default()
        });
    }

    // Camera
    commands.spawn(Camera3dBundle {
        transform: Transform::from_xyz(100.0, 100.0, 100.0)
            .looking_at(Vec3::ZERO, Vec3::Y),
        ..default()
    });
}
```

---

## 7. Performance Optimization

### 7.1 Parallelization

```rust
use rayon::prelude::*;

pub fn decompose_mesh_into_chunks_parallel(
    mesh: &Mesh,
    planes: &[SlicePlane],
) -> Result<Vec<MeshChunk>, ChunkError> {
    // STEP 1: Cut in parallel
    let chunks: Result<Vec<_>, _> = planes
        .par_iter()
        .enumerate()
        .map(|(i, plane)| {
            slice_plane_keep_positive(mesh, plane)
                .map_err(|e| ChunkError::PlaneIntersection(format!("Plane {}: {}", i, e)))
        })
        .collect();

    let mut chunks = chunks?;

    // STEP 2: Boolean subtraction (must be sequential due to dependencies)
    for k in 0..chunks.len() {
        // But we can parallelize the multiple subtractions for chunk k
        let later_chunks: Vec<_> = chunks[(k+1)..].to_vec();

        chunks[k] = later_chunks.par_iter()
            .try_fold(
                || chunks[k].clone(),
                |acc, later_chunk| boolean_difference(&acc, later_chunk)
            )
            .try_reduce(
                || chunks[k].clone(),
                |a, b| Ok(a)  // Just keep first result
            )?;
    }

    // Rest of the algorithm...
}
```

### 7.2 Caching

```rust
use std::collections::HashMap;

pub struct ChunkDecomposer {
    // Cache plane cuts by mesh hash + plane
    cut_cache: HashMap<(u64, SlicePlane), Mesh>,
}

impl ChunkDecomposer {
    pub fn decompose_cached(&mut self, mesh: &Mesh, planes: &[SlicePlane])
        -> Result<Vec<MeshChunk>, ChunkError>
    {
        let mesh_hash = mesh.compute_hash();

        // Check cache for each plane cut
        let chunks: Vec<_> = planes.iter()
            .map(|plane| {
                let key = (mesh_hash, plane.clone());

                if let Some(cached) = self.cut_cache.get(&key) {
                    cached.clone()
                } else {
                    let result = slice_plane_keep_positive(mesh, plane)?;
                    self.cut_cache.insert(key, result.clone());
                    Ok(result)
                }
            })
            .collect::<Result<_, _>>()?;

        // Continue with boolean subtraction...
    }
}
```

### 7.3 Profiling

```rust
use tracing::{info_span, instrument};

#[instrument(skip(mesh, planes))]
pub fn decompose_mesh_into_chunks(
    mesh: &Mesh,
    planes: &[SlicePlane],
) -> Result<Vec<MeshChunk>, ChunkError> {
    let _span = info_span!("chunk_decomposition",
                          num_triangles = mesh.triangles().len(),
                          num_planes = planes.len()).entered();

    // Step 1
    {
        let _span = info_span!("plane_cutting").entered();
        // ...
    }

    // Step 2
    {
        let _span = info_span!("boolean_subtraction").entered();
        // ...
    }

    // Step 3
    {
        let _span = info_span!("alignment_transforms").entered();
        // ...
    }

    Ok(result)
}
```

---

## 8. Integration with Layered Pipeline

### 8.1 Create MultidirectionalSlicer

```rust
// File: crates/layerkit-algo/src/pipeline/impls/multidirectional_slicer.rs

use crate::pipeline::{Slicer, SlicingContext, LayerData, PipelineResult};
use crate::multidirectional::{decompose_mesh_into_chunks, SlicePlane};
use std::sync::Arc;

pub struct MultidirectionalSlicer {
    pub slice_planes: Vec<SlicePlane>,
}

impl Slicer for MultidirectionalSlicer {
    fn slice(&self, ctx: &SlicingContext) -> PipelineResult<Vec<LayerData>> {
        // 1. Decompose mesh into chunks
        let chunks = decompose_mesh_into_chunks(&ctx.mesh, &self.slice_planes)
            .map_err(|e| PipelineError::SlicingFailed {
                reason: format!("Chunk decomposition failed: {}", e),
            })?;

        let mut all_layers = Vec::new();

        // 2. For each chunk, slice in rotated coordinate system
        for chunk in chunks {
            // Apply alignment transform
            let rotated_mesh = chunk.geometry.transform(&chunk.alignment_transform);

            // Calculate slice heights
            let bounds = rotated_mesh.bounds();
            let z_min = bounds.min.z;
            let z_max = bounds.max.z;
            let layer_height = ctx.settings.layer_height;

            let num_layers = ((z_max - z_min) / layer_height).ceil() as usize;

            // Slice all layers
            for i in 0..num_layers {
                let z = z_min + (i as f64 + 0.5) * layer_height;

                // Use standard planar slicing at this Z
                let contours = slice_mesh_at_z(&rotated_mesh, z)?;

                // Create LayerData with chunk metadata
                let layer = LayerData {
                    z_height: z,
                    regions: contours_to_regions(contours),
                    chunk_id: Some(chunk.id),
                    chunk_transform: Some(chunk.alignment_transform.inverse()),
                    chunk_plane: Some(chunk.plane.clone()),
                };

                all_layers.push(layer);
            }
        }

        Ok(all_layers)
    }
}
```

### 8.2 Update LayerData Structure

```rust
// File: crates/layerkit-algo/src/pipeline/layer_data.rs

pub struct LayerData {
    pub z_height: f64,
    pub regions: Vec<RegionData>,

    // NEW: Multidirectional support
    pub chunk_id: Option<usize>,
    pub chunk_transform: Option<Mat4>,  // Inverse of alignment transform
    pub chunk_plane: Option<SlicePlane>,
}
```

### 8.3 Usage Example

```rust
use layerkit_algo::pipeline::*;
use layerkit_algo::multidirectional::*;

// Build pipeline with multidirectional slicer
let slicer = MultidirectionalSlicer {
    slice_planes: vec![
        SlicePlane::from_spherical(Vec3::ZERO, 0.0, 0.0),
        SlicePlane::from_spherical(Vec3::new(0.0, 0.0, 30.0), 45.0, 0.0),
    ],
};

let pipeline = SlicePipelineBuilder::new()
    .with_slicer(Arc::new(slicer))
    .with_perimeter_generator(Arc::new(ClassicPerimeterGen::default()))
    .with_infill_generator(Arc::new(RectilinearInfillGen::default()))
    .build();

// Run
let ctx = SlicingContext {
    mesh: Arc::new(mesh),
    settings: SliceSettings::default(),
    hardware: HardwareConstraints::default(),
    progress: None,
};

let layers = pipeline.slice(&ctx)?;
```

---

## 9. Dependencies Required

```toml
# Cargo.toml additions

[dependencies]
# Existing
glam = "0.29"
rayon = "1.10"
tracing = "0.1"
thiserror = "2.0"

# NEW for chunk decomposition
truck-modeling = "0.3"   # CSG operations
truck-topology = "0.3"   # Topological data structures
earcutr = "0.4"          # Ear-clipping triangulation for caps
approx = "0.5"           # For testing (assert_relative_eq)

# Optional: alternative CSG
# cgal-rs = "0.1"        # If truck doesn't work
```

---

## 10. References

### Fractal-Cortex Code References

| Function | File | Lines | Purpose |
|----------|------|-------|---------|
| `create_chunkList()` | `slicing_functions.py` | 799-822 | Main chunk decomposition algorithm |
| `spherical_to_normal()` | `slicing_functions.py` | 787-797 | Convert spherical coords to normal vector |
| `align_mesh_base_to_xy()` | `slicing_functions.py` | 824-878 | Rodrigues rotation to align plane |
| `all_5_axis_calculations()` | `slicing_functions.py` | 752-1050 | Main 5-axis pipeline (calls chunk functions) |

### Mathematical References

- **Rodrigues' Rotation Formula:** https://en.wikipedia.org/wiki/Rodrigues%27_rotation_formula
- **Plane Equation:** https://mathworld.wolfram.com/Plane.html
- **Boolean Operations (CSG):** Requicha, A. (1980). "Representations for Rigid Solids: Theory, Methods, and Systems"
- **Mesh-Plane Intersection:** Akenine-Möller, T., & Haines, E. (2018). "Real-Time Rendering" (Chapter 16: Intersection Test Methods)

### Library Documentation

- **trimesh (Python):** https://trimsh.org/trimesh.html
- **truck (Rust):** https://docs.rs/truck-modeling/latest/truck_modeling/
- **CGAL:** https://doc.cgal.org/latest/Boolean_set_operations_2/

---

## 11. Next Steps

1. **Implement plane intersection** (`plane_intersection.rs`)
   - Start with axis-aligned planes for simplicity
   - Add general plane support
   - Implement cap triangulation

2. **Integrate CSG library** (`boolean_ops.rs`)
   - Try `truck` crate first
   - Add fallback to voxel-based approach
   - Profile performance

3. **Test with Fractal examples**
   - Port Fractal test files to Layered format
   - Compare chunk geometry visually
   - Validate volume conservation

4. **Optimize**
   - Add parallelization where safe
   - Implement caching
   - Profile and identify bottlenecks

5. **Document**
   - Add inline comments
   - Write API documentation
   - Create usage examples

---

**This is the foundation for 5-axis slicing in Layered. Once chunk decomposition works, the rest of the pipeline can reuse existing implementations!**
