# Dependencies Used in BambuStudio

## Core Dependencies
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

## GUI Dependencies
- **wxWidgets**: Cross-platform GUI framework
- **WebKit2GTK**: Web content rendering (Linux)

## Graphics and CAD Dependencies
- **OpenCASCADE Technology (OCCT)**: 3D modeling and CAD operations
- **libigl**: Geometry processing library

## Build Dependencies
- **CMake (≥3.13)**: Build system
- **Ninja**: Alternative build system
- **pkg-config**: Build configuration tool (Linux)

## Optional Dependencies
- **Perl**: For XS modules and unit/integration tests
- **FFmpeg libraries**: avcodec, avutil, swscale, swresample for video/audio processing
- **DBus**: Linux system integration
- **GTK3**: Linux GUI toolkit (alternative to GTK2)