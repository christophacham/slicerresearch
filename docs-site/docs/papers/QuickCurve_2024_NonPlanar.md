---
title: "QuickCurve: Revisiting Slightly Non-Planar 3D Printing"
---

# QuickCurve: Revisiting Slightly Non-Planar 3D Printing

**Filename:** QuickCurve_2024_NonPlanar.pdf

## Metadata
- **Authors:** Emilio Ottonello, Pierre-Alexandre Hugron, Alberto Parmiggiani, and Sylvain Lefebvre
- **Year:** 2024
- **Venue:** arXiv (A PREPRINT)
- **DOI:** Not provided in sources

## What problem does it solve?
QuickCurve addresses the staircase effect on top surfaces while optimizing for computational efficiency. It avoids the heavy tetrahedralization and iterative Quadratic Programming (QP) solver passes required by previous methods, instead using a single least-square optimization pass that is 10–100 times faster.

## Algorithm (from QuickCurve_2024_NonPlanar.pdf)
- **Input →** 3D Model
- **Output →** Non-planar layers/toolpaths optimized for 3-axis machines

Steps:
1. **Identify Surfaces:** Determine top surface regions that would benefit from non-planar layers.
2. **Slicing Surface Optimization:** Formulate a single curved slicing surface S(x,y) as a height field.
3. **Least-Squares Solve:** Solve a single least-square problem to align the slicing surface with top surfaces while maintaining gradient bounds (slope < θ_max) to avoid collisions.
4. **Feature Filtering:** Apply a filter to remove "spurious tiny features" often found on natural or scanned surfaces that would otherwise damage the non-planar result.
5. **Curvature Alignment:** Orient toolpaths to follow principal curvatures (maximizing alignment with either maximum or minimum curvature) to balance accuracy against nozzle gouging.

## Key equations (paper refs)
- **Accessibility Constraint (Sec 3.2, p. 3):** Slope angle < θ_max — Ensures the nozzle can access the surface under the conical collision model without self-collisions.
- **Threshold Angle (Sec 2.2):** `θ_th = arctan(extrusion_width / layer_height)` — Defines the threshold inclination where non-planar printing becomes superior to planar layers.

## Complexity
O(n) for a single least-square solve (significantly more efficient than the O(n³) required by the QP solvers in foundational mesh deformation methods).

## Hardware tested (from QuickCurve_2024_NonPlanar.pdf)
- **Printers:** Standard 3-axis FFF printers
- **Modifications:** Requires a specific nozzle shape (conical/pointy) without a large flat area around the exit hole

## Results (from QuickCurve_2024_NonPlanar.pdf Sec 5)
| Metric | Value |
| --- | ---: |
| Computational Speedup (vs CurviSlicer) | 10–100x |
| Accuracy | Significantly reduced staircase error compared to uniform and adaptive slicing |

## Limitations (as stated in QuickCurve_2024_NonPlanar.pdf)
- **Top Surfaces Only:** The current formulation can only consider the top surface of a part, whereas volume-based methods can curve surfaces internally.
- **Optimization Cost:** Calling the path orientation optimizer at every slice can be costly, making it most suitable for visible top layers rather than internal infill.

## Code available?
[ ] No — Source code not provided, though authors express intent to foster adoption.

## Related papers in collection
- Builds on: CurviSlicer_NYU_2019.pdf (conceptual foundation)
- Compare to: S3_Slicer_SIGGRAPH_Asia_2022.pdf (multi-objective volume deformation)

## Category
- [X] Mesh Deformation  [ ] Multi-Axis  [ ] Field-Based  [ ] Neural/ML  [ ] Adaptive  [ ] Support  [ ] Fiber  [ ] Other

## Analogy
If previous algorithms were like high-end tailoring where every stitch is recalculated over a complex 3D mannequin (CurviSlicer), QuickCurve is like using a smart elastic fabric. You simply pull it over the mannequin and let it snap into place using a single, quick adjustment. It might not reshape the interior of the mannequin, but it gives the outside a perfectly smooth fit in a fraction of the time.
