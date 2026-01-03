---
sidebar_position: 1
title: Research Papers
---

# Research Papers Index

This repository contains 40+ research papers (~320MB) on non-planar 3D printing.

## Quick Access

All papers are in the `papers/` directory. Download the full repository:

```bash
git clone https://github.com/christophacham/slicerresearch.git
cd slicerresearch
git lfs pull  # Downloads PDFs
```

## Paper Categories

| Category | Count | Key Papers |
|----------|-------|------------|
| [Foundational](/docs/papers/foundational) | 5 | CLFDM, Ahlers Thesis, FullControl |
| [Core Algorithms](/docs/papers/core-algorithms) | 10 | CurviSlicer, S³-Slicer, QuickCurve |
| [Recent Advances](/docs/papers/recent-advances) | 15 | Neural methods, fiber printing |

## Complete Paper List

### Mesh Deformation
| Paper | Year | Size | Description |
|-------|------|------|-------------|
| `S3_Slicer_SIGGRAPH_Asia_2022.pdf` | 2022 | 16MB | S³-Slicer (Best Paper) |
| `CurviSlicer_NYU_2019.pdf` | 2019 | 11.5MB | QP-based deformation |
| `QuickCurve_2024_NonPlanar.pdf` | 2024 | 19MB | Simplified least-squares |

### Multi-Axis Path Planning
| Paper | Year | Size | Description |
|-------|------|------|-------------|
| `RoboFDM_ICRA_2017.pdf` | 2017 | 470KB | Support-free robotic |
| `Open5x_Conformal_Slicing_2022.pdf` | 2022 | 6.4MB | 5-axis kinematics |
| `Reinforced_FDM_MultiAxis_SIGGRAPH_Asia_2020.pdf` | 2020 | 11.8MB | Stress-aligned |

### Neural/ML Methods
| Paper | Year | Size | Description |
|-------|------|------|-------------|
| `Neural_Slicer_MultiAxis_2024.pdf` | 2024 | 31MB | Neural layer generation |
| `INF_3DP_Collision_Free_2024.pdf` | 2024 | 45MB | Implicit neural fields |
| `Learning_Based_Toolpath_Planner_2024.pdf` | 2024 | 44MB | Graph neural networks |

### Geodesic/Field-Based
| Paper | Year | Size | Description |
|-------|------|------|-------------|
| `Geodesic_Distance_Field_Curved_Layer_2020.pdf` | 2020 | 4.6MB | Heat method slicing |
| `Field_Based_Toolpath_Fiber_2021.pdf` | 2021 | 10.4MB | Stress-aligned fiber |

### Adaptive Slicing
| Paper | Year | Size | Description |
|-------|------|------|-------------|
| `Adaptive_Slicing_FDM_Revisited_Hamburg_2017.pdf` | 2017 | 2.5MB | Curvature-based |
| `Optimal_Triangle_Mesh_Slicing.pdf` | - | 1.3MB | O(n log k) algorithm |

## Reading Order

### For Beginners
1. `CLFDM_Singamneni_2010.pdf` - Original concept
2. `Ahlers_2018_MSc_Thesis_NonPlanar_Layers.pdf` - Comprehensive overview
3. `Gleadall_2021_FullControl_GCode_Designer.pdf` - Alternative approach

### For Researchers
1. `CurviSlicer_NYU_2019.pdf` - Foundation algorithm
2. `S3_Slicer_SIGGRAPH_Asia_2022.pdf` - State of the art
3. `QuickCurve_2024_NonPlanar.pdf` - Modern simplification
4. `Neural_Slicer_MultiAxis_2024.pdf` - ML approaches

### For Practitioners
1. `Open5x_Conformal_Slicing_2022.pdf` - Practical 5-axis
2. `RoboFDM_ICRA_2017.pdf` - Collision-free paths
3. `Support_Generation_Curved_Layers_2023.pdf` - Support structures

## Key Algorithms Summary

| Paper | Algorithm | Complexity | Key Math |
|-------|-----------|------------|----------|
| CurviSlicer | Tetrahedral QP | O(n³) | Quadratic programming |
| S³-Slicer | Rotation optimization | O(n³) | Quaternions |
| QuickCurve | Surface optimization | O(n) | Least-squares |
| Geodesic Field | Distance field | O(n log n) | Heat equation |
| RoboFDM | Decomposition | O(n²) | Dependency graphs |
| Neural Slicer | Neural network | O(n) | MLP, implicit fields |

## Papers Requiring Manual Download

Some papers are behind paywalls. Check these sources:

### ACM Digital Library
- **Support-free Volume Printing** (SIGGRAPH 2018)
- **Overhang-Aware Slicing** (SIGGRAPH 2014)

### ScienceDirect
- **Curved Layer Based Process Planning** (CAD 2019)
- **Vector Field-based Curved Layer Slicing** (2022)

### Institutional Access
- Check your university library for access
- Authors often share preprints on personal pages
- arXiv has many recent ML papers
