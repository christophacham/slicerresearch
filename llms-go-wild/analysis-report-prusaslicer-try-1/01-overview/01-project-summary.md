# PrusaSlicer Project Summary

## Project Overview

PrusaSlicer is an open-source 3D printing software that takes 3D models (STL, OBJ, AMF) and converts them into G-code instructions for FFF (Fused Filament Fabrication) printers or PNG layers for mSLA (resin) 3D printers. It's compatible with any modern printer based on the RepRap toolchain, including those based on Marlin, Prusa, Sprinter, and Repetier firmware. It also works with Mach3, LinuxCNC, and Machinekit controllers.

The software is based on Slic3r by Alessandro Ranellucci and the RepRap community, developed by Prusa Research.

## Key Features

### Core Functionality
- **Multi-platform support**: Linux, macOS, and Windows
- **Command-line interface**: Complete CLI for headless operation
- **Multi-material printing**: Support for multiple extruders
- **Multiple G-code flavors**: RepRap, Makerbot, Mach3, Machinekit, etc.
- **Multi-object printing**: Multiple objects with distinct print settings
- **Multithreaded processing**: For faster slicing
- **STL auto-repair**: Tolerance for broken models
- **Unit testing**: Wide automated unit testing coverage

### Advanced Features
- **3D preview**: Including multi-material files
- **Multiple layer heights**: In a single print
- **Spiral vase mode**: For bumpless vases
- **Fine-grained configuration**: Speed, acceleration, extrusion width
- **Multiple infill patterns**: Honeycomb, spirals, Hilbert curves
- **Support structures**: Raft, brim, skirt
- **Multi-extruder support**: Standby temperature and automatic wiping
- **G-code macros**: Customizable macro language
- **Post-processing scripts**: Support for custom G-code processing
- **Cooling logic**: Fan speed and dynamic print speed control

## Technical Details

### Language and Architecture
- **Primary Language**: C++
- **Slicing Core**: `libslic3r` library (standalone)
- **GUI Framework**: wxWidgets
- **Build System**: CMake
- **OpenGL**: For 3D rendering
- **License**: GNU Affero General Public License (AGPLv3)

### Version Information
- **Current Version**: 2.9.4
- **Application Name**: PrusaSlicer
- **Build ID**: PrusaSlicer-2.9.4+UNKNOWN

## Development Information

### Building
- **Build System**: CMake (minimum version 3.13)
- **C++ Standard**: C++17
- **Cross-platform**: Windows, macOS, Linux
- **Dependencies**: Managed through CMake and bundled dependencies

### Contributing
- Issues can be added to the GitHub tracker
- Volunteer opportunities available for labeled issues
- Documentation available for building on different platforms

## Project Structure

The project follows a standard C++/CMake structure with:
- `src/` - Main source code
- `tests/` - Unit tests
- `resources/` - Icons, translations, and other resources
- `doc/` - Documentation
- `deps/` - Dependencies
- `cmake/` - CMake modules
- `bundled_deps/` - Bundled dependency sources
- `sandboxes/` - Development sandboxes