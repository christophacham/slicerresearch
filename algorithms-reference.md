# Non-Planar Slicing Algorithms - Comprehensive Reference

## Algorithm Categories Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                  NON-PLANAR SLICING ALGORITHMS                  │
├─────────────────────────────────────────────────────────────────┤
│  1. MESH DEFORMATION          │  2. COORDINATE TRANSFORM        │
│     - Tetrahedral deformation │     - Cylindrical mapping       │
│     - Space warping           │     - Spherical mapping         │
│     - QP optimization         │     - Conic slicing             │
├───────────────────────────────┼─────────────────────────────────┤
│  3. FIELD-BASED              │  4. GEODESIC METHODS            │
│     - Scalar distance fields  │     - Geodesic distance fields  │
│     - Iso-surface extraction  │     - Heat method               │
│     - Vector field guided     │     - Shortest path on mesh     │
├───────────────────────────────┼─────────────────────────────────┤
│  5. HYBRID / ADAPTIVE        │  6. MULTI-AXIS PATH PLANNING    │
│     - Planar + non-planar     │     - Collision avoidance       │
│     - Curvature-based layers  │     - Inverse kinematics        │
│     - Boolean decomposition   │     - Feed rate optimization    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Mesh Deformation Algorithms

### 1.1 CurviSlicer (SIGGRAPH 2019) ⭐ FOUNDATIONAL

**Paper:** `CurviSlicer_NYU_2019.pdf`
**Authors:** Etienne, Ray, Panozzo, Lefebvre et al.

**Core Algorithm:**
```
Input: Triangular mesh M
Output: Curved layer G-code

1. Generate tetrahedral mesh Γ enclosing M
2. For each vertex p in Γ, compute optimal height h(p)
3. Solve Quadratic Programming (QP) optimization:

   minimize:  λ_f·E_flat + λ_s·E_slope + λ_m·E_smooth + λ_a·E_align

   subject to:
     - θ ≤ θ_max  (maximum printable slope)
     - τ_min ≤ τ ≤ τ_max  (layer thickness bounds)

4. Slice deformed mesh with planar layers
5. Inverse-transform toolpaths to original space
```

**Energy Terms:**
| Term | Formula | Purpose |
|------|---------|---------|
| E_flat | Σ(n_f · z)² | Flatten horizontal surfaces |
| E_slope | Σ max(0, θ - θ_max)² | Penalize steep overhangs |
| E_smooth | Σ‖∇h‖² | Laplacian smoothing |
| E_align | Σ(h(p) - z_layer)² | Align to slice heights |

**Complexity:** O(n³) for n tetrahedral vertices

---

### 1.2 S³-Slicer (SIGGRAPH Asia 2022 - Best Paper) ⭐

**Paper:** `S3_Slicer_SIGGRAPH_Asia_2022.pdf`
**Authors:** Zhang, Fang, Huang, Lefebvre, Wang et al.

**Core Algorithm:**
```
Input: Tetrahedral mesh T, objectives (SF, SQ, SR)
Output: Multi-objective curved layers

1. Initialize rotation field R(e) for each element e
2. For each objective, compute local target rotation:
   - SF (Support-Free): align normals to avoid overhangs
   - SQ (Surface Quality): minimize staircase
   - SR (Strength Reinforcement): align with stress

3. Optimization loop:
   a. Rotate elements to satisfy local objectives
   b. Global assembly via deformation gradient
   c. Compute deformed mesh positions

4. Generate scalar height field on deformed mesh
5. Extract iso-surfaces as curved layers
6. Inverse map toolpaths
```

**Deformation Formula:**
```
X_deformed = Σ w_i · R(θ_i) · X_original + T_i
```
Where R(θ) is rotation matrix, w_i are barycentric weights.

---

### 1.3 QuickCurve (arXiv 2024) - SIMPLIFIED

**Paper:** `QuickCurve_2024_NonPlanar.pdf`
**Authors:** Ottonello, Hugron, Parmiggiani, Lefebvre

**Key Innovation:** Single least-squares solve instead of full QP

**Algorithm:**
```
Input: Mesh M (no tetrahedralization needed!)
Output: Curved slicing surface

1. Sample points on mesh surface
2. Formulate as least-squares problem:

   minimize: ‖Ax - b‖²

   where x defines the curved surface parameters

3. Solve in single pass (no iteration)
4. Intersect surface with mesh for layers
```

**Advantage:** 10-100x faster than CurviSlicer

---

## 2. Coordinate Transformation Methods

### 2.1 Cylindrical/Spherical Mapping

**Paper:** `Coupek_2018_MultiAxis_Path_Planning.pdf`

**Transformation:**
```
Cartesian (x, y, z) ↔ Cylindrical (r, θ, z)

Forward:  r = √(x² + y²)
          θ = atan2(y, x)

Inverse:  x = r·cos(θ)
          y = r·sin(θ)
```

**Workflow:**
```
1. Transform model to cylindrical space
2. Use standard planar slicer (Slic3r, CuraEngine)
3. Transform G-code back to Cartesian
4. Adjust extrusion for path length changes
```

### 2.2 Axisymmetric Non-Planar Slicing (2024)

**Paper:** `Axisymmetric_NonPlanar_Slicing_2024.pdf`

**Method:**
```
Slicing Space {s}: (L, θ, H)
  - L = arc length along generatrix curve Γ(u)
  - θ = rotation angle
  - H = height offset

Transform: (L,θ,H) → (x,y,z)
  x = (r(u) + H)·cos(θ)
  y = (r(u) + H)·sin(θ)
  z = z(u)

where u = u(L) requires numerical integration
```

### 2.3 Conic Slicing (ZHAW 2021)

**Modes:**
- **Inside-out:** Print from center outward (cone opens up)
- **Outside-in:** Print from outside inward (cone opens down)

**Angle range:** 20° - 45° typical

---

## 3. Field-Based Methods

### 3.1 Geodesic Distance Field

**Paper:** `Geodesic_Distance_Field_Curved_Layer_2020.pdf`

**Algorithm:**
```
Input: Tetrahedral mesh T, base surface B
Output: Curved layer decomposition

1. Compute geodesic distance d(v) for all vertices
   - Use heat method or Dijkstra on mesh

2. For distance values d₀ < d₁ < ... < dₙ:
   a. Extract iso-geodesic surface IGDS(dᵢ)
   b. Surface = {v : d(v) = dᵢ}

3. Optimize printing sequence via TSP-like formulation
4. Generate toolpaths on each IGDS
```

**Heat Method for Geodesics:**
```
1. Solve heat equation: (I + tL)u = δ_source
2. Compute gradient: X = -∇u/|∇u|
3. Solve Poisson: Δφ = ∇·X
4. φ gives geodesic distances
```

### 3.2 Vector Field-Based Curved Layers

**Core Idea:** Two orthogonal vector fields guide slicing
- **Filament orientation field:** Direction of material deposition
- **Printing orientation field:** Build direction (varying)

**Scalar Field Generation:**
```
φ(p) = ∫ V_print(s) · ds  (path integral)

where V_print is printing orientation vector field
```

---

## 4. Path Planning Algorithms

### 4.1 Collision-Free Toolpath (RoboFDM)

**Paper:** `RoboFDM_ICRA_2017.pdf`

**Algorithm:**
```
Input: Model M, robot kinematics K
Output: Collision-free print sequence

1. Decompose M into support-free regions {R₁...Rₙ}
2. Build dependency graph G:
   - Nodes = regions
   - Edges = collision dependencies

3. Topological sort G for print order
4. For each region:
   a. Compute optimal orientation
   b. Generate planar slices in that orientation
   c. Verify no collision with printed regions
```

### 4.2 5-Axis Feed Rate Optimization (Open5x)

**Paper:** `Open5x_Conformal_Slicing_2022.pdf`

**Problem:** Constant G-code feedrate ≠ constant tip speed when axes rotate

**Solution:**
```
For each segment with:
  - Linear move: Δx, Δy, Δz
  - Rotary move: Δu, Δv

Total axis distance: d = √(Δx² + Δy² + Δz² + Δu² + Δv²)
Toolpath length: l (actual path at nozzle)

Compensation ratio: c = d / l
Adjusted feedrate: F' = F × c
```

### 4.3 Adaptive Layer Thickness

**Paper:** `Adaptive_Slicing_FDM_Revisited_Hamburg_2017.pdf`

**Curvature-Based Thickness:**
```
τ(p) = τ_min + (τ_max - τ_min) × f(κ(p))

where:
  κ(p) = local surface curvature
  f(κ) = mapping function (linear, exponential)
```

**Cusp Height Method:**
```
h_cusp = τ × tan(θ)  for surface angle θ

Constraint: h_cusp ≤ h_max (tolerance)
Therefore: τ ≤ h_max / tan(θ)
```

---

## 5. Support Generation for Curved Layers

**Paper:** `Support_Generation_Curved_Layers_2023.pdf`

**Challenge:** Traditional support algorithms assume fixed build direction

**Skeleton-Based Method:**
```
1. Compute medial axis skeleton of overhang regions
2. Represent support as implicit solid:
   S(p) = d_skeleton(p) - r_support

3. Generate support toolpaths on curved surfaces
4. Ensure support contacts printed surface properly
```

---

## 6. Mathematical Foundations

### 6.1 Barycentric Coordinates (for Tet Mapping)

```
For point p inside tetrahedron with vertices v₀,v₁,v₂,v₃:

p = w₀v₀ + w₁v₁ + w₂v₂ + w₃v₃

where w₀ + w₁ + w₂ + w₃ = 1

Weights computed via:
w_i = Vol(p,v_j,v_k,v_l) / Vol(v₀,v₁,v₂,v₃)
```

### 6.2 Laplacian Smoothing

```
L = D - A

where:
  D = diagonal degree matrix
  A = adjacency matrix

Smoothing: x_new = (I - λL)x_old
```

### 6.3 Quaternion Rotation

```
q = (w, x, y, z) = cos(θ/2) + sin(θ/2)(uₓi + uᵧj + u_zk)

Rotation of vector v:
v' = qvq*

Composition: q_total = q₂ × q₁ (apply q₁ first)
```

---

## Implementation Recommendations

### For Beginners
1. Start with **coordinate transformation** (cylindrical)
2. Use existing planar slicers
3. Focus on post-processing G-code

### For Research
1. Implement **CurviSlicer** QP formulation
2. Study **S³-Slicer** for multi-objective
3. Explore **QuickCurve** for efficiency

### Key Libraries
| Library | Language | Use |
|---------|----------|-----|
| PyVista | Python | Mesh processing |
| libigl | C++ | Geometry algorithms |
| CGAL | C++ | Computational geometry |
| TetGen | C++ | Tetrahedralization |
| Eigen | C++ | Linear algebra |
| SciPy | Python | Optimization (QP) |

---

## Papers by Category

### Mesh Deformation
- CurviSlicer (2019)
- S³-Slicer (2022)
- QuickCurve (2024)

### Coordinate Transform
- Coupek Multi-Axis (2018)
- Axisymmetric Slicing (2024)

### Geodesic/Field-Based
- Geodesic Distance Field (2020)
- Vector Field Curved Layer (2022)

### Path Planning
- RoboFDM (2017)
- Open5x (2022)
- Support Generation (2023)

### Adaptive Slicing
- Saliency-Preserving (2015)
- Adaptive FDM Revisited (2017)
- Contour Reconstruction (2021)

### Foundational
- CLFDM Original (2010)
- Ahlers Thesis (2018)
- FullControl (2021)
