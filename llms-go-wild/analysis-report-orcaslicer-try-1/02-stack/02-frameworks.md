# Frameworks and Libraries

## Core Frameworks
- **wxWidgets**: Cross-platform GUI framework
  - Used for the main application interface
  - Version 3.0+ (stable) or 3.1+ (development) on Linux
  - Provides native look and feel across platforms

## 3D Graphics and Visualization
- **OpenGL**: 3D rendering engine
  - Used for 3D model visualization and preview
  - Legacy OpenGL (with deprecated functions, based on compiler flags)

- **GLEW**: OpenGL Extension Wrangler Library
  - Manages OpenGL extensions across platforms

- **GLFW3**: Window management and context creation
  - Handles window creation, OpenGL context, and input

## Geometry and Mathematics
- **Eigen3**: Linear algebra and mathematical operations
  - Used for 3D transformations, matrix operations, and geometric calculations

- **OpenVDB**: Volumetric data processing
  - Version 5.0+ for advanced 3D geometry operations
  - Used for support generation and complex geometry processing

- **OpenCASCADE (OCCT)**: Computer-Aided Design (CAD) operations
  - Used for advanced geometric operations and mesh processing
  - DLLs included in the build process

## Slicing and Geometry Processing
- **Clipper**: Polygon clipping library
  - Used for 2D polygon operations during slicing
  - Handles polygon intersections, unions, and offsets

- **libigl**: Geometry processing library
  - Used for mesh operations and geometric algorithms

## Serialization and Data Handling
- **Cereal**: C++11 serialization library
  - Used for configuration and data serialization

- **Freetype**: Font rendering library
  - Used for text rendering in the UI

## Networking and Communication
- **CURL**: URL transfer library
  - Used for network operations and updates
  - Supports various protocols (HTTP, HTTPS, FTP, etc.)

- **OpenSSL**: SSL/TLS encryption
  - Used for secure network communications

## Threading and Concurrency
- **Intel TBB**: Threading Building Blocks
  - Used for parallel processing of slicing operations
  - Enables multi-threaded slicing for performance

## Logging and Utilities
- **Boost**: C++ libraries collection
  - Components used: system, filesystem, thread, log, regex, chrono, atomic, date_time, iostreams, program_options, nowide
  - Provides cross-platform utilities and extensions

## Image Processing
- **PNG**: Image format support
  - Used for UI icons and image processing features

## Build and Development Tools
- **CMake**: Cross-platform build system
  - Modern CMake for cross-platform builds
  - Supports Visual Studio, Ninja, and other generators