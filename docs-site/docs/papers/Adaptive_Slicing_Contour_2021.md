---
title: "A New Adaptive Slicing Algorithm Based on Slice Contour Reconstruction"
---

# A New Adaptive Slicing Algorithm Based on Slice Contour Reconstruction

**Filename:** Adaptive_Slicing_Contour_2021.pdf

## Metadata
- **Authors:** Suyun Liu, Ajay Joneja, and Kai Tang
- **Year:** 2021
- **Venue:** Computer-Aided Design & Applications
- **DOI:** 10.1080/16864360.2021.1913386

## What problem does it solve?
It addresses the volumetric deviation between a designed surface and its 3D-printed counterpart. Traditional slicers use contours at the nominal height of a layer, ignoring geometry within the layer. This algorithm reconstructs an optimal contour for each layer to minimize error without needing expensive multi-axis hardware.

## Algorithm (from Adaptive_Slicing_Contour_2021.pdf)
- **Input →** STL model and pre-selected layer thickness t
- **Output →** Optimized 2D slice contours

Steps:
1. **3D Slice Mesh Extraction:** For each layer, extract the "slice mesh" (the portion of the original STL between the top and bottom planes of the layer).
2. **Boundary Projection:** Project the 3D slice mesh onto a horizontal plane to identify the innermost and outermost boundaries.
3. **Medial Axis Computation:** Compute the Medial Axis (MA) skeleton from the Voronoi graph of the boundary sampling points.
4. **Contour Reconstruction:** Traverse the projected mesh edges to reconstruct a new contour based on the Medial Axis skeleton.

## Key equations (paper refs)
- **Area Deviation Ratio (Sec 2.2, p. 1429):** `|A_i - A'_i| / A_i < δ` — Used as a tolerance check for adjacent cross-sections.

## Complexity
O(n log n) — Driven by Voronoi-based Medial Axis computation for each layer.

## Results (from Adaptive_Slicing_Contour_2021.pdf Sec 5)
| Metric | Value |
| --- | ---: |
| Volumetric Error Reduction | 30% - 50% |
| Build Time Saving | 20% - 30% (by allowing larger layer heights for same tolerance) |

## Limitations (as stated in Adaptive_Slicing_Contour_2021.pdf)
- **Exactness:** Uses Voronoi diagram of sampling points to approximate the Medial Axis; exact computation is suggested for future work.
- **Verticality:** Does not handle sloping or curved layer deposition, as it is limited to standard 3-axis deposition.

## Code available?
[ ] No — Not mentioned in available excerpts

## Related papers in collection
- Compare to: Adaptive_Slicing_FDM_Revisited_Hamburg_2017.pdf (different optimization approach)

## Category
- [ ] Mesh Deformation  [ ] Multi-Axis  [ ] Field-Based  [ ] Neural/ML  [X] Adaptive  [ ] Support  [ ] Fiber  [ ] Other

## Analogy
Imagine cutting a loaf of bread. Traditional slicing cuts exactly at the top of each slice level, missing the shape within. This algorithm looks at the entire chunk of bread between two cuts and figures out the "average" or "optimal" cutting line through that chunk, like finding the center line that best represents the bread's shape in that section.
