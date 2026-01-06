---
title: "RoboFDM: A Robotic System for Support-Free Fabrication Using FDM"
---

# RoboFDM: A Robotic System for Support-Free Fabrication Using FDM

**Filename:** RoboFDM_ICRA_2017.pdf

## Metadata
- **Authors:** Chenming Wu, Chengkai Dai, Guoxin Fang, Yong-Jin Liu, and Charlie C. L. Wang
- **Year:** 2017
- **Venue:** IEEE International Conference on Robotics and Automation (ICRA)
- **DOI:** 10.1109/ICRA.2017.7989140

## What problem does it solve?
It addresses the support material requirement and the associated issues of surface damage and material waste in FDM printing. By using a high-DOF robotic arm, the system can dynamically change the printing direction to ensure all model features are self-supporting and collision-free.

## Algorithm (from RoboFDM_ICRA_2017.pdf)
- **Input →** 3D Model M
- **Output →** Collision-free sequence of support-free segments `{M_i}` with optimized directions `{d_i}`

Steps:
1. **Phase I (Coarse Decomposition):** Use skeleton-based shape analysis to decompose the model into simpler branches.
2. **Phase II (Sequence Planning):** Convert the decomposition into an undirected adjacency graph.
3. **Graph Rooting:** Convert the graph into a directed graph starting from a user-selected root node to define the fabrication order.
4. **Direction Assignment:** Assign initial printing directions based on the normal vectors of the planes separating the segments.
5. **Phase III (Fine Tuning):** Iteratively refine the separating planes by merging or splitting regions to eliminate overhanging ("risky") faces and ensure the nozzle does not collide with the previously printed part.

## Key equations (paper refs)
- **Safe Face Condition (Eq. 1, p. 2):** `n⋅d + sin(α_max) ≥ 0` — Where n is the face normal, d is the printing direction, and α_max is the self-support angle.
- **Kinematic Frame Relationship (Eq. 3, p. 6):** `T_B^T⋅T_E^T⋅T_P^T⋅O_P^T = N_B^T` — Defines the relationship between the base, end-effector, part, and nozzle frames to maintain correct extrusion orientation.

## Complexity
O(n²) where n = number of parts/nodes (based on the construction and traversal of the dependency graph).

## Hardware tested (from RoboFDM_ICRA_2017.pdf)
- **Robot:** 6-DOF robotic arm
- **Extruder:** FDM material extrusion unit mounted as the robot's end-effector

## Results (from RoboFDM_ICRA_2017.pdf Fig 4/Fig 14)
| Metric | Value |
| --- | ---: |
| Support Material Reduction | 100% (Support-free) |
| Models Fabricated | Bunny, Armadillo, Yoga, and complex topological "C2-models" |

## Limitations (as stated in RoboFDM_ICRA_2017.pdf)
- **Restrictive Constraints:** The current constraint to avoid facing-down base planes is overly restrictive and may fail for models like trees with downward-pointing branches.
- **Manual Initialization:** The root node of the sequence must be interactively selected by the user.

## Code available?
[X] Yes — README.md points to an implementation in the ../VoxelMultiAxisAM/ directory.

## Related papers in collection
- Builds on: Clever_Support_SGP_2014.pdf (for self-support metrics)
- Compare to: Reinforced_FDM_MultiAxis_SIGGRAPH_Asia_2020.pdf (extends this for strength optimization)

## Category
- [ ] Mesh Deformation  [X] Multi-Axis  [ ] Field-Based  [ ] Neural/ML  [ ] Adaptive  [X] Support  [ ] Fiber  [ ] Other

## Analogy
Standard printing is like building a skyscraper with only a crane that moves up and down; you need massive scaffolding (supports) to hold up any floors that stick out. RoboFDM is like using a highly agile robot hand that can tilt and rotate the entire building site. If the robot needs to add a balcony, it just tilts the building so the balcony can be built straight "up" from the wall, removing the need for scaffolding entirely.
