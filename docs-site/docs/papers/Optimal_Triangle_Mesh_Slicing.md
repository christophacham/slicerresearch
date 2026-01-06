---
title: "An optimal algorithm for 3D triangle mesh slicing"
---

# An optimal algorithm for 3D triangle mesh slicing

**Filename:** Optimal_Triangle_Mesh_Slicing.pdf

## Metadata
- **Authors:** Rodrigo Minetto, Neri Volpato, Jorge Stolfi, Rodrigo M.M.H. Gregori, and Murilo V.G. da Silva
- **Year:** 2017
- **Venue:** Computer-Aided Design
- **DOI:** 10.1016/j.cad.2017.07.001

## What problem does it solve?
The paper presents an asymptotically optimal algorithm for slicing unstructured triangular meshes and constructing contours for additive manufacturing. It addresses the computational bottleneck of the slicing sub-tasks, which can consume up to 60% of process planning time.

## Algorithm (from Optimal_Triangle_Mesh_Slicing.pdf)
- **Input →** Unstructured triangular mesh T (n triangles) and a list of k slicing planes P
- **Output →** Sorted lists `S[i]` of line segments forming closed polygons for each plane

Steps:
1. **Triangle Partitioning:** Divide input triangles into `k+1` lists based on their minimum Z-coordinate (`z_min`) using direct indexing (uniform) or binary search (adaptive).
2. **Plane Sweep:** Simulate a sweeping plane jumping between coordinates in P. Maintain an active set A of triangles that potentially intersect the current plane.
3. **Intersection Computation:** For each plane i, add triangles starting at `P[i]` to A and remove triangles whose maximum Z-coordinate (`z_max`) is below `P[i]`.
4. **Segment Generation:** Compute triangle-plane intersection segments for all triangles in A.
5. **Contour Construction:** Use an `O(m)` hash-based algorithm to chain unsorted line segments into closed polygons by matching endpoints.

## Key equations (paper refs)
- **Average Intersection Count (Sec 3.1, p. 3):** `n̄ = (1/k) Σᵢ₌₁ᵏ nᵢ` — Where n̄ is the average number of triangles intersecting a plane.
- **Uniform List Indexing (Sec 3.3, p. 5):** `i = ⌊(t.zmin − P) / δ⌋ + 1` — Calculates the bucket for a triangle in O(1) time for uniform slicing.

## Complexity
O(n log k + k + m) where n = triangles, k = planes, m = intersections. For uniform slicing or pre-sorted meshes, this reduces to O(n + k + m).

## Hardware tested (from Optimal_Triangle_Mesh_Slicing.pdf)
- **System:** Intel Core i7 (3.4 GHz) with 32 GB RAM
- **OS:** Linux (64-bit)

## Results (from Optimal_Triangle_Mesh_Slicing.pdf Table 4)
| Metric | Value (Proposed vs. Slic3r) |
| --- | ---: |
| Total Time (Skull model, 16M triangles) | 118.46s vs. 2189.65s |
| Total Time (Bear model, 6M triangles) | 22.15s vs. 536.56s |
| Segment Processing Rate | ~1.8 million segments/sec |

## Limitations (as stated in Optimal_Triangle_Mesh_Slicing.pdf)
- **Mesh Manifoldness:** Requires the input mesh to be a closed orientable 2-manifold to guarantee valid closed polygons.
- **Vertex Alignment:** Assumes plane Z-coordinates are distinct from vertex Z-coordinates (requires coordinate rounding/preprocessing).

## Code available?
[X] Yes — Available at http://www.inf.ufrgs.br/~minetto/slicing

## Related papers in collection
- Builds on: McMains and Séquin (Plane sweep basics)
- Compare to: Slic3r (Standard benchmark)

## Category
- [ ] Mesh Deformation  [ ] Multi-Axis  [ ] Field-Based  [ ] Neural/ML  [ ] Adaptive  [ ] Support  [ ] Fiber  [X] Other: Slicing Optimization

## Analogy
Imagine you have 10,000 decks of cards (triangles) scattered on a floor. Traditional slicing is like walking to every single card every time you want to see if it's at a certain height. This algorithm is like pre-sorting the cards into boxes based on their lowest edge. As you move upward, you only open the boxes you've just reached and throw away cards you've already passed, so you're only ever looking at a tiny, relevant handful of cards at any one time.
