# Non-Planar 3D Printing Research Papers

## Downloaded Papers (~170MB total)

### Foundational Papers
| File | Size | Description |
|------|------|-------------|
| `CLFDM_Singamneni_2010.pdf` | 288KB | **Foundational** - Original Curved Layer FDM paper |
| `Ahlers_2018_MSc_Thesis_NonPlanar_Layers.pdf` | 6.8MB | **Foundational** - Daniel Ahlers Master's Thesis, TAMS Hamburg |
| `Ahlers_2019_CASE_NonPlanar_Smooth_Surface.pdf` | 2.0MB | IEEE CASE 2019 conference paper |
| `Ahlers_Colloquium_Presentation.pdf` | 6.9MB | Thesis defense slides |

### Core Algorithm Papers
| File | Size | Description |
|------|------|-------------|
| `S3_Slicer_SIGGRAPH_Asia_2022.pdf` | 16MB | **Key** - S³-Slicer: Multi-Axis Framework (Best Paper Award) |
| `CurviSlicer_NYU_2019.pdf` | 11.5MB | **Key** - CurviSlicer: QP-based mesh deformation |
| `CurviSlicer_HAL_2019.pdf` | 11.6MB | CurviSlicer (HAL archive version) |
| `QuickCurve_2024_NonPlanar.pdf` | 19MB | QuickCurve: Simplified least-squares approach |
| `Geodesic_Distance_Field_Curved_Layer_2020.pdf` | 4.6MB | Geodesic field-based volume decomposition |

### Multi-Axis & Path Planning
| File | Size | Description |
|------|------|-------------|
| `RoboFDM_ICRA_2017.pdf` | 470KB | RoboFDM: Support-free robotic fabrication |
| `Open5x_Conformal_Slicing_2022.pdf` | 6.4MB | Open5x: 5-axis conformal slicing |
| `Coupek_2018_MultiAxis_Path_Planning.pdf` | 811KB | Multi-axis path planning, coordinate transforms |
| `Curved_Layer_Process_Planning_2017.pdf` | 9.1MB | Process planning for curved layers |
| `Support_Generation_Curved_Layers_2023.pdf` | 5.1MB | Skeleton-based support for curved layers |

### Neural/Advanced Methods
| File | Size | Description |
|------|------|-------------|
| `Neural_Slicer_MultiAxis_2024.pdf` | 31MB | Neural Slicer for Multi-Axis 3D Printing |
| `Curve_Based_Slicer_DLP_2024.pdf` | 13MB | Curve-Based Slicer for Multi-Axis DLP |
| `NonPlanar_Slicer_Modeling_2024.pdf` | 2.2MB | Hybrid planar/non-planar approach |
| `Continuous_Fiber_Spatial_Printing_2023.pdf` | 5.7MB | Geodesic toolpaths for fiber printing |

### Adaptive Slicing
| File | Size | Description |
|------|------|-------------|
| `Adaptive_Slicing_FDM_Revisited_Hamburg_2017.pdf` | 2.5MB | Curvature-based layer thickness |
| `Adaptive_Slicing_Contour_2021.pdf` | 937KB | Contour reconstruction slicing |
| `Saliency_Preserving_Slicing_Microsoft_2015.pdf` | 3.0MB | Visual saliency optimization |
| `Optimal_Triangle_Mesh_Slicing.pdf` | 1.3MB | O(n log k) optimal slicing algorithm |

### Coordinate Transform Methods
| File | Size | Description |
|------|------|-------------|
| `Axisymmetric_NonPlanar_Slicing_2024.pdf` | 830KB | B-spline generatrix slicing |

### Direct G-code Design
| File | Size | Description |
|------|------|-------------|
| `Gleadall_2021_FullControl_GCode_Designer.pdf` | 2.3MB | **Paradigm Shift** - Direct G-code design |

### Other
| File | Size | Description |
|------|------|-------------|
| `MultiAxis_Spiral_SupportFree_2021.pdf` | 495KB | Spiral parts without supports |

---

## Papers Requiring Manual Download

### ACM Digital Library (Login Required)
- **Support-free Volume Printing by Multi-axis Motion** (SIGGRAPH 2018)
  - https://dl.acm.org/doi/10.1145/3197517.3201342
- **Overhang-Aware Slicing** (SIGGRAPH 2014)
  - https://dl.acm.org/doi/10.1145/2601097.2601132
- **5-Axis Toolpath Optimization** (2018)
  - https://dl.acm.org/doi/10.1145/3197517.3201382

### ScienceDirect
- **Vector Field-based Curved Layer Slicing** (2022)
  - https://www.sciencedirect.com/science/article/abs/pii/S0736584522000503
- **A Comparative Review of Multi-Axis 3D Printing** (2024)
  - https://www.sciencedirect.com/science/article/abs/pii/S1526612524004432

---

## Reading Order by Algorithm Category

### 1. Mesh Deformation (Start Here)
1. `CurviSlicer_NYU_2019.pdf` - QP optimization, tetrahedral deformation
2. `S3_Slicer_SIGGRAPH_Asia_2022.pdf` - Multi-objective quaternion optimization
3. `QuickCurve_2024_NonPlanar.pdf` - Simplified single least-squares

### 2. Geodesic/Field-Based
4. `Geodesic_Distance_Field_Curved_Layer_2020.pdf` - Heat method, iso-surfaces
5. `Continuous_Fiber_Spatial_Printing_2023.pdf` - Vector fields + geodesics

### 3. Multi-Axis Path Planning
6. `RoboFDM_ICRA_2017.pdf` - Collision-free decomposition
7. `Open5x_Conformal_Slicing_2022.pdf` - 5-axis kinematics, feed rate
8. `Support_Generation_Curved_Layers_2023.pdf` - Support for curved layers

### 4. Coordinate Transforms
9. `Coupek_2018_MultiAxis_Path_Planning.pdf` - Cylindrical mapping
10. `Axisymmetric_NonPlanar_Slicing_2024.pdf` - B-spline transforms

### 5. Adaptive Layer Thickness
11. `Adaptive_Slicing_FDM_Revisited_Hamburg_2017.pdf` - Curvature analysis
12. `Optimal_Triangle_Mesh_Slicing.pdf` - Algorithm complexity

### 6. Foundations
13. `CLFDM_Singamneni_2010.pdf` - Original concept
14. `Ahlers_2018_MSc_Thesis_NonPlanar_Layers.pdf` - Full implementation
15. `Gleadall_2021_FullControl_GCode_Designer.pdf` - Alternative paradigm

---

## Key Algorithms Summary

| Paper | Algorithm | Complexity | Key Math |
|-------|-----------|------------|----------|
| CurviSlicer | Tetrahedral QP | O(n³) | Quadratic programming |
| S³-Slicer | Rotation optimization | O(n³) | Quaternions, deformation gradient |
| QuickCurve | Surface optimization | O(n) | Single least-squares |
| Geodesic Field | Distance field | O(n log n) | Heat equation, Poisson |
| RoboFDM | Decomposition | O(n²) | Dependency graphs |
| Open5x | Kinematics | O(n) | Inverse kinematics, feed rate |

---

## See Also

- `../algorithms-reference.md` - Comprehensive algorithm documentation
- `../s4-slicer-deep-dive.md` - S4 Slicer technical details
- `../non-planar-slicing-projects.md` - Project survey
