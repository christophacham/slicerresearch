---
sidebar_position: 4
title: FullControl
---

# FullControl G-Code Designer

Direct G-code design without traditional slicing.

**Repository:** `fullcontrol/`
**Author:** Andrew Gleadall (Loughborough University)
**License:** GPL-3.0
**Status:** Very Active

## Philosophy

> "FullControl is like Notepad for G-code. Design the manufacturing process, not just the geometry."

Instead of:
```
CAD Model → STL → Slicer → G-code
```

FullControl does:
```
Design Parameters → Python Script → G-code
```

## Quick Start

### Installation

```bash
pip install fullcontrol
```

### Hello World

```python
import fullcontrol as fc

# Define a simple spiral
steps = []
for z in range(100):
    angle = z * 0.1
    x = 50 + 20 * np.cos(angle)
    y = 50 + 20 * np.sin(angle)
    steps.append(fc.Point(x=x, y=y, z=z * 0.1))

# Generate G-code
fc.transform(steps, 'gcode', fc.GcodeControls(
    printer_name='generic',
    save_as='spiral.gcode'
))
```

## Core Concepts

### Design Objects

```python
# Point: a position in 3D space
fc.Point(x=50, y=50, z=10)

# Extruder: controls extrusion
fc.Extruder(on=True)
fc.Extruder(on=False)  # Travel move

# Fan: cooling control
fc.Fan(speed_percent=100)

# Hotend: temperature
fc.Hotend(temp=210)

# Printer: settings
fc.Printer(print_speed=1500, travel_speed=3000)
```

### Non-Planar Paths

```python
import numpy as np
import fullcontrol as fc

def dome_path(radius, layers):
    steps = []

    for i in range(layers):
        phi = np.pi/2 * i / layers  # Elevation angle
        z = radius * np.sin(phi)
        r = radius * np.cos(phi)

        # Circle at this height
        for theta in np.linspace(0, 2*np.pi, 100):
            x = 50 + r * np.cos(theta)
            y = 50 + r * np.sin(theta)
            steps.append(fc.Point(x=x, y=y, z=z))

    return steps

# Generate dome
dome = dome_path(radius=30, layers=50)
fc.transform(dome, 'gcode', fc.GcodeControls(save_as='dome.gcode'))
```

### Extrusion Control

```python
# Automatic extrusion calculation
fc.GcodeControls(
    extrusion_width=0.4,
    extrusion_height=0.2
)

# Manual extrusion
steps.append(fc.Extruder(relative_gcode=True))
steps.append(fc.Point(x=60, y=50, z=10))
steps.append(fc.ManualGcode(text="G1 E0.5 F100"))  # Manual E
```

## Advanced Features

### Variable Width/Height

```python
def variable_extrusion_path():
    steps = []

    for i in range(100):
        x = 50 + i * 0.5
        y = 50

        # Vary extrusion width along path
        width = 0.4 + 0.2 * np.sin(i * 0.1)
        steps.append(fc.ExtrusionGeometry(width=width, height=0.2))
        steps.append(fc.Point(x=x, y=y, z=10))

    return steps
```

### Multi-Material

```python
def multi_material_tower():
    steps = []

    for layer in range(50):
        z = layer * 0.2

        if layer % 10 < 5:
            steps.append(fc.Extruder(tool=0))  # Material A
        else:
            steps.append(fc.Extruder(tool=1))  # Material B

        # Layer path...
        steps.extend(square_layer(50, 50, 20, z))

    return steps
```

### Acceleration Control

```python
# Per-segment acceleration
steps.append(fc.Printer(print_speed=1500, acceleration=500))
steps.append(fc.Point(x=50, y=50, z=10))

# Change for next segment
steps.append(fc.Printer(acceleration=2000))
steps.append(fc.Point(x=60, y=50, z=10))
```

## Web Interface

Try FullControl without installation:

**https://fullcontrol.xyz/**

Features:
- Browser-based G-code generation
- Real-time 3D preview
- Export to any printer

## Comparison to Traditional Slicers

| Aspect | FullControl | Traditional Slicer |
|--------|-------------|-------------------|
| Input | Python code | STL file |
| Flexibility | Unlimited | Constrained |
| Learning curve | Steep | Easy |
| Non-planar | Native | Limited/fork |
| Reproducibility | Parametric | Manual |
| File size | ~1KB params | ~10MB G-code |

## Example: Helical Vase

```python
import fullcontrol as fc
import numpy as np

def helical_vase(height=100, radius=30, twist=2*np.pi):
    steps = []

    # Start sequence
    steps.append(fc.Printer(print_speed=1000))
    steps.append(fc.Hotend(temp=200, wait=True))
    steps.append(fc.Extruder(on=True))

    # Helical path
    for z in np.linspace(0, height, 1000):
        angle = (z / height) * twist
        r = radius * (1 - 0.3 * (z / height))  # Taper

        x = 50 + r * np.cos(angle)
        y = 50 + r * np.sin(angle)

        steps.append(fc.Point(x=x, y=y, z=z))

    # End sequence
    steps.append(fc.Extruder(on=False))
    steps.append(fc.Hotend(temp=0))

    return steps

vase = helical_vase()
fc.transform(vase, 'gcode', fc.GcodeControls(
    printer_name='prusa_i3',
    save_as='helical_vase.gcode'
))
```

## Resources

- [Official Documentation](https://fullcontrol.xyz/docs)
- [GitHub Repository](https://github.com/FullControlXYZ/fullcontrol)
- [Research Paper](/docs/papers/foundational#fullcontrol-g-code-designer-2021)
- [Tutorial Videos](https://youtube.com/@FullControlXYZ)
