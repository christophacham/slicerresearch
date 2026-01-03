# Non-Planar 3D Printing Slicer Research

A comprehensive collection of research papers, open-source projects, and documentation for non-planar/curved layer 3D printing slicing techniques.

## Contents

### Research Papers (`papers/`)
11 key papers (~97MB) covering:
- Curved Layer FDM fundamentals
- Tetrahedral mesh deformation (S³-Slicer)
- Multi-axis path planning
- Neural network approaches
- Direct G-code design

See [`papers/README.md`](papers/README.md) for reading order and paper summaries.

### Open Source Projects

| Project | Description | Original Repo |
|---------|-------------|---------------|
| `S4_Slicer/` | Jupyter notebook non-planar slicer (2025) | [jyjblrd/S4_Slicer](https://github.com/jyjblrd/S4_Slicer) |
| `S3_DeformFDM/` | S³-Slicer - tetrahedral deformation (SIGGRAPH Asia 2022 Best Paper) | [zhangty019/S3_DeformFDM](https://github.com/zhangty019/S3_DeformFDM) |
| `fullcontrol/` | Python library for direct G-code design | [FullControlXYZ/fullcontrol](https://github.com/FullControlXYZ/fullcontrol) |
| `Slic3r_NonPlanar_Slicing/` | Historical Slic3r fork with non-planar support | [DrEricEbert/Slic3r_NonPlanar_Slicing](https://github.com/DrEricEbert/Slic3r_NonPlanar_Slicing) |
| `Slicer6D/` | 5-axis slicer reference implementation | [DavidSeyserGit/Slicer6D](https://github.com/DavidSeyserGit/Slicer6D) |

### Documentation
- [`non-planar-slicing-projects.md`](non-planar-slicing-projects.md) - Complete project/tool survey
- [`s4-slicer-deep-dive.md`](s4-slicer-deep-dive.md) - Technical deep dive into S4 Slicer

## Key Algorithms

### 1. Tetrahedral Mesh Deformation (S³/S4)
```
Original Mesh → Tetrahedralize → Deform (rotate to eliminate overhangs)
    → Planar Slice deformed mesh → Inverse transform paths → Non-planar G-code
```

### 2. Coordinate Transformation (Coupek et al.)
- Cylindrical/spherical coordinate transforms
- Works with existing planar slicers
- Good for rotationally symmetric parts

### 3. Direct G-code Design (FullControl)
- Skip CAD/STL/slicing entirely
- Define every path segment + parameters
- Maximum flexibility for novel structures

## Getting Started

### Quick Start with S4 Slicer
```bash
cd S4_Slicer
pip install -r requirements.txt
jupyter notebook main.ipynb
```

### Quick Start with FullControl
```bash
cd fullcontrol
pip install fullcontrol
python -c "import fullcontrol as fc; print(fc.__version__)"
```

## Hardware Requirements

| Approach | Printer Type |
|----------|-------------|
| S4/S³ Slicer | 5-axis (Duet3D + kinematics plugins) |
| Slic3r NonPlanar | 3-axis with long/tilted nozzle |
| FullControl | Any (you control everything) |

## Key Challenges

1. **Collision Detection** - Toolhead vs printed part
2. **Extrusion Compensation** - Rate changes on curved surfaces
3. **Path Planning** - Optimal ordering for non-planar moves
4. **Support Generation** - When supports are still needed

## License

This repository aggregates open-source projects under their respective licenses:
- S4_Slicer: Check original repo
- S3_DeformFDM: Check original repo
- fullcontrol: GPL-3.0
- Slic3r_NonPlanar_Slicing: AGPL-3.0
- Slicer6D: Check original repo

Research papers are included for educational/research purposes.

## Acknowledgments

- Joshua Bird (@jyjblrd) - S4 Slicer
- Tianyu Zhang et al. - S³-Slicer
- Andrew Gleadall - FullControl
- Daniel Ahlers - Foundational non-planar research (TAMS Hamburg)
- Dr. Eric Ebert - Slic3r non-planar fork
