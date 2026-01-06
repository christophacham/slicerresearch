# PrusaSlicer Technology Stack

## Programming Languages

### Primary Language
- **C++**: All user-facing code is written in C++
- **C++ Standard**: C++17 (enforced by CMakeLists.txt)
- **Language Features**: Uses modern C++17 features with platform-specific considerations

## Build System

### CMake Configuration
- **CMake Minimum Version**: 3.13
- **Build Types**: Debug, Release, RelWithDebInfo, MinSizeRel
- **Static Libraries Support**: Optional compilation with static libraries (Boost, TBB, GLEW)
- **GUI Components**: Optional compilation with GUI components (OpenGL, wxWidgets)
- **Precompiled Headers**: Optional support for faster compilation

## Core Libraries and Dependencies

### Core Libraries
- **libslic3r**: Standalone slicing library (the core of PrusaSlicer)
- **wxWidgets**: Cross-platform GUI framework (version 3.2+)
- **OpenGL**: 3D rendering and visualization
- **GLEW**: OpenGL Extension Wrangler Library
- **Boost**: C++ libraries (minimum version 1.83.0)
  - Components: system, filesystem, thread, log, locale, regex, chrono, atomic, date_time, iostreams, nowide
- **Eigen3**: Linear algebra library (minimum version 3.3.7)
- **Intel TBB**: Threading Building Blocks for parallel processing
- **CURL**: HTTP/HTTPS client functionality
- **ZLIB**: Compression library
- **PNG**: PNG image format support
- **EXPAT**: XML parsing
- **Cereal**: Serialization library
- **NLopt**: Nonlinear optimization library (minimum version 1.4)
- **OpenVDB**: Volumetric data processing (minimum version 5.0)

### Platform-Specific Libraries
- **Windows**: Windows 10 SDK (optional) for STL fixing services
- **Linux**: D-Bus for system integration
- **macOS**: Framework-based linking

## GUI Framework

### wxWidgets
- **Version**: 3.2+
- **Unicode Support**: Enabled (wxUSE_UNICODE, UNICODE, _UNICODE)
- **GTK Version**: Configurable (GTK 2 or 3) for Linux
- **OpenGL ES**: Optional support for embedded systems

## Graphics and Visualization

### 3D Rendering
- **OpenGL**: Core 3D rendering pipeline
- **OpenGL ES**: Optional support for embedded systems
- **GLEW**: OpenGL extension management
- **3D Preview**: Real-time visualization of models and slicing results

## Serialization and Data Handling

### Configuration and Data
- **Cereal**: C++11 serialization library for saving/loading application state
- **EXPAT**: XML parsing for configuration and model formats
- **JSON/YAML**: Likely handled through other libraries (to be confirmed in source)

## Internationalization and Localization

### L10N Support
- **gettext**: GNU gettext for translation management
- **PO/MO files**: Translation files in standard format
- **Multiple Languages**: Czech, German, Spanish, French, Italian, Japanese, Polish (and community translations)

## Build and Development Tools

### Compiler Support
- **MSVC**: Visual Studio 2019+ (minimum version 16)
- **GCC**: GNU Compiler Collection
- **Clang**: LLVM-based compiler
- **MinGW**: Windows development with GCC

### Debugging and Analysis Tools
- **AddressSanitizer (ASan)**: Optional memory error detection
- **UndefinedBehaviorSanitizer (UBSan)**: Optional undefined behavior detection
- **Precompiled Headers**: Optional support for faster compilation

## Platform Support

### Operating Systems
- **Windows**: Windows 7+ (with Windows 10 SDK support)
- **macOS**: Modern macOS versions
- **Linux**: FHS-compliant distributions

### Architecture Support
- **x86_64**: Primary target architecture
- **ARM64**: Support for ARM-based systems (to be confirmed)

## File Formats Support

### Input Formats
- **STL**: Standard Triangle Language (binary and ASCII)
- **OBJ**: Wavefront OBJ format
- **AMF**: Additive Manufacturing File Format

### Output Formats
- **G-code**: For FFF printers
- **PNG**: For mSLA printers (layer images)

## Additional Features

### Optional Features
- **OpenVDB**: Volumetric data processing for advanced geometry operations
- **Desktop Integration**: Optional runtime desktop integration (Linux)
- **FHS Compliance**: Support for Filesystem Hierarchy Standard on Linux
- **Static Linking**: Option for fully static builds