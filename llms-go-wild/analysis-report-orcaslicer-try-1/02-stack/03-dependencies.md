# Dependencies

## Build System Dependencies
- **CMake** (minimum version 3.13)
- **Git** (for version information and commit hash detection)
- **Compiler**: MSVC, GCC, or Clang depending on platform

## Core Runtime Dependencies

### GUI Dependencies
- **wxWidgets** (3.0+ or 3.1+)
  - Cross-platform GUI framework
  - Required for GUI components when SLIC3R_GUI is enabled

### Graphics and Visualization
- **OpenGL** (legacy)
  - 3D rendering for model visualization
- **GLEW** (version compatible with OpenGL)
  - OpenGL extension management
- **GLFW3** (3.x)
  - Window management and OpenGL context

### Mathematical and Geometry Libraries
- **Eigen3** (3.3+)
  - Linear algebra operations
- **OpenVDB** (5.0+)
  - Volumetric data processing
- **OpenCASCADE (OCCT)**
  - Advanced CAD operations
  - DLLs included in distribution

### Geometry Processing
- **Clipper** (polygon clipping library)
  - 2D polygon operations
- **libigl**
  - Geometry processing algorithms

### Serialization
- **Cereal** (any version)
  - C++11 serialization library

### Networking
- **CURL** (any version)
  - Network operations and updates
- **OpenSSL** (any version)
  - Secure communications

### Threading
- **Intel TBB** (any version)
  - Parallel processing for slicing operations

### Utilities
- **Boost** (1.83.0+)
  - Components: system, filesystem, thread, log, log_setup, locale, regex, chrono, atomic, date_time, iostreams, program_options, nowide
- **Freetype** (any version)
  - Font rendering
- **PNG** (any version)
  - Image format support

### Optional Dependencies
- **expat** (XML parsing)
  - Either system library or bundled version
- **NLopt** (1.4+)
  - Non-linear optimization library
- **spnav** (Space Navigator support)
  - 3D mouse support (optional)

## Platform-Specific Dependencies

### Windows
- **Windows 10 SDK** (for Netfabb STL fixing service)
- **WebView2** (for web-based UI components)
- **GMP** (GNU Multiple Precision Arithmetic Library)
- **MPFR** (Multiple Precision Floating-Point Reliable Library)

### Linux
- **GTK3** (3.x)
  - GUI toolkit backend (version specified by SLIC3R_GTK)
- **DBus** (any version)
  - System integration
- **PkgConfig** (any version)
  - Build system helper

### macOS
- **Xcode/Clang** (any version)
- **macOS SDK** (11.3+ deployment target)

## Build Dependencies
- **Ninja** (optional, for faster builds)
- **ccache** (optional, for faster rebuilds)
- **ld.lld** (optional, for faster linking)

## Development Dependencies
- **gettext** (for internationalization)
  - xgettext, msgfmt, msgmerge tools
- **Doxygen** (for documentation generation)