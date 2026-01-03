---
sidebar_position: 2
title: Mesh Deformation
---

# Mesh Deformation Algorithms

Transform the model geometry so that planar slicing produces curved paths when inverse-mapped.

## Core Concept

```mermaid
graph LR
    A[Original Mesh] --> B[Tetrahedralize]
    B --> C[Optimize Deformation]
    C --> D[Deformed Mesh]
    D --> E[Planar Slice]
    E --> F[Inverse Map]
    F --> G[Curved G-code]
```

## CurviSlicer (SIGGRAPH 2019)

**Paper:** `CurviSlicer_NYU_2019.pdf`

### Algorithm

```python
def curvislicer(mesh, theta_max=45, tau_range=(0.1, 0.4)):
    # 1. Generate tetrahedral mesh
    tet_mesh = tetrahedralize(mesh)

    # 2. Initialize height field
    h = initial_heights(tet_mesh)

    # 3. Solve QP optimization
    h_opt = solve_qp(
        objective = lambda_f * E_flat(h)
                  + lambda_s * E_slope(h)
                  + lambda_m * E_smooth(h)
                  + lambda_a * E_align(h),
        constraints = [
            slope(h) <= theta_max,
            tau_min <= thickness(h) <= tau_max
        ]
    )

    # 4. Deform mesh using optimized heights
    deformed = apply_deformation(tet_mesh, h_opt)

    # 5. Slice and inverse transform
    layers = planar_slice(deformed)
    return inverse_transform(layers, tet_mesh)
```

### Energy Terms

| Term | Formula | Purpose |
|------|---------|---------|
| E_flat | `Σ(n_f · z)²` | Flatten horizontal surfaces |
| E_slope | `Σ max(0, θ - θ_max)²` | Penalize steep overhangs |
| E_smooth | `Σ‖∇h‖²` | Laplacian smoothing |
| E_align | `Σ(h(p) - z_layer)²` | Align to discrete layers |

### Complexity
- **Time:** O(n³) for QP solve
- **Memory:** O(n) for tet mesh storage

---

## S³-Slicer (SIGGRAPH Asia 2022 Best Paper)

**Paper:** `S3_Slicer_SIGGRAPH_Asia_2022.pdf`

### Multi-Objective Optimization

S³ optimizes for three goals simultaneously:

```
SF = Support-Free (minimize overhangs)
SQ = Surface Quality (minimize staircase)
SR = Strength Reinforcement (align with stress)
```

### Algorithm

```python
def s3_slicer(mesh, weights={'SF': 1, 'SQ': 1, 'SR': 1}):
    tet_mesh = tetrahedralize(mesh)

    # Initialize rotation field (quaternions per element)
    R = initialize_rotations(tet_mesh)

    for iteration in range(max_iter):
        # Local step: compute target rotations
        R_target = {}
        for element in tet_mesh.elements:
            R_sf = compute_support_free_rotation(element)
            R_sq = compute_surface_quality_rotation(element)
            R_sr = compute_stress_alignment_rotation(element)

            R_target[element] = blend_quaternions(
                [R_sf, R_sq, R_sr],
                [weights['SF'], weights['SQ'], weights['SR']]
            )

        # Global step: deformation gradient assembly
        positions = solve_global_assembly(R_target, tet_mesh)

        if converged(positions):
            break

    # Generate height field and slice
    h = compute_height_field(positions)
    return extract_isosurfaces(h)
```

### Quaternion Rotation

```
q = (w, x, y, z) = cos(θ/2) + sin(θ/2)(u_x·i + u_y·j + u_z·k)

Rotation of vector v:
v' = q v q*

Composition: q_total = q₂ × q₁ (apply q₁ first)
```

---

## QuickCurve (2024)

**Paper:** `QuickCurve_2024_NonPlanar.pdf`

### Simplified Approach

Key insight: Skip tetrahedralization, use single least-squares solve.

```python
def quickcurve(mesh):
    # 1. Sample points on surface
    points = sample_surface(mesh, density=1000)

    # 2. Build least-squares system
    # Find surface z(x,y) that minimizes overhang
    A, b = build_ls_system(points)

    # 3. Single solve (no iteration!)
    surface_params = np.linalg.lstsq(A, b)

    # 4. Intersect surface with mesh
    return generate_layers(mesh, surface_params)
```

### Performance

| Model | CurviSlicer | QuickCurve | Speedup |
|-------|-------------|------------|---------|
| Bunny | 45 min | 30 sec | 90x |
| Vase | 20 min | 15 sec | 80x |
| Complex | 2 hours | 5 min | 24x |

---

## Barycentric Coordinate Mapping

All deformation methods use barycentric coordinates for precise point mapping:

```python
def map_point_through_tet(point, tet_original, tet_deformed):
    # Compute barycentric weights in original tet
    v0, v1, v2, v3 = tet_original.vertices

    # Solve: point = w0*v0 + w1*v1 + w2*v2 + w3*v3
    # with constraint: w0 + w1 + w2 + w3 = 1

    mat = np.array([
        [v1-v0, v2-v0, v3-v0]
    ]).T
    weights = np.linalg.solve(mat, point - v0)
    w = [1 - sum(weights)] + list(weights)

    # Apply same weights to deformed tet
    u0, u1, u2, u3 = tet_deformed.vertices
    return w[0]*u0 + w[1]*u1 + w[2]*u2 + w[3]*u3
```

## Implementation Resources

- [S4 Slicer Implementation](/docs/implementations/s4-slicer)
- [S³ Slicer Implementation](/docs/implementations/s3-slicer)
- [Math Foundations](/docs/resources/math-foundations)
