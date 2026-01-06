# PrusaSlicer Configuration Files

## Build System Configuration

### CMake Configuration
- **CMakeLists.txt**: Main build configuration file
  - Defines project structure and dependencies
  - Configures build options (SLIC3R_STATIC, SLIC3R_GUI, etc.)
  - Sets up compilation flags for different platforms
  - Manages dependency finding and linking

- **CMakePresets.json**: Build presets configuration
  - Defines standard build configurations
  - Provides consistent build settings across development environments
  - Supports different build types and architectures

### Version Configuration
- **version.inc**: Version information included by CMake
  - Contains version numbers and build identifiers
  - Defines application name and version strings
  - Used to generate version information for the application

### Build Options
The build system supports various configuration options:
- **SLIC3R_STATIC**: Compile with static libraries
- **SLIC3R_GUI**: Compile with GUI components
- **SLIC3R_FHS**: Install in FHS directory structure
- **SLIC3R_PCH**: Use precompiled headers
- **SLIC3R_MSVC_COMPILE_PARALLEL**: Parallel compilation on MSVC
- **SLIC3R_ASAN**: Enable AddressSanitizer
- **SLIC3R_UBSAN**: Enable UndefinedBehaviorSanitizer
- **SLIC3R_ENABLE_FORMAT_STEP**: Enable STEP file support

## Application Configuration

### Configuration System (libslic3r)
- **Config.cpp/hpp**: Core configuration system
  - Generic configuration handling with validation
  - Support for different configuration types
  - Serialization and deserialization capabilities

- **PrintConfig.cpp/hpp**: Print-specific configuration
  - Settings for print parameters (speed, temperature, etc.)
  - Printer-specific settings
  - Material-specific settings

- **AppConfig.cpp/hpp**: Application-wide configuration
  - User preferences and application settings
  - UI configuration and behavior settings

### Preset System
- **Preset.cpp/hpp**: Configuration presets
  - Named configuration sets for different scenarios
  - Import/export functionality for presets
  - Version management for preset compatibility

- **PresetBundle.cpp/hpp**: Bundle of related presets
  - Groups multiple presets together
  - Manages collections of printer/material/profile configurations

### Configuration Files in Resources
- **resources/profiles/**: Printer, material, and filament profiles
  - **PrusaResearch.ini/.idx**: Prusa printer profiles
  - **PrusaResearchSLA.ini/.idx**: Prusa SLA printer profiles
  - Profiles for various manufacturers (Creality, Anycubic, Ultimaker, etc.)
  - INI format configuration files with printer-specific settings

## Platform-Specific Configuration

### Windows Configuration
- **build_win.bat**: Windows build script
  - Batch script for building on Windows
  - Handles MSVC configuration and dependencies
  - Supports different architectures and build types

### Compiler Configuration
The project includes platform-specific compiler settings:
- **MSVC**: Specific flags for Visual Studio compiler
- **GCC/Clang**: Optimized settings for GCC and Clang
- **Cross-platform**: Consistent settings across platforms

## Localization Configuration

### Translation Files
- **resources/localization/**: Translation resources
  - PO files for each supported language
  - MO compiled translation files
  - **list.txt**: List of files to translate
  - **PrusaSlicer.pot**: Translation template file

## Build Dependencies Configuration

### Dependency Management
- **deps/autobuild.cmake**: Automatic dependency building
- **deps/CMakeLists.txt**: Dependency build configuration
- **deps/README.md**: Dependency management documentation

### CMake Modules
- **cmake/modules/**: CMake find modules for dependencies
  - **FindwxWidgets.cmake**: Find wxWidgets GUI library
  - **FindBoost.cmake**: Find Boost C++ libraries
  - **FindTBB.cmake**: Find Intel TBB
  - **FindOpenVDB.cmake**: Find OpenVDB
  - **FindNLopt.cmake**: Find NLopt optimization library
  - And many other dependency find modules

## Runtime Configuration

### Feature Configuration
- **SLIC3R_OPENGL_ES**: OpenGL ES support for embedded systems
- **SLIC3R_DESKTOP_INTEGRATION**: Desktop integration features
- **SLIC3R_BUILD_TESTS**: Include unit tests in build
- **SLIC3R_BUILD_SANDBOXES**: Include development sandboxes

### Platform-Specific Features
- **WIN10SDK_PATH**: Windows 10 SDK path for STL fixing services
- **SLIC3R_GTK**: GTK version selection for Linux
- **SLIC3R_FHS**: Filesystem Hierarchy Standard compliance for Linux

## Testing Configuration

### Test Framework
- **tests/CMakeLists.txt**: Test build configuration
- **tests/catch_main.hpp**: Catch2 test framework main
- **test_utils.hpp**: Test utilities and helpers

## Code Quality Configuration

### Formatting
- **.clang-format**: Clang code formatting configuration
  - Defines code style for the project
  - Ensures consistent formatting across the codebase

### Git Configuration
- **.gitignore**: Git ignore patterns
  - Specifies files and directories to ignore
  - Prevents build artifacts and IDE files from being committed