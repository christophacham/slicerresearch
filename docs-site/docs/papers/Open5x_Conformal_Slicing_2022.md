---
title: "Open5x: Accessible 5-axis 3D printing and conformal slicing"
---

# Open5x: Accessible 5-axis 3D printing and conformal slicing

**Filename:** Open5x_Conformal_Slicing_2022.pdf

## Metadata
- **Authors:** Freddie Hong, Steve Hodges, Connor Myant, and David Boyle
- **Year:** 2022
- **Venue:** CHI EA '22
- **DOI:** 10.1145/3491101.3519702

## What problem does it solve?
It addresses the high cost and technical complexity barriers that prevent individual makers and researchers from accessing 5-axis 3D printing. It provides a low-cost hardware upgrade path for standard 3-axis printers and an accessible GUI-based conformal slicer integrated into existing CAD software.

## Algorithm (from Open5x_Conformal_Slicing_2022.pdf)
- **Input →** 3D Model (Base Geometry) and target conformal surfaces [813A]
- **Output →** 5-axis G-Code with optimized feed rates [806, 813B]

Steps:
1. **Hardware Transformation:** Augment a standard desktop printer (Prusa i3) with a 2-axis rotating gantry controlled by a Duet 2 board.
2. **Surface Selection:** Within the Rhino/Grasshopper GUI, users pick the surface on the substrate for conformal deposition [813A].
3. **Kinematic Mapping:** Use inverse kinematics to translate 3D coordinates and surface normals `[x, y, z, i, j, k]` into 5-axis machine coordinates `[x', y', z', θ_u, θ_v]`.
4. **Feed Rate Optimization:** Calculate the ratio between the machine's total multi-axis travel distance and the actual path segment length to ensure a constant deposition speed on the substrate surface.
5. **G-Code Generation:** Produce the final instruction set for the RepRap firmware [812, 813B].

## Key equations (paper refs)
- **Inverse Kinematics (Fig. 4, p. 814):** `θ_u = arccos(√(x² + y² + z²))` and `θ_v = atan2(i, j)` — Calculates rotation values for the gantry to align the nozzle normal to the surface.
- **Rotated Tooltip Position (Fig. 4, p. 814):** `P' = R_n(θ_v) · R_y(θ_u) · [x, y, z]ᵀ` — Maps the physical point to the machine space after gantry rotation.
- **Nozzle Direction (Fig. 4, p. 814):** `n = [sin θ_u, 0, cos θ_u]` — Determines orientation to maintain the nozzle perpendicular to the build platform.

## Complexity
O(n) where n = number of path segments (processing is linear as each toolpath vertex is mapped to machine space and speed-optimized individually).

## Hardware tested (from Open5x_Conformal_Slicing_2022.pdf)
- **Printer:** Prusa i3 MK3s modified with a 3D-printed 2-axis rotary gantry
- **Electronics:** Duet 2 board with RepRap firmware
- **Components:** NEMA 17 stepper motors, GT2 pulleys, and belts

## Results (from Open5x_Conformal_Slicing_2022.pdf Fig 6/7)
| Metric | Value |
| --- | ---: |
| Support-less Printing | Successfully demonstrated for complex overhanging shapes |
| Surface Finish | Conformal surface finish achieved on curved substrates |
| Conductivity | Continuous extrusion of conductive PLA on 3D surfaces reduced electrical resistance compared to planar-stepped paths |

## Limitations (as stated in Open5x_Conformal_Slicing_2022.pdf)
- **Software Dependency:** The slicer currently requires the commercial Rhino/Grasshopper CAD package.
- **Collision Constraints:** Users must match the print bed diameter to the object base to minimize nozzle-bed collision risks.
- **Manual Calibration:** Requires manual replacement of the electronics board and wiring.

## Code available?
[X] Yes — Online repository containing CAD files, mechanical parts list, and firmware configuration.

## Related papers in collection
- Builds on: Dai_et_al_2018.pdf (support-free volume printing)
- Compare to: Reinforced_FDM_MultiAxis_SIGGRAPH_Asia_2020.pdf (uses 5-axis for strength)

## Category
- [ ] Mesh Deformation  [X] Multi-Axis  [ ] Field-Based  [ ] Neural/ML  [X] Adaptive  [ ] Support  [ ] Fiber  [X] Other: Conformal Slicing

## Analogy
Imagine trying to write on the side of a soccer ball with a fixed vertical marker. You'd only be able to write on the very top, or the ink would smudge as the ball curved away. Open5x is like a robotic cradle that holds the ball. As you move your marker to write, the cradle tilts and spins the ball so that the part you are writing on is always perfectly flat and centered under the marker tip, allowing you to write smoothly across the entire surface.
