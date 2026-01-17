# 2026-01-08: TCP Reference Design Guide - Getting Started with 5-Axis FDM Slicer

## Introduction

This guide provides a **concrete, actionable roadmap** for implementing Tool Center Point (TCP) functionality in a 5-axis FDM slicer. Unlike the comprehensive technical document, this focuses on **"do this, then this, then this"** with real code examples, project structures, and decision trees.

**Target Audience**: Developers with basic Python knowledge who want to build or extend a 5-axis FDM slicer.

**Time Commitment**: 8-14 weeks for full implementation, 2-4 weeks for MVP.

---

## Table of Contents

1. [Prerequisites & Setup](#prerequisites--setup)
2. [Absolute Beginner Path](#absolute-beginner-path)
3. [Reference Software Architecture](#reference-software-architecture)
4. [Minimal Viable Implementation (MVP)](#minimal-viable-implementation-mvp)
5. [Testing Without Hardware](#testing-without-hardware)
6. [Integration Strategies](#integration-strategies)
7. [Real-World Project Plan: Slicer6D Integration](#real-world-project-plan-slicer6d-integration)
8. [Code Templates & Examples](#code-templates--examples)
9. [Troubleshooting Guide](#troubleshooting-guide)

---

## Prerequisites & Setup

### Knowledge Requirements

**Essential** (must have):
- ✅ Python programming (functions, classes, numpy basics)
- ✅ Basic 3D geometry (vectors, matrices, rotations)
- ✅ Understanding of 3D printing fundamentals (G-code, extrusion, layer height)

**Helpful** (nice to have):
- ⭐ Linear algebra (matrix multiplication, transformations)
- ⭐ CAD software basics (STL files, mesh manipulation)
- ⭐ C++ (for performance-critical sections)

**Optional** (can learn along the way):
- 🔧 ROS/robotics kinematics
- 🔧 CNC machining concepts
- 🔧 Computational geometry (CGAL)

### Software Installation

**Day 1 Setup Checklist**:

```bash
# 1. Python 3.10+ with pip
python --version  # Should be 3.10 or higher

# 2. Core dependencies
pip install numpy scipy matplotlib trimesh pyvista

# 3. Clone slicerresearch repo (if not already done)
cd ~/code
git clone <your-slicerresearch-repo>
cd slicerresearch

# 4. LinuxCNC (for reference and testing)
# On Ubuntu/Debian:
sudo apt install linuxcnc

# On Windows, use WSL2 or a Linux VM

# 5. IDE with Python support
# Recommended: VS Code with Python extension
# Or PyCharm Community Edition

# 6. Optional: Jupyter for experiments
pip install jupyter notebook
```

### Hardware Requirements

**For Development** (no 5-axis printer needed initially):
- ✅ Standard PC (8GB RAM minimum, 16GB recommended)
- ✅ Linux or WSL2 on Windows (for LinuxCNC simulation)

**For Testing** (when ready):
- 🔧 5-axis 3D printer or retrofit kit
- 🔧 Klipper firmware with MAF support
- 🔧 OR access to LinuxCNC simulation

### Verify Installation

```bash
# Test Python imports
python3 << EOF
import numpy as np
import scipy
import trimesh
import pyvista
print("All dependencies OK!")
EOF

# Test LinuxCNC (on Linux)
linuxcnc --version

# Output should show version 2.8.x or higher
```

---

## Absolute Beginner Path

### Week 1: Foundation (8 hours)

**Objective**: Understand 5-axis FDM and TCP concepts.

#### Day 1-2: Theory (4 hours)

1. **Read overview documents**:
   ```bash
   # From slicerresearch repo
   cat slicerresearch/20260108-5axis-fdm-implementation-analysis.md
   cat slicerresearch/20260108-tcp-implementation-guide.md
   ```

2. **Watch introductory videos**:
   - Search YouTube: "5-axis 3D printing basics"
   - Search YouTube: "Tool Center Point CNC"
   - LinuxCNC 5-axis demos

3. **Key concepts to understand**:
   - What is TCP and why does it matter?
   - Difference between 3+2 positioning and continuous 5-axis
   - Coordinate systems: joint space vs tool space

**Checkpoint**: Can you explain in your own words why a G1 X10 command might move the machine to X9.3 in a 5-axis setup?

#### Day 3-4: Hands-On Exploration (4 hours)

1. **Run LinuxCNC 5-axis simulation**:
   ```bash
   cd /usr/share/doc/linuxcnc/examples/sample-configs/sim/axis/vismach/5axis
   linuxcnc xyzac-trt.ini
   ```

2. **Experiment with manual jogs**:
   - Jog X, Y, Z axes (observe tool tip movement)
   - Jog A, C axes (observe rotation)
   - Notice how TCP position shifts when rotating

3. **Load test G-code**:
   ```gcode
   ; Save as test_square.ngc
   G21 G90
   G1 X0 Y0 Z10 A0 C0 F1000
   G1 X10 Y0 Z10 A0 C0
   G1 X10 Y10 Z10 A15 C30
   G1 X0 Y10 Z10 A0 C0
   G1 X0 Y0 Z10 A0 C0
   M2
   ```

   Load in LinuxCNC, run, observe tool tip path.

**Checkpoint**: Can you successfully run LinuxCNC simulation and see the difference between joint motion and TCP motion?

### Week 2: Forward & Inverse Kinematics (12 hours)

**Objective**: Implement basic kinematics algorithms.

#### Exercise 1: Forward Kinematics (4 hours)

**File**: `week2_forward_kin.py`

```python
import numpy as np

def forward_kinematics_xyzac(x, y, z, a_deg, c_deg, tool_length):
    """
    Compute tool tip position from joint angles.

    Test with these values:
    - Input: (10, 10, 5, 0, 0, 50) -> Should output tip near (10, 10, 5)
    - Input: (10, 10, 5, 45, 0, 50) -> Should output tip shifted
    """
    # Convert degrees to radians
    a = np.radians(a_deg)
    c = np.radians(c_deg)

    # Rotation matrices
    R_x = np.array([
        [1, 0, 0],
        [0, np.cos(a), -np.sin(a)],
        [0, np.sin(a), np.cos(a)]
    ])

    R_z = np.array([
        [np.cos(c), -np.sin(c), 0],
        [np.sin(c), np.cos(c), 0],
        [0, 0, 1]
    ])

    # Combined rotation
    R_total = R_z @ R_x

    # Tool vector (pointing down initially)
    tool_vec_local = np.array([0, 0, -1])
    tool_vec = R_total @ tool_vec_local

    # Tool tip position
    tool_offset = tool_vec * tool_length
    tip_pos = np.array([x, y, z]) + tool_offset

    return tip_pos, tool_vec

# Test cases
if __name__ == "__main__":
    # Test 1: No rotation
    tip, vec = forward_kinematics_xyzac(10, 10, 5, 0, 0, 50)
    print(f"Test 1 - Tip: {tip}, Vec: {vec}")
    # Expected: Tip ≈ (10, 10, -45), Vec = (0, 0, -1)

    # Test 2: With A rotation
    tip, vec = forward_kinematics_xyzac(10, 10, 5, 45, 0, 50)
    print(f"Test 2 - Tip: {tip}, Vec: {vec}")
    # Expected: Tip shifted due to tool length and rotation

    # Test 3: With both A and C
    tip, vec = forward_kinematics_xyzac(10, 10, 5, 30, 45, 50)
    print(f"Test 3 - Tip: {tip}, Vec: {vec}")
```

**Assignment**:
1. Run this code
2. Verify results manually (use calculator or pen & paper for Test 1)
3. Plot tool tip positions for A = 0° to 90° in 10° increments

**Checkpoint**: Do your forward kinematics results match LinuxCNC's vismach visualization?

#### Exercise 2: Inverse Kinematics (4 hours)

**File**: `week2_inverse_kin.py`

```python
import numpy as np

def inverse_kinematics_xyzac(tip_pos, tool_vec, tool_length):
    """
    Compute joint angles from desired TCP.

    Test with:
    - Desired tip: (10, 10, 5), vec: (0, 0, -1)
    - Should output: (X, Y, Z, A≈0, C≈0)
    """
    kx, ky, kz = tool_vec
    px, py, pz = tip_pos

    # Solve rotary angles
    A_rad = np.arctan2(kz, np.sqrt(kx**2 + ky**2))
    C_rad = np.arctan2(-ky, kx)

    A_deg = np.degrees(A_rad)
    C_deg = np.degrees(C_rad)

    # Compute rotation matrices
    ca, sa = np.cos(A_rad), np.sin(A_rad)
    cc, sc = np.cos(C_rad), np.sin(C_rad)

    # Tool offset
    offset_x = -tool_length * (-sa * sc)
    offset_y = -tool_length * (-sa * cc)
    offset_z = -tool_length * ca

    # Joint positions
    X = px - offset_x
    Y = py - offset_y
    Z = pz - offset_z

    return (X, Y, Z, A_deg, C_deg)

# Verification function
def verify_ik_fk(tip_pos, tool_vec, tool_length):
    """Verify IK by running FK on result."""
    from week2_forward_kin import forward_kinematics_xyzac

    joints = inverse_kinematics_xyzac(tip_pos, tool_vec, tool_length)
    tip_check, vec_check = forward_kinematics_xyzac(*joints, tool_length)

    tip_error = np.linalg.norm(tip_check - tip_pos)
    vec_error = np.linalg.norm(vec_check - tool_vec)

    print(f"IK Result: {joints}")
    print(f"FK Verification - Tip error: {tip_error:.6f} mm, Vec error: {vec_error:.6f}")

    return tip_error < 0.01  # Pass if < 10 microns

# Test cases
if __name__ == "__main__":
    # Test 1: Tool pointing down
    tip = np.array([10.0, 10.0, 5.0])
    vec = np.array([0.0, 0.0, -1.0])
    assert verify_ik_fk(tip, vec, 50.0), "Test 1 failed!"

    # Test 2: Tool tilted
    vec_tilted = np.array([0.5, 0.3, -0.81])  # Must be normalized
    vec_tilted = vec_tilted / np.linalg.norm(vec_tilted)
    assert verify_ik_fk(tip, vec_tilted, 50.0), "Test 2 failed!"

    print("All IK tests passed!")
```

**Assignment**:
1. Implement inverse kinematics
2. Verify with forward kinematics (error < 0.01mm)
3. Test 10 random TCP configurations

**Checkpoint**: Can you convert any TCP position+orientation to joint coordinates and verify correctness?

#### Exercise 3: Interactive Visualization (4 hours)

**File**: `week2_visualize.py`

```python
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from week2_forward_kin import forward_kinematics_xyzac
from week2_inverse_kin import inverse_kinematics_xyzac

def visualize_tcp_path():
    """Visualize a TCP path in 3D."""
    fig = plt.figure(figsize=(12, 8))
    ax = fig.add_subplot(111, projection='3d')

    # Create a test path (arc)
    tcp_points = []
    for t in np.linspace(0, np.pi/2, 30):
        tip = np.array([10 * np.cos(t), 10 * np.sin(t), 5.0])
        vec = np.array([0.0, 0.0, -1.0])
        tcp_points.append((tip, vec))

    # Convert to joint coordinates
    joint_points = []
    for tip, vec in tcp_points:
        joints = inverse_kinematics_xyzac(tip, vec, 50.0)
        joint_points.append(joints)

    # Verify with forward kinematics
    verified_tips = []
    for joints in joint_points:
        tip_check, _ = forward_kinematics_xyzac(*joints, 50.0)
        verified_tips.append(tip_check)

    # Plot
    desired = np.array([p[0] for p in tcp_points])
    verified = np.array(verified_tips)

    ax.plot(desired[:, 0], desired[:, 1], desired[:, 2], 'b-', label='Desired TCP', linewidth=2)
    ax.plot(verified[:, 0], verified[:, 1], verified[:, 2], 'r--', label='Verified TCP', linewidth=1)
    ax.scatter(desired[0, 0], desired[0, 1], desired[0, 2], c='g', s=100, label='Start')
    ax.scatter(desired[-1, 0], desired[-1, 1], desired[-1, 2], c='r', s=100, label='End')

    ax.set_xlabel('X (mm)')
    ax.set_ylabel('Y (mm)')
    ax.set_zlabel('Z (mm)')
    ax.legend()
    ax.set_title('TCP Path: Desired vs Verified')

    plt.show()

if __name__ == "__main__":
    visualize_tcp_path()
```

**Assignment**:
1. Run visualization
2. Verify desired vs verified paths overlap (should be identical)
3. Modify to create a spiral path

**Checkpoint**: Can you visualize TCP paths and verify kinematics accuracy visually?

### Week 3: G-Code Generation (8 hours)

**Objective**: Generate 5-axis G-code from TCP toolpaths.

#### Exercise 4: Basic G-Code Generator (8 hours)

**File**: `week3_gcode_gen.py`

```python
import numpy as np
from week2_inverse_kin import inverse_kinematics_xyzac
from week2_forward_kin import forward_kinematics_xyzac

class GCodeGenerator:
    """Generate 5-axis G-code from TCP toolpaths."""

    def __init__(self, tool_length, default_feed_rate=3000):
        self.tool_length = tool_length
        self.default_feed_rate = default_feed_rate

    def tcp_to_gcode(self, tcp_path, output_file):
        """
        Convert TCP path to G-code.

        Args:
            tcp_path: List of (tip_pos, tool_vec, extrusion) tuples
            output_file: Output .gcode file path
        """
        with open(output_file, 'w') as f:
            # Header
            f.write("; 5-Axis FDM G-code\n")
            f.write("; Generated by TCP Slicer\n")
            f.write("G21 ; millimeters\n")
            f.write("G90 ; absolute positioning\n")
            f.write("M82 ; absolute extrusion\n")
            f.write("G28 ; home all axes\n")
            f.write("G1 Z5 F3000 ; safe height\n\n")

            # Convert TCP to joints
            prev_joints = None
            for i, (tip, vec, e_value) in enumerate(tcp_path):
                # Inverse kinematics
                joints = inverse_kinematics_xyzac(tip, vec, self.tool_length)

                # Compute feed rate
                if prev_joints:
                    feed = self._compute_feed_rate(prev_joints, joints, tip, prev_tip)
                else:
                    feed = self.default_feed_rate

                # Write G-code line
                if i == 0:
                    # First point, no extrusion
                    f.write(f"G1 X{joints[0]:.3f} Y{joints[1]:.3f} Z{joints[2]:.3f} "
                           f"A{joints[3]:.3f} C{joints[4]:.3f} F{feed:.1f}\n")
                else:
                    # Extrusion move
                    f.write(f"G1 X{joints[0]:.3f} Y{joints[1]:.3f} Z{joints[2]:.3f} "
                           f"A{joints[3]:.3f} C{joints[4]:.3f} E{e_value:.5f} F{feed:.1f}\n")

                prev_joints = joints
                prev_tip = tip

            # Footer
            f.write("\n; End of print\n")
            f.write("M104 S0 ; turn off hotend\n")
            f.write("M140 S0 ; turn off bed\n")
            f.write("M84 ; disable motors\n")

        print(f"G-code written to {output_file}")

    def _compute_feed_rate(self, prev_joints, curr_joints, curr_tip, prev_tip):
        """Compute feed rate with TCP compensation."""
        # TCP distance
        tcp_dist = np.linalg.norm(curr_tip - prev_tip)

        # Machine axis distance
        dx = curr_joints[0] - prev_joints[0]
        dy = curr_joints[1] - prev_joints[1]
        dz = curr_joints[2] - prev_joints[2]
        da = curr_joints[3] - prev_joints[3]
        dc = curr_joints[4] - prev_joints[4]

        machine_dist = np.sqrt(dx**2 + dy**2 + dz**2 + da**2 + dc**2)

        # Compensation
        if tcp_dist > 0.001:
            ratio = machine_dist / tcp_dist
            feed = self.default_feed_rate * ratio
        else:
            feed = self.default_feed_rate

        return feed

# Test
if __name__ == "__main__":
    # Create test TCP path (simple line)
    tcp_path = []
    for i in range(20):
        t = i / 19.0
        tip = np.array([10 + t * 10, 10, 5])
        vec = np.array([0, 0, -1])
        e = i * 0.1
        tcp_path.append((tip, vec, e))

    # Generate G-code
    gen = GCodeGenerator(tool_length=50.0)
    gen.tcp_to_gcode(tcp_path, "week3_test_output.gcode")

    print("Check week3_test_output.gcode")
```

**Assignment**:
1. Generate G-code for a simple straight line
2. Load in LinuxCNC simulator and verify
3. Generate G-code for an arc

**Checkpoint**: Can you generate valid 5-axis G-code that runs in LinuxCNC without errors?

---

## Reference Software Architecture

### Module Breakdown

```
tcp_slicer/
├── core/
│   ├── __init__.py
│   ├── kinematics.py          # Forward/inverse kinematics
│   ├── tcp_point.py           # Data structures (TCPPoint, JointPoint)
│   └── config.py              # Configuration management
│
├── slicing/
│   ├── __init__.py
│   ├── planar_slicer.py       # Traditional planar slicing
│   ├── conformal_slicer.py    # Geodesic/conformal slicing
│   └── path_optimizer.py      # Toolpath optimization
│
├── collision/
│   ├── __init__.py
│   ├── voxel_grid.py          # Voxel-based collision detection
│   └── swept_volume.py        # Swept volume calculation
│
├── gcode/
│   ├── __init__.py
│   ├── generator.py           # G-code generation
│   └── feedrate.py            # Feed rate compensation
│
├── utils/
│   ├── __init__.py
│   ├── mesh_io.py             # STL/OBJ loading
│   ├── visualization.py       # 3D plotting
│   └── validation.py          # Accuracy checking
│
└── tests/
    ├── test_kinematics.py
    ├── test_gcode.py
    └── test_integration.py
```

### Data Structures

**File**: `tcp_slicer/core/tcp_point.py`

```python
from dataclasses import dataclass
import numpy as np

@dataclass
class TCPPoint:
    """Point in TCP (tool) space."""
    position: np.ndarray        # (x, y, z) in mm
    orientation: np.ndarray     # (kx, ky, kz) normalized tool vector
    extrusion: float            # E value (mm³ or mm)
    metadata: dict = None       # Optional: layer, segment ID, etc.

    def __post_init__(self):
        # Validate
        assert self.position.shape == (3,), "Position must be 3D"
        assert self.orientation.shape == (3,), "Orientation must be 3D"

        # Normalize orientation
        norm = np.linalg.norm(self.orientation)
        if norm > 0:
            self.orientation = self.orientation / norm

@dataclass
class JointPoint:
    """Point in joint (machine) space."""
    x: float                    # Linear X (mm)
    y: float                    # Linear Y (mm)
    z: float                    # Linear Z (mm)
    a: float                    # Rotary A (degrees)
    c: float                    # Rotary C (degrees)
    e: float                    # Extrusion (mm³ or mm)
    f: float                    # Feed rate (mm/min)

    def to_gcode_line(self) -> str:
        """Convert to G-code line."""
        return (f"G1 X{self.x:.3f} Y{self.y:.3f} Z{self.z:.3f} "
                f"A{self.a:.3f} C{self.c:.3f} E{self.e:.5f} F{self.f:.1f}")
```

### Configuration Management

**File**: `tcp_slicer/core/config.py`

```python
from dataclasses import dataclass
from typing import Tuple

@dataclass
class MachineConfig:
    """5-axis machine configuration."""
    # Kinematics
    kinematics_type: str = "xyzac-trt"  # or "xyzbc-trt"
    tool_length: float = 50.0           # mm

    # Axis limits
    x_range: Tuple[float, float] = (-150, 150)
    y_range: Tuple[float, float] = (-150, 150)
    z_range: Tuple[float, float] = (0, 250)
    a_range: Tuple[float, float] = (-45, 45)
    c_range: Tuple[float, float] = (-180, 180)

    # Feed rates
    default_feed_rate: float = 3000     # mm/min
    max_feed_rate: float = 6000
    travel_feed_rate: float = 9000

    # Singularity handling
    singularity_threshold: float = 0.01
    singularity_perturbation: float = 1.0  # degrees

@dataclass
class SlicingConfig:
    """Slicing parameters."""
    layer_height: float = 0.2           # mm
    nozzle_diameter: float = 0.4        # mm
    extrusion_width: float = 0.45       # mm
    infill_density: float = 0.20        # 20%

    # Multi-axis specific
    enable_tcp: bool = True
    conformal_slicing: bool = False
    singularity_avoidance: bool = True
```

---

## Minimal Viable Implementation (MVP)

### MVP Scope (2-4 Weeks)

**What to include**:
- ✅ Forward/inverse kinematics (xyzac-trt only)
- ✅ Simple planar slicing (standard layers, no conformal)
- ✅ Basic G-code generation with TCP compensation
- ✅ Feed rate adjustment
- ✅ Basic singularity detection (warn only, no avoidance)

**What to skip** (add later):
- ❌ Collision detection
- ❌ Conformal slicing
- ❌ Advanced singularity avoidance
- ❌ GPU acceleration
- ❌ Multiple kinematics types

### MVP Project Structure

```
tcp_slicer_mvp/
├── kinematics.py       # Week 2 code
├── gcode_gen.py        # Week 3 code
├── slicer.py           # NEW: Main slicing logic
├── main.py             # NEW: CLI interface
└── test_cube.stl       # Test model
```

### MVP Main Slicer

**File**: `tcp_slicer_mvp/slicer.py`

```python
import numpy as np
import trimesh
from kinematics import inverse_kinematics_xyzac, forward_kinematics_xyzac
from gcode_gen import GCodeGenerator

class SimpleTCPSlicer:
    """Minimal viable 5-axis TCP slicer."""

    def __init__(self, tool_length=50.0, layer_height=0.2):
        self.tool_length = tool_length
        self.layer_height = layer_height
        self.gcode_gen = GCodeGenerator(tool_length)

    def slice_mesh(self, mesh_file):
        """Slice STL mesh into TCP toolpath."""
        # Load mesh
        mesh = trimesh.load(mesh_file)

        # Get bounds
        z_min, z_max = mesh.bounds[0][2], mesh.bounds[1][2]

        # Generate layers
        tcp_path = []
        for z in np.arange(z_min, z_max, self.layer_height):
            layer_path = self._slice_layer(mesh, z)
            tcp_path.extend(layer_path)

        return tcp_path

    def _slice_layer(self, mesh, z_height):
        """Slice single layer at z_height."""
        # Create cutting plane
        plane_origin = np.array([0, 0, z_height])
        plane_normal = np.array([0, 0, 1])

        # Intersect mesh with plane
        section = mesh.section(plane_origin=plane_origin,
                              plane_normal=plane_normal)

        if section is None:
            return []

        # Convert to 2D path
        path_2d, _ = section.to_planar()

        # Convert to 3D TCP points
        tcp_points = []
        e_value = 0.0
        for entity in path_2d.entities:
            points = path_2d.vertices[entity.points]
            for i, pt in enumerate(points):
                # 3D position (lift to z_height)
                position = np.array([pt[0], pt[1], z_height])

                # Tool always pointing down (simple version)
                orientation = np.array([0, 0, -1])

                # Extrusion (simple: constant per mm)
                if i > 0:
                    dist = np.linalg.norm(points[i] - points[i-1])
                    e_value += dist * 0.01  # 0.01 mm³/mm extrusion rate

                tcp_points.append((position, orientation, e_value))

        return tcp_points

    def generate_gcode(self, tcp_path, output_file):
        """Generate G-code from TCP path."""
        self.gcode_gen.tcp_to_gcode(tcp_path, output_file)

# Example usage
if __name__ == "__main__":
    slicer = SimpleTCPSlicer()
    path = slicer.slice_mesh("test_cube.stl")
    slicer.generate_gcode(path, "output_mvp.gcode")
    print(f"Sliced {len(path)} points")
```

### MVP CLI Interface

**File**: `tcp_slicer_mvp/main.py`

```python
import argparse
from slicer import SimpleTCPSlicer

def main():
    parser = argparse.ArgumentParser(description="Simple 5-Axis TCP Slicer")
    parser.add_argument("input", help="Input STL file")
    parser.add_argument("-o", "--output", default="output.gcode", help="Output G-code file")
    parser.add_argument("-l", "--layer-height", type=float, default=0.2, help="Layer height (mm)")
    parser.add_argument("-t", "--tool-length", type=float, default=50.0, help="Tool length (mm)")

    args = parser.parse_args()

    # Create slicer
    slicer = SimpleTCPSlicer(tool_length=args.tool_length,
                             layer_height=args.layer_height)

    # Slice
    print(f"Slicing {args.input}...")
    tcp_path = slicer.slice_mesh(args.input)
    print(f"Generated {len(tcp_path)} TCP points")

    # Generate G-code
    slicer.generate_gcode(tcp_path, args.output)
    print(f"G-code written to {args.output}")

if __name__ == "__main__":
    main()
```

### MVP Usage

```bash
# Slice a cube
python tcp_slicer_mvp/main.py test_cube.stl -o cube_5axis.gcode

# Custom layer height
python tcp_slicer_mvp/main.py test_cube.stl -o cube_fine.gcode -l 0.1

# Verify in LinuxCNC
linuxcnc xyzac-trt.ini
# Load cube_5axis.gcode
```

---

## Testing Without Hardware

### Strategy 1: LinuxCNC Vismach Simulation

**Setup**:

```bash
# 1. Install LinuxCNC
sudo apt install linuxcnc

# 2. Run 5-axis simulation
linuxcnc /usr/share/doc/linuxcnc/examples/sample-configs/sim/axis/vismach/5axis/xyzac-trt.ini

# 3. Load your generated G-code
# File -> Open -> Select cube_5axis.gcode

# 4. Observe in 3D visualization
# Press "Run" to simulate
```

**What to check**:
- ✅ Tool tip follows expected path
- ✅ No collision warnings
- ✅ Rotary axes stay within limits
- ✅ Feed rates are reasonable

### Strategy 2: Python Visualization

**File**: `tcp_slicer_mvp/visualize_gcode.py`

```python
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import re

def parse_gcode(gcode_file):
    """Parse G-code file into joint positions."""
    joints = []

    with open(gcode_file, 'r') as f:
        for line in f:
            if line.startswith('G1'):
                # Parse coordinates
                x = re.search(r'X([-\d.]+)', line)
                y = re.search(r'Y([-\d.]+)', line)
                z = re.search(r'Z([-\d.]+)', line)
                a = re.search(r'A([-\d.]+)', line)
                c = re.search(r'C([-\d.]+)', line)

                if x and y and z:
                    joints.append([
                        float(x.group(1)),
                        float(y.group(1)),
                        float(z.group(1)),
                        float(a.group(1)) if a else 0,
                        float(c.group(1)) if c else 0
                    ])

    return np.array(joints)

def visualize_gcode(gcode_file):
    """Visualize G-code in 3D."""
    joints = parse_gcode(gcode_file)

    fig = plt.figure(figsize=(14, 10))

    # Plot 1: Joint space (machine coordinates)
    ax1 = fig.add_subplot(121, projection='3d')
    ax1.plot(joints[:, 0], joints[:, 1], joints[:, 2], 'b-', linewidth=1)
    ax1.scatter(joints[0, 0], joints[0, 1], joints[0, 2], c='g', s=100, label='Start')
    ax1.scatter(joints[-1, 0], joints[-1, 1], joints[-1, 2], c='r', s=100, label='End')
    ax1.set_xlabel('X (mm)')
    ax1.set_ylabel('Y (mm)')
    ax1.set_zlabel('Z (mm)')
    ax1.set_title('Joint Space (Machine Coordinates)')
    ax1.legend()

    # Plot 2: TCP space (tool tip positions)
    from kinematics import forward_kinematics_xyzac

    tcp_positions = []
    for joint in joints:
        tip, _ = forward_kinematics_xyzac(*joint, tool_length=50)
        tcp_positions.append(tip)

    tcp_positions = np.array(tcp_positions)

    ax2 = fig.add_subplot(122, projection='3d')
    ax2.plot(tcp_positions[:, 0], tcp_positions[:, 1], tcp_positions[:, 2], 'r-', linewidth=1)
    ax2.scatter(tcp_positions[0, 0], tcp_positions[0, 1], tcp_positions[0, 2], c='g', s=100, label='Start')
    ax2.scatter(tcp_positions[-1, 0], tcp_positions[-1, 1], tcp_positions[-1, 2], c='r', s=100, label='End')
    ax2.set_xlabel('X (mm)')
    ax2.set_ylabel('Y (mm)')
    ax2.set_zlabel('Z (mm)')
    ax2.set_title('TCP Space (Tool Tip Path)')
    ax2.legend()

    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python visualize_gcode.py <gcode_file>")
    else:
        visualize_gcode(sys.argv[1])
```

**Usage**:

```bash
python tcp_slicer_mvp/visualize_gcode.py cube_5axis.gcode
```

### Strategy 3: Unit Tests

**File**: `tcp_slicer_mvp/tests/test_all.py`

```python
import unittest
import numpy as np
from kinematics import forward_kinematics_xyzac, inverse_kinematics_xyzac

class TestKinematics(unittest.TestCase):

    def test_fk_no_rotation(self):
        """Test forward kinematics with no rotation."""
        tip, vec = forward_kinematics_xyzac(10, 10, 5, 0, 0, 50)
        np.testing.assert_array_almost_equal(vec, [0, 0, -1])

    def test_ik_fk_roundtrip(self):
        """Test IK->FK round trip."""
        tip_desired = np.array([10, 10, 5])
        vec_desired = np.array([0, 0, -1])

        # IK
        joints = inverse_kinematics_xyzac(tip_desired, vec_desired, 50)

        # FK
        tip_actual, vec_actual = forward_kinematics_xyzac(*joints, 50)

        # Verify
        tip_error = np.linalg.norm(tip_actual - tip_desired)
        vec_error = np.linalg.norm(vec_actual - vec_desired)

        self.assertLess(tip_error, 0.001, "Tip error too large")
        self.assertLess(vec_error, 0.001, "Vec error too large")

    def test_ik_with_tilt(self):
        """Test IK with tool tilt."""
        tip = np.array([10, 10, 5])
        vec = np.array([0.5, 0, -0.866])  # 30° tilt
        vec = vec / np.linalg.norm(vec)

        joints = inverse_kinematics_xyzac(tip, vec, 50)

        # Verify
        tip_actual, vec_actual = forward_kinematics_xyzac(*joints, 50)
        tip_error = np.linalg.norm(tip_actual - tip)

        self.assertLess(tip_error, 0.001)

if __name__ == "__main__":
    unittest.main()
```

**Run tests**:

```bash
python -m unittest tcp_slicer_mvp/tests/test_all.py
```

**Expected output**:
```
...
----------------------------------------------------------------------
Ran 3 tests in 0.002s

OK
```

---

## Integration Strategies

### Option 1: Extend Slicer6D

**Advantages**:
- ✅ Existing codebase with mesh processing
- ✅ Conformal slicing algorithms already implemented
- ✅ Visualization tools (PyVista)

**Disadvantages**:
- ❌ May require understanding complex existing code
- ❌ AGPL license (must remain open-source)

**Integration Plan**:

```
Week 1: Study Slicer6D architecture
├── Read slicerresearch/Slicer6D/README.md
├── Run existing examples
└── Identify integration points

Week 2-3: Add TCP module
├── Create src/tcp_kinematics.py
├── Modify src/slicing/slicing.py
└── Update src/slicing/gcode_optimizer.py

Week 4: Testing & refinement
├── Test with sample models
├── Validate against LinuxCNC
└── Fix bugs
```

**Code Integration**:

```python
# slicerresearch/Slicer6D/src/tcp_kinematics.py

from core.tcp_point import TCPPoint, JointPoint
# ... (use your week2/week3 code)

# slicerresearch/Slicer6D/src/slicing/slicing.py

from tcp_kinematics import SimpleTCPSlicer

class Slicer6DWithTCP:
    def __init__(self, config):
        self.tcp_slicer = SimpleTCPSlicer(
            tool_length=config.tool_length
        )
        # ... existing init

    def slice_with_tcp(self, mesh):
        # Use existing conformal slicing
        conformal_path = self.conformal_slice(mesh)

        # Convert to TCP points
        tcp_path = self._convert_to_tcp(conformal_path)

        # Apply TCP kinematics
        joint_path = self.tcp_slicer.convert_to_joints(tcp_path)

        return joint_path
```

### Option 2: Standalone Slicer

**Advantages**:
- ✅ Full control over architecture
- ✅ Choose your own license
- ✅ Simpler codebase to maintain

**Disadvantages**:
- ❌ More work (implement slicing from scratch)
- ❌ Need to build community from zero

**Project Template**:

```
my_tcp_slicer/
├── setup.py
├── README.md
├── LICENSE
├── requirements.txt
├── src/
│   ├── __init__.py
│   ├── cli.py              # Command-line interface
│   ├── core/               # From week 2-3
│   ├── slicing/            # Implement planar/conformal
│   └── gui/                # Optional: PyQt5 GUI
├── tests/
│   └── test_*.py
└── examples/
    ├── test_models/
    └── generated_gcode/
```

### Option 3: Cura Plugin

**Advantages**:
- ✅ Large existing user base
- ✅ Mature slicing engine
- ✅ Good UI

**Disadvantages**:
- ❌ Plugin API limitations
- ❌ Must follow Cura architecture
- ❌ May not support 5-axis natively

**Plugin Structure**:

```
CuraTCPPlugin/
├── __init__.py
├── TCPProcessor.py        # Post-processor
├── plugin.json
└── README.md
```

**Post-Processor** (processes G-code after slicing):

```python
# CuraTCPPlugin/TCPProcessor.py

from UM.Logger import Logger
from cura.CuraApplication import CuraApplication

class TCPPostProcessor:
    def __init__(self):
        self.tcp_converter = SimpleTCPSlicer(tool_length=50)

    def execute(self, gcode_list):
        """Convert 3-axis G-code to 5-axis with TCP."""
        tcp_gcode = []

        for line in gcode_list:
            if line.startswith('G1'):
                # Parse, convert to TCP, regenerate
                converted = self._convert_line_to_tcp(line)
                tcp_gcode.append(converted)
            else:
                tcp_gcode.append(line)

        return tcp_gcode
```

### Recommendation

**For learning**: Start with Option 2 (Standalone Slicer MVP)
**For production**: Option 1 (Extend Slicer6D) - leverage existing conformal slicing
**For accessibility**: Option 3 (Cura Plugin) - but limited by plugin API

---

## Real-World Project Plan: Slicer6D Integration

### 14-Week Implementation Timeline

#### Phase 1: Foundation (Weeks 1-2)

**Week 1: Environment Setup & Study**

- [ ] Clone Slicer6D repository
- [ ] Install all dependencies
- [ ] Run existing Slicer6D examples
- [ ] Study architecture (deformer, slicing, visualization modules)
- [ ] Identify integration points for TCP

**Deliverable**: Architecture diagram showing where TCP code will integrate

**Week 2: Kinematics Implementation**

- [ ] Create `src/tcp/kinematics.py` module
- [ ] Implement forward kinematics (xyzac-trt)
- [ ] Implement inverse kinematics
- [ ] Write unit tests (>95% coverage)
- [ ] Verify against LinuxCNC results

**Deliverable**: Tested kinematics module with documentation

#### Phase 2: Core Integration (Weeks 3-6)

**Week 3: TCP Data Structures**

- [ ] Create `src/tcp/tcp_point.py` with TCPPoint/JointPoint classes
- [ ] Integrate with existing Slicer6D data flow
- [ ] Modify `src/slicing/slicing.py` to support TCP output
- [ ] Update visualization to show TCP paths

**Deliverable**: Modified Slicer6D with TCP data structures

**Week 4: G-Code Generation**

- [ ] Create `src/tcp/gcode_generator.py`
- [ ] Implement feed rate compensation
- [ ] Add singularity detection (warn only)
- [ ] Test G-code generation with simple paths

**Deliverable**: Working G-code generator for TCP paths

**Week 5-6: Conformal Slicing Integration**

- [ ] Connect existing conformal slicer output to TCP converter
- [ ] Test with hemisphere model (conformal + TCP)
- [ ] Validate dimensional accuracy
- [ ] Fix bugs and edge cases

**Deliverable**: End-to-end conformal slicing to 5-axis G-code

#### Phase 3: Enhancement (Weeks 7-10)

**Week 7-8: Singularity Handling**

- [ ] Implement singularity avoidance (perturbation method)
- [ ] Add alternative IK solution switching
- [ ] Test with near-vertical orientations
- [ ] Validate smooth motion through singular regions

**Deliverable**: Robust singularity handling

**Week 9-10: Collision Detection (Basic)**

- [ ] Implement simple bounding box collision
- [ ] Add warning system for potential collisions
- [ ] Test with complex geometries
- [ ] (Optional) Start voxel-based collision for Phase 4

**Deliverable**: Basic collision avoidance

#### Phase 4: Refinement (Weeks 11-14)

**Week 11-12: Testing & Validation**

- [ ] Test with 10+ diverse models
- [ ] Benchmark accuracy (±0.1mm target)
- [ ] Performance profiling and optimization
- [ ] Fix identified bugs

**Deliverable**: Stable, tested implementation

**Week 13: Documentation**

- [ ] User guide (how to use TCP features)
- [ ] Developer documentation (API reference)
- [ ] Example models and G-code
- [ ] Video tutorial

**Deliverable**: Complete documentation package

**Week 14: Release Preparation**

- [ ] Code cleanup and refactoring
- [ ] Final testing round
- [ ] Prepare GitHub release
- [ ] Announce to community

**Deliverable**: Public release v1.0

### Success Criteria

**Must Have** (MVP):
- ✅ Forward/inverse kinematics working correctly (< 0.01mm error)
- ✅ G-code generation from conformal paths
- ✅ Feed rate compensation
- ✅ Runs in LinuxCNC simulation without errors

**Should Have**:
- ✅ Singularity detection and warning
- ✅ Basic collision detection
- ✅ Documentation

**Nice to Have**:
- ⭐ Advanced singularity avoidance
- ⭐ GPU voxel collision detection
- ⭐ Multiple kinematics types (xyzbc, etc.)

### Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Kinematics bugs | Medium | High | Extensive unit testing, verification vs LinuxCNC |
| Integration complexity | High | Medium | Start with minimal changes, incremental integration |
| Performance issues | Low | Medium | Profile early, optimize critical paths |
| Singularity crashes | Medium | High | Conservative detection, fallback to warnings |

---

## Code Templates & Examples

### Template: Custom Kinematics Module

**File**: `tcp_slicer/core/kinematics_base.py`

```python
from abc import ABC, abstractmethod
import numpy as np

class KinematicsBase(ABC):
    """Base class for 5-axis kinematics."""

    def __init__(self, tool_length: float):
        self.tool_length = tool_length

    @abstractmethod
    def forward(self, joints: np.ndarray) -> tuple:
        """
        Compute TCP from joint coordinates.

        Args:
            joints: [X, Y, Z, A, C] in mm and degrees

        Returns:
            (tip_position, tool_vector)
        """
        pass

    @abstractmethod
    def inverse(self, tip_pos: np.ndarray, tool_vec: np.ndarray) -> np.ndarray:
        """
        Compute joint coordinates from TCP.

        Args:
            tip_pos: [x, y, z] nozzle tip position
            tool_vec: [kx, ky, kz] tool direction (normalized)

        Returns:
            joints: [X, Y, Z, A, C]
        """
        pass

    def validate_roundtrip(self, tip_pos, tool_vec, tol=0.001):
        """Validate IK->FK->IK round trip."""
        joints = self.inverse(tip_pos, tool_vec)
        tip_check, vec_check = self.forward(joints)

        tip_error = np.linalg.norm(tip_check - tip_pos)
        vec_error = np.linalg.norm(vec_check - tool_vec)

        return tip_error < tol and vec_error < tol
```

### Template: Configuration File

**File**: `config/machine_xyzac.yaml`

```yaml
machine:
  name: "Custom XYZAC Printer"
  kinematics: "xyzac-trt"
  tool_length: 50.0  # mm

  axes:
    x:
      min: -150
      max: 150
      max_velocity: 300  # mm/s
      max_acceleration: 3000  # mm/s²

    y:
      min: -150
      max: 150
      max_velocity: 300
      max_acceleration: 3000

    z:
      min: 0
      max: 250
      max_velocity: 50
      max_acceleration: 500

    a:
      min: -45
      max: 45
      max_velocity: 60  # deg/s
      max_acceleration: 180  # deg/s²

    c:
      min: -180
      max: 180
      max_velocity: 120
      max_acceleration: 360

slicing:
  layer_height: 0.2
  first_layer_height: 0.3
  nozzle_diameter: 0.4
  extrusion_width: 0.45
  infill_density: 0.20

  tcp:
    enable: true
    singularity_threshold: 0.01
    singularity_avoidance: "perturbation"  # or "solution_flip"
    collision_detection: false  # Enable when implemented

firmware:
  type: "klipper"  # or "linuxcnc", "marlin"
  tcp_mode: "pre_process"  # or "real_time"
```

**Loading config**:

```python
import yaml

def load_config(config_file):
    with open(config_file, 'r') as f:
        return yaml.safe_load(f)

config = load_config('config/machine_xyzac.yaml')
tool_length = config['machine']['tool_length']
```

---

## Troubleshooting Guide

### Common Issues

#### Issue 1: IK/FK Round Trip Errors

**Symptom**: `verify_ik_fk()` fails with large errors

**Cause**: Numerical precision, incorrect matrix multiplication order

**Solution**:
```python
# Check matrix multiplication order
R_total = R_z @ R_x  # NOT R_x @ R_z

# Use float64 explicitly
joints = np.array(joints, dtype=np.float64)

# Check normalization
tool_vec = tool_vec / np.linalg.norm(tool_vec)
```

#### Issue 2: G-Code Runs But Wrong Path

**Symptom**: LinuxCNC runs G-code but tool doesn't go where expected

**Cause**: Wrong tool length, incorrect IK implementation

**Debugging**:
```python
# Add debug output to G-code
f.write(f"; DEBUG: TCP tip={tip}, joints={joints}\n")

# Verify tool length matches machine
# Check LinuxCNC config: setp xyzac-trt-kins.tool-offset 50.0
```

#### Issue 3: Singularity Crashes

**Symptom**: Path planning fails near vertical orientations

**Solution**:
```python
# Add early detection
if abs(tool_vec[2]) > 0.99:  # Near vertical
    print("WARNING: Near singularity, perturbing...")
    tool_vec = perturb_away_from_singularity(tool_vec)
```

#### Issue 4: Feed Rate Too Fast/Slow

**Symptom**: Printer skips steps or prints too slowly

**Solution**:
```python
# Clamp feed rate
max_feed = config['machine']['axes']['x']['max_velocity'] * 60  # mm/min
adjusted_feed = min(adjusted_feed, max_feed)

# Debug: print feed rates
print(f"Segment {i}: TCP dist={tcp_dist:.3f}, Feed={feed:.1f}")
```

---

## Quick Reference Checklist

### Before You Start
- [ ] Python 3.10+ installed
- [ ] Dependencies installed (numpy, scipy, trimesh, pyvista)
- [ ] LinuxCNC accessible (native or WSL2)
- [ ] Slicerresearch repo cloned
- [ ] Test STL file ready

### Week 1 Checklist
- [ ] Understand TCP concept
- [ ] Run LinuxCNC 5-axis simulation
- [ ] Load test G-code successfully

### Week 2 Checklist
- [ ] Forward kinematics implemented
- [ ] Inverse kinematics implemented
- [ ] IK/FK round trip passes (error < 0.01mm)
- [ ] Visualization working

### Week 3 Checklist
- [ ] G-code generator implemented
- [ ] Feed rate compensation working
- [ ] Generated G-code runs in LinuxCNC

### MVP Checklist
- [ ] Can slice STL file
- [ ] Generates valid 5-axis G-code
- [ ] Runs without errors in LinuxCNC
- [ ] Visual verification looks correct

### Production Checklist
- [ ] Singularity handling implemented
- [ ] Collision detection (basic)
- [ ] Tested with 10+ models
- [ ] Documentation complete
- [ ] Unit tests passing

---

## Next Steps

1. **Start with Week 1** exercises (even if you think you understand)
2. **Don't skip verification** - IK/FK round trips are critical
3. **Test early, test often** - LinuxCNC simulation is your friend
4. **Join communities**:
   - LinuxCNC forum
   - RepRap forums
   - Discord servers for 3D printing development

5. **Document your journey** - future you will thank you

---

**Document Version**: 1.0
**Last Updated**: 2026-01-08
**Estimated Time**: 8-14 weeks full implementation, 2-4 weeks MVP
**Difficulty**: Intermediate (Python + math)
**Support**: Use GitHub issues in slicerresearch repo

**Good luck! You're building the future of 5-axis FDM printing! 🚀**
