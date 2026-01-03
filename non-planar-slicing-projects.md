# Complete List of Non-Planar Slicing Projects & Tools

## Active/Recent Projects (2024-2025)

### 1. S4 Slicer (April 2025) ⭐ Most Recent

- **Creator:** Joshua Bird (@jyjblrd)
- **Type:** Jupyter Notebook-based, generic non-planar slicer
- **Approach:** Tetrahedral mesh → deformation grid → planar slice → transform back
- **Unique:** Can print almost any part without support
- **GitHub:** https://github.com/jyjblrd/S4_Slicer
- **Try Online:** Google Colab (free tier for simple models)
- **Status:** Active, open source
- **Note:** Based on S³ Slicer concepts, "Simplified S³"

### 2. PrusaSlicer Non-Planar Fork (2024)

- **Creator:** EiNSTeiN (GitHub user), adapted by Teaching Tech team
- **Base:** PrusaSlicer 2.6
- **Type:** Fork with integrated non-planar functionality
- **Features:** Max non-planar angle, max height parameters
- **Download:** Windows portable version available
- **Status:** Community-maintained, somewhat unstable
- **Origin:** Based on 2019 master's thesis
- **Issues:** Some models can't slice reliably, limited travel optimization

### 3. FullControl GCode Designer ⭐ Paradigm Shift

- **Creator:** Andrew Gleadall (Loughborough University)
- **Type:** Direct GCode design (not traditional slicer)
- **Versions:**
  - Original: Excel/VBA (FullControl_GCode_Designer_Heron02d.xlsm)
  - Python: https://github.com/FullControlXYZ/fullcontrol
  - Web: https://fullcontrol.xyz/ (test online, no installation)
- **Approach:** Define every segment of print path + all parameters
- **Capabilities:**
  - Full 3D non-planar paths
  - Per-segment control (speed, extrusion, temp, acceleration)
  - Multi-material support
  - Parametric designs (<1KB data files)
- **Status:** Very active, both versions maintained
- **Philosophy:** "Notepad for GCode" - design manufacturing process directly
- **Best for:** Research, novel structures, impossible-with-slicers designs

### 4. Non-PlanaR3D (January 2024)

- **Type:** Grasshopper plug-in for Rhino
- **Creator:** Pontifícia Universidade Católica do Rio de Janeiro
- **Approach:** Generates print paths in all 3 axes within Grasshopper
- **Features:**
  - Manual path definition
  - Mechanical stress simulation
  - Component optimization for stability/weight
- **Status:** First version available, ongoing development
- **Best for:** Designers using Rhino/Grasshopper workflow

---

## Older/Historical Projects (Still Referenced)

### 5. Slic3r Non-Planar (2016-2019)

- **Creator:** Dr. Eric Ebert
- **GitHub:** https://github.com/DrEricEbert/Slic3r_NonPlanar_Slicing
- **Type:** Modified Slic3r with non-planar capabilities
- **Status:** Archived/historical reference
- **Origin:** Based on TAMS Hamburg research (Daniel Ahlers thesis 2018)

### 6. Slicer4RTN (Rotating Tilted Nozzle)

- **Type:** Experimental slicer for belt printers and RTN setups
- **Features:** Tilted slicing, conic slicing
- **Status:** Experimental, limited documentation

---

## Theoretical/Research Approaches

### 7. Conic Slicing (ZHAW, 2021)

- **Researchers:** [unnamed in sources]
- **Method:** Utilizes planar slicers with coordinate transformation
- **Modes:** Inside-out (outside cone), outside-in (inside cone)
- **Angles:** 45° to 20° conic angles
- **Platform:** Can work with standard planar slicers (Slic3r 1.2.9, CuraEngine 4.4.1)

### 8. Cylindrical & Spherical Slicing

- **Researchers:** Coupek, Friedrich, Battran, Riedel (2018)
- **Paper:** "Reduction of support structures and building time by optimized path planning algorithms in multi-axis additive manufacturing"
- **Method:** Coordinate transformation to/from cylindrical or spherical space
- **Slicers Used:** Slic3r 1.2.9, CuraEngine 4.4.1 (PrusaSlicer not recommended)

### 9. XYZ Dims Blog Approaches (René K. Müller)

- **URL:** https://xyzdims.com/
- **Focus:** Re-imagining slicing with non-planar geometries
- **Examples:** Extensive 20mm cube slicing demonstrations
- **Methods:** Various coordinate transformation approaches

---

## Academic/Research Tools

### 10. S³ Slicer (Original)

- **Status:** Predecessor to S4
- **Note:** Inspired Joshua Bird's work
- **Details:** Limited public documentation

---

## Commercial/Patent Landscape

### Autodesk Patents

- **Focus:** Covering planar prints with non-planar layers
- **Status:** Some public, some abandoned
- **Note:** Patent landscape complex, prior art exists

---

## Comparison Matrix

| Tool | Ease of Use | Power | Status | Best For |
|------|-------------|-------|--------|----------|
| S4 Slicer | Medium | High | Active | Research, support-free printing |
| PrusaSlicer Fork | Easy | Medium | Unstable | Quick tests, simple geometries |
| FullControl | Hard | Extreme | Very Active | Complete control, novel structures |
| Non-PlanaR3D | Medium | Medium | New | Rhino/Grasshopper users |
| Slic3r NP | Medium | Medium | Historical | Reference only |

---

## For Building From Scratch - Key Papers to Read

1. **FullControl Paper:** Gleadall (2021) - Additive Manufacturing journal
2. **Coupek et al (2018):** Multi-axis path planning (free PDF)
3. **Daniel Ahlers Thesis (2018):** TAMS Hamburg - foundational non-planar work
4. **S4 Approach:** Joshua Bird's YouTube explanations

---

## Recommendations for From-Scratch Development

### Study these in order:

1. **FullControl** - understand complete freedom approach
2. **S4 Slicer** - learn tetrahedral mesh + deformation technique
3. **Conic slicing papers** - understand coordinate transformation methods
4. **PrusaSlicer fork source** - see integration challenges

### Why this order:

1. FullControl shows what's possible when unconstrained
2. S4 shows modern algorithmic approach
3. Academic papers provide mathematical foundation
4. PrusaSlicer fork shows real-world integration issues

### Key Challenges You'll Face:

- Collision detection (toolhead vs part)
- Path planning for non-planar surfaces
- Support structure generation
- Extrusion rate calculation on angled surfaces
- Multi-material coordination (for INDX goal)
