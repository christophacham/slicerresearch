# PrusaSlicer Runtime Environment

## Operating System Support

### Windows
- **Minimum Version**: Windows 7 (with Windows 10 SDK support)
- **Architecture**: x86_64 (primary), with potential ARM64 support
- **Runtime Dependencies**:
  - Microsoft Visual C++ Redistributables (for MSVC builds)
  - Windows 10 SDK (optional, for STL fixing services)
  - GMP and MPFR DLLs (bundled with application)
- **Build Tools**: MSVC 2019+ or MinGW
- **Special Considerations**:
  - UTF-8 source code encoding enforced
  - Automatic copying of runtime DLLs during build
  - Windows-specific compiler flags (/bigobj, /Zm520, etc.)

### macOS
- **Minimum Version**: Modern macOS versions (specific version not explicitly stated)
- **Architecture**: x86_64, ARM64 (Apple Silicon)
- **Runtime Dependencies**:
  - System frameworks
  - Bundled dependencies
- **Build Tools**: Xcode with appropriate SDK
- **Special Considerations**:
  - Framework linking approach
  - Cross-compilation support detection
  - SDK path management

### Linux
- **Distribution Support**: FHS-compliant distributions
- **Architecture**: x86_64 (primary), with potential ARM support
- **Runtime Dependencies**:
  - System libraries (Boost, OpenGL, etc.)
  - D-Bus for system integration
  - Desktop environment integration (optional)
- **Build Tools**: GCC or Clang with CMake
- **Special Considerations**:
  - FHS (Filesystem Hierarchy Standard) installation option
  - Desktop integration support
  - GTK version selection (2 or 3)

## Compiler Runtime Requirements

### C++ Runtime
- **Standard**: C++17 compliant runtime
- **Threading**: POSIX threads (pthreads) on Unix-like systems
- **Character Encoding**: Signed char enforced for consistency across platforms
- **Mathematical Functions**: Standard C++ math library with _USE_MATH_DEFINES on Windows

### Memory Management
- **Threading Building Blocks (TBB)**: For parallel processing
- **Memory Allocators**: Custom allocators may be used for performance
- **Sanitizers Support**: Optional AddressSanitizer and UBSan for debugging

## Graphics Runtime

### OpenGL Context
- **Version**: Legacy OpenGL (as specified in CMakeLists.txt)
- **Extensions**: Managed through GLEW
- **Platform-Specific**: OpenGL ES support for embedded systems
- **Driver Requirements**: Modern graphics drivers supporting OpenGL 2.0+

### Display Requirements
- **Windowing System**: Platform-specific (Win32, Cocoa, X11/Wayland)
- **OpenGL Support**: Hardware or software OpenGL implementation
- **HiDPI Support**: Likely through wxWidgets abstraction

## File System Requirements

### Storage
- **Configuration Storage**: User-specific configuration directories
- **Temporary Files**: For processing large 3D models
- **Model Storage**: Support for large STL/OBJ/AMF files
- **G-code Output**: Directories for generated G-code files

### Permissions
- **User Configuration**: Read/write access to user configuration directories
- **Model Loading**: Read access to user's 3D model files
- **G-code Output**: Write access to user-specified output directories
- **System Integration**: Optional access for desktop integration (Linux)

## Network Environment

### Connectivity
- **Update Checks**: Optional network access for checking updates
- **Remote Resources**: Potential access to online model repositories
- **Protocol Support**: HTTP/HTTPS via cURL library

### Security Considerations
- **Certificate Validation**: SSL/TLS certificate validation for secure connections
- **Local Network**: Potential access for printer communication (not confirmed in root files)

## Localization Runtime

### Language Support
- **Unicode**: Full Unicode support through wxWidgets and Boost.Locale
- **Translation Files**: MO files for each supported language
- **Text Encoding**: UTF-8 for all internal text processing
- **Right-to-Left**: Support through wxWidgets (if applicable)

## Performance Environment

### Hardware Requirements
- **CPU**: Multi-core processor recommended for parallel slicing
- **RAM**: Variable depending on model complexity (can be substantial for large models)
- **GPU**: OpenGL-capable graphics for 3D preview
- **Storage**: Fast storage recommended for temporary file processing

### Optimization Features
- **Parallel Processing**: Utilizes all available CPU cores through TBB
- **Memory Management**: Optimized for large model processing
- **GPU Acceleration**: Potential OpenGL acceleration for preview rendering

## Development Runtime (Optional)

### Debugging Support
- **Sanitizers**: AddressSanitizer and UBSan when enabled
- **Logging**: File-based logging option (SLIC3R_LOG_TO_FILE)
- **Debug Builds**: Full debugging information and assertions

### Development Tools Integration
- **IDE Support**: Visual Studio, CLion, or other CMake-compatible IDEs
- **Build Systems**: CMake-based builds with multiple configuration options
- **Testing Framework**: Unit testing environment with Google Test or similar