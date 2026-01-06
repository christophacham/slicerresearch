# PrusaSlicer Directory Tree

## Project Structure Overview

```
PrusaSlicer/
├── .clang-format          # Clang formatting configuration
├── .gitignore            # Git ignore patterns
├── build_win.bat         # Windows build script
├── CMakeLists.txt        # Main CMake build configuration
├── CMakePresets.json     # CMake build presets
├── LICENSE              # AGPLv3 license file
├── README.md            # Project overview and documentation
├── version.inc          # Version information included by CMake
├── .github/             # GitHub configuration (workflows, issue templates)
├── analysis-report/     # Analysis report (this documentation)
├── build-utils/         # Build utilities and helper scripts
├── bundled_deps/        # Bundled third-party dependencies
├── cmake/               # CMake modules and find scripts
├── deps/                # External dependencies build system
├── doc/                 # Documentation files
├── resources/           # Application resources (icons, translations, etc.)
├── sandboxes/           # Development sandboxes
├── src/                 # Source code
└── tests/               # Unit and integration tests
```

## Detailed Directory Descriptions

### Root Directory
- **.clang-format**: Configuration file for code formatting with clang-format
- **.gitignore**: Specifies files and directories to be ignored by Git
- **build_win.bat**: Windows batch script for building the application
- **CMakeLists.txt**: Main CMake build configuration file
- **CMakePresets.json**: CMake build presets for different configurations
- **LICENSE**: AGPLv3 license text
- **README.md**: Main project documentation with features and build instructions
- **version.inc**: Version information included by CMake build system

### .github/
- Contains GitHub-specific configurations like workflows, issue templates, and contributing guidelines

### build-utils/
- Build utilities and helper scripts for the build process

### bundled_deps/
- Third-party dependencies bundled with the project for easier distribution

### cmake/
- CMake modules and find scripts for dependency detection and configuration

### deps/
- External dependencies build system and configuration

### doc/
- Documentation files including build instructions for different platforms
- **Dependencies.md**: Documentation about project dependencies
- **How to build - Linux et al.md**: Linux build instructions
- **How to build - Mac OS.md**: macOS build instructions  
- **How to build - Windows.md**: Windows build instructions
- **Localization_guide.md**: Guide for localization process
- **images/**: Documentation images
- **seam_placement/**: Documentation about seam placement feature
- **updating/**: Documentation about update process

### resources/
- Application resources including icons, translations, and profiles
- **data/**: Application data files
- **fonts/**: Font files used in the application
- **icons/**: Icon files for the application
- **localization/**: Translation files (PO/MO files)
- **profiles/**: Default printer/material/profile configurations
- **shaders/**: OpenGL shader files for 3D rendering
- **shapes/**: 3D shape files
- **udev/**: Linux udev rules
- **web/**: Web-based resources

### sandboxes/
- Development sandboxes for testing new features or experimental code

### src/
- Main source code of the application
- **CLI/**: Command-line interface code
- **clipper/**: Polygon clipping library (likely ClipperLib)
- **libseqarrange/**: Sequential arrangement library
- **libslic3r/**: Core slicing library (the original Slic3r library)
- **libvgcode/**: Vector G-code library
- **occt_wrapper/**: Open CASCADE Technology wrapper
- **platform/**: Platform-specific code
- **slic3r/**: Main PrusaSlicer application code
- **slic3r-arrange/**: Object arrangement functionality
- **slic3r-arrange-wrapper/**: Wrapper for arrangement functionality
- **PrusaSlicer_app_msvc.cpp**: MSVC-specific application entry point
- **PrusaSlicer.cpp**: Main application code
- **PrusaSlicer.hpp**: Main application header

### tests/
- Unit and integration tests
- **arrange/**: Tests for arrangement functionality
- **cpp17/**: C++17-specific tests
- **data/**: Test data files
- **example/**: Example tests
- **fff_print/**: Tests for FFF (Fused Filament Fabrication) printing
- **libslic3r/**: Tests for the core slicing library
- **sla_print/**: Tests for SLA (Stereolithography) printing
- **slic3rutils/**: Tests for Slic3r utilities
- **thumbnails/**: Tests for thumbnail generation
- **catch_main.hpp**: Main header for Catch2 test framework
- **CMakeLists.txt**: CMake configuration for tests
- **test_utils.hpp**: Test utilities and helpers