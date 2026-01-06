---
title: "CurviSlicer: Slightly curved slicing for 3-axis printers (CurviSlicer_NYU_2019.pdf)"
---

# CurviSlicer: Slightly curved slicing for 3-axis printers

**Filename:** CurviSlicer_NYU_2019.pdf

## Metadata
- **Authors:** Jimmy Etienne, Nicolas Ray, Daniele Panozzo, Samuel Hornus, Charlie C. L. Wang, Jonàs Martínez, Sara McMains, Marc Alexa, Brian Wyvill, Sylvain Lefebvre
- **Year:** 2019
- **Venue:** ACM Transactions on Graphics (SIGGRAPH)
- **DOI:** 10.1145/3306346.3323022

## What problem does it solve?
Addresses the staircase effect from planar layers on slanted/curved surfaces; uses slightly curved paths on standard 3-axis FDM printers to improve surface finish without increasing print time.

## Algorithm (from CurviSlicer_NYU_2019.pdf)
- **Input →** 3D mesh Ω oriented for +Z build direction
- **Output →** curved toolpaths M⁻¹(T) optimized for collision-free deposition

Steps:
1. **Tetrahedralization:** Embed the mesh and surrounding empty space in a tetrahedral grid.
2. **Mapping optimization:** Optimize continuous deformation mapping M, allowing stretch/compress only along Z.
3. **Constraint enforcement:** Encode nozzle collision and feasible layer thickness as linear constraints in a convex QP solver.
4. **Standard slicing:** Slice the deformed mesh M(Ω) with a uniform slicer to produce toolpaths T.
5. **Inverse mapping:** Map toolpaths back with M⁻¹(T) to create curved G-code.

## Key equations (paper refs)
- **Collision cone angle (Sec 3.1, p. 4):** `θ_max = min(θ_nozzle, tan⁻¹(e / h))` where h is distance from nozzle tip to carriage, e is max XY extent.
- **Flattening objective (Sec 4.3, p. 6):** `E_flat(h, F) = Σ_{t∈F} A(t) (n_t · z)²`
- **Smoothness energy (Sec 4.3, p. 7):** `E_smooth(h) = Σ_{t∈Γ} Σ_{n∈N(t)} (V(Γ)/(V(t)+V(n))) · ‖∇h_t − ∇h_n‖²`

## Complexity
O(n³), where n is the number of tetrahedral vertices (QP solver complexity).

## Hardware tested (from CurviSlicer_NYU_2019.pdf)
- **Printers:** Ultimaker 2, Anet A8
- **Modifications:** Pointed conical nozzle; removal of fan shrouds to increase clearance
- **Layer range:** 0.6 mm base layer thickness; 0.1–0.6 mm variable

## Results (Fig. 1)
| Metric | Value |
| --- | ---: |
| Volumetric Error (Uniform) | 270 mm³ |
| Volumetric Error (Adaptive) | 149 mm³ |
| Volumetric Error (Curved) | 57 mm³ |

## Limitations (as stated)
- **Slope limitation:** Cannot improve beyond printable angle dictated by nozzle geometry.
- **Sagging risk:** Curved layers over large staircases may sag; compensated by progressively curving layers.
- **Surface focus:** Primarily improves top surfaces.

## Code available?
[X] Yes — open-source reference implementation announced (likely IceSL or standalone repo).

## Related papers in collection
- Builds on: CLFDM_Singamneni_2010.pdf (pioneer of curved layers)
- Compare to: S3_Slicer_SIGGRAPH_Asia_2022.pdf (extends to multi-objective SR/SQ)

## Category
- [X] Mesh Deformation  [ ] Multi-Axis  [ ] Field-Based  [ ] Neural/ML  [ ] Adaptive  [ ] Support  [ ] Fiber  [ ] Other

## Analogy
Like steaming and bending paper sheets to follow a wavy wooden board instead of stacking flat sheets that leave visible steps.
