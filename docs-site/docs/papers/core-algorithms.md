---
sidebar_position: 3
title: Core Algorithm Papers
---

# Core Algorithm Papers

The key papers defining modern non-planar slicing algorithms.

## CurviSlicer (SIGGRAPH 2019)

**File:** `CurviSlicer_NYU_2019.pdf`
**Authors:** Etienne, Ray, Panozzo, Lefebvre et al.
**Size:** 11.5MB

Foundation paper for tetrahedral mesh deformation approach.

### Algorithm Overview
```
1. Tetrahedralize mesh enclosing model
2. Formulate QP optimization
3. Solve for height field h(p)
4. Slice deformed mesh planarly
5. Inverse transform to original space
```

### Optimization Formulation
```
minimize: λ_f·E_flat + λ_s·E_slope + λ_m·E_smooth + λ_a·E_align

subject to:
  θ ≤ θ_max (overhang constraint)
  τ_min ≤ τ ≤ τ_max (thickness bounds)
```

### Key Innovation
Using tetrahedral mesh deformation to convert non-planar slicing into a well-understood planar slicing problem.

---

## S³-Slicer (SIGGRAPH Asia 2022 - Best Paper)

**File:** `S3_Slicer_SIGGRAPH_Asia_2022.pdf`
**Authors:** Zhang, Fang, Huang, Lefebvre, Wang et al.
**Size:** 16MB

State-of-the-art multi-objective non-planar slicer.

### Three Objectives
| Objective | Symbol | Purpose |
|-----------|--------|---------|
| Support-Free | SF | Minimize overhangs |
| Surface Quality | SQ | Reduce staircase effect |
| Strength Reinforcement | SR | Align with stress |

### Quaternion Optimization
```cpp
// Per-element rotation optimization
for (Element& e : mesh.elements) {
    Quaternion R_target = blend(
        support_free_rotation(e),
        surface_quality_rotation(e),
        stress_alignment_rotation(e),
        weights
    );
    R[e] = R_target;
}
```

### Results
- 40-60% reduction in support material
- 2-3x strength improvement in stress-aligned mode
- Significant surface quality improvement

---

## QuickCurve (2024)

**File:** `QuickCurve_2024_NonPlanar.pdf`
**Authors:** Ottonello, Hugron, Parmiggiani, Lefebvre
**Size:** 19MB

Simplified, fast non-planar slicing.

### Key Insight
Single least-squares solve replaces iterative QP optimization.

### Performance Comparison
| Model | CurviSlicer | QuickCurve | Speedup |
|-------|-------------|------------|---------|
| Bunny | 45 min | 30 sec | 90x |
| Vase | 20 min | 15 sec | 80x |

### Algorithm
```python
def quickcurve(mesh):
    # No tetrahedralization needed!
    points = sample_surface(mesh)
    A, b = build_ls_system(points)
    surface = np.linalg.lstsq(A, b)
    return intersect_with_mesh(surface, mesh)
```

---

## Geodesic Distance Field (2020)

**File:** `Geodesic_Distance_Field_Curved_Layer_2020.pdf`
**Size:** 4.6MB

Field-based approach using geodesic distances.

### Heat Method for Geodesics
```
1. Solve heat equation: (I + tL)u = δ_source
2. Compute gradient: X = -∇u/|∇u|
3. Solve Poisson: Δφ = ∇·X
4. Extract iso-surfaces at intervals
```

### Advantages
- O(n log n) complexity
- Natural for organic shapes
- No tetrahedralization needed

---

## RoboFDM (ICRA 2017)

**File:** `RoboFDM_ICRA_2017.pdf`
**Size:** 470KB
**Venue:** IEEE ICRA

Support-free robotic fabrication via decomposition.

### Algorithm
```
1. Identify overhang regions
2. Decompose into support-free subparts
3. Build dependency graph
4. Topological sort for print order
5. Compute optimal orientation per subpart
```

### Key Contribution
First systematic treatment of collision-free multi-axis path planning for FDM.

---

## Open5x Conformal Slicing (2022)

**File:** `Open5x_Conformal_Slicing_2022.pdf`
**Size:** 6.4MB

Practical 5-axis slicing with kinematics.

### Feed Rate Compensation
```python
def compensate_feedrate(segment, nominal_feed):
    axis_dist = sqrt(dx² + dy² + dz² + du² + dv²)
    tip_dist = arc_length(segment)
    return nominal_feed * (axis_dist / tip_dist)
```

### Inverse Kinematics
```python
def inverse_kinematics(tip_pos, tip_dir, tool_length):
    v = atan2(tip_dir.x, tip_dir.z)
    u = atan2(-tip_dir.y, sqrt(tip_dir.x² + tip_dir.z²))
    x = tip_pos.x - tool_length * tip_dir.x
    y = tip_pos.y - tool_length * tip_dir.y
    z = tip_pos.z - tool_length * tip_dir.z
    return x, y, z, degrees(u), degrees(v)
```

---

## Reinforced FDM (SIGGRAPH Asia 2020)

**File:** `Reinforced_FDM_MultiAxis_SIGGRAPH_Asia_2020.pdf`
**Size:** 11.8MB

Stress-aligned multi-axis printing for strength.

### Approach
```
1. FEM stress analysis
2. Extract principal stress directions
3. Align layers with stress field
4. Generate collision-free 5-axis paths
```

### Results
- 2-3x tensile strength improvement
- Reduced delamination
- Optimal material orientation

---

## Paper Comparison

| Paper | Year | Approach | Complexity | Best For |
|-------|------|----------|------------|----------|
| CurviSlicer | 2019 | Tet deformation | O(n³) | General |
| S³-Slicer | 2022 | Multi-objective | O(n³) | Research |
| QuickCurve | 2024 | Least-squares | O(n) | Speed |
| Geodesic | 2020 | Distance field | O(n log n) | Organic |
| RoboFDM | 2017 | Decomposition | O(n²) | Support-free |
| Open5x | 2022 | 5-axis | O(n) | Production |

## Next Steps

- [Recent Advances](/docs/papers/recent-advances) - Neural and ML methods
- [Algorithm Details](/docs/algorithms/overview) - Implementation guide
