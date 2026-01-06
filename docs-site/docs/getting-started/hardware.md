---
sidebar_position: 3
title: Hardware Requirements
---

# Hardware Requirements

Non-planar printing has specific hardware needs depending on the approach.

## Printer Categories

### 3-Axis with Modified Toolhead

For simple non-planar (top surface finishing):

```
Requirements:
├── Long/tilted nozzle (40-50mm reach)
├── Clearance for 15-25° tilt angles
└── Standard Marlin/Klipper firmware
```

**Compatible Printers:**
- Any Cartesian/CoreXY with sufficient Z clearance
- Ender 3 (with nozzle extension)
- Prusa MK3/MK4 (limited angle)

**Limitations:**
- Maximum ~25° non-planar angle
- Top surfaces only
- Collision risk with printed part

### 5-Axis Systems

For full non-planar capability:

```
Requirements:
├── Tilting printhead OR tilting bed
├── 5-axis motion controller
├── Kinematics-aware firmware
└── Collision detection
```

**Controller Options:**
| Controller | Features |
|------------|----------|
| Duet3D | RepRapFirmware, kinematics plugins |
| LinuxCNC | Full 5-axis, industrial |
| Klipper | Community plugins available |

### Robotic Arms

For research and complex geometries:

- 6-DOF industrial arms (KUKA, ABB, UR)
- Custom end-effector with extruder
- ROS integration typical

## Firmware Configuration

### RepRapFirmware (Duet)

```gcode
; Enable 5-axis kinematics
M669 K10  ; Select 5-axis mode

; Define axis limits
M208 X-100:100 Y-100:100 Z0:300 U-45:45 V-45:45
```

### Klipper

```ini
[printer]
kinematics: corexy_5axis  ; Custom module required

[stepper_u]
# Tilt axis configuration
step_pin: ...
```

## G-code Compatibility

### Standard (3-axis)
```gcode
G1 X50 Y50 Z10.5 F3000 E1.5
```

### 5-Axis Extended
```gcode
G1 X50 Y50 Z10.5 U15.2 V-8.7 F3000 E1.5
; U = tilt around X, V = tilt around Y
```

### Robotic (6-axis)
```gcode
; Often uses custom M-codes or external protocols
M6000 X50 Y50 Z10.5 A15 B-8 C0 E1.5
```

## What You Can Do with Standard 3-Axis Printers

With a standard **3-axis 3D printer** (such as a Bambu, Ender, or Prusa), you can perform non-planar printing by utilizing **Active-Z printing**, where the X, Y, and Z axes move simultaneously during material deposition. While these machines lack the rotating heads of 5-axis systems, they can still dramatically improve surface finish on top-facing regions.

### Capabilities on Standard 3-Axis Machines
*   **Staircase Elimination:** You can remove the "stair-stepping" artifacts that typically plague surfaces with shallow slopes (angles below 20°).
*   **Smooth Surface Generation:** By having the nozzle follow the actual 3D contour of the model instead of flat slabs, you can achieve a "near-perfect" surface finish on curved tops.
*   **Aerodynamic/Functional Optimization:** You can print parts like **wings or airfoils** with smooth continuous skins, which improves fluid dynamics by eliminating the turbulence caused by traditional layer steps.
*   **Enhanced Strength:** Non-planar layers can bond multiple underlying planar layers together, potentially making the object's surface stronger.

### Hardware Considerations
To succeed on a standard 3-axis machine, the primary challenge is **collision avoidance**.
*   **Nozzle Geometry:** You ideally need a **long, pointy nozzle** to provide clearance. Standard bulky heater blocks or fan shrouds will often collide with already-printed material if the slopes are too steep.
*   **Angular Limits:** On a standard setup, non-planar printing is generally restricted to **low ramp angles** (typically up to 20°–30°) to prevent the flat underside of the nozzle from "gouging" or melting the part.

### Recommended Test Models for Verification
The sources suggest several benchmarks to verify if your slicer and hardware are handling non-planar moves correctly:

1.  **The 5°–10° Wedge:** This is the best model for verifying the elimination of the **staircase effect**. A planar print will show clear "bricks," while a non-planar print should show a single, smooth slope.
2.  **The Quarter Sphere / Sphere Cap:** This tests the algorithm's ability to handle **multi-faceted curves** where the Z-height changes constantly in all directions across the surface.
3.  **The NACA Airfoil (Wing Section):** This verifies **functional smoothness**. It is a standard test for aerodynamic performance where any stair-stepping is highly visible and detrimental.
4.  **Complex Mathematical Surface ($z = \sin x \cdot \cos y$):** Used to evaluate the slicer's ability to generate **collision-free toolpaths** across varying peaks and valleys.

## Recommended Setups by Budget

| Budget | Setup | Capability |
|--------|-------|------------|
| $0 | Simulation only | Full algorithm testing |
| $300 | Ender 3 + nozzle mod | Basic non-planar |
| $2000 | Duet-based 5-axis | Research-grade |
| $10000+ | Industrial 5-axis | Production |

## Safety Considerations

:::warning Collision Risk
Non-planar paths can collide with:
- Previously printed layers
- Print bed edges
- The toolhead itself

Always simulate before printing!
:::

## Simulation Tools

Before hardware:
1. **Repetier-Host** - Visualize G-code
2. **ncviewer.com** - Online G-code viewer
3. **PrusaSlicer Preview** - Layer inspection
4. **Custom PyVista scripts** - Full path visualization

## Next Steps

- [Algorithm Overview](/docs/algorithms/overview) - Understand the theory
- [Implementation Guides](/docs/implementations/overview) - Set up software
