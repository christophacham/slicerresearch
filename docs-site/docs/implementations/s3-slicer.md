---
sidebar_position: 3
title: S³ Slicer
---

# S³ Slicer (S3_DeformFDM)

Multi-objective non-planar slicer with quaternion-based optimization.

**Repository:** `S3_DeformFDM/`
**Paper:** SIGGRAPH Asia 2022 (Best Paper Award)
**Authors:** Zhang, Fang, Huang, Lefebvre, Wang et al.

## Overview

S³-Slicer optimizes for three simultaneous objectives:
- **SF:** Support-Free (minimize overhangs)
- **SQ:** Surface Quality (minimize staircase)
- **SR:** Strength Reinforcement (align with stress)

## Building from Source

### Prerequisites

```bash
# Ubuntu/Debian
sudo apt install cmake libeigen3-dev libcgal-dev libgmp-dev libmpfr-dev

# Clone libigl
git clone https://github.com/libigl/libigl.git
```

### Build

```bash
cd slicerresearch/S3_DeformFDM

mkdir build && cd build
cmake .. -DLIBIGL_DIR=/path/to/libigl
make -j$(nproc)
```

### Windows (Visual Studio)

```powershell
cd slicerresearch\S3_DeformFDM
mkdir build
cd build
cmake .. -G "Visual Studio 17 2022" -DLIBIGL_DIR=C:\path\to\libigl
cmake --build . --config Release
```

## Usage

```bash
./S3_DeformFDM input.obj output_dir \
    --sf_weight 1.0 \
    --sq_weight 0.5 \
    --sr_weight 0.3 \
    --layer_height 0.2
```

### Parameters

| Flag | Description | Default |
|------|-------------|---------|
| `--sf_weight` | Support-free weight | 1.0 |
| `--sq_weight` | Surface quality weight | 1.0 |
| `--sr_weight` | Strength weight | 0.0 |
| `--layer_height` | Layer thickness (mm) | 0.2 |
| `--max_overhang` | Max overhang angle (°) | 45 |
| `--iterations` | Optimization iterations | 100 |

## Algorithm

### Multi-Objective Optimization

```cpp
// Pseudocode for S³ optimization loop
void optimize(TetMesh& mesh, Weights w) {
    // Initialize rotation field
    QuaternionField R = initialize_rotations(mesh);

    for (int iter = 0; iter < max_iterations; iter++) {
        // Local step: compute target rotations per element
        for (Element& e : mesh.elements) {
            Quaternion R_sf = support_free_rotation(e);
            Quaternion R_sq = surface_quality_rotation(e);
            Quaternion R_sr = stress_alignment_rotation(e);

            R[e] = slerp_blend({R_sf, R_sq, R_sr},
                               {w.sf, w.sq, w.sr});
        }

        // Global step: deformation gradient assembly
        mesh.positions = solve_global_poisson(R);

        if (converged()) break;
    }
}
```

### Quaternion Blending

```cpp
Quaternion slerp_blend(vector<Quaternion> quats, vector<float> weights) {
    // Normalize weights
    float sum = accumulate(weights.begin(), weights.end(), 0.0f);
    for (float& w : weights) w /= sum;

    // Iterative SLERP
    Quaternion result = quats[0];
    float acc_weight = weights[0];

    for (int i = 1; i < quats.size(); i++) {
        float t = weights[i] / (acc_weight + weights[i]);
        result = slerp(result, quats[i], t);
        acc_weight += weights[i];
    }

    return result;
}
```

### Stress Analysis (SR Objective)

```cpp
Quaternion stress_alignment_rotation(Element& e, StressTensor& sigma) {
    // Compute principal stress directions
    Eigen::SelfAdjointEigenSolver<Matrix3d> solver(sigma[e]);
    Vector3d principal_dir = solver.eigenvectors().col(2);  // max eigenvalue

    // Rotation to align layer normal with principal stress
    Vector3d current_normal = e.layer_normal();
    return Quaternion::FromTwoVectors(current_normal, principal_dir);
}
```

## Output Format

S³ outputs:
1. **Deformed mesh:** `output/deformed.obj`
2. **Curved layers:** `output/layer_*.obj`
3. **G-code:** `output/toolpath.gcode`
4. **Visualization:** `output/preview.ply`

## Performance

| Model | Tetrahedra | Time | RAM |
|-------|------------|------|-----|
| Bunny | 50K | 15 min | 2 GB |
| Kitten | 100K | 45 min | 4 GB |
| Complex | 500K | 4 hours | 16 GB |

## Comparison

| Feature | S³ Slicer | S4 Slicer | CurviSlicer |
|---------|-----------|-----------|-------------|
| Multi-objective | ✓ | ✗ | ✗ |
| Stress analysis | ✓ | ✗ | ✗ |
| Setup difficulty | Hard | Easy | Medium |
| Performance | Fast (C++) | Medium | Slow |
| Maintenance | Research | Active | Archive |

## Troubleshooting

### CMake can't find libigl

```bash
cmake .. -DLIBIGL_DIR=/absolute/path/to/libigl
```

### Eigen version mismatch

```bash
# Use Eigen 3.4+
sudo apt install libeigen3-dev
```

### TetGen failures

Some meshes fail tetrahedralization:
- Ensure manifold input mesh
- Try `meshlab` to repair mesh first
- Reduce mesh complexity

## Resources

- [Original Paper (HAL)](https://inria.hal.science/hal-03971065v1)
- [GitHub Repository](https://github.com/zhangty019/S3_DeformFDM)
- [Algorithm Details](/docs/algorithms/mesh-deformation#s3-slicer-siggraph-asia-2022-best-paper)
