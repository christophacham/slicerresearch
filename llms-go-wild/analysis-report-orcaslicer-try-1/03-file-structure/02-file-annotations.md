# File Annotations

## Root Directory Files

### README.md
- Project documentation and overview
- Features, installation instructions, and community links
- License information and project history

### CMakeLists.txt
- Main CMake build configuration
- Defines build system, dependencies, and compilation flags
- Handles cross-platform builds (Windows, Linux, macOS)

### version.inc
- Version information for the application
- Contains version numbers and build metadata

### LICENSE.txt
- GNU Affero General Public License, version 3
- Legal terms for the open source project

### Build Scripts
- **build_release.bat**: Windows build script
- **build_linux.sh**: Linux build script
- **build_release_macos.sh**: macOS build script
- Handle platform-specific compilation and packaging

## Source Directory Structure

### src/OrcaSlicer.cpp
- Main application entry point
- CLI interface implementation
- Core application logic and initialization
- Handles command-line arguments and application flow
- Manages model loading, slicing, and G-code generation

### src/OrcaSlicer.hpp
- Main application header file
- Contains declarations for core application classes and functions

### src/libslic3r/
- Core slicing library implementation
- Contains all 3D printing algorithms and geometry processing

#### libslic3r/Print.cpp
- Print management and validation logic
- Handles multi-object printing and collision detection
- Manages extruder assignments and filament compatibility
- Implements sequential and layered printing validation
- Contains algorithms for print sequence optimization

#### libslic3r/Config.hpp and Config.cpp
- Configuration management system
- Handles all slicing parameters and settings
- Implements configuration validation and serialization

#### libslic3r/Model.cpp
- 3D model representation and manipulation
- Handles loading and processing of 3D models (STL, OBJ, AMF, 3MF)
- Manages model transformations and geometry operations

#### libslic3r/Layer.cpp
- Layer generation and management
- Implements slicing algorithms for converting 3D models to 2D layers
- Handles layer height calculations and variable layer heights

#### libslic3r/ExtrusionEntity.cpp
- Represents extrusion paths (perimeters, infill, support)
- Core data structure for G-code generation

#### libslic3r/Flow.cpp
- Flow rate calculations for extrusion
- Manages line width and extrusion multiplier settings

#### libslic3r/GCode/
- G-code generation system
- Contains various G-code writers and post-processors
- Handles different printer firmware types (Marlin, RepRap, etc.)

#### libslic3r/Support/
- Support structure generation algorithms
- Implements various support types (tree, organic, normal)

#### libslic3r/Fill/
- Infill pattern generation algorithms
- Implements various infill patterns (rectilinear, honeycomb, gyroid, etc.)

#### libslic3r/Geometry/
- Geometric algorithms and operations
- Polygon clipping, offsetting, and Boolean operations
- Uses Clipper library for polygon operations

#### libslic3r/Algorithm/
- Various algorithm implementations
- Path planning, optimization algorithms

#### libslic3r/Arachne/
- Advanced path planning algorithms
- Implements efficient perimeter and infill generation

#### libslic3r/SLA/
- Support for SLA (stereolithography) printing

### src/slic3r/
- GUI application layer built on top of libslic3r
- Contains wxWidgets-based user interface

#### src/slic3r/GUI/
- Graphical user interface implementation
- Contains 3D visualization, plater, and configuration panels
- OpenGL-based 3D rendering system

### deps/
- External dependencies build system
- Contains build scripts for third-party libraries

### deps_src/
- Source code for dependencies that are built as part of the project

### resources/
- Application resources (icons, presets, translations)
- Contains default printer/material/profile configurations

### localization/
- Internationalization files
- Contains translation files for multiple languages

### tests/
- Unit and integration tests
- Test framework for core functionality

### cmake/
- CMake modules and build utilities
- Custom find modules for dependencies

### scripts/
- Build and utility scripts
- Platform-specific build and deployment scripts

## Key Libraries and Dependencies

### Core Libraries
- **wxWidgets**: Cross-platform GUI framework
- **OpenGL/GLFW**: 3D rendering and visualization
- **Eigen3**: Linear algebra and mathematical operations
- **OpenVDB**: Volumetric data processing
- **OpenCASCADE**: CAD operations and geometry processing
- **Clipper**: Polygon clipping operations
- **libigl**: Geometry processing
- **Boost**: C++ utilities and extensions
- **Intel TBB**: Threading and parallel processing
- **Cereal**: Serialization library

### File Format Support
- **STL**: Standard Triangle Language format
- **OBJ**: Wavefront OBJ format
- **AMF**: Additive Manufacturing Format
- **3MF**: 3D Manufacturing Format
- **PNG**: Image format for thumbnails

### Build System
- **CMake**: Cross-platform build system
- **Ninja**: Fast build system (optional)
- **ccache**: Compilation cache (optional)