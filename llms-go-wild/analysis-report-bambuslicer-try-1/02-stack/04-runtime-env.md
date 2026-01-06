# Runtime Environment for BambuStudio

## Operating Systems
- **Windows**: 64-bit support with Visual Studio 2019 (MSVC 16.x) toolchain
- **macOS**: 64-bit support with minimum deployment target of macOS 10.15
- **Linux**: Multi-distribution support (Ubuntu, Fedora, and others via Flatpak)

## Compiler Requirements
- **Windows**: Visual Studio 2019 (MSVC 16.x) or Clang-cl
- **macOS**: AppleClang (with C++17 support)
- **Linux**: GCC (≥6.0) or Clang with C++17 support

## Architecture Support
- **x86_64**: Primary architecture for all platforms
- **ARM64**: Support for Apple Silicon (macOS)
- **Universal Binaries**: Support for macOS with both x86_64 and ARM64

## Runtime Libraries
- **C++ Standard Library**: C++17 compliant implementation
- **System Libraries**: Platform-specific libraries for GUI, graphics, and system integration
- **Dynamic Linking**: On Linux/macOS, libraries can be linked dynamically or statically based on configuration

## Graphics Requirements
- **OpenGL**: Modern OpenGL support for 3D rendering
- **Graphics Drivers**: Compatible graphics drivers supporting OpenGL 3.3+ or higher
- **Windowing System**: Platform-specific windowing (Win32 API, Cocoa, X11/Wayland)

## Memory and Performance
- **Recommended RAM**: At least 8GB for compilation, more for complex slicing operations
- **Storage**: Several GB for installation and build artifacts
- **Parallel Processing**: Utilizes multi-core processors via Intel TBB

## Additional Runtime Dependencies
- **CA Certificates**: For SSL/TLS verification
- **Font System**: Platform font rendering
- **Audio/Video**: FFmpeg libraries for video processing features