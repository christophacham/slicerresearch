---
title: "S³-Slicer: A General Slicing Framework for Multi-Axis 3D Printing"
---

# S³-Slicer: A General Slicing Framework for Multi-Axis 3D Printing

**Filename:** S3_Slicer_SIGGRAPH_Asia_2022.pdf

## Metadata
- **Authors:** Tianyu Zhang, Guoxin Fang, Yuming Huang, Neelotpal Dutta, Sylvain Lefebvre, Zekai Murat Kilic, and Charlie C. L. Wang
- **Year:** 2022
- **Venue:** ACM Transactions on Graphics (SIGGRAPH Asia)
- **DOI:** 10.1145/3550454.3555516

## What problem does it solve?
Previous curved slicing methods were limited to optimizing a single objective (e.g., only support-free or only surface quality) and struggled to combine them. S³-Slicer provides a general framework that simultaneously satisfies Support-free (SF), Strength reinforcement (SR), and Surface quality (SQ) objectives within a single deformation-based optimization.

## Algorithm (from S3_Slicer_SIGGRAPH_Asia_2022.pdf)
- **Input →** Tetrahedral mesh M and stress field from Finite Element Analysis (FEA)
- **Output →** Curved toolpaths satisfying multi-objective fabrication requirements

Steps:
1. **Stress Analysis:** Compute principal stresses to identify regions for reinforcement.
2. **Quaternion Field Optimization (Inner Loop):** Optimize quaternions `{q_e}` for each element to determine compatible rotations that satisfy local printing direction (LPD) requirements for SF, SR, and SQ.
3. **Scale-Controlled Deformation (Outer Loop):** Perform a local/global ARAP-style deformation to assemble rotated elements into a deformed model M_d, allowing for local scaling.
4. **Scalar Field Mapping:** Map the height field of the deformed model back to the original space to create a governing scalar field G(⋅).
5. **Isosurface Extraction:** Extract isosurfaces of G(⋅) to form curved layers, including an adaptive refinement step to ensure thickness constraints `(t_min, t_max)`.
6. **Toolpath Generation:** Generate final paths on the resulting curved surfaces.

## Key equations (paper refs)
- **Quaternion Smoothing Loss (Eq. 6, p. 5):** `min_{q_e} Σ_{(e_i,e_j)∈N_F} w_s(e_i,e_j)‖q_{e_i} − q_{e_j}‖²` — Encourages compatibility between neighboring element rotations.
- **Support-Free (SF) Loss (Eq. 3, p. 6):** `L_SF := Σ_{p∈B} |A_p|σ(k_SF(−n(p)⋅d_p − sinα))` — Penalizes local printing directions that fall outside the self-supporting cone.
- **Terminal Condition Metric (Eq. 13, p. 10):** `Π = (Σw_e D(d_e, H_e))/(Σw_e)` — Measures the geodesic distance on the Gauss sphere between current LPDs and feasible objective regions.

## Complexity
O(n log n) per iteration (based on the performance of local/global solvers for tetrahedral meshes where n is the number of vertices/elements).

## Hardware tested (from S3_Slicer_SIGGRAPH_Asia_2022.pdf)
- **Robot:** UR5e robotic arm (6-DOF)
- **Platform:** Custom 2-axis tilting/rotating platform (8-DOF total system)
- **Material:** PLA

## Results (from S3_Slicer_SIGGRAPH_Asia_2022.pdf Sec 6.1.3 / 6.1.5)
| Metric | Value |
| --- | ---: |
| Maximal Strain Reduction (Bridge vs single-objective) | 40.5% |
| Overhang Area Reduction (Tubes model vs previous work) | 95% |
| Maximal Strain Reduction (Bunny vs Planar) | 43.3% |

## Limitations (as stated in S3_Slicer_SIGGRAPH_Asia_2022.pdf)
- **Isotropic Assumption:** Stress fields are computed using isotropic properties, which ignores the actual anisotropic strength of the curved layers.
- **Sequential Handling:** Global collision avoidance and hardware kinematics are handled in post-processing rather than integrated into the primary optimization.

## Code available?
[X] Yes — Implementation at [zhangty019/S3_DeformFDM](https://github.com/zhangty019/S3_DeformFDM)

## Related papers in collection
- Builds on: CurviSlicer_NYU_2019.pdf (deformation concept)
- Builds on: Reinforced_FDM_MultiAxis_SIGGRAPH_Asia_2020.pdf (strength alignment)
- Extended by: Neural_Slicer_MultiAxis_2024.pdf (uses neural fields for the mapping)

## Category
- [X] Mesh Deformation  [X] Multi-Axis  [ ] Field-Based  [ ] Neural/ML  [X] Adaptive  [ ] Support  [ ] Fiber  [ ] Other

## Analogy
Imagine trying to wrap a highly complex gift with paper that has a specific structural grain. Standard slicing is like cutting the paper into flat strips; they don't cover curves well and break easily. S³-Slicer is like a master wrapper who digitally stretches and bends the paper in 3D so that the patterns align with the box's edges for strength, no parts of the paper sag into empty space (support-free), and the final surface looks perfectly smooth without any visible "steps."
