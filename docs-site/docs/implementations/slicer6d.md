---
sidebar_position: 5
title: Slicer6D
---

# Slicer6D

5-axis conformal slicing reference implementation.

**Repository:** `Slicer6D/`
**Author:** David Seyser
**Focus:** Multi-axis path planning with kinematics

## Overview

Slicer6D implements conformal slicing for 5-axis FDM printers, handling:
- Inverse kinematics for tilting head/bed
- Feed rate compensation for rotary axes
- Collision-aware path planning

## Setup

```bash
cd slicerresearch/Slicer6D

pip install -r requirements.txt
```

## Usage

```python
from slicer6d import Slicer, MachineConfig

# Define machine kinematics
config = MachineConfig(
    type='tilting_head',
    x_range=(-100, 100),
    y_range=(-100, 100),
    z_range=(0, 300),
    u_range=(-45, 45),  # Tilt around X
    v_range=(-45, 45),  # Tilt around Y
    tool_length=50
)

# Create slicer
slicer = Slicer(config)

# Load and slice model
slicer.load_mesh('model.stl')
slicer.slice(layer_height=0.2, conformal=True)

# Generate G-code
slicer.generate_gcode('output.gcode')
```

## Key Algorithms

### Conformal Slicing

Layers follow the surface of the part:

```python
def conformal_slice(mesh, base_surface):
    """
    Generate layers that conform to a base surface.
    """
    # Compute distance field from base
    distances = geodesic_distance(mesh, base_surface)

    # Extract iso-surfaces
    layers = []
    for d in np.arange(0, max(distances), layer_height):
        layer = extract_isosurface(mesh, distances, d)
        layers.append(layer)

    return layers
```

### Inverse Kinematics

Convert toolpath point + direction to machine coordinates:

```python
def inverse_kinematics(tip_pos, tip_dir, tool_length):
    """
    Compute machine axes from tip position and direction.

    Args:
        tip_pos: (x, y, z) nozzle tip position
        tip_dir: (nx, ny, nz) nozzle direction (normalized)
        tool_length: distance from rotation center to tip
    """
    nx, ny, nz = tip_dir

    # Compute rotary angles (ZYX Euler)
    v = np.arctan2(nx, nz)  # Rotation around Y
    u = np.arctan2(-ny, np.sqrt(nx**2 + nz**2))  # Around X

    # Adjust linear position for tool offset
    x = tip_pos[0] - tool_length * nx
    y = tip_pos[1] - tool_length * ny
    z = tip_pos[2] - tool_length * nz

    return x, y, z, np.degrees(u), np.degrees(v)
```

### Feed Rate Compensation

```python
def compensate_feedrate(segment, nominal_feed):
    """
    Adjust feedrate for rotary axis motion.
    """
    # Linear axis displacement
    dx = segment.end.x - segment.start.x
    dy = segment.end.y - segment.start.y
    dz = segment.end.z - segment.start.z

    # Rotary axis displacement (degrees)
    du = segment.end.u - segment.start.u
    dv = segment.end.v - segment.start.v

    # Machine axis distance
    axis_dist = np.sqrt(dx**2 + dy**2 + dz**2 + du**2 + dv**2)

    # Actual tip travel distance
    tip_dist = compute_arc_length(segment)

    # Compensation ratio
    ratio = axis_dist / tip_dist if tip_dist > 0 else 1.0

    return nominal_feed * ratio
```

## Machine Configurations

### Tilting Head

```
     ╔═══╗
     ║ U ║ ← Tilt axis
     ╚═╤═╝
       │
  ╔════╧════╗
  ║ V axis  ║
  ╚════╤════╝
       │
   [Nozzle]
```

### Tilting Bed

```
  [Fixed Head]
       │
       ▼
  ┌─────────┐
  │  Part   │
  └────┬────┘
    ╔══╧══╗
    ║ U/V ║
    ╚═════╝
```

## G-code Output

```gcode
; Slicer6D output
; Machine: tilting_head
; Layer height: 0.2mm

G28 ; Home
G1 Z5 F3000 ; Safe height

; Layer 1
G1 X50.0 Y50.0 Z0.2 U0.0 V0.0 F1500 E0.0
G1 X51.0 Y50.0 Z0.22 U2.5 V0.0 F1485 E0.05
G1 X52.0 Y50.0 Z0.25 U5.0 V-1.2 F1470 E0.10
...
```

## Integration with Firmware

### RepRapFirmware (Duet)

```gcode
; config.g
M669 K10  ; 5-axis mode

; Define axes
M584 X0 Y1 Z2 U3 V4
M208 X-100:100 Y-100:100 Z0:300 U-45:45 V-45:45
```

### Klipper

```ini
[printer]
kinematics: corexy_5axis  ; Custom module

[stepper_u]
step_pin: PE3
dir_pin: PE4
rotation_distance: 360  ; degrees per rotation
position_min: -45
position_max: 45
```

## Limitations

- Requires 5-axis hardware
- Limited to tilting head or bed configurations
- No support for full 6-DOF robotics
- Collision detection is basic

## Resources

- [GitHub Repository](https://github.com/DavidSeyserGit/Slicer6D)
- [Multi-Axis Algorithms](/docs/algorithms/multi-axis)
- [Hardware Guide](/docs/getting-started/hardware)
