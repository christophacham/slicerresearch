# Deployment in BambuStudio

## Overview
BambuStudio provides multiple deployment options across different platforms, including traditional installation packages, containerized deployment, and cross-platform build systems. The deployment strategy supports Windows, macOS, and Linux platforms with various distribution methods.

## Build Systems

### 1. CMake Build System
- **File**: `CMakeLists.txt`
- **Purpose**: Cross-platform build configuration
- **Features**:
  - Multi-platform support (Windows, macOS, Linux)
  - Dependency management
  - Build type configuration (Debug, Release, RelWithDebInfo)
  - Static/dynamic linking options
  - Parallel compilation support

#### Build Configuration Options:
- `SLIC3R_STATIC`: Compile with static libraries
- `SLIC3R_GUI`: Include GUI components
- `SLIC3R_FHS`: Install in FHS directory structure (Linux)
- `SLIC3R_WX_STABLE`: Use wxWidgets stable version
- `SLIC3R_PROFILE`: Enable profiling
- `SLIC3R_PCH`: Use precompiled headers
- `SLIC3R_ASAN`: Enable AddressSanitizer

### 2. Platform-Specific Build Scripts
- **Windows**: `build_win.bat`
- **Linux**: `BuildLinux.sh`
- **macOS**: `BuildMac.sh`

#### Windows Build Script (`build_win.bat`):
- **Features**:
  - Visual Studio integration
  - Dependency building
  - Multi-architecture support (x64, ARM64)
  - Build step management (deps, app, all)
  - Runtime execution options

#### Linux Build Script (`BuildLinux.sh`):
- **Features**:
  - Memory and disk space checks
  - Distribution detection
  - Package dependency installation
  - Parallel build optimization
  - AppImage generation

#### macOS Build Script (`BuildMac.sh`):
- **Features**:
  - Xcode/Unix Makefiles support
  - Multi-architecture builds (x86_64, ARM64, universal)
  - Deployment target configuration
  - Framework integration

## Containerized Deployment

### 1. Docker Support
- **Files**: `Dockerfile`, `Containerfile`, `docker/`
- **Purpose**: Containerized build and deployment
- **Features**:
  - Isolated build environment
  - Consistent build results
  - Dependency management
  - Multi-platform support

#### Dockerfile Features:
- Ubuntu 24.10 base image
- Complete build environment
- User mapping support
- Certificate configuration
- Entry point script

#### Containerfile Features:
- Podman support
- AppImage generation
- Multi-stage builds
- Optimized layer caching

### 2. Docker Build Scripts
- **DockerBuild.sh**: Orchestrates Docker builds
- **DockerEntrypoint.sh**: Container entry point
- **DockerRun.sh**: Container execution script

## Package Distribution

### 1. AppImage (Linux)
- **Purpose**: Portable Linux application
- **Features**:
  - Single executable file
  - No installation required
  - Bundled dependencies
  - FHS compliance

### 2. Flatpak (Linux)
- **Purpose**: Universal Linux package
- **Features**:
  - Sandboxed execution
  - Automatic updates
  - System integration
  - Security isolation

### 3. Windows Installation
- **Features**:
  - MSI installer
  - Registry integration
  - File association
  - Start menu entries

### 4. macOS Bundle
- **Features**:
  - Application bundle format
  - Code signing support
  - Notarization preparation
  - System integration

## Cross-Platform Considerations

### 1. Architecture Support
- **x86_64**: Primary architecture for all platforms
- **ARM64**: Support for Apple Silicon (macOS)
- **Universal Binaries**: macOS multi-architecture support

### 2. Compiler Support
- **Windows**: Visual Studio 2019 (MSVC 16.x), Clang-cl
- **macOS**: AppleClang with C++17 support
- **Linux**: GCC (≥6.0) or Clang with C++17 support

### 3. Runtime Dependencies
- **Graphics**: OpenGL 3.3+ with extensions
- **System Libraries**: Platform-specific requirements
- **Fonts**: System font rendering
- **Audio/Video**: FFmpeg libraries for video processing

## Deployment Strategies

### 1. GitHub Releases
- **Purpose**: Official binary distribution
- **Content**:
  - Pre-built binaries for all platforms
  - Release notes and changelogs
  - Signature verification
  - Version management

### 2. Package Managers
- **Linux**: AppImage, Flatpak
- **macOS**: Homebrew, MacPorts
- **Windows**: Chocolatey, Scoop

### 3. Container Registries
- **Docker Hub**: Pre-built Docker images
- **GitHub Container Registry**: Development images
- **Quay.io**: Alternative registry

## Build Dependencies

### 1. Core Dependencies
- **Boost (≥1.83.0)**: System, Filesystem, Thread, Log, Locale, Regex, Chrono, Atomic, Date_Time, IOStreams
- **Intel TBB**: Parallel computing library
- **OpenSSL**: SSL/TLS encryption
- **CURL**: HTTP/HTTPS client functionality
- **ZLIB**: Compression library
- **PNG**: PNG image format support
- **OpenGL**: Graphics rendering
- **GLEW**: OpenGL Extension Wrangler
- **GLFW3**: Window management
- **Eigen3 (≥3.3)**: Linear algebra library
- **OpenVDB (≥5.0)**: Volumetric data processing
- **NLopt (≥1.4)**: Nonlinear optimization library
- **Cereal**: Serialization library
- **Expat**: XML parsing library

### 2. GUI Dependencies
- **wxWidgets**: Cross-platform GUI framework
- **WebKit2GTK**: Web content rendering (Linux)

### 3. Graphics and CAD Dependencies
- **OpenCASCADE Technology (OCCT)**: 3D modeling and CAD operations
- **libigl**: Geometry processing library

## Deployment Automation

### 1. CI/CD Pipeline
- **GitHub Actions**: Automated builds and testing
- **Build Types**:
  - Pull request validation
  - Nightly builds
  - Release builds
  - Container builds

### 2. Automated Testing
- **Unit Tests**: Core functionality validation
- **Integration Tests**: Workflow validation
- **Platform Tests**: Cross-platform compatibility
- **Performance Tests**: Performance regression detection

## Installation Process

### 1. Windows Installation
- **Steps**:
  - Download installer from GitHub releases
  - Run installer with administrative privileges
  - Configure installation directory
  - Set up file associations
  - Complete installation wizard

### 2. Linux Installation
- **AppImage Method**:
  - Download AppImage file
  - Make executable
  - Run directly

- **Flatpak Method**:
  - Install Flatpak
  - Add Flathub repository
  - Install BambuStudio

### 3. macOS Installation
- **Steps**:
  - Download DMG file
  - Mount and copy to Applications
  - Configure security settings if needed
  - Complete first-run setup

## Configuration and Initialization

### 1. First Run Setup
- **User Configuration**: Initial preferences
- **Printer Detection**: Automatic printer discovery
- **Network Configuration**: Printer connection setup
- **Profile Setup**: Default printer/filament profiles

### 2. Data Directory
- **Windows**: `%APPDATA%\BambuStudio\`
- **Linux**: `~/.config/BambuStudio/`
- **macOS**: `~/Library/Application Support/BambuStudio/`

## Update Mechanisms

### 1. Automatic Updates
- **Check Frequency**: Periodic update checks
- **Notification System**: Update availability notifications
- **Download Management**: Background downloads
- **Installation Process**: Seamless updates

### 2. Manual Updates
- **GitHub Releases**: Manual download option
- **Package Managers**: Update through package manager
- **Container Updates**: Pull latest container images

## Deployment Monitoring

### 1. Build Monitoring
- **Build Status**: Real-time build status
- **Failure Notifications**: Build failure alerts
- **Performance Metrics**: Build time tracking
- **Resource Usage**: Memory/disk usage monitoring

### 2. Release Monitoring
- **Download Statistics**: Release download tracking
- **Compatibility Reports**: Platform compatibility
- **User Feedback**: Issue reporting and feedback
- **Usage Analytics**: Feature usage statistics

## Troubleshooting

### 1. Common Issues
- **Dependency Issues**: Missing or incompatible libraries
- **Graphics Issues**: OpenGL driver problems
- **Network Issues**: Printer connectivity problems
- **Performance Issues**: Slow slicing or rendering

### 2. Diagnostic Tools
- **System Info**: System information reporting
- **Log Files**: Detailed operation logging
- **Debug Builds**: Debugging support
- **Support Utilities**: Diagnostic utilities

## Security Considerations

### 1. Code Signing
- **Windows**: Authenticode signing
- **macOS**: Code signing and notarization
- **Linux**: Signature verification

### 2. Network Security
- **Encryption**: SSL/TLS for network communication
- **Authentication**: Secure printer connections
- **Certificate Management**: Certificate validation

### 3. Sandbox Security
- **Container Security**: Isolated execution environments
- **File System**: Limited file system access
- **Network**: Controlled network access