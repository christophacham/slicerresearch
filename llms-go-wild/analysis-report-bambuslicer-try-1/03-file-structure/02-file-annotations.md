# File Annotations for BambuStudio

## Root Directory Files

### README.md
Project overview, features, build instructions, and licensing information.

### CMakeLists.txt
Main CMake build configuration file. Defines build options, dependencies, compiler flags, and build targets for the entire project.

### Build.PL
Perl build script for installing Perl dependencies needed for unit/integration tests.

### Build Scripts
- `build_win.bat`: Windows batch script for building the application
- `BuildLinux.sh`: Linux shell script for building the application
- `BuildMac.sh`: macOS shell script for building the application

### Docker Files
- `Dockerfile`: Main Docker configuration for building BambuStudio in a container
- `Containerfile`: Alternative Docker build configuration
- `DockerBuild.sh`: Script for building Docker images
- `DockerEntrypoint.sh`: Docker entrypoint script for container execution
- `DockerRun.sh`: Script for running the Docker container

### Configuration Files
- `version.inc`: Version information for the application
- `localazy.json`: Localization configuration for Localazy service
- `.gitignore`: Git ignore patterns
- `.dockerignore`: Docker ignore patterns

### Source Code Directories

#### `src/`
The main source code directory containing:
- `libslic3r/`: Core slicing library functionality
- `slic3r/`: Main application code
  - `GUI/`: Graphical user interface components
  - `Utils/`: Utility functions and helpers
  - `Print/`: Print-related functionality
  - `Geometry/`: Geometric operations
  - `GCode/`: G-code generation and processing
  - `Model/`: 3D model handling
  - `Config/`: Configuration management

#### `deps/`
Contains build configurations for third-party dependencies:
- Boost
- OpenVDB
- OpenCASCADE Technology (OCCT)
- wxWidgets
- Other required libraries

#### `resources/`
Application resources including:
- `i18n/`: Internationalization files
- `images/`: UI images and icons
- `fonts/`: Font files
- `themes/`: UI theme configurations

#### `tests/`
C++ unit and integration tests organized by component:
- `libslic3r/`: Tests for core library
- `fff_print/`: Tests for FFF printing functionality
- `sla_print/`: Tests for SLA printing functionality
- `libnest2d/`: Tests for nesting library

#### `bbl/`
Bambu Lab specific code:
- `i18n/`: Bambu-specific localization files
- Device-specific configurations and utilities

#### `xs/`
Perl XS modules for Perl/C++ interoperability:
- `lib/`: Perl library files
- `src/`: XS source files
- `t/`: Perl tests
- `xsp/`: XS proxy files

#### `cmake/`
CMake modules and build configurations:
- `modules/`: Find modules for dependencies
- Build configuration utilities

#### `docker/`
Docker build configurations:
- Build dependencies Dockerfiles
- AppImage build Dockerfiles
- Container build scripts

#### `bbs_test_tools/`
Bambu Studio specific test tools:
- G-code checker utilities
- Testing utilities

#### `sandboxes/`
Development sandboxes for experimental features

#### `scripts/`
Utility scripts:
- Git hooks
- Build utilities
- Development tools

## Binary and Data Files

### Localization Files
- `.po` files in `bbl/i18n/` directories: Translation files for different languages
- `BambuStudio.mo`: Compiled localization files

### Test Data
- `.obj`, `.stl`, `.3mf` files in `tests/data/`: 3D model test files
- Configuration files for testing

### Documentation
- Files in `doc/` directory: Project documentation

## Build Artifacts (Generated)
- `build/` directory: Contains compiled binaries and build artifacts
- `deps/build/` directory: Contains built dependencies