# PrusaSlicer Deployment and Build System

## Build System Overview

### CMake-Based Build
PrusaSlicer uses CMake as its primary build system with comprehensive cross-platform support:

- **CMakeLists.txt**: Main build configuration file
- **CMakePresets.json**: Build presets for standardized configurations
- Minimum CMake version: 3.13
- Supports multiple generators (Visual Studio, Ninja, Makefiles, etc.)

### Build Configuration Options
The build system supports numerous configuration options:

#### Core Options
- **SLIC3R_STATIC**: Compile with static libraries (Boost, TBB, GLEW)
- **SLIC3R_GUI**: Compile with GUI components (OpenGL, wxWidgets)
- **SLIC3R_FHS**: Install in FHS directory structure (Linux)
- **SLIC3R_PCH**: Use precompiled headers for faster compilation
- **SLIC3R_MSVC_COMPILE_PARALLEL**: Parallel compilation on MSVC

#### Debugging Options
- **SLIC3R_ASAN**: Enable AddressSanitizer for memory error detection
- **SLIC3R_UBSAN**: Enable UndefinedBehaviorSanitizer for undefined behavior detection

#### Feature Options
- **SLIC3R_ENABLE_FORMAT_STEP**: Enable STEP file support
- **SLIC3R_LOG_TO_FILE**: Enable logging to file
- **SLIC3R_OPENGL_ES**: Target OpenGL ES (when SLIC3R_GUI is enabled)
- **SLIC3R_DESKTOP_INTEGRATION**: Allow desktop integration during runtime

## Platform-Specific Builds

### Windows Build
- **build_win.bat**: Windows batch script for building
- Supports MSVC 2019+ and MinGW
- Handles dependency management and path configuration
- Manages different architectures (x64, ARM64)
- Automatic copying of runtime DLLs (GMP, MPFR)

### Linux Build
- FHS (Filesystem Hierarchy Standard) compliance option
- D-Bus integration for system communication
- GTK version selection (2 or 3) for wxWidgets
- Package manager dependency support

### macOS Build
- Framework-based linking
- Cross-compilation support detection
- SDK path management

## Dependency Management

### Automatic Dependency Building
- **deps/autobuild.cmake**: Automatic dependency building system
- **deps/CMakeLists.txt**: Dependency build configuration
- **PrusaSlicer_BUILD_DEPS**: Flag to build dependencies during main build
- Uses CMake's ExternalProject module for dependency management

### Bundled Dependencies
- **bundled_deps/**: Third-party libraries bundled with the project
- **deps/+LibraryName/**: Individual dependency build configurations
- Supports both system and bundled dependency options

### Dependency List
- Boost (1.83.0+): System, filesystem, thread, log, locale, regex, chrono, atomic, date_time, iostreams, nowide
- Eigen3 (3.3.7+): Linear algebra library
- Intel TBB: Threading Building Blocks
- wxWidgets: GUI framework
- OpenGL/GLEW: Graphics rendering
- cURL: Network operations
- OpenVDB (5.0+): Volumetric data processing
- NLopt (1.4+): Nonlinear optimization
- And many other libraries

## Compiler Support

### Supported Compilers
- **MSVC**: Visual Studio 2019+ (minimum version 16)
- **GCC**: GNU Compiler Collection
- **Clang**: LLVM-based compiler
- **MinGW**: Windows development with GCC

### Compiler-Specific Configuration
- **MSVC**: Special flags for Windows builds, UTF-8 source encoding
- **GCC/Clang**: Optimized flags and sanitizer support
- **clang-cl**: Support for Clang on Windows

## Build Targets and Artifacts

### Main Executables
- **PrusaSlicer**: Main GUI application
- **prusa-slicer-console**: Console/command-line version
- **prusa-gcodeviewer**: Standalone G-code viewer

### Build Output
- Platform-specific executables and libraries
- Resource files and localization data
- Installation packages (depending on platform)

## Installation System

### Cross-Platform Installation
- Windows: Standalone application with all dependencies included
- macOS: Application bundle with embedded dependencies
- Linux: FHS-compliant installation or standalone app

### Desktop Integration
- Desktop file installation (Linux)
- Application icons in various sizes
- MIME type associations
- Menu entries

## Continuous Integration and Deployment

### Build Process
- CMake-based build system supports CI/CD integration
- Multiple build configurations (Debug, Release, RelWithDebInfo, MinSizeRel)
- Automated dependency building option

### Cross-Platform Considerations
- Consistent build process across platforms
- Platform-specific optimizations
- Architecture-specific builds (x86_64, ARM64)

## Development Sandboxes

### Sandbox System
- **sandboxes/**: Development sandbox environments
- **SLIC3R_BUILD_SANDBOXES**: Option to build development sandboxes
- Used for testing new features and experimental code

## Localization Deployment

### Translation System
- GNU gettext-based localization
- PO/MO file generation during build
- Automatic POT file generation from source code
- Community translation integration

## Version Management

### Version System
- **version.inc**: Version information included by CMake
- Git-based version generation
- Build ID management
- Semantic versioning support

## Installation Targets

### File Installation
- Executables to appropriate directories
- Resource files (icons, localization, profiles)
- Desktop integration files (Linux)
- Documentation files

### Platform-Specific Installation
- **Windows**: Standalone directory with all dependencies
- **macOS**: Application bundle format
- **Linux**: FHS-compliant or AppImage/Snap packages possible

## Build Optimization

### Performance Optimizations
- Precompiled headers for faster compilation
- Parallel compilation support
- Static vs. dynamic linking options
- Platform-specific compiler optimizations

### Memory Management
- Sanitizer support for debugging
- Memory-efficient data structures
- Multi-threading with Intel TBB