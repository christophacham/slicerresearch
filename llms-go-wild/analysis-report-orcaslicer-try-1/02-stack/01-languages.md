# Languages

## Primary Language
- **C++**: The main implementation language for the core 3D slicing engine and application logic
  - C++17 standard (as specified in CMakeLists.txt)
  - Used extensively throughout the libslic3r library and GUI components

## Supporting Languages
- **CMake**: Build system and configuration
  - Modern CMake (minimum version 3.13)
  - Cross-platform build configuration

- **Shell Scripts**: Build and deployment automation
  - Bash scripts for Linux builds (build_linux.sh)
  - Batch scripts for Windows builds (build_release.bat)

- **Python**: Likely used for some utilities (based on historical Slic3r codebase)

- **XML/XRC**: GUI layout definitions (likely, based on wxWidgets usage)

- **GLSL**: OpenGL shader code (likely, for 3D rendering)

## Codebase Composition
The project is predominantly C++ with supporting build scripts and configuration files. The core slicing algorithms and 3D geometry processing are implemented in C++ for performance reasons.