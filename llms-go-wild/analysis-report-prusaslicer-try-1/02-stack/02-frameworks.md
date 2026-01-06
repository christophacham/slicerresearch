# PrusaSlicer Frameworks

## GUI Framework

### wxWidgets
- **Purpose**: Cross-platform native GUI toolkit
- **Version**: 3.2+ (based on CMake configuration)
- **Features Used**:
  - Native look and feel across platforms
  - OpenGL integration for 3D preview
  - Internationalization support
  - Advanced UI controls for 3D printing settings
- **Configuration**:
  - Unicode support enabled
  - Custom styling and theming
  - Platform-specific optimizations

## Build System Framework

### CMake
- **Purpose**: Cross-platform build system
- **Version**: Minimum 3.13
- **Features Used**:
  - Multi-config support (Debug, Release, etc.)
  - Dependency management
  - Platform-specific compilation flags
  - Custom build targets for localization
  - Static vs. dynamic linking options
  - Cross-compilation support

## Graphics Framework

### OpenGL
- **Purpose**: 3D rendering and visualization
- **Features Used**:
  - 3D model preview
  - G-code visualization
  - Real-time rendering of sliced models
  - Support for both desktop and embedded (OpenGL ES) targets

### GLEW
- **Purpose**: OpenGL Extension Wrangler Library
- **Features Used**:
  - Managing OpenGL extensions across platforms
  - Ensuring compatibility with different OpenGL implementations

## Threading Framework

### Intel TBB (Threading Building Blocks)
- **Purpose**: Parallel processing and multithreading
- **Features Used**:
  - Parallel slicing operations
  - Multi-threaded processing for performance
  - Task-based parallelism

## Serialization Framework

### Cereal
- **Purpose**: C++11 serialization library
- **Features Used**:
  - Saving/loading application settings
  - Serializing 3D printing configurations
  - State persistence across sessions

## Networking Framework

### cURL
- **Purpose**: HTTP/HTTPS client functionality
- **Features Used**:
  - Downloading updates
  - Communicating with external services
  - Handling web-based resources

## Mathematical Framework

### Eigen3
- **Purpose**: Linear algebra and mathematical operations
- **Features Used**:
  - 3D transformations
  - Geometric calculations
  - Matrix operations for slicing algorithms

## Optimization Framework

### NLopt
- **Purpose**: Nonlinear optimization library
- **Features Used**:
  - Optimizing print parameters
  - Path planning optimization
  - Slicing parameter optimization

## Volumetric Data Framework

### OpenVDB
- **Purpose**: Volumetric data processing
- **Features Used**:
  - Advanced geometry operations
  - Volumetric modeling for complex prints
  - Support for complex 3D structures

## XML Processing Framework

### EXPAT
- **Purpose**: XML parsing
- **Features Used**:
  - Processing XML-based configuration files
  - Handling AMF (Additive Manufacturing File Format)
  - Parsing model metadata

## Localization Framework

### GNU gettext
- **Purpose**: Internationalization and localization
- **Features Used**:
  - Multi-language support
  - Dynamic language switching
  - Community translation management
  - Custom localization tools and scripts