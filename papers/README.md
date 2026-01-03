# Non-Planar 3D Printing Research Papers

## Downloaded Papers (~320MB total, 40+ papers)

### Foundational Papers
| File | Size | Description |
|------|------|-------------|
| `CLFDM_Singamneni_2010.pdf` | 288KB | **Foundational** - Original Curved Layer FDM paper |
| `Ahlers_2018_MSc_Thesis_NonPlanar_Layers.pdf` | 6.8MB | **Foundational** - Daniel Ahlers Master's Thesis, TAMS Hamburg |
| `Ahlers_2019_CASE_NonPlanar_Smooth_Surface.pdf` | 2.0MB | IEEE CASE 2019 conference paper |
| `Ahlers_Colloquium_Presentation.pdf` | 6.9MB | Thesis defense slides |
| `Clever_Support_SGP_2014.pdf` | 334KB | Tree-based support structure optimization |

### Core Algorithm Papers (Mesh Deformation)
| File | Size | Description |
|------|------|-------------|
| `S3_Slicer_SIGGRAPH_Asia_2022.pdf` | 16MB | **Key** - S³-Slicer: Multi-Axis Framework (Best Paper Award) |
| `CurviSlicer_NYU_2019.pdf` | 11.5MB | **Key** - CurviSlicer: QP-based mesh deformation |
| `CurviSlicer_HAL_2019.pdf` | 11.6MB | CurviSlicer (HAL archive version) |
| `CurviSlicer_SIGGRAPH_2019.pdf` | 9.1MB | CurviSlicer (SIGGRAPH version) |
| `QuickCurve_2024_NonPlanar.pdf` | 19MB | QuickCurve: Simplified least-squares approach |
| `Geodesic_Distance_Field_Curved_Layer_2020.pdf` | 4.6MB | Geodesic field-based volume decomposition |

### Multi-Axis & Path Planning
| File | Size | Description |
|------|------|-------------|
| `RoboFDM_ICRA_2017.pdf` | 470KB | RoboFDM: Support-free robotic fabrication |
| `Open5x_Conformal_Slicing_2022.pdf` | 6.4MB | Open5x: 5-axis conformal slicing + kinematics |
| `Coupek_2018_MultiAxis_Path_Planning.pdf` | 811KB | Multi-axis path planning, coordinate transforms |
| `Curved_Layer_Process_Planning_2017.pdf` | 9.1MB | Vector field process planning |
| `Support_Generation_Curved_Layers_2023.pdf` | 5.1MB | Skeleton-based support for curved layers |
| `Singularity_Aware_Motion_Planning_2021.pdf` | 1.4MB | Singularity avoidance in multi-axis AM |
| `Reinforced_FDM_MultiAxis_SIGGRAPH_Asia_2020.pdf` | 11.8MB | **Key** - Stress-aligned multi-axis printing |
| `Delta_DLP_3D_Printer_IROS_2016.pdf` | 6.1MB | Delta DLP 3D printer architecture |

### Neural/ML-Based Methods
| File | Size | Description |
|------|------|-------------|
| `Neural_Slicer_MultiAxis_2024.pdf` | 31MB | Neural Slicer for Multi-Axis 3D Printing |
| `Curve_Based_Slicer_DLP_2024.pdf` | 13MB | Curve-Based Slicer for Multi-Axis DLP |
| `Implicit_Neural_Field_MultiAxis_2024.pdf` | 23MB | Implicit Neural Field process planning |
| `INF_3DP_Collision_Free_2024.pdf` | 45MB | INF-3DP: Neural collision-free multi-axis |
| `Learning_Based_Toolpath_Planner_2024.pdf` | 44MB | Graph-based learning for toolpath planning |
| `NonPlanar_Slicer_Modeling_2024.pdf` | 2.2MB | Hybrid planar/non-planar approach |

### Fiber/Composite Printing
| File | Size | Description |
|------|------|-------------|
| `Continuous_Fiber_Spatial_Printing_2023.pdf` | 5.7MB | Geodesic toolpaths for fiber printing |
| `Field_Based_Toolpath_Fiber_2021.pdf` | 10.4MB | Stress-aligned continuous fiber toolpaths |
| `Toolpath_Gen_Fiber_Stresses_2024.pdf` | 12.9MB | High-density fiber paths via principal stresses |

### Adaptive Slicing
| File | Size | Description |
|------|------|-------------|
| `Adaptive_Slicing_FDM_Revisited_Hamburg_2017.pdf` | 2.5MB | Curvature-based layer thickness |
| `Adaptive_Slicing_Contour_2021.pdf` | 937KB | Contour reconstruction slicing |
| `Saliency_Preserving_Slicing_Microsoft_2015.pdf` | 3.0MB | Visual saliency optimization |
| `Optimal_Triangle_Mesh_Slicing.pdf` | 1.3MB | O(n log k) optimal slicing algorithm |
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
  - Implementation: `../VoxelMultiAxisAM/` (cloned)
- **Overhang-Aware Slicing** (SIGGRAPH 2014)
  - https://dl.acm.org/doi/10.1145/2601097.2601132

### ScienceDirect
- **Curved Layer Based Process Planning** (Xu et al., CAD 2019)
  - https://www.sciencedirect.com/science/article/abs/pii/S0010448518305384
- **Vector Field-based Curved Layer Slicing** (2022)
  - https://www.sciencedirect.com/science/article/abs/pii/S0736584522000503

### Emerald (Institutional Access)
- **Curved Layer Adaptive Slicing (CLAS)** (Huang & Singamneni, 2015)
  - https://www.emerald.com/insight/content/doi/10.1108/rpj-06-2013-0059/full/html

---

## Reading Order by Algorithm Category

### 1. Mesh Deformation (Start Here)
1. `CurviSlicer_NYU_2019.pdf` - QP optimization, tetrahedral deformation
2. `S3_Slicer_SIGGRAPH_Asia_2022.pdf` - Multi-objective quaternion optimization
3. `QuickCurve_2024_NonPlanar.pdf` - Simplified single least-squares

### 2. Geodesic/Field-Based
4. `Geodesic_Distance_Field_Curved_Layer_2020.pdf` - Heat method, iso-surfaces
5. `Continuous_Fiber_Spatial_Printing_2023.pdf` - Vector fields + geodesics
6. `Field_Based_Toolpath_Fiber_2021.pdf` - Stress-aligned fiber paths

### 3. Multi-Axis Path Planning
7. `RoboFDM_ICRA_2017.pdf` - Collision-free decomposition
8. `Reinforced_FDM_MultiAxis_SIGGRAPH_Asia_2020.pdf` - Strength optimization
9. `Open5x_Conformal_Slicing_2022.pdf` - 5-axis kinematics, feed rate
10. `Support_Generation_Curved_Layers_2023.pdf` - Support for curved layers
11. `Singularity_Aware_Motion_Planning_2021.pdf` - Avoiding singularities

### 4. Neural/ML Approaches
12. `Neural_Slicer_MultiAxis_2024.pdf` - NN for layer generation
13. `INF_3DP_Collision_Free_2024.pdf` - Implicit neural fields
14. `Learning_Based_Toolpath_Planner_2024.pdf` - Graph neural networks

### 5. Adaptive Layer Thickness
15. `Adaptive_Slicing_FDM_Revisited_Hamburg_2017.pdf` - Curvature analysis
16. `Optimal_Triangle_Mesh_Slicing.pdf` - Algorithm complexity

### 6. Foundations
17. `CLFDM_Singamneni_2010.pdf` - Original concept
18. `Ahlers_2018_MSc_Thesis_NonPlanar_Layers.pdf` - Full implementation
19. `Clever_Support_SGP_2014.pdf` - Support structure optimization
20. `Gleadall_2021_FullControl_GCode_Designer.pdf` - Alternative paradigm

---

## Key Algorithms Summary

| Paper | Algorithm | Complexity | Key Math |
|-------|-----------|------------|----------|
| CurviSlicer | Tetrahedral QP | O(n³) | Quadratic programming |
| S³-Slicer | Rotation optimization | O(n³) | Quaternions, deformation gradient |
| QuickCurve | Surface optimization | O(n) | Single least-squares |
| Geodesic Field | Distance field | O(n log n) | Heat equation, Poisson |
| RoboFDM | Decomposition | O(n²) | Dependency graphs |
| Reinforced FDM | Stress alignment | O(n²) | Principal stress directions |
| Open5x | Kinematics | O(n) | Inverse kinematics, feed rate |
| Neural Slicer | Neural network | O(n) | MLP, implicit fields |
| INF-3DP | Implicit neural | O(n) | Neural signed distance |

---

## Implementations Available

| Paper | Implementation |
|-------|----------------|
| Support-free Volume Printing | `../VoxelMultiAxisAM/` |
| S³-Slicer | `../S3_DeformFDM/` |
| S4 Slicer | `../S4_Slicer/` |
| FullControl | `../fullcontrol/` |
| Slic3r NonPlanar | `../Slic3r_NonPlanar_Slicing/` |
| Slicer6D | `../Slicer6D/` |

---

## See Also

- `../algorithms-reference.md` - Comprehensive algorithm documentation
- `../s4-slicer-deep-dive.md` - S4 Slicer technical details
- `../non-planar-slicing-projects.md` - Project survey
