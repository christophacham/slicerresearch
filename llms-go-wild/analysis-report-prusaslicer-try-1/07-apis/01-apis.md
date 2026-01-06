# PrusaSlicer APIs

## Overview
PrusaSlicer provides multiple API interfaces for interacting with the slicing functionality, primarily through a command-line interface and programmatic C++ APIs through the libslic3r library.

## Command-Line Interface (CLI)

### Main CLI Components
- **CLI.hpp**: Main CLI header with core definitions
- **CLI_DynamicPrintConfig.hpp**: Dynamic print configuration for CLI operations
- **Run.cpp**: Main CLI execution logic
- **Setup.cpp**: CLI setup and initialization
- **ProcessActions.cpp**: Processing CLI actions and commands
- **ProcessTransform.cpp**: Processing transformation operations
- **LoadPrintData.cpp**: Loading print data functionality
- **PrintHelp.cpp**: Help text generation and display

### CLI Functionality
- **ProfilesSharingUtils.cpp/hpp**: Profile sharing utilities for CLI
- **GuiParams.cpp**: GUI parameters handling for CLI operations

### CLI Commands and Actions
The CLI supports various operations including:
- Slicing 3D models to G-code
- Transforming models (rotation, scaling, positioning)
- Managing print configurations and presets
- Exporting and importing configurations
- Batch processing operations

## Programmatic APIs (libslic3r)

### Core Library Interface
The libslic3r library provides a C++ API for all core slicing functionality:

#### Model Processing API
- **Model.cpp/hpp**: 3D model loading, processing, and manipulation API
- **TriangleMesh.cpp/hpp**: Mesh processing and validation API
- **FileReader.cpp/hpp**: File format reading API (STL, OBJ, AMF, etc.)

#### Slicing API
- **Slicing.cpp/hpp**: Core slicing algorithm API
- **SlicingAdaptive.cpp/hpp**: Adaptive slicing API
- **Layer.cpp/hpp**: Layer generation API
- **Print.cpp/hpp**: Print job creation and management API

#### Configuration API
- **Config.cpp/hpp**: Generic configuration API
- **PrintConfig.cpp/hpp**: Print-specific configuration API
- **Preset.cpp/hpp**: Preset management API
- **PresetBundle.cpp/hpp**: Preset bundle management API

#### G-code Generation API
- **GCode.cpp/hpp**: G-code generation API
- **CustomGCode.cpp/hpp**: Custom G-code handling API
- **Flow.cpp/hpp**: Flow rate calculation API
- **Extruder.cpp/hpp**: Extruder configuration API

#### Support Generation API
- **SupportSpotsGenerator.cpp/hpp**: Support generation API
- **Support/**: Directory with comprehensive support generation APIs

#### Fill Pattern API
- **Fill/**: Directory containing various fill pattern generation APIs
- Multiple infill pattern algorithms available programmatically

## Library Structure

### libslic3r Public Interface
The library is designed to be used as a standalone component:

- **libslic3r.h**: Main public header file
- **libslic3r_version.h.in**: Version information header template
- **pchheader.cpp/pchheader.hpp**: Precompiled header for faster compilation

### Key API Classes
- **Model**: Represents 3D models and their processing
- **Print**: Manages print jobs and their execution
- **ConfigBase**: Base configuration class for all settings
- **TriangleMesh**: Handles mesh processing and validation
- **GCodeProcessor**: G-code generation and processing
- **Slicer**: Core slicing functionality

## Integration Points

### GUI Integration
The GUI layer (src/slic3r/GUI/) builds on top of the libslic3r APIs to provide the user interface, demonstrating how the core APIs can be used.

### CLI Integration
The CLI layer (src/CLI/) uses the same core APIs to provide command-line functionality, showing another integration approach.

## File Format APIs

### Input Formats
- STL (binary and ASCII)
- OBJ format
- AMF format
- 3MF format support

### Output Formats
- G-code for FFF printers
- PNG layers for SLA printers
- Configuration files

## Configuration System API

### Dynamic Configuration
- **Config.cpp/hpp**: Runtime configuration modification
- **DynamicPrintConfig**: Dynamic configuration for print parameters
- Support for validation and default values

### Preset System
- **Preset.cpp/hpp**: Named configuration sets
- Import/export functionality
- Version management for presets

## Threading and Performance API

### Parallel Processing
- Intel TBB integration for parallel operations
- Thread-safe access to core algorithms
- Background processing capabilities

## Extension Points

### Custom Parameters
- **CustomParametersHandling.cpp/hpp**: API for custom G-code parameters
- Placeholder system for dynamic values

### Custom G-code
- **CustomGCode.cpp/hpp**: Custom G-code insertion API
- Macro language support

## Error Handling API

### Exception System
- **Exception.hpp**: Base exception classes
- Specific exception types for different error conditions
- File parsing error handling

## Platform Abstraction API

### Cross-Platform Support
- Platform-specific implementations abstracted
- Consistent API across Windows, macOS, and Linux
- GUI toolkit abstraction through wxWidgets