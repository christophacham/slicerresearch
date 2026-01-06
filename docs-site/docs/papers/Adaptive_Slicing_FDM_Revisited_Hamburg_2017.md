---
title: "Adaptive Slicing for the FDM Process Revisited"
---

# Adaptive Slicing for the FDM Process Revisited

**Filename:** Adaptive_Slicing_FDM_Revisited_Hamburg_2017.pdf

## Metadata
- **Authors:** Florens Wasserfall, Norman Hendrich, and Jianwei Zhang
- **Year:** 2017
- **Venue:** IEEE International Conference on Automation Science and Engineering (CASE)
- **DOI:** 10.1109/COASE.2017.8256073

## What problem does it solve?
Existing adaptive slicing algorithms were not used in practice because their control measures were not intuitive. This paper introduces a volumetric surface error metric and a B-Spline based graphical control element to allow users to manually and intuitively refine layer heights.

## Algorithm (from Adaptive_Slicing_FDM_Revisited_Hamburg_2017.pdf)
- **Input →** 3D Model and user-specified error tolerance
- **Output →** Variable layer height distribution

Steps:
1. **Volumetric Analysis:** Analyze the model surface over the full layer height to calculate volumetric deviation.
2. **Automatic Slicing:** Generate an initial distribution where thinner layers are used for high-curvature regions.
3. **B-Spline Refinement:** Map the layer heights to a B-Spline height curve. The user can drag control points on the curve to smoothly adjust layer thicknesses.
4. **Smoothing:** The spline representation automatically attenuates sudden thickness variations that might cause extrusion issues.

## Key equations (paper refs)
- **Error Measurement:** Uses the volumetric error between the printed stair-stepped surface and the ideal model surface.

## Complexity
Not explicitly stated — Linear in practice for UI interaction

## Results (from Adaptive_Slicing_FDM_Revisited_Hamburg_2017.pdf Sec VIII)
- **Usability:** Successfully integrated into widely used open-source slicing software (Slic3r).
- **Quality:** Achieved optimal balance between surface finish and print time through intuitive manual overrides.

## Code available?
[X] Yes — https://tams.informatik.uni-hamburg.de/research/3d-printing/slicing/

## Related papers in collection
- Compare to: Adaptive_Slicing_Contour_2021.pdf (automatic optimization)
- Builds on: Classic adaptive slicing literature

## Category
- [ ] Mesh Deformation  [ ] Multi-Axis  [ ] Field-Based  [ ] Neural/ML  [X] Adaptive  [ ] Support  [ ] Fiber  [X] Other: User Interface

## Analogy
Traditional adaptive slicing is like an autopilot that adjusts your car's speed based on curves, but you can't override it. This algorithm is like adaptive cruise control with a smooth dial—the computer suggests speeds, but you can see a curve showing the entire route and gently adjust any section to match your preference, with changes automatically smoothing out to neighboring sections.
