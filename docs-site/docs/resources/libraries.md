---
sidebar_position: 2
title: Libraries & Tools
---

# Libraries & Tools

Essential libraries for implementing non-planar slicing algorithms.

## Python Libraries

### PyVista - Mesh Visualization & Processing

```bash
pip install pyvista
```

```python
import pyvista as pv

# Load mesh
mesh = pv.read("model.stl")

# Tetrahedralization
tet_mesh = mesh.delaunay_3d(alpha=0.1)

# Visualization
plotter = pv.Plotter()
plotter.add_mesh(mesh, color='lightblue')
plotter.show()
```

### Trimesh - Mesh I/O & Operations

```bash
pip install trimesh
```

```python
import trimesh

# Load mesh
mesh = trimesh.load("model.stl")

# Properties
print(f"Vertices: {len(mesh.vertices)}")
print(f"Faces: {len(mesh.faces)}")
print(f"Watertight: {mesh.is_watertight}")

# Operations
mesh_fixed = trimesh.repair.fix_winding(mesh)
mesh_simplified = mesh.simplify_quadric_decimation(1000)
```

### NumPy & SciPy - Numerical Computing

```python
import numpy as np
from scipy import sparse
from scipy.optimize import minimize
from scipy.spatial import Delaunay

# Linear algebra
eigenvalues, eigenvectors = np.linalg.eigh(matrix)

# Sparse matrices
L = sparse.csr_matrix(laplacian_data)

# Optimization
result = minimize(objective, x0, method='L-BFGS-B', constraints=constraints)

# Spatial operations
tri = Delaunay(points)
```

### Open3D - 3D Data Processing

```bash
pip install open3d
```

```python
import open3d as o3d

# Load mesh
mesh = o3d.io.read_triangle_mesh("model.stl")

# Compute normals
mesh.compute_vertex_normals()

# Simplification
simplified = mesh.simplify_quadric_decimation(target_triangles=5000)

# Poisson reconstruction
mesh, densities = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(pcd)
```

### CVXPY - Convex Optimization

```bash
pip install cvxpy
```

```python
import cvxpy as cp

# Quadratic programming
x = cp.Variable(n)
objective = cp.Minimize(cp.quad_form(x, H) + c @ x)
constraints = [A @ x <= b, x >= 0]
problem = cp.Problem(objective, constraints)
problem.solve()
```

---

## C++ Libraries

### Eigen - Linear Algebra

```cmake
find_package(Eigen3 REQUIRED)
target_link_libraries(myproject Eigen3::Eigen)
```

```cpp
#include <Eigen/Dense>

Eigen::Matrix3d R;
Eigen::Vector3d v;

// Rotation
Eigen::Quaterniond q(R);
v = q * v;

// Solve linear system
Eigen::VectorXd x = A.colPivHouseholderQr().solve(b);
```

### libigl - Geometry Processing

```cmake
find_package(libigl REQUIRED)
target_link_libraries(myproject igl::core)
```

```cpp
#include <igl/readOBJ.h>
#include <igl/cotmatrix.h>
#include <igl/massmatrix.h>

Eigen::MatrixXd V;
Eigen::MatrixXi F;
igl::readOBJ("model.obj", V, F);

// Cotangent Laplacian
Eigen::SparseMatrix<double> L;
igl::cotmatrix(V, F, L);

// Mass matrix
Eigen::SparseMatrix<double> M;
igl::massmatrix(V, F, igl::MASSMATRIX_TYPE_VORONOI, M);
```

### CGAL - Computational Geometry

```cmake
find_package(CGAL REQUIRED)
target_link_libraries(myproject CGAL::CGAL)
```

```cpp
#include <CGAL/Exact_predicates_inexact_constructions_kernel.h>
#include <CGAL/Mesh_3/Robust_intersection_traits_3.h>

typedef CGAL::Exact_predicates_inexact_constructions_kernel K;
typedef K::Point_3 Point;

// Boolean operations, Delaunay, etc.
```

### TetGen - Tetrahedralization

```cpp
#include <tetgen.h>

tetgenio in, out;
// ... load mesh into 'in' ...

tetgenbehavior behavior;
behavior.plc = 1;
behavior.quality = 1;

tetrahedralize(&behavior, &in, &out);
```

---

## Slicing-Specific Tools

### CuraEngine (C++)

Open-source slicing engine:
```bash
git clone https://github.com/Ultimaker/CuraEngine.git
```

### Slic3r/PrusaSlicer (C++)

```bash
git clone https://github.com/prusa3d/PrusaSlicer.git
cd PrusaSlicer
mkdir build && cd build
cmake ..
make -j$(nproc)
```

### FullControl (Python)

```bash
pip install fullcontrol
```

---

## Visualization Tools

### Matplotlib (Python)

```python
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')
ax.plot_trisurf(vertices[:,0], vertices[:,1], vertices[:,2],
                triangles=faces, cmap='viridis')
plt.show()
```

### Polyscope (C++/Python)

```bash
pip install polyscope
```

```python
import polyscope as ps

ps.init()
ps.register_surface_mesh("mesh", vertices, faces)
ps.show()
```

---

## G-code Tools

### G-code Viewer (Web)

- **ncviewer.com** - Online viewer
- **Repetier-Host** - Desktop application
- **OctoPrint** - Web-based with preview

### Python G-code Parser

```python
def parse_gcode(filename):
    moves = []
    with open(filename) as f:
        for line in f:
            if line.startswith('G1'):
                coords = {}
                for part in line.split():
                    if part[0] in 'XYZEF':
                        coords[part[0]] = float(part[1:])
                moves.append(coords)
    return moves
```

---

## Performance Tools

### Profiling (Python)

```python
import cProfile
import pstats

profiler = cProfile.Profile()
profiler.enable()
# ... code to profile ...
profiler.disable()

stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(20)
```

### Parallel Processing

```python
from multiprocessing import Pool
import numpy as np

def process_layer(layer_data):
    # ... process single layer ...
    return result

with Pool(processes=8) as pool:
    results = pool.map(process_layer, layers)
```

---

## Recommended Stack

### For Prototyping
| Task | Library |
|------|---------|
| Mesh I/O | Trimesh |
| Processing | PyVista |
| Optimization | SciPy/CVXPY |
| Visualization | Matplotlib |

### For Production
| Task | Library |
|------|---------|
| Mesh I/O | libigl |
| Processing | CGAL |
| Linear Algebra | Eigen |
| Tetrahedralization | TetGen |

### For Research
| Task | Library |
|------|---------|
| Neural Networks | PyTorch |
| Mesh Learning | PyTorch Geometric |
| Visualization | Polyscope |
| Experiments | Jupyter |

---

## Installation Cheatsheet

### Python Environment
```bash
pip install numpy scipy matplotlib
pip install pyvista trimesh open3d
pip install cvxpy torch
pip install jupyter polyscope
```

### C++ (Ubuntu)
```bash
sudo apt install cmake libeigen3-dev libcgal-dev
git clone https://github.com/libigl/libigl.git
```

### C++ (macOS)
```bash
brew install cmake eigen cgal
```

## Next Steps

- [Math Foundations](/docs/resources/math-foundations) - Theory background
- [Implementation Guides](/docs/implementations/overview) - Using the libraries
