# IMPORTANT-04: Five-Axis G-code Generation and Tool Path Strategies

**Created**: 2026-01-08
**Purpose**: Reference implementation for generating 5-axis G-code with support for both manual stepper mode (Fractal-5-Pro) and integrated kinematics mode (TCP/MAF)
**Fractal-Cortex Reference**: `slicing_functions.py:1124-1490` (write_5_axis_gcode)

---

## Executive Summary

5-axis G-code generation is fundamentally different from standard 3-axis printing. The key challenges are:

1. **Coordinate Transformation**: Converting chunk-local 2D paths to global 3D coordinates
2. **Rotary Motion Control**: Managing A and B axes (or equivalent rotary axes)
3. **Extrusion Calculation**: Accounting for 3D path length, not just 2D
4. **Feed Rate Adjustment**: Compensating for rotary motion contributions to actual nozzle velocity
5. **Safety Clearances**: Preventing collisions during axis transitions

**Two Approaches**:
- **Manual Stepper Mode** (Fractal-Cortex): Rotary axes moved discretely between chunks via firmware commands
- **Integrated Kinematics Mode** (TCP/MAF): Firmware handles 5-axis coordination in real-time

---

## 1. Fractal-Cortex Manual Stepper Approach

### 1.1 Algorithm Overview

**Reference**: `slicing_functions.py:1345-1380`

The Fractal approach uses **manual stepper commands** to position rotary axes between chunks, then prints each chunk using standard XYZ G-code:

```python
# For each chunk (lines 1345-1380):
for key in chunk_transform3DList:
    theta = BMOVE_Degrees[int(key)] * (np.pi/180.0)  # B axis angle
    phi = AMOVE_Degrees[int(key)] * (np.pi/180.0)    # A axis angle

    if key != '0':  # Not the first chunk
        # 1. Raise Z for clearance
        openFile.write(f"G0 F{G0Z_FEEDRATE} Z{nozzleHeight + 10.0}\n")

        # 2. Move XY out of the way
        openFile.write("G0 X0.0 Y-175.0\n")

        # 3. Rotate A and B axes (manual steppers)
        openFile.write(f'MANUAL_STEPPER STEPPER=stepper_a MOVE={AMOVE_Degrees[int(key)]} SPEED={ASPEED_Scaled[int(key)]} SYNC=0\n')
        openFile.write(f'MANUAL_STEPPER STEPPER=stepper_b MOVE={BMOVE_Degrees[int(key)]} SPEED={BSPEED_Scaled[int(key)]} SYNC=1 STOP_ON_ENDSTOP=2\n')

    # 4. Calculate Direction Cosine Matrix (DCM)
    QA = np.array([[np.cos(phi), -np.sin(phi), 0],
                   [np.sin(phi), np.cos(phi), 0],
                   [0, 0, 1]])
    QB = np.array([[1, 0, 0],
                   [0, np.cos(theta), -np.sin(theta)],
                   [0, np.sin(theta), np.cos(theta)]])
    DCM_AB = np.matmul(QB, QA)

    # 5. Transform all paths for this chunk
    printable_paths = transform_paths(chunk_paths, transform3DList, DCM_AB)

    # 6. Print using standard G0/G1 commands
    for layer in printable_paths:
        for path in layer:
            # Standard XYE commands (lines 1142-1160)
```

**Key Insight**: After rotary axes are positioned, the firmware sees the chunk as if it's flat in XY. All subsequent G-code is standard 3-axis.

### 1.2 Speed Calculation for A/B Axes

**Reference**: `slicing_functions.py:1281-1287`

Fractal calculates individual A and B speeds to maintain constant rotary feedrate:

```python
AB_FEEDRATE = 25.0  # degrees/second
ASPEED_Scaled = []
BSPEED_Scaled = []

for d in range(len(AMOVE_Degrees)):
    if d > 0:
        currentAMove_Relative = AMOVE_Degrees[d] - AMOVE_Degrees[d-1]
        currentBMove_Relative = BMOVE_Degrees[d] - BMOVE_Degrees[d-1]

        # Decompose diagonal motion into A and B components
        ABTheta = np.arctan2(currentBMove_Relative, currentAMove_Relative)
        ASPEED_Scaled.append(abs(AB_FEEDRATE * np.cos(ABTheta)))
        BSPEED_Scaled.append(abs(AB_FEEDRATE * np.sin(ABTheta)))
```

**Geometric Interpretation**:
```
For simultaneous A and B motion:
    Total angle change: Δ = √(ΔA² + ΔB²)
    Direction: θ = atan2(ΔB, ΔA)

    Speed components:
    speed_A = feedrate × cos(θ)
    speed_B = feedrate × sin(θ)

    Result: Both axes finish simultaneously
```

### 1.3 Coordinate Transformation Pipeline

**Reference**: `slicing_functions.py:1182-1207`

```python
def transform_paths_to_printable_orientation(layer_paths, transformation_matrices, DCM_AB):
    """
    Convert 2D layer paths to 3D coordinates in printer reference frame
    """
    printable_pathPoints = []
    midLayer_Z_Heights = []

    for layer_idx, (paths, transform) in enumerate(zip(layer_paths, transformation_matrices)):
        layerPaths = []

        for path in paths:
            # Step 1: Get 2D coordinates from sliced layer (chunk-local XY plane)
            coords_2d = np.array(path.coords)

            # Step 2: Transform to 3D (add Z, apply chunk transform)
            coords_3d = np.array([transform_point(point, transform) for point in coords_2d])

            # Step 3: Apply rotation to align with printer axes
            printable_coords_3d = np.array([np.matmul(DCM_AB, point3D) for point3D in coords_3d])

            # Step 4: Extract XY (Z is now just layer height)
            layerPaths.append([(point[0], point[1]) for point in printable_coords_3d])

        printable_pathPoints.append(layerPaths)
        midLayer_Z_Heights.append(printable_coords_3d[0][2])

    return printable_pathPoints, midLayer_Z_Heights
```

**Visual Pipeline**:
```
Chunk-Local 2D          Chunk 3D              Printer Global 3D        Output XYE
┌─────────┐            ┌─────────┐            ┌─────────┐            ┌─────────┐
│ (x, y)  │  +Z+Trans │ (X, Y, Z)│  ×DCM_AB  │ (X', Y', Z')         │ G1 X Y E│
│ 2D slice│  ───────> │  3D mesh │  ───────> │  Global  │ ───────> │  G-code │
│ contours│            │  coords  │            │  coords  │            │ commands│
└─────────┘            └─────────┘            └─────────┘            └─────────┘
    ↑                       ↑                       ↑
 (0,0) = chunk          Apply chunk            Rotated to
   center              alignment to            match AB
                       slice plane              angles
```

### 1.4 Extrusion Calculation

**Reference**: `slicing_functions.py:1150-1151`

Fractal uses **conservation of mass** to calculate extrusion:

```python
# Calculate 2D distance
s = ((X - previousX) ** 2 + (Y - previousY) ** 2) ** 0.5

# Calculate extrusion (conservation of mass)
E += ((4.0 * layerHeight * lineWidth * s) / (np.pi * (1.75**2)))
```

**Derivation**:
```
Volume extruded = Volume of deposited line

Filament:
    V_filament = π × (d/2)² × L
    where d = filament diameter (1.75mm), L = length

Deposited line (rectangular cross-section):
    V_deposited = height × width × length
    where height = layer_height, width = line_width, length = path_length

Setting equal:
    π × (d/2)² × L = h × w × s

Solving for L:
    L = (4 × h × w × s) / (π × d²)
```

**IMPORTANT LIMITATION**: Fractal's calculation uses 2D distance `s`, which **underestimates** extrusion for tilted paths. For true 5-axis, we need 3D distance:

```python
# CORRECTED 3D version:
s_3d = np.sqrt((X - previousX)**2 + (Y - previousY)**2 + (Z - previousZ)**2)
E += ((4.0 * layerHeight * lineWidth * s_3d) / (np.pi * (1.75**2)))
```

---

## 2. Integrated Kinematics Mode (TCP/MAF)

For printers with 5-axis kinematics in firmware (RepRapFirmware, RRF with Open5x, potential Klipper MAF), we can use **Tool Center Point (TCP)** control where firmware handles inverse kinematics.

### 2.1 G-code Structure with TCP

```gcode
; Enable TCP mode (RRF example)
M453 P4                    ; Set to CNC mode with 4th axis
G10 L2 P1 X0 Y0 Z50        ; Set TCP offset (nozzle tip relative to A axis pivot)

; Move with simultaneous linear + rotary
G1 X10 Y20 Z30 A45 B30 E1.5 F3000

; Firmware automatically:
; 1. Solves inverse kinematics
; 2. Coordinates all 5 axes to maintain TCP position/orientation
; 3. Adjusts feedrate for actual tool velocity
```

### 2.2 TCP Offset Configuration

```
                  Nozzle Tip (TCP)
                       ▼
                       ●
                       │
                       │ ← TCP offset
                       │    (typically 40-60mm)
    ╔══════════════════╧═══╗
    ║    Hotend Block      ║
    ╚══════════════════════╝
              │
              │ ← A-axis pivot point
              ●
```

**Configuration**:
```rust
pub struct TcpConfiguration {
    pub offset: Vec3,  // Nozzle tip relative to A-axis pivot
    pub mode: TcpMode,
}

pub enum TcpMode {
    /// RRF-style: Firmware handles kinematics
    FirmwareTcp { tool_offset: Vec3 },

    /// Manual: We calculate joint angles
    ManualIk {
        a_axis_origin: Vec3,
        b_axis_origin: Vec3,
    },
}
```

### 2.3 Inverse Kinematics for Manual IK Mode

If firmware doesn't support TCP, we must calculate A/B/C angles ourselves:

```rust
pub fn compute_joint_angles(
    tcp_position: Vec3,
    tcp_orientation: Vec3,  // Unit vector (nozzle direction)
    hardware: &HardwareConstraints,
) -> Result<JointAngles, IkError> {
    // For a typical A/B configuration (A = table rotation, B = nozzle tilt):

    // 1. B angle from nozzle orientation
    let b_angle = tcp_orientation.z.acos();  // Angle from vertical

    // 2. A angle from nozzle projection onto XY plane
    let xy_projection = Vec2::new(tcp_orientation.x, tcp_orientation.y);
    let a_angle = if xy_projection.length() > EPSILON {
        xy_projection.y.atan2(xy_projection.x)
    } else {
        0.0  // Nozzle is vertical, A angle is arbitrary
    };

    // 3. Calculate XYZ to achieve TCP position given AB angles
    // This requires forward kinematics + offset compensation
    let xyz = compensate_for_tcp_offset(tcp_position, a_angle, b_angle, hardware)?;

    Ok(JointAngles {
        x: xyz.x,
        y: xyz.y,
        z: xyz.z,
        a: a_angle,
        b: b_angle,
    })
}

fn compensate_for_tcp_offset(
    desired_tcp: Vec3,
    a_angle: f32,
    b_angle: f32,
    hardware: &HardwareConstraints,
) -> Result<Vec3, IkError> {
    // TCP offset rotates with AB axes
    let rotation = Mat3::from_rotation_z(a_angle) * Mat3::from_rotation_y(b_angle);
    let rotated_offset = rotation * hardware.tcp_offset;

    // XYZ position must be offset to place TCP at desired location
    Ok(desired_tcp - rotated_offset)
}
```

### 2.4 Feed Rate Adjustment

**Critical**: When rotary axes move, the TCP velocity is NOT the same as XYZ velocity.

```rust
pub fn calculate_effective_feedrate(
    from: &JointAngles,
    to: &JointAngles,
    desired_tcp_speed: f32,  // mm/s
    tcp_offset: Vec3,
) -> f32 {
    // Calculate TCP displacement
    let tcp_from = forward_kinematics(from, tcp_offset);
    let tcp_to = forward_kinematics(to, tcp_offset);
    let tcp_distance = (tcp_to - tcp_from).length();

    // Calculate time based on desired TCP speed
    let time = tcp_distance / desired_tcp_speed;

    // Calculate required XYZ feedrate
    let xyz_distance = (to.xyz() - from.xyz()).length();
    let xyz_feedrate = xyz_distance / time;

    xyz_feedrate
}

fn forward_kinematics(angles: &JointAngles, tcp_offset: Vec3) -> Vec3 {
    // Base position
    let base = angles.xyz();

    // Rotation from AB axes
    let rotation = Mat3::from_rotation_z(angles.a) * Mat3::from_rotation_y(angles.b);

    // TCP is at base + rotated offset
    base + rotation * tcp_offset
}
```

**Example**:
```
XYZ moves 10mm while AB rotates 30°
TCP offset = 50mm

TCP actually moves: √(10² + (50 × sin(30°))²) = √(100 + 625) ≈ 26.9mm

If we want 50mm/s TCP speed:
    Required XYZ feedrate = (10mm / 26.9mm) × 50mm/s = 18.6mm/s
```

---

## 3. Complete Rust Implementation

### 3.1 G-code Generator Trait

```rust
use glam::{Vec2, Vec3, Mat3, Mat4};

pub trait GcodeGenerator: Send + Sync {
    fn generate(&self, ctx: &GeneratorContext) -> Result<String, GcodeError>;
}

pub struct GeneratorContext {
    pub chunks: Vec<MeshChunk>,
    pub layer_data: Vec<Vec<LayerData>>,  // Indexed by [chunk][layer]
    pub hardware: HardwareConstraints,
    pub settings: PrintSettings,
}

pub struct MeshChunk {
    pub mesh: Arc<Mesh>,
    pub slice_plane: SlicePlane,
    pub chunk_id: usize,
    pub alignment_transform: Mat4,
}

pub struct HardwareConstraints {
    pub tcp_offset: Vec3,
    pub max_speeds: AxisSpeeds,
    pub rotary_mode: RotaryMode,
}

pub enum RotaryMode {
    ManualSteppers {
        a_axis_name: String,  // "stepper_a"
        b_axis_name: String,  // "stepper_b"
    },
    IntegratedKinematics {
        tcp_mode: TcpMode,
    },
}

pub struct PrintSettings {
    pub nozzle_temp: f32,
    pub bed_temp: f32,
    pub layer_height: f32,
    pub line_width: f32,
    pub print_speed: f32,
    pub travel_speed: f32,
    pub filament_diameter: f32,
    pub enable_retraction: bool,
    pub retraction_distance: f32,
}
```

### 3.2 Manual Stepper G-code Generator

```rust
pub struct ManualStepperGenerator {
    pub ab_feedrate: f32,  // degrees/second
}

impl GcodeGenerator for ManualStepperGenerator {
    fn generate(&self, ctx: &GeneratorContext) -> Result<String, GcodeError> {
        let mut gcode = String::new();

        // Header
        self.write_header(&mut gcode, ctx)?;

        // Calculate AB angles for each chunk
        let ab_angles = self.calculate_ab_angles(&ctx.chunks)?;
        let ab_speeds = self.calculate_ab_speeds(&ab_angles)?;

        // Body: For each chunk
        for (chunk_idx, chunk) in ctx.chunks.iter().enumerate() {
            gcode.push_str(&format!(";Chunk {}\n", chunk_idx));

            // Rotate AB axes if needed
            if chunk_idx > 0 {
                self.write_ab_rotation(
                    &mut gcode,
                    &ab_angles[chunk_idx],
                    &ab_speeds[chunk_idx],
                    ctx,
                )?;
            }

            // Calculate DCM for this chunk
            let dcm = self.calculate_dcm(&ab_angles[chunk_idx])?;

            // Print all layers for this chunk
            let layers = &ctx.layer_data[chunk_idx];
            for (layer_idx, layer) in layers.iter().enumerate() {
                self.write_layer(&mut gcode, layer, &dcm, chunk_idx, layer_idx, ctx)?;
            }
        }

        // Footer
        self.write_footer(&mut gcode, ctx)?;

        Ok(gcode)
    }
}

impl ManualStepperGenerator {
    fn calculate_ab_angles(&self, chunks: &[MeshChunk]) -> Result<Vec<AbAngles>, GcodeError> {
        chunks.iter().map(|chunk| {
            let normal = chunk.slice_plane.normal;

            // Convert normal to spherical coordinates
            let b_angle = normal.z.acos().to_degrees();  // Tilt from vertical
            let a_angle = if normal.x.abs() > EPSILON || normal.y.abs() > EPSILON {
                normal.y.atan2(normal.x).to_degrees()
            } else {
                0.0
            };

            Ok(AbAngles {
                a: a_angle,
                b: b_angle,
            })
        }).collect()
    }

    fn calculate_ab_speeds(&self, angles: &[AbAngles]) -> Result<Vec<AbSpeeds>, GcodeError> {
        let mut speeds = vec![AbSpeeds { a: self.ab_feedrate, b: self.ab_feedrate }];

        for i in 1..angles.len() {
            let delta_a = angles[i].a - angles[i-1].a;
            let delta_b = angles[i].b - angles[i-1].b;

            // Decompose diagonal motion (Fractal algorithm)
            let theta = delta_b.atan2(delta_a);
            let speed_a = (self.ab_feedrate * theta.cos()).abs();
            let speed_b = (self.ab_feedrate * theta.sin()).abs();

            speeds.push(AbSpeeds { a: speed_a, b: speed_b });
        }

        Ok(speeds)
    }

    fn write_ab_rotation(
        &self,
        gcode: &mut String,
        angles: &AbAngles,
        speeds: &AbSpeeds,
        ctx: &GeneratorContext,
    ) -> Result<(), GcodeError> {
        // Safety: Raise Z and move XY out of the way
        gcode.push_str(&format!("G0 Z{:.5} ; Clearance for rotation\n",
            ctx.settings.layer_height * 10.0));
        gcode.push_str("G0 X0.0 Y-175.0 ; Move out of rotation path\n");

        // Rotate A and B (Klipper MANUAL_STEPPER syntax)
        if let RotaryMode::ManualSteppers { a_axis_name, b_axis_name } = &ctx.hardware.rotary_mode {
            if speeds.a > EPSILON && speeds.b > EPSILON {
                // Simultaneous motion
                gcode.push_str(&format!(
                    "MANUAL_STEPPER STEPPER={} MOVE={:.5} SPEED={:.5} SYNC=0\n",
                    a_axis_name, angles.a, speeds.a
                ));
                gcode.push_str(&format!(
                    "MANUAL_STEPPER STEPPER={} MOVE={:.5} SPEED={:.5} SYNC=1 STOP_ON_ENDSTOP=2\n",
                    b_axis_name, angles.b, speeds.b
                ));
            } else if speeds.b > EPSILON {
                // B only
                gcode.push_str(&format!(
                    "MANUAL_STEPPER STEPPER={} MOVE={:.5} SPEED={:.5} SYNC=1 STOP_ON_ENDSTOP=2\n",
                    b_axis_name, angles.b, speeds.b
                ));
            } else if speeds.a > EPSILON {
                // A only
                gcode.push_str(&format!(
                    "MANUAL_STEPPER STEPPER={} MOVE={:.5} SPEED={:.5} SYNC=1\n",
                    a_axis_name, angles.a, speeds.a
                ));
            }
        }

        gcode.push_str(";A & B Axis Motion Complete\n");
        Ok(())
    }

    fn calculate_dcm(&self, angles: &AbAngles) -> Result<Mat3, GcodeError> {
        let phi = angles.a.to_radians();
        let theta = angles.b.to_radians();

        // Rotation about Z (A axis)
        let qa = Mat3::from_cols_array(&[
            phi.cos(), -phi.sin(), 0.0,
            phi.sin(),  phi.cos(), 0.0,
            0.0,        0.0,       1.0,
        ]);

        // Rotation about Y (B axis)
        let qb = Mat3::from_cols_array(&[
            1.0,  0.0,          0.0,
            0.0,  theta.cos(), -theta.sin(),
            0.0,  theta.sin(),  theta.cos(),
        ]);

        Ok(qb * qa)
    }

    fn write_layer(
        &self,
        gcode: &mut String,
        layer: &LayerData,
        dcm: &Mat3,
        chunk_idx: usize,
        layer_idx: usize,
        ctx: &GeneratorContext,
    ) -> Result<(), GcodeError> {
        gcode.push_str(&format!(";Layer {}\n", layer_idx));

        // Calculate Z height (including DCM transformation)
        let local_z = ctx.settings.layer_height * (layer_idx as f32 + 0.5);
        let global_pos = *dcm * Vec3::new(0.0, 0.0, local_z);
        let z_height = global_pos.z;

        gcode.push_str(&format!("G0 Z{:.5}\n", z_height));

        // Write perimeters
        for region in &layer.regions {
            self.write_contour(gcode, &region.contour, dcm, ctx)?;
        }

        // Write infill
        for region in &layer.regions {
            self.write_infill(gcode, &region.infill, dcm, ctx)?;
        }

        Ok(())
    }

    fn write_contour(
        &self,
        gcode: &mut String,
        contour: &ExPolygon,
        dcm: &Mat3,
        ctx: &GeneratorContext,
    ) -> Result<(), GcodeError> {
        let mut e = 0.0;
        let mut prev_pos: Option<Vec2> = None;

        for point in contour.outer.iter() {
            // Transform to global coordinates
            let local_3d = Vec3::new(point.x as f32, point.y as f32, 0.0);
            let global_3d = *dcm * local_3d;
            let pos = Vec2::new(global_3d.x, global_3d.y);

            if let Some(prev) = prev_pos {
                // Calculate extrusion
                let distance = (pos - prev).length();
                let extrusion = self.calculate_extrusion(distance, ctx);
                e += extrusion;

                // G1 command
                gcode.push_str(&format!(
                    "G1 X{:.5} Y{:.5} E{:.5}\n",
                    pos.x, pos.y, e
                ));
            } else {
                // G0 travel move
                gcode.push_str(&format!(
                    "G0 X{:.5} Y{:.5}\n",
                    pos.x, pos.y
                ));
            }

            prev_pos = Some(pos);
        }

        Ok(())
    }

    fn calculate_extrusion(&self, distance: f32, ctx: &GeneratorContext) -> f32 {
        let h = ctx.settings.layer_height;
        let w = ctx.settings.line_width;
        let d = ctx.settings.filament_diameter;

        // Conservation of mass: 4hwl / (πd²)
        (4.0 * h * w * distance) / (std::f32::consts::PI * d * d)
    }

    fn write_header(&self, gcode: &mut String, ctx: &GeneratorContext) -> Result<(), GcodeError> {
        gcode.push_str(";SLICER: Layered\n");
        gcode.push_str(";FIRMWARE: Klipper\n");
        gcode.push_str(";5-AXIS MODE: Manual Steppers\n");
        gcode.push_str("G28 ;Home all axes\n");
        gcode.push_str("home_ab ;Home A/B axes\n");
        gcode.push_str(&format!("M104 S{} ;Set nozzle temp\n", ctx.settings.nozzle_temp));
        gcode.push_str(&format!("M140 S{} ;Set bed temp\n", ctx.settings.bed_temp));
        gcode.push_str("M109 ;Wait for nozzle\n");
        gcode.push_str("M190 ;Wait for bed\n");
        gcode.push_str("G92 E0 ;Reset extruder\n");
        Ok(())
    }

    fn write_footer(&self, gcode: &mut String, ctx: &GeneratorContext) -> Result<(), GcodeError> {
        gcode.push_str(";FOOTER\n");
        gcode.push_str("G1 E-2.0 ;Retract\n");
        gcode.push_str("M104 S0 ;Turn off nozzle\n");
        gcode.push_str("M140 S0 ;Turn off bed\n");
        gcode.push_str("G28 X Y ;Home XY\n");

        // Return AB to zero
        if let RotaryMode::ManualSteppers { a_axis_name, b_axis_name } = &ctx.hardware.rotary_mode {
            gcode.push_str(&format!(
                "MANUAL_STEPPER STEPPER={} MOVE=0.0 SPEED=25.0 SYNC=0\n",
                a_axis_name
            ));
            gcode.push_str(&format!(
                "MANUAL_STEPPER STEPPER={} MOVE=0.0 SPEED=25.0 SYNC=1 STOP_ON_ENDSTOP=2\n",
                b_axis_name
            ));
        }

        gcode.push_str(";End of G-code\n");
        Ok(())
    }

    fn write_infill(
        &self,
        gcode: &mut String,
        infill: &InfillData,
        dcm: &Mat3,
        ctx: &GeneratorContext,
    ) -> Result<(), GcodeError> {
        // Similar to write_contour but for infill paths
        // Left as exercise - same transformation logic
        Ok(())
    }
}

#[derive(Debug, Clone)]
struct AbAngles {
    a: f32,  // degrees
    b: f32,  // degrees
}

#[derive(Debug, Clone)]
struct AbSpeeds {
    a: f32,  // degrees/second
    b: f32,  // degrees/second
}

const EPSILON: f32 = 1e-6;
```

### 3.3 Integrated Kinematics Generator

```rust
pub struct IntegratedKinematicsGenerator {
    pub tcp_mode: TcpMode,
}

impl GcodeGenerator for IntegratedKinematicsGenerator {
    fn generate(&self, ctx: &GeneratorContext) -> Result<String, GcodeError> {
        let mut gcode = String::new();

        // Header with TCP configuration
        self.write_header(&mut gcode, ctx)?;

        // For each chunk
        for (chunk_idx, chunk) in ctx.chunks.iter().enumerate() {
            gcode.push_str(&format!(";Chunk {}\n", chunk_idx));

            // For each layer
            let layers = &ctx.layer_data[chunk_idx];
            for (layer_idx, layer) in layers.iter().enumerate() {
                self.write_layer_with_tcp(&mut gcode, layer, chunk, layer_idx, ctx)?;
            }
        }

        self.write_footer(&mut gcode, ctx)?;

        Ok(gcode)
    }
}

impl IntegratedKinematicsGenerator {
    fn write_layer_with_tcp(
        &self,
        gcode: &mut String,
        layer: &LayerData,
        chunk: &MeshChunk,
        layer_idx: usize,
        ctx: &GeneratorContext,
    ) -> Result<(), GcodeError> {
        gcode.push_str(&format!(";Layer {}\n", layer_idx));

        // Calculate nozzle orientation for this chunk
        let nozzle_direction = chunk.slice_plane.normal;
        let (a_angle, b_angle) = self.normal_to_ab_angles(nozzle_direction)?;

        let mut e = 0.0;
        let mut prev_tcp: Option<Vec3> = None;

        // Write contours
        for region in &layer.regions {
            for point in region.contour.outer.iter() {
                // Transform to 3D TCP position
                let local_2d = Vec2::new(point.x as f32, point.y as f32);
                let tcp_pos = self.transform_to_tcp(local_2d, layer_idx, chunk, ctx)?;

                if let Some(prev) = prev_tcp {
                    // Calculate true 3D distance
                    let distance = (tcp_pos - prev).length();
                    let extrusion = self.calculate_extrusion(distance, ctx);
                    e += extrusion;

                    // Calculate effective feedrate
                    let feedrate = self.calculate_feedrate(
                        prev, tcp_pos,
                        ctx.settings.print_speed,
                        ctx
                    )?;

                    // G1 with 5 axes + E
                    gcode.push_str(&format!(
                        "G1 X{:.5} Y{:.5} Z{:.5} A{:.5} B{:.5} E{:.5} F{:.1}\n",
                        tcp_pos.x, tcp_pos.y, tcp_pos.z,
                        a_angle, b_angle,
                        e, feedrate
                    ));
                } else {
                    // G0 travel
                    gcode.push_str(&format!(
                        "G0 X{:.5} Y{:.5} Z{:.5} A{:.5} B{:.5}\n",
                        tcp_pos.x, tcp_pos.y, tcp_pos.z,
                        a_angle, b_angle
                    ));
                }

                prev_tcp = Some(tcp_pos);
            }
        }

        Ok(())
    }

    fn normal_to_ab_angles(&self, normal: Vec3) -> Result<(f32, f32), GcodeError> {
        let b_angle = normal.z.acos().to_degrees();
        let a_angle = if normal.x.abs() > EPSILON || normal.y.abs() > EPSILON {
            normal.y.atan2(normal.x).to_degrees()
        } else {
            0.0
        };

        Ok((a_angle, b_angle))
    }

    fn transform_to_tcp(
        &self,
        point_2d: Vec2,
        layer_idx: usize,
        chunk: &MeshChunk,
        ctx: &GeneratorContext,
    ) -> Result<Vec3, GcodeError> {
        // Add Z for this layer
        let local_z = ctx.settings.layer_height * (layer_idx as f32 + 0.5);
        let local_3d = Vec3::new(point_2d.x, point_2d.y, local_z);

        // Apply chunk alignment transform to get global position
        let global_4d = chunk.alignment_transform * local_3d.extend(1.0);

        Ok(global_4d.truncate())
    }

    fn calculate_feedrate(
        &self,
        from: Vec3,
        to: Vec3,
        desired_speed: f32,
        ctx: &GeneratorContext,
    ) -> Result<f32, GcodeError> {
        // For integrated kinematics, firmware handles this
        // Just use desired speed directly
        Ok(desired_speed * 60.0)  // Convert mm/s to mm/min
    }

    fn calculate_extrusion(&self, distance: f32, ctx: &GeneratorContext) -> f32 {
        let h = ctx.settings.layer_height;
        let w = ctx.settings.line_width;
        let d = ctx.settings.filament_diameter;

        // TRUE 3D distance (unlike Fractal's 2D approximation)
        (4.0 * h * w * distance) / (std::f32::consts::PI * d * d)
    }

    fn write_header(&self, gcode: &mut String, ctx: &GeneratorContext) -> Result<(), GcodeError> {
        gcode.push_str(";SLICER: Layered\n");
        gcode.push_str(";5-AXIS MODE: Integrated Kinematics (TCP)\n");
        gcode.push_str("G28 ;Home all axes\n");

        // Configure TCP offset (RRF syntax)
        let offset = ctx.hardware.tcp_offset;
        gcode.push_str(&format!(
            "G10 L2 P1 X{:.5} Y{:.5} Z{:.5} ;Set TCP offset\n",
            offset.x, offset.y, offset.z
        ));

        gcode.push_str(&format!("M104 S{} ;Set nozzle temp\n", ctx.settings.nozzle_temp));
        gcode.push_str(&format!("M140 S{} ;Set bed temp\n", ctx.settings.bed_temp));
        gcode.push_str("M109 ;Wait for nozzle\n");
        gcode.push_str("M190 ;Wait for bed\n");
        gcode.push_str("G92 E0 ;Reset extruder\n");
        Ok(())
    }

    fn write_footer(&self, gcode: &mut String, ctx: &GeneratorContext) -> Result<(), GcodeError> {
        gcode.push_str(";FOOTER\n");
        gcode.push_str("G1 E-2.0 ;Retract\n");
        gcode.push_str("M104 S0 ;Turn off nozzle\n");
        gcode.push_str("M140 S0 ;Turn off bed\n");
        gcode.push_str("G28 X Y A B ;Home all\n");
        gcode.push_str(";End of G-code\n");
        Ok(())
    }
}
```

---

## 4. Integration with Layered Pipeline

### 4.1 Adding G-code Generation Stage

In the existing Layered pipeline (ADR-006), add a new stage:

```rust
// In layerkit-core/src/pipeline/stages.rs

pub trait GcodeGenerator: Send + Sync {
    fn generate(&self, ctx: &GeneratorContext) -> PipelineResult<String>;
}

// Default implementation
pub struct StandardGcodeGenerator;

impl GcodeGenerator for StandardGcodeGenerator {
    fn generate(&self, ctx: &GeneratorContext) -> PipelineResult<String> {
        // Standard 3-axis G-code
        // ...existing implementation...
    }
}

// 5-axis implementations
pub struct ManualStepperGenerator { /* ... */ }
pub struct IntegratedKinematicsGenerator { /* ... */ }
```

### 4.2 Configuration

```rust
// In layerkit-config/src/lib.rs

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlicerConfig {
    pub slicer: SlicerType,
    pub gcode_generator: GcodeGeneratorType,
    // ...
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SlicerType {
    Planar,
    Multidirectional {
        chunk_planes: Vec<SlicePlane>,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GcodeGeneratorType {
    Standard,
    ManualSteppers {
        a_axis_name: String,
        b_axis_name: String,
        ab_feedrate: f32,
    },
    IntegratedKinematics {
        tcp_offset: Vec3,
    },
}
```

### 4.3 Usage Example

```rust
use layerkit_core::*;

fn main() -> Result<(), Box<dyn Error>> {
    let config = SlicerConfig {
        slicer: SlicerType::Multidirectional {
            chunk_planes: vec![
                SlicePlane { origin: Vec3::ZERO, normal: Vec3::Z },
                SlicePlane { origin: Vec3::new(0., 0., 20.), normal: Vec3::new(0., 0.707, 0.707) },
            ],
        },
        gcode_generator: GcodeGeneratorType::ManualSteppers {
            a_axis_name: "stepper_a".into(),
            b_axis_name: "stepper_b".into(),
            ab_feedrate: 25.0,
        },
        // ...
    };

    let pipeline = Pipeline::new(config)?;
    let mesh = load_mesh("model.stl")?;
    let gcode = pipeline.process(&mesh)?;

    std::fs::write("output.gcode", gcode)?;
    Ok(())
}
```

---

## 5. Testing Strategy

### 5.1 Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ab_angle_calculation() {
        let chunk = MeshChunk {
            slice_plane: SlicePlane {
                origin: Vec3::ZERO,
                normal: Vec3::new(0.0, 0.707, 0.707).normalize(),
            },
            // ...
        };

        let generator = ManualStepperGenerator { ab_feedrate: 25.0 };
        let angles = generator.calculate_ab_angles(&[chunk]).unwrap();

        assert_eq!(angles[0].a, 90.0);  // Points in +Y direction
        assert_eq!(angles[0].b, 45.0);  // 45° tilt
    }

    #[test]
    fn test_ab_speed_decomposition() {
        let angles = vec![
            AbAngles { a: 0.0, b: 0.0 },
            AbAngles { a: 30.0, b: 40.0 },  // Diagonal motion
        ];

        let generator = ManualStepperGenerator { ab_feedrate: 25.0 };
        let speeds = generator.calculate_ab_speeds(&angles).unwrap();

        // Speed components should satisfy: speed_a² + speed_b² ≈ feedrate²
        let total = (speeds[1].a.powi(2) + speeds[1].b.powi(2)).sqrt();
        assert!((total - 25.0).abs() < 0.01);
    }

    #[test]
    fn test_dcm_calculation() {
        let generator = ManualStepperGenerator { ab_feedrate: 25.0 };
        let angles = AbAngles { a: 0.0, b: 0.0 };

        let dcm = generator.calculate_dcm(&angles).unwrap();

        // Identity matrix for zero rotation
        assert_eq!(dcm, Mat3::IDENTITY);
    }

    #[test]
    fn test_extrusion_calculation() {
        let settings = PrintSettings {
            layer_height: 0.2,
            line_width: 0.4,
            filament_diameter: 1.75,
            // ...
        };

        let ctx = GeneratorContext {
            settings,
            // ...
        };

        let generator = ManualStepperGenerator { ab_feedrate: 25.0 };
        let e = generator.calculate_extrusion(10.0, &ctx);

        // Expected: (4 × 0.2 × 0.4 × 10) / (π × 1.75²) ≈ 0.332
        assert!((e - 0.332).abs() < 0.01);
    }

    #[test]
    fn test_tcp_offset_compensation() {
        let tcp_offset = Vec3::new(0.0, 0.0, 50.0);
        let a_angle = 0.0;
        let b_angle = 30.0_f32.to_radians();

        let hardware = HardwareConstraints {
            tcp_offset,
            // ...
        };

        let desired_tcp = Vec3::new(100.0, 100.0, 50.0);
        let xyz = compensate_for_tcp_offset(desired_tcp, a_angle, b_angle, &hardware).unwrap();

        // Verify forward kinematics gives desired TCP
        let actual_tcp = forward_kinematics(&JointAngles {
            x: xyz.x, y: xyz.y, z: xyz.z, a: a_angle, b: b_angle
        }, tcp_offset);

        assert!((actual_tcp - desired_tcp).length() < 0.01);
    }
}
```

### 5.2 Integration Tests

```rust
#[test]
fn test_simple_cube_5axis() {
    let mesh = create_cube(20.0);

    let config = SlicerConfig {
        slicer: SlicerType::Multidirectional {
            chunk_planes: vec![
                SlicePlane { origin: Vec3::ZERO, normal: Vec3::Z },
                SlicePlane { origin: Vec3::new(0., 0., 10.), normal: Vec3::new(0., 0.707, 0.707) },
            ],
        },
        gcode_generator: GcodeGeneratorType::ManualSteppers {
            a_axis_name: "stepper_a".into(),
            b_axis_name: "stepper_b".into(),
            ab_feedrate: 25.0,
        },
        // ...
    };

    let pipeline = Pipeline::new(config).unwrap();
    let gcode = pipeline.process(&mesh).unwrap();

    // Verify G-code structure
    assert!(gcode.contains("MANUAL_STEPPER"));
    assert!(gcode.contains("Chunk 0"));
    assert!(gcode.contains("Chunk 1"));
    assert!(gcode.contains("Layer 0"));
}

#[test]
fn test_collision_free_path() {
    // Test that generated G-code doesn't cause collisions
    // This requires collision detection from important-03

    let mesh = load_mesh("overhang_test.stl").unwrap();
    let pipeline = Pipeline::new(config).unwrap();
    let gcode = pipeline.process(&mesh).unwrap();

    // Parse G-code and verify collision-free
    let moves = parse_gcode(&gcode).unwrap();
    let collision_checker = NozzleBedChecker { min_clearance: 12.0 };

    for i in 1..moves.len() {
        let result = collision_checker.check_move(&moves[i-1], &moves[i], &hardware);
        assert!(matches!(result, CollisionResult::Safe));
    }
}
```

### 5.3 Property-Based Tests

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn test_extrusion_always_positive(
        distance in 0.1f32..100.0f32,
        layer_height in 0.1f32..0.4f32,
        line_width in 0.3f32..0.6f32,
    ) {
        let settings = PrintSettings {
            layer_height,
            line_width,
            filament_diameter: 1.75,
            // ...
        };

        let ctx = GeneratorContext { settings, /* ... */ };
        let generator = ManualStepperGenerator { ab_feedrate: 25.0 };
        let e = generator.calculate_extrusion(distance, &ctx);

        prop_assert!(e > 0.0);
        prop_assert!(e < distance * 10.0);  // Sanity check
    }

    #[test]
    fn test_dcm_is_orthogonal(
        a_angle in -180.0f32..180.0f32,
        b_angle in 0.0f32..90.0f32,
    ) {
        let generator = ManualStepperGenerator { ab_feedrate: 25.0 };
        let angles = AbAngles { a: a_angle, b: b_angle };
        let dcm = generator.calculate_dcm(&angles).unwrap();

        // Rotation matrices must be orthogonal: R^T × R = I
        let identity = dcm.transpose() * dcm;
        for i in 0..3 {
            for j in 0..3 {
                let expected = if i == j { 1.0 } else { 0.0 };
                prop_assert!((identity.col(i)[j] - expected).abs() < 0.001);
            }
        }
    }
}
```

---

## 6. Performance Optimization

### 6.1 Parallel G-code Generation

```rust
use rayon::prelude::*;

impl ManualStepperGenerator {
    fn generate_parallel(&self, ctx: &GeneratorContext) -> Result<String, GcodeError> {
        // Generate G-code for each chunk in parallel
        let chunk_gcode: Vec<String> = ctx.chunks.par_iter()
            .enumerate()
            .map(|(idx, chunk)| self.generate_chunk(idx, chunk, ctx))
            .collect::<Result<Vec<_>, _>>()?;

        // Combine with header/footer
        let mut result = String::new();
        self.write_header(&mut result, ctx)?;
        for chunk in chunk_gcode {
            result.push_str(&chunk);
        }
        self.write_footer(&mut result, ctx)?;

        Ok(result)
    }
}
```

### 6.2 G-code Compression

For large files, use run-length encoding or binary G-code:

```rust
pub fn compress_gcode(gcode: &str) -> Vec<u8> {
    // Remove comments and whitespace
    let cleaned: String = gcode.lines()
        .filter(|line| !line.starts_with(';'))
        .map(|line| line.trim())
        .collect::<Vec<_>>()
        .join("\n");

    // Use zlib compression
    use flate2::write::GzEncoder;
    use flate2::Compression;

    let mut encoder = GzEncoder::new(Vec::new(), Compression::best());
    encoder.write_all(cleaned.as_bytes()).unwrap();
    encoder.finish().unwrap()
}
```

---

## 7. Common Pitfalls and Solutions

### 7.1 Incorrect Extrusion for Tilted Layers

**Problem**: Using 2D distance underestimates extrusion for non-planar paths.

**Solution**: Always calculate TRUE 3D distance:

```rust
// WRONG (Fractal's approach):
let distance_2d = ((to.x - from.x).powi(2) + (to.y - from.y).powi(2)).sqrt();

// CORRECT:
let distance_3d = (to - from).length();
```

### 7.2 Feed Rate Doesn't Account for Rotary Motion

**Problem**: When A/B axes move, TCP velocity differs from XYZ velocity.

**Solution**: Use TCP-based feedrate calculation (section 2.4).

### 7.3 Gimbal Lock at B=0° or B=90°

**Problem**: At vertical orientations, A angle becomes undefined.

**Solution**: Detect singularities and use minimum angular change:

```rust
fn calculate_ab_angles_safe(normal: Vec3, prev_a: f32) -> AbAngles {
    let b_angle = normal.z.acos().to_degrees();

    let a_angle = if b_angle < 1.0 || b_angle > 179.0 {
        // Near singularity - maintain previous A angle
        prev_a
    } else {
        normal.y.atan2(normal.x).to_degrees()
    };

    AbAngles { a: a_angle, b: b_angle }
}
```

### 7.4 Collision During AB Transition

**Problem**: Nozzle collides with part when rotating between chunks.

**Solution**: Always raise Z and move XY to safe position before rotating (see section 3.2).

---

## 8. Future Enhancements

### 8.1 Variable Speed for Rotary Axes

Adjust AB feedrate based on printed geometry complexity:

```rust
fn calculate_adaptive_ab_feedrate(chunk: &MeshChunk) -> f32 {
    let complexity = estimate_chunk_complexity(chunk);

    // Slower for complex chunks (tight curves, small features)
    let base_feedrate = 25.0;
    base_feedrate / (1.0 + complexity * 0.5)
}
```

### 8.2 Preview of AB Motion

Generate visualization of rotary axis motion for UI:

```rust
pub fn generate_ab_preview(chunks: &[MeshChunk]) -> Vec<RotaryKeyframe> {
    // For timeline UI showing when axes rotate
    chunks.iter().enumerate().map(|(idx, chunk)| {
        RotaryKeyframe {
            time: idx as f32,
            a_angle: calculate_a_angle(chunk),
            b_angle: calculate_b_angle(chunk),
        }
    }).collect()
}
```

### 8.3 G-code Simulation

Before printing, simulate the G-code to verify:

```rust
pub fn simulate_gcode(gcode: &str, hardware: &HardwareConstraints) -> SimulationResult {
    let moves = parse_gcode(gcode)?;
    let mut state = PrinterState::default();

    for mv in moves {
        // Check collisions
        let collision = check_all_collisions(&state, &mv, hardware);

        // Update state
        state.update(&mv);
    }

    Ok(SimulationResult { /* ... */ })
}
```

---

## 9. References

### Papers
- Dai et al., "Support-Free Volume Printing by Multi-Axis Motion" (2018)
- Pan et al., "5-Axis Printing of Curved Surfaces" (2020)

### Firmware Documentation
- Klipper Manual Steppers: https://www.klipper3d.org/G-Codes.html#manual_stepper
- RepRapFirmware TCP: https://docs.duet3d.com/en/User_manual/Reference/Gcodes#g10

### Code References
- **Fractal-Cortex**: `slicing_functions.py:1124-1490` (5-axis G-code generation)
- **Layered**: ADR-006 (pipeline stages), ADR-007 (data model)

### Libraries
- `glam`: Vector/matrix math
- `rayon`: Parallel iteration
- `flate2`: G-code compression

---

## Conclusion

5-axis G-code generation requires careful coordinate transformation, rotary motion control, and collision avoidance. The **manual stepper approach** (Fractal-Cortex) is simpler to implement but requires firmware modifications. The **integrated kinematics approach** (TCP/MAF) requires complex firmware support but enables smoother, more efficient printing.

Layered's trait-based architecture makes it straightforward to support both modes via different `GcodeGenerator` implementations. The key algorithms are:

1. **Chunk decomposition** → Identifies print regions (important-01)
2. **Coordinate transformation** → Aligns chunks for slicing (important-02)
3. **Collision detection** → Ensures safe motion (important-03)
4. **G-code generation** → Outputs machine commands (this document)

With these four systems, Layered can become a production-ready 5-axis slicer.
