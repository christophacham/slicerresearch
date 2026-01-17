# Fractal-Cortex Algorithm Analysis
**Date:** 2026-01-08
**Source:** `slicing_functions.py` from https://github.com/fractalrobotics/Fractal-Cortex
**Context:** Understanding multidirectional 5-axis slicing for Rust implementation

---

## Executive Summary

**Fractal-Cortex uses a brilliantly simple approach:**
1. Divide mesh into chunks using slice planes
2. "Chisel away" later chunks from earlier ones (prevents nozzle-part collision automatically!)
3. Rotate each chunk so its slice plane becomes horizontal
4. Use standard planar slicing within each chunk
5. Transform coordinates back to printable orientation
6. Generate G-code with manual stepper moves for A/B axes

**Key Innovation:** Boolean subtraction between chunks ensures print order automatically prevents collisions.

---

## 1. Core Data Structures

### Slice Plane Definition

**User Input:**
```python
slicingDirections = [
    numSlicingDirections,  # e.g., 3
    startingPositions,     # [[0, 0, 0], [0, 0, 20], [0, 0, 40]]
    directions             # [[0, 0], [45, 30], [90, 0]]  # [theta, phi] in degrees
]
```

**Spherical Coordinates → Normal Vector:**
```python
def spherical_to_normal(theta, phi):
    """Convert spherical coordinates to a normal vector."""
    theta = theta * (np.pi/180.0)
    phi = phi * (np.pi/180.0)

    nx = np.sin(theta) * np.cos(phi)
    ny = np.sin(theta) * np.sin(phi)
    nz = np.cos(theta)
    return np.array([nx, ny, nz])
```

**Coordinate System:**
- `theta` = angle from Z-axis (0° = vertical/normal to bed, 90° = horizontal)
- `phi` = rotation around Z-axis (azimuthal angle)
- First slice direction is always `[0, 0]` (perpendicular to build plate)

### Mesh Representation

Uses **trimesh** library:
```python
import trimesh

mesh = trimesh.load('model.stl')
mesh.section_multiplane(plane_normal, plane_origin, heights)  # Slicing
mesh.slice_plane(origin, normal, cap=True)                    # Boolean cut
mesh.difference(other_mesh, check_volume=False)               # Boolean subtraction
```

### Layer Representation

**Shapely** for 2D geometry operations:
```python
from shapely.geometry import Polygon, LineString, LinearRing

shapely_polygons = [Polygon(p) for p in layer.polygons_full]
shellRingsList = [polygon.exterior, *polygon.interiors]  # Extract rings
```

---

## 2. Chunk Decomposition Algorithm

**Location:** `all_5_axis_calculations()` → `create_chunkList()` (lines 799-822)

### Step 1: Initial Chunk Creation

```python
def create_chunkList():
    '''First define each chunk as the remainder of the mesh
       that's ahead of each respective sliceplane.'''

    chunkList = []
    for k in range(int(numSlicingDirections)):
        currentStart = startingPositions[k]
        currentNormal = spherical_to_normal(*directions[k])

        # Cut mesh at plane, keep everything on the "positive" side
        unprocessedChunk = mesh.slice_plane(
            currentStart,
            currentNormal,
            cap=True,              # Close the cut with planar cap
            face_index=None,
            cached_dots=None
        )
        chunkList.append(unprocessedChunk)
```

**Example:**
```
Original mesh: Cube (0,0,0) to (100,100,100)

Slice planes:
  Plane 0: position (0,0,0),   normal (0,0,1)  [vertical]
  Plane 1: position (0,0,50),  normal (0,1,0)  [horizontal, 50mm up]
  Plane 2: position (0,0,70),  normal (1,0,0)  [horizontal, 70mm up]

Initial chunks (before subtraction):
  Chunk 0: Everything above Z=0   (entire cube)
  Chunk 1: Everything in +Y direction from (0,0,50)
  Chunk 2: Everything in +X direction from (0,0,70)
```

### Step 2: Boolean Subtraction ("Chiseling")

**This is the KEY innovation - automatic collision prevention!**

```python
    '''
    Then, for each chunk, gradually chisel away material
    starting from the lattermost chunk and working backwards
    until the current chunk index.
    This process ensures no collisions between the printhead
    and the in-process part.
    '''
    for k in slicePlaneList:                    # For each chunk
        remainingChunk = chunkList[k]
        for r in reversedSlicePlaneList:        # Walk backwards through later chunks
            if r > k:                            # Only subtract chunks that come after
                latterChunk = chunkList[r]
                remainingChunk = remainingChunk.difference(
                    latterChunk,
                    check_volume=False
                )
        if remainingChunk.is_empty == False:
            chunkList[k] = remainingChunk
        else:
            chunkList[k] = None
    return chunkList
```

**Example (continued):**
```
After boolean subtraction:
  Chunk 0: cube MINUS chunk 1 MINUS chunk 2  (bottom portion only)
  Chunk 1: original chunk 1 MINUS chunk 2     (middle section)
  Chunk 2: unchanged                          (top section)

Result: No overlaps between chunks!
Print order is automatically safe: 0 → 1 → 2
```

**Why this works:**
- When printing chunk 0, chunks 1 and 2 don't exist yet → no collision possible
- When printing chunk 1, chunk 0 is done, chunk 2 doesn't exist yet → no collision
- When printing chunk 2, chunks 0 and 1 are done → no collision

**Limitation:**
- User must define slice planes in a "reasonable" order
- If planes are defined badly, chunks might be empty after subtraction
- No optimization to find "best" plane ordering (user's responsibility)

---

## 3. Coordinate Transformation

**Location:** `align_mesh_base_to_xy()` (lines 824-878)

### Purpose

Each chunk has a different slicing direction. To use standard planar slicing (which always slices perpendicular to Z), we need to **rotate each chunk** so its slice plane becomes horizontal (parallel to XY plane).

### Algorithm

```python
def align_mesh_base_to_xy(mesh, base_point, base_normal):
    """Transform a mesh so its base (defined by a point and normal)
       aligns with XY plane at Z=0."""

    # 1. Normalize the slice plane normal
    base_normal = base_normal / np.linalg.norm(base_normal)
    z_axis = np.array([0, 0, 1])

    # 2. Find rotation axis (perpendicular to both normals)
    rotation_axis = np.cross(base_normal, z_axis)

    # 3. If already aligned with Z, no rotation needed
    if np.allclose(rotation_axis, 0):
        rotation_matrix = np.eye(3)
    else:
        # 4. Calculate rotation angle using dot product
        rotation_axis = rotation_axis / np.linalg.norm(rotation_axis)
        cos_angle = np.dot(base_normal, z_axis)
        angle = np.arccos(np.clip(cos_angle, -1.0, 1.0))

        # 5. Rodrigues' rotation formula (axis-angle to matrix)
        K = np.array([
            [0, -rotation_axis[2], rotation_axis[1]],
            [rotation_axis[2], 0, -rotation_axis[0]],
            [-rotation_axis[1], rotation_axis[0], 0]
        ])
        rotation_matrix = (np.eye(3) +
                          np.sin(angle) * K +
                          (1 - np.cos(angle)) * (K @ K))

    # 6. Apply rotation to mesh
    transform = np.eye(4)
    transform[:3, :3] = rotation_matrix
    rotated_mesh = mesh.copy()
    rotated_mesh.apply_transform(transform)

    # 7. Translate so base point is at Z=0
    rotated_point = rotation_matrix @ base_point
    z_offset = rotated_point[2]
    translation = np.eye(4)
    translation[2, 3] = -z_offset
    rotated_mesh.apply_transform(translation)

    # 8. Return rotated mesh and combined transformation matrix
    final_transform = translation @ transform
    return rotated_mesh, final_transform
```

**Example:**
```
Chunk 1 has slice plane at (0, 0, 50) with normal (0, 1, 0) [pointing in +Y]

Step 1: Normal (0, 1, 0) needs to align with (0, 0, 1)
Step 2: Rotation axis = cross((0,1,0), (0,0,1)) = (-1, 0, 0)  [rotate around X-axis]
Step 3: Angle = acos(dot((0,1,0), (0,0,1))) = acos(0) = 90°
Step 4: Rotate mesh 90° around X-axis
Step 5: Translate so Z=0 is at the slice plane
Result: Chunk is now oriented with slice direction pointing up
```

### Inverse Transformation

After slicing in the rotated coordinate system, need to transform back:

```python
# During slicing:
transform3DList = [layer.metadata["to_3D"] for layer in meshSections]

# During G-code generation:
coords_3d = [transform_point(point, transform) for point in coords_2d]

def transform_point(point, transform_matrix):
    # Convert 2D point to homogeneous coordinates
    point_homogeneous = np.array([point[0], point[1], 0, 1])
    # Apply transformation
    transformed = transform_matrix @ point_homogeneous
    return transformed[:3]  # Return XYZ
```

---

## 4. Slicing Within Chunks

**Location:** `all_5_axis_calculations()` main loop (lines 950-1050)

### Process Flow

For each chunk:

1. **Slice perpendicular to chunk's direction** (parallel processing)
2. **Generate shells** (perimeter offsets)
3. **Detect manifold vs internal areas** (top/bottom vs infill)
4. **Generate infill patterns**
5. **Check nozzle-bed collisions**

### 1. Parallel Slicing

```python
slice_levels = chunk_slice_levels[str(k)]  # Heights to slice at
layerNumbers = list(range(len(slice_levels)))

# Slice all layers in parallel
argsList = zip(
    [currentChunk] * len(slice_levels),
    [currentNormal] * len(slice_levels),
    [currentStart] * len(slice_levels),
    slice_levels
)

with concurrent.futures.ProcessPoolExecutor(max_workers=workerBees) as executor:
    meshSections = list(executor.map(apply_slicing_function_5_axis, argsList))
```

**Performance:** Parallelized across CPU cores using `ProcessPoolExecutor`.

### 2. Shell Generation

**Algorithm:** Buffer (offset) inward from contour

```python
def get_shells_for_one_layer(shapely_polygons, lineWidth, shellThickness):
    # Outer shell: offset inward by lineWidth/2
    # (so outer edge of printed bead aligns with STL dimension)
    initialShellPolygons = [
        poly.buffer(-lineWidth / 2.0, join_style=2)  # join_style=2 = mitered corners
        for poly in shapely_polygons
    ]

    # Inner shells: repeatedly offset by lineWidth
    for shell in range(shellThickness - 1):
        for geometry in shellPolyList[shell]:
            newBufferedPoly = geometry.buffer(-lineWidth, join_style=2)
            volatilePolyList.append(make_valid(newBufferedPoly))
        shellPolyList.append(volatilePolyList.copy())

    # Extract LinearRings (coordinates) from polygons for G-code generation
    shellRingsList = [poly.exterior, *poly.interiors for poly in shellPolyList]

    return innerMostPolygons, shellRingsList
```

**Example:**
```
lineWidth = 0.4mm, shellThickness = 3

Original contour:  Square 10x10mm
Shell 1 (outer):   Square 9.6x9.6mm  (offset -0.2mm)
Shell 2:           Square 9.2x9.2mm  (offset -0.4mm total)
Shell 3 (inner):   Square 8.8x8.8mm  (offset -0.6mm total)
```

### 3. Manifold vs Internal Areas

**Goal:** Distinguish solid infill (top/bottom surfaces) from sparse infill (internal).

```python
def get_manifold_areas_for_one_chunk(innerMostPolygonsList, infillPercentage, shellThickness):
    manifoldAreasDict = {}
    internalAreasDict = {}

    for layer in range(len(innerMostPolygonsList)):
        current_layer = innerMostPolygonsList[layer]

        # Compare with previous and next layers
        if layer > 0:
            prev_layer = innerMostPolygonsList[layer - 1]
            overlap_with_prev = current_layer.intersection(prev_layer)
        else:
            overlap_with_prev = None

        if layer < len(innerMostPolygonsList) - 1:
            next_layer = innerMostPolygonsList[layer + 1]
            overlap_with_next = current_layer.intersection(next_layer)
        else:
            overlap_with_next = None

        # Manifold = areas with no overlap (top/bottom surfaces)
        if overlap_with_prev and overlap_with_next:
            manifold = current_layer.difference(overlap_with_prev.union(overlap_with_next))
        elif overlap_with_prev:
            manifold = current_layer.difference(overlap_with_prev)
        elif overlap_with_next:
            manifold = current_layer.difference(overlap_with_next)
        else:
            manifold = current_layer

        # Internal = areas with overlap on both sides
        if overlap_with_prev and overlap_with_next:
            internal = overlap_with_prev.intersection(overlap_with_next)
        else:
            internal = None

        manifoldAreasDict[layer] = manifold
        internalAreasDict[layer] = internal

    return manifoldAreasDict, internalAreasDict
```

**Example:**
```
Layer 0: Bottom surface              → 100% manifold
Layer 1: Has layer above and below   → Overlapping area = internal, rest = manifold
Layer 2: Has layer above and below   → Overlapping area = internal, rest = manifold
Layer 3: Top surface                 → 100% manifold
```

### 4. Infill Generation

**Internal Infill (sparse):**
- User-defined pattern (triangular, rectilinear, honeycomb)
- User-defined density (0-100%)

**Solid Infill (manifold):**
- Always 100% density
- Alternating ±45° pattern between layers

**Optimization:** Nearest-neighbor path optimization to minimize travel moves.

---

## 5. Collision Detection

**Location:** `checkForBedNozzleCollisions()` (lines 918-937)

### Nozzle-Bed Collision Only

**Limitation:** Does NOT check nozzle-part collision (relies on chunk ordering).

```python
def checkForBedNozzleCollisions(chunk, meshSections, transform3DList):
    global stopSlicing
    minAcceptableBedToNozzleClearance = 12.0  # mm

    # Convert 2D layer paths to 3D global coordinates
    paths_3D = []
    for layer, path2D in enumerate(meshSections):
        currentTransform = transform3DList[layer]
        paths_3D.append(path2D.to_3D(currentTransform))

    # Extract Z values of all points
    sectionPoints = [path.vertices for path in paths_3D]
    sectionZValuesBySlicePlane = [[point[2] for point in section]
                                  for section in sectionPoints]

    # Check each point
    for layer, section in enumerate(sectionZValuesBySlicePlane):
        theta = directionsRad[chunk][0]  # Tilt angle of bed

        for z in section:
            if z <= minAcceptableBedToNozzleClearance:
                # Calculate clearance considering bed tilt
                currentBedToNozzleDistance = abs(z) / np.sin(theta)

                if currentBedToNozzleDistance < minAcceptableBedToNozzleClearance:
                    # COLLISION DETECTED!
                    stopSlicing = True
                    return stopSlicing

    return stopSlicing
```

**Geometry:**
```
Tilted bed at angle θ:

  Nozzle at height Z (global coordinates)
              |
              v
         ↓
    ----/----  ← Nozzle tip
       /
      /
     /   ) θ
    /____|___  ← Tilted bed surface

  Actual clearance = Z / sin(θ)

  Example: Z = 10mm, θ = 30°
    Clearance = 10 / sin(30°) = 10 / 0.5 = 20mm
```

**Result:**
- If collision detected: `stopSlicing = True`, GUI shows red plane
- User must adjust slice plane position/orientation

---

## 6. G-code Generation

**Location:** `write_5_axis_gcode()` (lines 1124-1400+)

### Coordinate Transformation to Printable Orientation

```python
def transform_paths_to_printable_orientation(layer_paths, transformation_matrices, DCM_AB):
    """
    Convert layer paths to 3D, then rotate for bed orientation.
    DCM_AB = Direction Cosine Matrix for A/B axes rotation.
    """
    printable_pathPoints = []

    for layer_idx, (paths, transform) in enumerate(zip(layer_paths, transformation_matrices)):
        for path in paths:
            # 1. Get 2D coordinates
            coords_2d = np.array(path.coords)

            # 2. Transform to 3D (undo chunk rotation)
            coords_3d = [transform_point(point, transform) for point in coords_2d]

            # 3. Apply bed rotation (A/B axes)
            printable_coords_3d = [np.matmul(DCM_AB, point3D) for point3D in coords_3d]

            layerPaths.append([(point[0], point[1]) for point in printable_coords_3d])

        printable_pathPoints.append(layerPaths)
        midLayer_Z_Heights.append(printable_coords_3d[0][2])

    return printable_pathPoints, midLayer_Z_Heights
```

### Manual Stepper Moves

**Key insight:** A and B axes move **separately** from XYZ.

```python
# Convert slice directions to A/B angles
directions = np.array(directions)
directions[:, 1] = 90 - directions[:, 1]  # Adjust B angle convention
directions[0] = [0.0, 0.0]                # First chunk always vertical

AMOVE_Degrees = [sublist[1] for sublist in directions]  # A angles
BMOVE_Degrees = [sublist[0] for sublist in directions]  # B angles

# Append final return-to-zero moves
AMOVE_Degrees.append(0.0)
BMOVE_Degrees.append(0.0)

# Calculate feed rates for A/B (scaled for combined motion)
for d in range(len(AMOVE_Degrees)):
    if d > 0:
        currentAMove_Relative = AMOVE_Degrees[d] - AMOVE_Degrees[d-1]
        currentBMove_Relative = BMOVE_Degrees[d] - BMOVE_Degrees[d-1]
        ABTheta = np.arctan2(currentBMove_Relative, currentAMove_Relative)

        # Decompose feed rate into A and B components
        ASPEED_Scaled.append(abs(AB_FEEDRATE * np.cos(ABTheta)))
        BSPEED_Scaled.append(abs(AB_FEEDRATE * np.sin(ABTheta)))
```

### G-code Structure

```gcode
;SLICER:       Fractal Cortex
;FIRMWARE:     Klipper
;FILE:         pipe_fitting.stl
;--------------------------
;PRINT SETTINGS:
;--------------------------
;nozzleTemp:          210
;bedTemp:             60
;layerHeight:         0.2
;shellThickness:      3
;infillPercentage:    20
;--------------------------

; START SEQUENCE
G28 X Y Z                       ; Home linear axes
home_ab                         ; Home rotary axes (Klipper macro)
G29                             ; Bed leveling
M104 S210                       ; Set hotend temp
M140 S60                        ; Set bed temp
M109 S210                       ; Wait for hotend
M190 S60                        ; Wait for bed
G1 Z5 F1000                     ; Lift Z to safe height

; CHUNK 0 (A=0.00° B=0.00°)
MANUAL_STEPPER STEPPER=stepper_a MOVE=0.00 SPEED=15 SYNC=1
MANUAL_STEPPER STEPPER=stepper_b MOVE=0.00 SPEED=10 SYNC=1
; Layer 0
G0 F3000 X50.0 Y50.0            ; Travel to start
G0 F1000 Z0.2                   ; Lower to layer height
G1 F1800 X60.0 Y50.0 E0.05      ; Print shell
G1 F1800 X60.0 Y60.0 E0.10      ; ...
; ... more layers ...

; CHUNK 1 (A=45.00° B=30.00°)
G1 E-5.0 F1800                  ; Retract
G0 F1000 Z30.0                  ; Lift high for rotation
MANUAL_STEPPER STEPPER=stepper_a MOVE=45.00 SPEED=15 SYNC=1
MANUAL_STEPPER STEPPER=stepper_b MOVE=30.00 SPEED=10 SYNC=1
; Layer 0 (of chunk 1)
G0 F3000 X52.3 Y48.7            ; Travel to start (coordinates transformed!)
G0 F1000 Z15.2                  ; Lower to layer height (Z is now relative to rotated bed)
G1 F1800 X62.1 Y49.2 E0.15      ; Print shell
; ... more layers ...

; CHUNK 2 (A=90.00° B=0.00°)
G1 E-5.0 F1800
G0 F1000 Z30.0
MANUAL_STEPPER STEPPER=stepper_a MOVE=90.00 SPEED=15 SYNC=1
MANUAL_STEPPER STEPPER=stepper_b MOVE=0.00 SPEED=10 SYNC=1
; ... slicing ...

; END SEQUENCE
G1 E-5.0 F1800                  ; Final retract
G0 F1000 Z100.0                 ; Lift Z
MANUAL_STEPPER STEPPER=stepper_a MOVE=0.0 SPEED=15 SYNC=1   ; Return to home
MANUAL_STEPPER STEPPER=stepper_b MOVE=0.0 SPEED=10 SYNC=1
M104 S0                         ; Turn off hotend
M140 S0                         ; Turn off bed
M84                             ; Disable steppers
```

**Key Points:**
1. `MANUAL_STEPPER` commands move A/B axes
2. `SYNC=1` waits for move to complete before continuing
3. XYZ coordinates are **pre-transformed** (no TCP in firmware!)
4. Z-hop between chunks prevents collisions during rotation

---

## 7. Performance Optimizations

### Parallel Processing

Used throughout with `concurrent.futures.ProcessPoolExecutor`:

```python
workerBees = os.cpu_count()  # Use all CPU cores

# Example: Parallel slicing
with concurrent.futures.ProcessPoolExecutor(max_workers=workerBees) as executor:
    meshSections = list(executor.map(apply_slicing_function_5_axis, argsList))

# Example: Parallel shell generation
with concurrent.futures.ProcessPoolExecutor(max_workers=workerBees) as executor:
    innerMostPolygonsList, shellRingsListList = zip(
        *executor.map(apply_get_shells_for_one_layer, argsList)
    )
```

**Performance:** Author notes "I parallelized everything I could, but there's room for improvement"

### Memory Management

```python
del meshSections      # Explicitly delete large objects after use
del bufferedPoly
del volatilePolyList
```

Prevents memory bloat during long slicing operations.

---

## 8. Known Issues and Limitations

### From Author (README.md)

**1. Geometry Errors (MOST IMPORTANT)**
> "Sometimes slicing calculations will encounter challenging geometry that halts the slicing process."

**Likely causes:**
- Invalid STL geometry (non-manifold, self-intersections)
- Shapely geometry errors after boolean operations
- Edge cases in mesh-plane intersections
- Floating-point precision issues

**Location:** Needs better error handling in `slicing_functions.py`

**2. No Support Generation**
- Neither 3-axis nor 5-axis mode generates supports
- User must manually add supports or rely on geometry being printable

**3. Windows-Only**
- Dependencies (pyglet, glooey) are Windows-focused
- Needs porting for Linux/Mac/Web

**4. Efficiency**
- Already parallelized but could be faster
- Python bottleneck for geometry operations
- No caching of intermediate results

### Discovered in Code Analysis

**5. No Nozzle-Part Collision Detection**
- Only checks nozzle-bed collision
- Relies entirely on chunk ordering to prevent nozzle-part collisions
- Could fail if:
  - User defines weird slice planes
  - Part has extreme overhangs within a chunk
  - Chunk boundaries are poorly chosen

**6. No TCP Compensation**
- XYZ coordinates pre-computed by slicer
- Firmware treats A/B as independent manual steppers
- No feed rate compensation for rotary motion
- Could cause artifacts at chunk transitions

**7. No Singularity Handling**
- No checks for gimbal lock (B = ±90°)
- No warnings if approaching singularity
- Could cause erratic motion

**8. Fixed 12mm Clearance**
```python
minAcceptableBedToNozzleClearance = 12.0  # Hardcoded!
```
- Not configurable per printer
- May be too conservative or too aggressive depending on hotend geometry

**9. No Adaptive Layer Height**
- Fixed layer height throughout print
- Could benefit from variable layer height (coarse for flat areas, fine for details)

---

## 9. Rust Implementation Opportunities

### Improvements Over Fractal-Cortex

**1. Robust Geometry Handling**
```rust
use geo::algorithm::bool_ops::BooleanOps;
use geo::algorithm::contains::Contains;

pub fn decompose_chunks(mesh: &Mesh, planes: &[SlicePlane])
    -> Result<Vec<MeshChunk>, SlicingError>
{
    let mut chunks = Vec::new();

    // Step 1: Initial cuts
    for plane in planes {
        let chunk = mesh.slice_plane(&plane.origin, &plane.normal)
            .map_err(|e| SlicingError::InvalidGeometry {
                reason: format!("Failed to slice at plane: {}", e)
            })?;

        // Validate chunk is valid manifold mesh
        if !chunk.is_manifold() {
            return Err(SlicingError::NonManifoldGeometry {
                plane_id: chunks.len(),
            });
        }

        chunks.push(chunk);
    }

    // Step 2: Boolean subtraction (with better error handling)
    for k in 0..chunks.len() {
        let mut remaining = chunks[k].clone();

        for r in (k+1)..chunks.len() {
            // Try boolean operation with multiple backends
            remaining = match remaining.difference(&chunks[r]) {
                Ok(result) if !result.is_empty() => result,
                Ok(_) => {
                    // Empty result - log warning but continue
                    warn!("Chunk {} became empty after subtracting chunk {}", k, r);
                    Mesh::empty()
                },
                Err(e) => {
                    // Try fallback method (voxel-based boolean ops)
                    warn!("Direct boolean failed: {}. Trying voxel fallback.", e);
                    voxel_based_difference(&remaining, &chunks[r])?
                }
            };
        }

        chunks[k] = remaining;
    }

    Ok(chunks)
}
```

**2. Nozzle-Part Collision Detection**
```rust
use parry3d::shape::Capsule;
use parry3d::query::contact;

pub struct EnhancedCollisionChecker {
    nozzle: Capsule,
    bed: TriMesh,
    printed_geometry: Vec<TriMesh>,  // Accumulate as printing
}

impl EnhancedCollisionChecker {
    pub fn check_toolpath(&mut self, path: &ToolPath, chunk_id: usize)
        -> CollisionResult
    {
        // Check nozzle vs bed
        if let Some(collision) = self.check_nozzle_bed(path) {
            return CollisionResult::BedCollision(collision);
        }

        // Check nozzle vs already-printed chunks
        for (id, printed_chunk) in self.printed_geometry.iter().enumerate() {
            if id >= chunk_id {
                break;  // Don't check against chunks not yet printed
            }

            if let Some(collision) = self.check_nozzle_part(path, printed_chunk) {
                return CollisionResult::PartCollision {
                    chunk_id: id,
                    collision,
                };
            }
        }

        CollisionResult::Safe
    }

    pub fn mark_chunk_printed(&mut self, chunk: TriMesh) {
        self.printed_geometry.push(chunk);
    }
}
```

**3. TCP Kinematics (Optional)**
```rust
pub struct TCPKinematics {
    config: MachineConfig,
}

impl TCPKinematics {
    pub fn inverse_kinematics(&self, tip: Vector3<f32>, orientation: Vector3<f32>)
        -> Result<(f32, f32, f32, f32, f32), KinematicError>
    {
        // Convert orientation to A/B angles
        let a_angle = orientation.z.acos().to_degrees();
        let b_angle = orientation.y.atan2(orientation.x).to_degrees();

        // Tool offset compensation
        let pivot = tip + orientation * self.config.tool_length;

        Ok((pivot.x, pivot.y, pivot.z, a_angle, b_angle))
    }

    pub fn compensate_feed_rate(&self, from: &Pose, to: &Pose, nominal_feed: f32)
        -> f32
    {
        // Calculate linear and rotary components
        let linear_dist = (to.position - from.position).magnitude();
        let rotary_dist = ((to.a - from.a).powi(2) + (to.b - from.b).powi(2)).sqrt();

        // Combined feed rate
        let total_dist = (linear_dist.powi(2) + (rotary_dist * self.config.mm_per_deg).powi(2)).sqrt();

        nominal_feed * (total_dist / linear_dist)
    }
}
```

**4. Performance (Rust vs Python)**

Estimated speedup for common operations:

| Operation | Python (Fractal) | Rust (Estimated) | Speedup |
|-----------|------------------|------------------|---------|
| Mesh boolean ops | 5-10s | 0.5-1s | 10× |
| Geometry validation | 2-3s | 0.1-0.2s | 15× |
| Coordinate transforms | 1-2s | 0.05-0.1s | 20× |
| Collision detection | 0.5-1s | 0.05-0.1s | 10× |
| **Total slicing time** | **30-60s** | **3-6s** | **10×** |

**Additional benefits:**
- Type safety (fewer runtime errors)
- Memory safety (no segfaults)
- Better parallelism (Rayon vs ProcessPoolExecutor)
- WASM support (web-based slicer)

---

## 10. Algorithm Pseudocode Summary

```
FUNCTION slice_multidirectional_5axis(mesh, slice_planes, settings):

    // === CHUNK DECOMPOSITION ===
    chunks = []
    FOR EACH plane IN slice_planes:
        chunk = mesh.slice_plane(plane.origin, plane.normal)
        chunks.APPEND(chunk)

    // Boolean subtraction to prevent collisions
    FOR k = 0 TO chunks.LENGTH - 1:
        FOR r = k+1 TO chunks.LENGTH - 1:
            chunks[k] = chunks[k].difference(chunks[r])

    // === PROCESS EACH CHUNK ===
    all_toolpaths = []
    FOR EACH chunk IN chunks:

        // Rotate chunk so slice plane is horizontal
        rotated_chunk, transform = align_to_xy(chunk, plane.origin, plane.normal)

        // Calculate slice heights
        z_min, z_max = rotated_chunk.bounds_z()
        slice_levels = RANGE(z_min, z_max, step=layer_height)

        // Slice all layers (parallel)
        layers = PARALLEL_MAP(slice_levels, LAMBDA z:
            rotated_chunk.section(z_height=z, normal=[0,0,1])
        )

        // Generate shells (parallel)
        shell_rings = PARALLEL_MAP(layers, LAMBDA layer:
            generate_shells(layer.polygons, line_width, shell_thickness)
        )

        // Identify solid vs sparse areas
        manifold_areas, internal_areas = detect_manifold_areas(layers)

        // Generate infill (parallel)
        solid_infill = PARALLEL_MAP(manifold_areas, generate_solid_infill)
        internal_infill = PARALLEL_MAP(internal_areas, generate_sparse_infill)

        // Check collisions
        IF NOT check_nozzle_bed_clearance(layers, plane.angle):
            RETURN ERROR("Illegal slice plane - nozzle would hit bed")

        // Transform back to printable coordinates
        printable_shells = transform_to_printable(shell_rings, transform, plane.ab_angles)
        printable_infill = transform_to_printable(infill, transform, plane.ab_angles)

        all_toolpaths.APPEND({
            shells: printable_shells,
            infill: printable_infill,
            ab_angles: plane.ab_angles
        })

    // === GENERATE G-CODE ===
    gcode = generate_start_sequence(settings)

    FOR EACH chunk_toolpath IN all_toolpaths:
        gcode.APPEND(f"MANUAL_STEPPER STEPPER=stepper_a MOVE={chunk_toolpath.ab_angles.a}")
        gcode.APPEND(f"MANUAL_STEPPER STEPPER=stepper_b MOVE={chunk_toolpath.ab_angles.b}")

        FOR EACH layer IN chunk_toolpath:
            gcode.APPEND(generate_layer_gcode(layer.shells, layer.infill, settings))

    gcode.APPEND(generate_end_sequence())

    RETURN gcode
```

---

## 11. Conclusion

**Fractal-Cortex's multidirectional approach is elegant and practical:**

✅ **Strengths:**
- Simple chunk decomposition with automatic collision prevention
- Uses standard planar slicing (well-understood algorithms)
- Parallelized for performance
- Works on real hardware (Fractal-5-Pro)
- Open source (GPLv3)

❌ **Weaknesses:**
- Geometry errors with complex/invalid meshes
- No nozzle-part collision detection (only ordering-based)
- No TCP compensation (pre-computed coordinates)
- No support generation
- Python performance limitations

**Our Rust implementation will:**
1. Port core algorithms with improved robustness
2. Add nozzle-part collision detection
3. Add optional TCP kinematics
4. Support multiple firmware modes (manual steppers, integrated kinematics, dense sampling)
5. Achieve 10-20× performance improvement
6. Enable web deployment via WASM

**Ready to begin implementation in Rust + Svelte!**

---

**Next Step:** Create Rust project structure and implement chunk decomposition module.
