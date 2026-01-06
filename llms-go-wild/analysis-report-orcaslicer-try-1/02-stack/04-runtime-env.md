# Runtime Environment

## Supported Platforms
- **Windows**: Windows 7 or later (with Windows 10 SDK support)
- **macOS**: macOS 11.3 or later (with Xcode toolchain)
- **Linux**: Various distributions with GTK3 support

## Compiler Requirements
- **Windows**: MSVC (Visual Studio 2019 or later) or Clang-cl
- **Linux**: GCC (5.4+ recommended) or Clang (3.3+)
- **macOS**: Xcode/Clang (any recent version)

## Build Environment
- **CMake**: Minimum version 3.13
- **Memory Requirements**: Minimum 10GB free RAM for compilation (as per build scripts)
- **Disk Space**: Significant space required for dependencies and build artifacts
- **Architecture Support**: x86_64 primarily, with ARM64 support for macOS

## Runtime Dependencies
- **Visual C++ Redistributables** (Windows)
  - MSVC 2019 runtime libraries
  - WebView2 runtime (for web components)

- **System Libraries** (Linux)
  - GTK3 runtime libraries
  - OpenGL drivers
  - Various system libraries (glibc, etc.)

- **Frameworks** (macOS)
  - Appropriate macOS frameworks
  - OpenGL support

## Configuration Environment
- **Environment Variables**:
  - `CMAKE_PREFIX_PATH`: Path to dependencies
  - `WIN10SDK_PATH`: Windows 10 SDK path (optional)
  - `CMAKE_BUILD_PARALLEL_LEVEL`: Parallel build configuration
  - `ORCA_UPDATER_SIG_KEY`: Updater signature key (optional)

## Build Types
- **Release**: Optimized build for production use
- **Debug**: Full debugging information, no optimizations
- **RelWithDebInfo**: Optimized with debugging information

## Static vs Dynamic Linking
- **Static Linking**: Enabled by default (SLIC3R_STATIC=ON)
  - Boost libraries linked statically
  - Intel TBB linked statically
  - GLEW linked statically (when SLIC3R_STATIC_EXCLUDE_GLEW is not set)
  - CURL linked statically (when SLIC3R_STATIC_EXCLUDE_CURL is not set)

- **Dynamic Linking**: Available as option
  - More flexible but requires runtime dependencies
  - Smaller executable size