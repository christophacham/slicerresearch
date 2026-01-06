---
title: "Status, comparison, and future of the representations of additive manufacturing data"
---

# Status, comparison, and future of the representations of additive manufacturing data

**Filename:** 1-s2.0-S0010448518304202-main.pdf

## Metadata
- **Authors:** Yuchu Qin, Qunfen Qi, Paul J. Scott, and Xiangqian Jiang
- **Year:** 2019
- **Venue:** Computer-Aided Design
- **DOI:** 10.1016/j.cad.2019.02.004

## What problem does it solve?
This paper provides a comprehensive review and comparison of various AM data formats, addressing the lack of a "real data model" that satisfies both printing requirements (geometry) and model-based engineering (metadata, GD&T, and materials). It identifies why the outdated STL format still dominates despite technically superior alternatives like AMF and 3MF.

## Algorithm (Review Framework)
- **Input →** Survey of 3D model, 2D slice, and integrated data representations
- **Output →** Taxonomy and comparative analysis of 24+ formats

Steps:
1. **Classification:** Categorize formats into 3D models (STL, AMF, 3MF, etc.), 2D slices (SLC, CLI, MAMF), and integrated representations (STEP).
2. **Comparison:** Evaluate 3D representations based on geometry, GD&T, materials, and repairability.
3. **Issue Identification:** Highlight lack of data validation mechanisms and design intent loss during exchange.
4. **Future Roadmap:** Suggest directions including XML-based unified representations and new GD&T models specifically for AM.

## Key equations (paper refs)
- **Data Completeness (Table 1):** Classifies data into five categories (Design, Process Planning, Part Build, Post-processing, and Qualification) necessary for repeatability.

## Complexity
N/A (Survey Paper)

## Results (from 1-s2.0-S0010448518304202-main.pdf Tables 6-8)
| Format | Accuracy | Materials | Metadata |
| --- | --- | --- | --- |
| STL | Limited | No | No |
| AMF | Moderate | Multiple | Various |
| 3MF | Limited | Multiple | Various |
| STEP | Satisfying | Multiple | Support |

## Limitations
- **Industry Inertia:** Companies face high cost-pressure to abandon STL.
- **Data Loss:** Integrated representations like STEP still lose design history (parameters/constraints) during exchange.

## Code available?
[ ] No — Survey/review paper

## Related papers in collection
- Foundation for understanding data exchange issues in modern slicers

## Category
- [ ] Mesh Deformation  [ ] Multi-Axis  [ ] Field-Based  [ ] Neural/ML  [ ] Adaptive  [ ] Support  [ ] Fiber  [X] Other: Data Representation Survey

## Analogy
Imagine trying to share a recipe. STL is like writing "flour, eggs, milk" with no amounts or instructions. AMF adds the measurements. 3MF includes some cooking tips. STEP is like a professional cookbook with photos, alternatives, and chef's notes—but when you photocopy it, all the handwritten margin notes (design intent) disappear.
