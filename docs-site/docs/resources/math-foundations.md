---
sidebar_position: 1
title: Mathematical Foundations
---

# Mathematical Foundations

Core mathematical concepts used in non-planar slicing algorithms.

## Coordinate Systems

### Cartesian Coordinates
```
Standard 3D space: (x, y, z)
Build direction: +Z (typically)
```

### Cylindrical Coordinates
```
(r, θ, z) where:
  r = √(x² + y²)      radius
  θ = atan2(y, x)     angle
  z = z               height
```

### Spherical Coordinates
```
(ρ, θ, φ) where:
  ρ = √(x² + y² + z²)  radius
  θ = atan2(y, x)       azimuthal angle
  φ = acos(z/ρ)         polar angle
```

---

## Linear Algebra Essentials

### Rotation Matrices

**2D Rotation:**
```
R(θ) = | cos(θ)  -sin(θ) |
       | sin(θ)   cos(θ) |
```

**3D Rotation (Z-axis):**
```
R_z(θ) = | cos(θ)  -sin(θ)  0 |
         | sin(θ)   cos(θ)  0 |
         |   0        0     1 |
```

**General 3D (axis-angle):**
```python
def axis_angle_to_matrix(axis, angle):
    """Rodrigues' rotation formula"""
    K = skew_symmetric(axis)  # Cross-product matrix
    I = np.eye(3)
    return I + np.sin(angle)*K + (1-np.cos(angle))*K@K
```

### Quaternions

**Definition:**
```
q = w + xi + yj + zk
  = (w, v) where v = (x, y, z)
  = cos(θ/2) + sin(θ/2)(u_x·i + u_y·j + u_z·k)
```

**Operations:**
```python
def quaternion_multiply(q1, q2):
    w1, x1, y1, z1 = q1
    w2, x2, y2, z2 = q2
    return (
        w1*w2 - x1*x2 - y1*y2 - z1*z2,
        w1*x2 + x1*w2 + y1*z2 - z1*y2,
        w1*y2 - x1*z2 + y1*w2 + z1*x2,
        w1*z2 + x1*y2 - y1*x2 + z1*w2
    )

def rotate_vector(q, v):
    """Rotate vector v by quaternion q"""
    q_conj = (q[0], -q[1], -q[2], -q[3])
    v_quat = (0, v[0], v[1], v[2])
    result = quaternion_multiply(quaternion_multiply(q, v_quat), q_conj)
    return result[1:4]
```

**SLERP (Spherical Linear Interpolation):**
```python
def slerp(q1, q2, t):
    """Interpolate between quaternions"""
    dot = sum(a*b for a, b in zip(q1, q2))

    if dot < 0:
        q2 = tuple(-x for x in q2)
        dot = -dot

    if dot > 0.9995:
        # Linear interpolation for nearly parallel
        result = tuple((1-t)*a + t*b for a, b in zip(q1, q2))
        return normalize(result)

    theta = np.arccos(dot)
    sin_theta = np.sin(theta)

    s1 = np.sin((1-t)*theta) / sin_theta
    s2 = np.sin(t*theta) / sin_theta

    return tuple(s1*a + s2*b for a, b in zip(q1, q2))
```

---

## Mesh Processing

### Barycentric Coordinates

For point p inside triangle (v0, v1, v2):
```
p = w0·v0 + w1·v1 + w2·v2
where w0 + w1 + w2 = 1
```

**Computation:**
```python
def barycentric_2d(p, v0, v1, v2):
    v0v1 = v1 - v0
    v0v2 = v2 - v0
    v0p = p - v0

    d00 = np.dot(v0v1, v0v1)
    d01 = np.dot(v0v1, v0v2)
    d11 = np.dot(v0v2, v0v2)
    d20 = np.dot(v0p, v0v1)
    d21 = np.dot(v0p, v0v2)

    denom = d00 * d11 - d01 * d01
    w1 = (d11 * d20 - d01 * d21) / denom
    w2 = (d00 * d21 - d01 * d20) / denom
    w0 = 1 - w1 - w2

    return w0, w1, w2
```

### Tetrahedral Barycentric Coordinates

For point p inside tetrahedron (v0, v1, v2, v3):
```python
def barycentric_tet(p, v0, v1, v2, v3):
    # Volume ratios
    vol_total = tet_volume(v0, v1, v2, v3)
    w0 = tet_volume(p, v1, v2, v3) / vol_total
    w1 = tet_volume(v0, p, v2, v3) / vol_total
    w2 = tet_volume(v0, v1, p, v3) / vol_total
    w3 = 1 - w0 - w1 - w2
    return w0, w1, w2, w3

def tet_volume(a, b, c, d):
    return abs(np.dot(b-a, np.cross(c-a, d-a))) / 6
```

---

## Differential Geometry

### Surface Normal

```python
def triangle_normal(v0, v1, v2):
    edge1 = v1 - v0
    edge2 = v2 - v0
    normal = np.cross(edge1, edge2)
    return normal / np.linalg.norm(normal)
```

### Curvature

**Mean Curvature (discrete):**
```python
def mean_curvature(mesh, vertex_idx):
    """Cotangent Laplacian method"""
    v = mesh.vertices[vertex_idx]
    neighbors = mesh.vertex_neighbors(vertex_idx)

    laplacian = np.zeros(3)
    area = 0

    for i, j in zip(neighbors, neighbors[1:] + [neighbors[0]]):
        vi, vj = mesh.vertices[i], mesh.vertices[j]

        # Cotangent weights
        cot_alpha = cotangent(v, vi, vj)
        cot_beta = cotangent(v, vj, vi)

        laplacian += (cot_alpha + cot_beta) * (vi - v)
        area += triangle_area(v, vi, vj) / 3

    return np.linalg.norm(laplacian) / (2 * area)
```

### Geodesic Distance

**Heat Method:**
```python
def heat_method_geodesic(mesh, source_vertices):
    L = mesh.cotangent_laplacian()
    M = mesh.mass_matrix()
    t = mesh.mean_edge_length ** 2

    # Step 1: Heat equation
    A = M + t * L
    b = np.zeros(len(mesh.vertices))
    b[source_vertices] = 1
    u = scipy.sparse.linalg.spsolve(A, b)

    # Step 2: Normalized gradient
    grad_u = mesh.gradient(u)
    X = -grad_u / np.linalg.norm(grad_u, axis=1, keepdims=True)

    # Step 3: Poisson equation
    div_X = mesh.divergence(X)
    phi = scipy.sparse.linalg.spsolve(L, div_X)

    return phi - phi.min()
```

---

## Optimization

### Quadratic Programming

Standard form:
```
minimize:    (1/2)x'Hx + f'x
subject to:  Ax ≤ b
             Aeq·x = beq
```

**Python (cvxpy):**
```python
import cvxpy as cp

def solve_qp(H, f, A, b, Aeq, beq):
    n = H.shape[0]
    x = cp.Variable(n)

    objective = cp.Minimize(0.5 * cp.quad_form(x, H) + f @ x)
    constraints = [A @ x <= b, Aeq @ x == beq]

    problem = cp.Problem(objective, constraints)
    problem.solve()

    return x.value
```

### Laplacian Smoothing

```python
def laplacian_smooth(mesh, iterations=10, lambda_=0.5):
    vertices = mesh.vertices.copy()
    L = mesh.laplacian_matrix()

    for _ in range(iterations):
        delta = L @ vertices
        vertices = vertices + lambda_ * delta

    return vertices
```

---

## Iso-Surface Extraction

### Marching Cubes (Simplified)

```python
def marching_cubes(scalar_field, iso_value, bounds, resolution):
    triangles = []

    for cell in grid_cells(bounds, resolution):
        values = [scalar_field(corner) for corner in cell.corners]
        signs = [v > iso_value for v in values]

        # Find edge crossings
        crossings = []
        for edge in cell.edges:
            v1, v2 = edge
            if signs[v1] != signs[v2]:
                t = (iso_value - values[v1]) / (values[v2] - values[v1])
                point = cell.corners[v1] + t * (cell.corners[v2] - cell.corners[v1])
                crossings.append(point)

        # Triangulate (lookup table in full implementation)
        triangles.extend(triangulate(crossings))

    return triangles
```

---

## References

- **Quaternions:** Shoemake, K. "Animating Rotation with Quaternion Curves" (SIGGRAPH 1985)
- **Barycentric Coordinates:** Möbius, A.F. "Der barycentrische Calcul" (1827)
- **Heat Method:** Crane, K. et al. "Geodesics in Heat" (TOG 2013)
- **Marching Cubes:** Lorensen, W.E. and Cline, H.E. (SIGGRAPH 1987)

## Next Steps

- [Libraries Reference](/docs/resources/libraries) - Implementation tools
- [Algorithm Overview](/docs/algorithms/overview) - Applied mathematics
