# Non-Planar 3D Printing Research Papers

## Downloaded Papers (97MB total)

| File | Size | Description |
|------|------|-------------|
| `Ahlers_2018_MSc_Thesis_NonPlanar_Layers.pdf` | 6.8MB | **Foundational** - Daniel Ahlers Master's Thesis, TAMS Hamburg |
| `Ahlers_2019_CASE_NonPlanar_Smooth_Surface.pdf` | 2.0MB | IEEE CASE 2019 conference paper |
| `Ahlers_Colloquium_Presentation.pdf` | 6.9MB | Thesis defense slides |
| `S3_Slicer_SIGGRAPH_Asia_2022.pdf` | 16MB | **Key Paper** - S³-Slicer: General Framework for Multi-Axis (Best Paper Award) |
| `Neural_Slicer_MultiAxis_2024.pdf` | 31MB | Neural Slicer for Multi-Axis 3D Printing (arXiv 2024) |
| `QuickCurve_2024_NonPlanar.pdf` | 19MB | QuickCurve: Revisiting Slightly Non-Planar 3D Printing (arXiv 2024) |
| `Curve_Based_Slicer_DLP_2024.pdf` | 13MB | Curve-Based Slicer for Multi-Axis DLP 3D Printing |
| `Gleadall_2021_FullControl_GCode_Designer.pdf` | 2.3MB | **Key Paper** - FullControl GCode Designer (Additive Manufacturing journal) |
| `Coupek_2018_MultiAxis_Path_Planning.pdf` | 811KB | Multi-axis path planning, support reduction (Open Access) |
| `CLFDM_Singamneni_2010.pdf` | 288KB | **Foundational** - Original Curved Layer FDM paper |
| `MultiAxis_Spiral_SupportFree_2021.pdf` | 495KB | Multi-axis 3D printing of spiral parts without supports |

---

## Additional Papers (Manual Download Required)

These papers require institutional access or manual download:

### ACM Digital Library
- **Support-free Volume Printing by Multi-axis Motion** (SIGGRAPH 2018)
  - https://dl.acm.org/doi/10.1145/3197517.3201342
  - Authors: Dai, Wang, et al.

### ScienceDirect (Requires Access)
- **A Fully Automatic Non-Planar Slicing Algorithm** (2023)
  - https://www.sciencedirect.com/science/article/pii/S2214860423001549

- **Multi-Axis Support-Free Printing with Lattice Infill** (2020)
  - https://www.sciencedirect.com/science/article/abs/pii/S0010448520301792

- **A Comparative Review of Multi-Axis 3D Printing** (2024)
  - https://www.sciencedirect.com/science/article/abs/pii/S1526612524004432

### MDPI Open Access
- **Path Planning Strategies Review** (2020)
  - https://www.mdpi.com/2072-666X/11/7/633

- **Support-Free 3D Printing Based on Model Decomposition** (2025)
  - https://www.mdpi.com/2072-666X/16/12/1316

### ResearchGate (May Require Login)
- **CLFDM with Variable Extruded Filament** (2018)
  - https://www.researchgate.net/publication/328710021

- **Geometry-Based Process Planning for Multi-Axis Support-Free AM**
  - https://www.researchgate.net/publication/329172372

### Theses
- **Multi-Axis 3D Printing Benefits & Limitations** - University of Twente (2023)
  - https://essay.utwente.nl/96771/

---

## Reading Order for Building a Non-Planar Slicer

### Phase 1: Foundations
1. `CLFDM_Singamneni_2010.pdf` - Original curved layer concept
2. `Ahlers_2018_MSc_Thesis_NonPlanar_Layers.pdf` - Implementation details, collision checking

### Phase 2: Modern Approaches
3. `S3_Slicer_SIGGRAPH_Asia_2022.pdf` - Tetrahedral deformation method
4. `QuickCurve_2024_NonPlanar.pdf` - Simplified approach without tetrahedralization

### Phase 3: Advanced Topics
5. `Neural_Slicer_MultiAxis_2024.pdf` - ML-based approach
6. `Curve_Based_Slicer_DLP_2024.pdf` - DLP-specific techniques
7. `Coupek_2018_MultiAxis_Path_Planning.pdf` - Multi-axis path planning

### Phase 4: Direct G-code Control
8. `Gleadall_2021_FullControl_GCode_Designer.pdf` - Paradigm shift: design G-code directly

---

## Key Concepts by Paper

| Paper | Key Contribution |
|-------|------------------|
| CLFDM (2010) | Curved layers eliminate stair-stepping |
| Ahlers (2018) | Collision checking, region classification |
| S³-Slicer (2022) | Tetrahedral mesh + quaternion optimization |
| QuickCurve (2024) | Single least-squares problem, no tet-mesh needed |
| Neural Slicer (2024) | Neural network for multi-axis planning |
| FullControl (2021) | Direct G-code design paradigm |
| Coupek (2018) | Cylindrical coordinate transforms |
