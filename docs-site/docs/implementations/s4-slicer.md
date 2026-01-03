---
sidebar_position: 2
title: S4 Slicer
---

# S4 Slicer Deep Dive

A simplified, accessible non-planar slicer based on mesh deformation.

**Repository:** `S4_Slicer/`
**Author:** Joshua Bird (@jyjblrd)
**Status:** Active (2025)

## Overview

S4 Slicer implements tetrahedral mesh deformation in a single Jupyter notebook, making non-planar slicing accessible for experimentation.

```mermaid
graph LR
    A[STL] --> B[Tetrahedralize]
    B --> C[Build Grid]
    C --> D[Optimize Rotations]
    D --> E[Deform]
    E --> F[Slice]
    F --> G[Inverse Map]
    G --> H[G-code]
```

## Quick Start

### Google Colab (Fastest)

1. Upload `S4_Slicer/main.ipynb` to [Google Colab](https://colab.research.google.com)
2. Run all cells
3. Download generated G-code

### Local Setup

```bash
cd slicerresearch/S4_Slicer

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Launch notebook
jupyter notebook main.ipynb
```

## Algorithm Details

### 1. Tetrahedralization

Convert surface mesh to volume mesh:

```python
# Using TetGen via PyVista
import pyvista as pv

mesh = pv.read("model.stl")
tet_mesh = mesh.delaunay_3d(alpha=0.1)
```

### 2. Deformation Grid

Hex-dominant grid stores rotation per cell:

```python
class DeformationGrid:
    def __init__(self, bounds, resolution):
        self.resolution = resolution
        self.rotations = {}  # cell -> Euler angles (rx, ry, rz)

    def get_rotation(self, point):
        cell = self.point_to_cell(point)
        return self.rotations.get(cell, (0, 0, 0))
```

### 3. Rotation Optimization

Minimize overhang angles:

```python
def optimize_rotations(grid, mesh, max_overhang=45):
    for cell in grid.cells:
        # Get faces in this cell
        faces = mesh.faces_in_cell(cell)

        # Find rotation that minimizes overhang
        def objective(angles):
            R = euler_to_matrix(*angles)
            rotated_normals = [R @ n for n in face_normals(faces)]
            overhangs = [angle_from_vertical(n) for n in rotated_normals]
            return sum(max(0, o - max_overhang)**2 for o in overhangs)

        result = scipy.optimize.minimize(objective, x0=[0,0,0])
        grid.rotations[cell] = result.x
```

### 4. Mesh Deformation

Apply rotations via barycentric interpolation:

```python
def deform_mesh(mesh, grid):
    deformed_vertices = []

    for v in mesh.vertices:
        # Get cell rotation
        R = euler_to_matrix(*grid.get_rotation(v))

        # Rotate around cell center
        cell_center = grid.cell_center(v)
        v_local = v - cell_center
        v_rotated = R @ v_local + cell_center

        deformed_vertices.append(v_rotated)

    return Mesh(deformed_vertices, mesh.faces)
```

### 5. Inverse Transform

Map planar slices back to original space:

```python
def inverse_transform_path(path, original_mesh, deformed_mesh):
    transformed = []

    for point in path:
        # Find containing tetrahedron in deformed mesh
        tet_idx = deformed_mesh.find_containing_tet(point)

        # Compute barycentric coordinates
        bary = barycentric_coords(point, deformed_mesh.tet_vertices(tet_idx))

        # Apply to original mesh
        original_point = apply_barycentric(bary, original_mesh.tet_vertices(tet_idx))
        transformed.append(original_point)

    return transformed
```

## Configuration

Key parameters in the notebook:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `max_overhang` | 45° | Maximum printable overhang angle |
| `grid_resolution` | 10 | Cells per axis in deformation grid |
| `layer_height` | 0.2mm | Slicing layer thickness |
| `smoothing_weight` | 0.1 | Rotation field smoothness |

## Limitations

- **Collision Detection:** No toolhead collision checking
- **Scalability:** >500K tetrahedra become slow
- **Sharp Features:** May distort thin walls
- **Material:** Assumes isotropic behavior

## Example Output

```gcode
; Non-planar layer 1
G1 X50.0 Y50.0 Z0.20 E0.5 F1500
G1 X51.0 Y50.0 Z0.22 E0.52  ; Z varies!
G1 X52.0 Y50.0 Z0.25 E0.54
...
```

## Comparison to S³

| Aspect | S4 Slicer | S³ Slicer |
|--------|-----------|-----------|
| Language | Python | C++ |
| Setup | 5 minutes | 1-2 hours |
| Multi-objective | No | Yes (SF/SQ/SR) |
| Performance | Medium | High |
| Maintenance | Active | Research |

## Resources

- [GitHub Repository](https://github.com/jyjblrd/S4_Slicer)
- [Algorithm Overview](/docs/algorithms/mesh-deformation)
- [Hardware Requirements](/docs/getting-started/hardware)
