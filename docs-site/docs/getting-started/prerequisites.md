---
sidebar_position: 1
title: Prerequisites
---

# Prerequisites

Before working with non-planar slicing algorithms, ensure you have the following.

## Software Requirements

### Python Environment (Recommended)

Most modern non-planar slicers use Python:

```bash
# Python 3.10+ recommended
python --version

# Create virtual environment
python -m venv nonplanar-env
source nonplanar-env/bin/activate  # Linux/Mac
# or
nonplanar-env\Scripts\activate     # Windows
```

### Key Python Libraries

```bash
pip install numpy scipy matplotlib
pip install pyvista trimesh
pip install jupyter  # For S4 Slicer
```

### C++ Build Tools (For Some Projects)

S³-Slicer and VoxelMultiAxisAM require C++ compilation:

| Platform | Requirements |
|----------|-------------|
| Windows | Visual Studio 2019+, CMake |
| Linux | GCC 9+, CMake, libigl |
| macOS | Xcode Command Line Tools, CMake |

## Knowledge Prerequisites

### Essential
- Basic 3D printing concepts (layers, extrusion, G-code)
- Python programming
- Linear algebra basics (vectors, matrices)

### Helpful
- Mesh processing (vertices, faces, tetrahedra)
- Optimization theory (gradient descent, QP)
- Differential geometry (normals, curvature)

## Repository Setup

Clone the research repository:

```bash
git clone https://github.com/christophacham/slicerresearch.git
cd slicerresearch

# Install Git LFS for large files (PDFs, models)
git lfs install
git lfs pull
```

## Verify Installation

Test your Python environment:

```python
import numpy as np
import pyvista as pv
import trimesh

# Load a test mesh
mesh = trimesh.load("S4_Slicer/test_models/bunny.stl")
print(f"Loaded mesh with {len(mesh.vertices)} vertices")
```

## Next Steps

- [Quick Start](/docs/getting-started/quick-start) - Run your first non-planar slice
- [Hardware Requirements](/docs/getting-started/hardware) - Check printer compatibility
