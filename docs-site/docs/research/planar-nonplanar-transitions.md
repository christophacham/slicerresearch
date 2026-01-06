---
sidebar_position: 2
sidebar_label: Planar-Nonplanar Transitions
title: Handling Transitions Between Planar and Non-Planar Regions
description: Strategies for smoothly transitioning between flat and curved slicing layers in hybrid printing
keywords: [transition, planar, non-planar, deformation, field-based, hybrid, slicing]
---

# Handling Transitions Between Planar and Non-Planar Regions

CurviSlicer, S³-Slicer, and QuickCurve handle the transition between planar and non-planar regions by optimizing a continuous deformation field or a slicing surface that allows the layers to morph smoothly from a flat base to curved top-facing surfaces.

## Transition Strategies in Core Slicers

### CurviSlicer (SIGGRAPH 2019)

This algorithm utilizes a **volumetric mapping** from object space to slicing space, represented by a tetrahedral mesh. It handles transitions by **progressively curving and thickening layers** to avoid abrupt geometric changes that could cause sagging or structural defects.

**Key Techniques:**
- **"Verticalizing" side surfaces:** Side walls are inclined toward the vertical to minimize staircase errors
- **"Flattening" top surfaces:** Top surfaces are curved to match the model's geometry
- **Flat base constraint:** The bottom of the model remains flat to ensure stable build-plate adhesion
- **Progressive thickening:** Layers gradually increase in thickness to prevent structural defects

**Implementation approach:**
```rust
pub struct VolumetricMapping {
    /// Tetrahedral mesh representing the deformation
    tet_mesh: TetrahedralMesh,

    /// Mapping function M: original space → slicing space
    pub fn map_point(&self, p: Point3D) -> Point3D,

    /// Inverse mapping M⁻¹: slicing space → original space
    pub fn inverse_map_point(&self, p: Point3D) -> Point3D,

    /// Constraint: base must remain flat
    pub fn constrain_base(&mut self, z_min: f64),
}
```

**Papers:** [CurviSlicer_NYU_2019](/docs/papers/CurviSlicer_NYU_2019)

---

### S³-Slicer (SIGGRAPH Asia 2022)

This framework employs a **decoupled optimization** consisting of an inner loop for quaternion (rotation) compatibility and an outer loop for **scale-controlled deformation**.

**Key Techniques:**
- **Scale-compatibility term:** Penalizes radical changes in deformation gradients between neighboring regions
- **Smooth layer thickness:** Ensures variations remain smooth across the part
- **Adaptive slicing interface:** Inserts partial layers when curvature would violate hardware thickness limits
- **Region padding:** Effectively "pads" the transition between highly curved and flatter regions

**Implementation approach:**
```rust
pub struct ScaleControlledDeformation {
    /// Inner loop: quaternion field optimization
    quaternion_field: Vec<Quaternion>,

    /// Outer loop: ARAP-style deformation
    deformation: ArapDeformation,

    /// Scale compatibility energy
    pub fn compute_scale_energy(&self) -> f64 {
        // Penalize radical gradient changes
        self.neighboring_elements()
            .map(|(e1, e2)| {
                let grad_diff = self.deformation_gradient(e1) -
                                self.deformation_gradient(e2);
                grad_diff.norm_squared()
            })
            .sum()
    }

    /// Insert partial layers for hardware limits
    pub fn insert_adaptive_layers(&mut self, max_thickness: f64),
}
```

**Papers:** [S3_Slicer_SIGGRAPH_Asia_2022](/docs/papers/S3_Slicer_SIGGRAPH_Asia_2022)

---

### QuickCurve (2024)

Unlike the volumetric tetrahedral approach of its predecessors, QuickCurve optimizes a **single non-planar slicing surface**.

**Key Techniques:**
- **Gradient steepening:** In free regions, encourages the slice surface to become more vertical
- **Surface orthogonality:** Makes surfaces perpendicular to the input geometry to improve quality
- **Conformal exterior:** Exterior perfectly matches top surfaces
- **Concave/planar interior:** Interior can remain simple while exterior is curved

**Implementation approach:**
```rust
pub struct NonplanarSliceSurface {
    /// Height field representing the slicing surface
    height_field: Grid2D<f64>,

    /// Gradient steepening in free regions
    pub fn steepen_gradient(&mut self, region: &Region) {
        for point in region.interior_points() {
            let current_grad = self.gradient_at(point);
            let target_grad = Vec2::new(0.0, 0.0); // Vertical
            self.adjust_height(point, target_grad);
        }
    }

    /// Ensure orthogonality to input surface
    pub fn align_to_surface(&mut self, surface_normals: &[Vec3]),
}
```

**Papers:** [QuickCurve_2024_NonPlanar](/docs/papers/QuickCurve_2024_NonPlanar)

---

## Interfaces Supporting Hybrid Strategies

To support both planar and non-planar strategies within a single part, research identifies several digital and geometric interfaces:

### 1. Boolean Mesh Partitioning

A robust strategy involves creating a **"planar-only" mesh** by using a Boolean difference operation to subtract the space occupied by non-planar layers from the original model.

**Benefits:**
- Core of the part uses standard planar methods
- Conformally-offset "skin" mesh handles non-planar regions
- Clear separation of concerns

```rust
pub struct HybridSlicingStrategy {
    /// Boolean split: planar core + non-planar skin
    pub fn partition_mesh(&self, mesh: &Mesh) -> (Mesh, Mesh) {
        let skin_thickness = 3.0; // Top 3 layers
        let skin_mesh = mesh.extract_top_surface(skin_thickness);
        let core_mesh = mesh.boolean_difference(&skin_mesh);
        (core_mesh, skin_mesh)
    }

    /// Slice core with planar slicer
    pub fn slice_core(&self, core: &Mesh) -> Vec<PlanarLayer>,

    /// Slice skin with non-planar slicer
    pub fn slice_skin(&self, skin: &Mesh) -> Vec<CurvedLayer>,
}
```

### 2. Implicit Neural Fields (INF)

Modern neural slicers use a **unified implicit representation** (SDF) for both the model and the guidance field.

**Benefits:**
- Continuous mathematical interface
- Handles transitions for shell and infill simultaneously
- No resolution-dependent discretization errors

```rust
#[cfg(feature = "neural")]
pub struct UnifiedImplicitField {
    /// SDF for model geometry
    model_sdf: Box<dyn ImplicitSurface>,

    /// SDF for guidance field
    guidance_field: Box<dyn ScalarField>,

    /// Sample at any point - no discretization
    pub fn evaluate_at(&self, p: Point3D) -> (f64, f64) {
        (
            self.model_sdf.distance(p),
            self.guidance_field.value(p)
        )
    }
}
```

### 3. Rotation-Driven "Stitching"

S³-Slicer uses a **global blending step** that "stitches" locally rotated elements together into a single global shape.

**Benefits:**
- Different functional objectives can interface smoothly
- Strength alignment vs. surface quality in same volume
- Maintains continuity across objective boundaries

```rust
pub struct GlobalStitching {
    /// Local rotations per element
    local_rotations: HashMap<ElementId, Quaternion>,

    /// Stitch into coherent global shape
    pub fn stitch_elements(&self) -> GlobalDeformation {
        // Blend neighboring rotations smoothly
        let mut result = GlobalDeformation::identity();
        for (elem_id, quat) in &self.local_rotations {
            let neighbors = self.get_neighbors(elem_id);
            let blended = self.blend_rotations(quat, &neighbors);
            result.apply_rotation(elem_id, blended);
        }
        result
    }
}
```

### 4. Field-Based Hybrid Toolpathing

On individual layer interfaces, slicers employ a combination of strategies:

- **Directional-parallel:** Following stress or curvature lines
- **Contour-parallel:** Boundary-following for dense coverage

```rust
pub enum ToolpathStrategy {
    /// Follow stress/curvature lines
    DirectionalParallel {
        direction_field: VectorField,
    },

    /// Follow boundary contours
    ContourParallel {
        offset_distance: f64,
    },

    /// Hybrid: blend both strategies
    Hybrid {
        /// Use directional in interior
        interior: Box<ToolpathStrategy>,
        /// Use contour near boundaries
        boundary: Box<ToolpathStrategy>,
        /// Transition zone width
        blend_width: f64,
    },
}
```

---

## Implementation Strategy for LayerKit

Based on research, LayerKit should support transitions through a **trait-based strategy pattern**:

### Phase 1: Boolean Partitioning (MVP)
```rust
pub trait TransitionStrategy {
    /// Identify regions that need non-planar treatment
    fn identify_regions(&self, mesh: &Mesh) -> Vec<Region>;

    /// Partition mesh into planar and non-planar parts
    fn partition(&self, mesh: &Mesh) -> PartitionedMesh;
}

pub struct PartitionedMesh {
    pub planar_core: Mesh,
    pub nonplanar_skin: Option<Mesh>,
    /// Transition zone metadata
    pub transition_info: TransitionMetadata,
}
```

### Phase 2: Field-Based Blending
```rust
#[cfg(feature = "nonplanar")]
pub trait FieldBasedTransition {
    /// Compute smooth deformation field
    fn compute_field(&self, mesh: &Mesh) -> DeformationField;

    /// Validate hardware constraints
    fn validate_transition(&self, field: &DeformationField)
        -> Result<(), TransitionError>;

    /// Insert adaptive layers where needed
    fn insert_padding_layers(&self, layers: &mut Vec<LayerData>);
}
```

### Phase 3: Implicit Representations
```rust
#[cfg(feature = "implicit")]
pub trait ImplicitTransition {
    /// Unified SDF representation
    fn create_unified_field(&self, mesh: &Mesh) -> UnifiedField;

    /// Sample anywhere without discretization
    fn sample_at(&self, p: Point3D) -> TransitionState;
}

pub enum TransitionState {
    FullyPlanar,
    FullyNonplanar,
    Transitioning { blend_factor: f64 },
}
```

---

## Comparison: Transition Strategies

| Strategy | Smoothness | Complexity | Hardware Req | Use Case |
|----------|------------|------------|--------------|----------|
| **Boolean Partition** | Sharp boundary | Low | 3-axis | MVP hybrid |
| **Volumetric Mapping** | Very smooth | High (O(n³)) | 3-axis | Research quality |
| **Scale-Controlled** | Smooth | Very High | Multi-axis | Multi-objective |
| **Gradient Steepening** | Moderate | Medium (O(n)) | 3-axis | Fast preview |
| **Implicit Fields** | Perfect | Medium | Any | Future neural |

---

## Research Insights for Implementation

### Key Takeaways:

1. **Start Simple:** Boolean partitioning provides 80% of the benefit with 20% of the complexity
2. **Preserve Continuity:** Any transition strategy must maintain G1 continuity (tangent continuity)
3. **Hardware Awareness:** Transition zones must respect `max_slope`, `max_layer_height`, and collision constraints
4. **Incremental Refinement:** Can start with sharp transitions and progressively add smoothing

### Common Pitfalls to Avoid:

- ❌ **Discontinuous thickness:** Causes extrusion rate jumps
- ❌ **Unvalidated slopes:** Leads to nozzle collisions
- ❌ **Ignored adhesion zones:** Bottom layers must stay flat
- ❌ **Over-optimization:** Diminishing returns beyond simple blending

---

## Related Research Papers

- **CurviSlicer (2019):** Volumetric mapping approach
- **S³-Slicer (2022):** Scale-controlled deformation with adaptive layers
- **QuickCurve (2024):** Fast gradient steepening method
- **Reinforced FDM (2020):** Field relaxation in collision zones
- **Neural Slicer (2024):** Unified implicit representations

---

## Analogy for Understanding

Imagine a standard 3D print is like a **stack of stiff cardboard sheets**. To make it curved on top, you could simply cut the top sheets into curved shapes, but they wouldn't fit the sheets below.

These transition algorithms are like **steaming the stack of cardboard** until it becomes flexible. You can pull the top sheets into smooth curves to match a mold (the model surface) while the sheets at the bottom stay flat against the table.

The middle sheets naturally stretch and bend to fill the gap, ensuring there are no holes or sudden "snaps" in the structure.

---

## Next Steps

1. **Implement Boolean partitioning** as first transition strategy
2. **Add `TransitionStrategy` trait** to core architecture
3. **Validate with simple test models** (pyramid, dome, overhang)
4. **Benchmark transition smoothness** using surface roughness metrics
5. **Research adaptive layer insertion** for thickness constraints

---

## References

1. Etienne et al. (2019) - "CurviSlicer: Slightly curved slicing for 3-axis printers"
2. Zhang et al. (2022) - "S³-Slicer: A General Slicing Framework"
3. Ottonello et al. (2024) - "QuickCurve: revisiting slightly non-planar 3D printing"
4. Fang et al. (2020) - "Reinforced FDM: Multi-axis filament alignment"
