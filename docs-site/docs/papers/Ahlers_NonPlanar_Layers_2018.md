---
title: "3D Printing of Nonplanar Layers for Smooth Surface Generation"
---

# 3D Printing of Nonplanar Layers for Smooth Surface Generation

**Filename:** Ahlers_2018_MSc_Thesis_NonPlanar_Layers.pdf (and Ahlers_2019_CASE_NonPlanar_Smooth_Surface.pdf)

## Metadata
- **Authors:** Daniel Ahlers
- **Year:** 2018 (Thesis) / 2019 (Conference Paper)
- **Venue:** University of Hamburg (Thesis) / IEEE CASE 2019
- **DOI:** 10.1109/COASE.2019.8843116

## What problem does it solve?
This is the foundational work for modern 3-axis non-planar slicing. It solves the staircase effect on top surfaces by using a standard printer to move the X, Y, and Z axes simultaneously. It specifically addresses the lack of usability in prior prototypes by integrating non-planar path generation directly into an open-source slicer.

## Algorithm (from Ahlers_2018_MSc_Thesis_NonPlanar_Layers.pdf)
- **Input →** STL model
- **Output →** Collision-free G-Code containing planar and non-planar layers

Steps:
1. **Surface Identification:** Extract top-facing surfaces from the mesh based on their angle relative to the Z-axis.
2. **Filtering:** Group connected faces and filter them by maximum angle (to prevent nozzle collision) and maximum height.
3. **Layer Warping:** Generate planar toolpaths for a theoretical layer and then project them downwards onto the original curved surface mesh.
4. **Collision Prevention:** Model the printhead geometry to ensure non-planar paths do not result in the nozzle crashing into previously printed planar walls.
5. **Path Projection:** Split toolpath segments where they intersect triangle edges to maintain high geometric fidelity.

## Key equations (paper refs)
- **Printable Angle Condition (p. 4, presentation):** `normal.Z ≥ cos(max_angle)` — Identifies surfaces reachable without collision.
- **Z-Lifting (p. 10, presentation):** Always lift Z when moving below current layer height to avoid dragging.

## Complexity
O(f × l) where f = facets, l = toolpath segments — Dominated by checking toolpath vertices against the STL facet mesh for projection and collision.

## Hardware tested (from Ahlers_2018_MSc_Thesis_NonPlanar_Layers.pdf)
- **Printer:** Ultimaker 2 (standard 3-axis)
- **Constraint:** Requires a pointy nozzle (e.g., Olsson Block) to allow for 8° – 45° of clearance

## Results (from Ahlers_2019_CASE_NonPlanar_Smooth_Surface.pdf Table II)
| Model | Planar Time | Non-Planar Time | Quality |
| --- | --- | --- | --- |
| Wing | 188 min | 182 min | Smooth/No stairs |
| Relief | 123 min | 119 min | Smooth/No stairs |
| Sphere | 91 min | 93 min | Drastic improvement |

## Limitations (as stated in Ahlers papers)
- **Downward Surfaces:** Only handles top-facing surfaces to avoid support complications.
- **Feature Incompatibility:** Slic3r features like adaptive layers and infill combination are currently unusable with this non-planar implementation.

## Code available?
[X] Yes — https://github.com/Zip-o-mat/Slic3r/tree/nonplanar

## Related papers in collection
- Foundation for: QuickCurve_2024_NonPlanar.pdf
- Compare to: CurviSlicer_NYU_2019.pdf (volume-based deformation vs. surface projection)

## Category
- [X] Mesh Deformation  [ ] Multi-Axis  [ ] Field-Based  [ ] Neural/ML  [ ] Adaptive  [ ] Support  [ ] Fiber  [ ] Other

## Analogy
Imagine a staircase covered in a thin carpet. Standard slicing is like seeing only the wooden steps—you see every sharp edge. Ahlers' algorithm is like stretching the carpet perfectly over the steps. The wooden structure underneath (planar layers) stays the same, but the final surface you touch (the non-planar layer) is a single, smooth curve that follows the true shape of the model.
