# Directory Tree

```
OrcaSlicer/
├── .claude/                    # Claude-specific configuration
├── .devcontainer/             # Development container configuration
├── .github/                   # GitHub-specific files (workflows, issue templates)
├── .idea/                     # JetBrains IDE configuration
├── analysis-report/           # Generated analysis reports (this project)
├── cmake/                     # CMake modules and build utilities
│   └── modules/               # Custom CMake find modules
├── deps/                      # Dependencies build system
│   ├── CMakeLists.txt         # Dependencies build configuration
│   └── deps.cmake             # Dependencies definition file
├── deps_src/                  # Dependencies source code
├── localization/              # Internationalization files
│   └── i18n/                  # Translation files (.po, .mo)
├── resources/                 # Application resources
│   ├── images/                # UI icons and images
│   ├── i18n/                  # Compiled translation files
│   ├── icons/                 # Additional icons
│   ├── presets/               # Printer/material/profile presets
│   └── templates/             # Template files
├── sandboxes/                 # Development sandboxes (if enabled)
├── scripts/                   # Build and utility scripts
│   └── linux.d/               # Linux distribution-specific scripts
├── SoftFever_doc/             # Documentation and sponsor materials
├── src/                       # Source code
│   ├── dev-utils/             # Development utilities
│   │   └── platform/          # Platform-specific utilities
│   ├── libslic3r/             # Core slicing library
│   │   ├── Algorithm/         # Slicing algorithms
│   │   ├── Arachne/           # Path planning algorithms
│   │   ├── CSGMesh/           # Constructive Solid Geometry mesh operations
│   │   ├── Execution/         # Execution and threading utilities
│   │   ├── Feature/           # Feature detection algorithms
│   │   ├── Fill/              # Infill generation algorithms
│   │   ├── Format/            # File format handling
│   │   ├── GCode/             # G-code generation
│   │   ├── Geometry/          # Geometric operations
│   │   ├── Optimize/          # Optimization algorithms
│   │   ├── Shape/             # Shape operations
│   │   ├── SLA/               # SLA (stereolithography) support
│   │   └── Support/           # Support structure generation
│   ├── slic3r/                # GUI application code
│   ├── OrcaSlicer.cpp         # Main application entry point
│   ├── OrcaSlicer.hpp         # Main application header
│   └── OrcaSlicer_app_msvc.cpp # MSVC-specific application code
├── tests/                     # Unit and integration tests
├── tools/                     # Utility tools
├── version.inc                # Version information
├── CMakeLists.txt             # Main CMake build configuration
├── README.md                  # Project documentation
├── LICENSE.txt                # License information
├── build_*.sh                 # Build scripts (Linux/macOS)
├── build_*.bat                # Build scripts (Windows)
└── other root files           # Configuration and documentation files
```

## Directory Purposes

### Core Directories
- **src/libslic3r**: The heart of OrcaSlicer containing all the core slicing algorithms, geometry processing, and 3D printing logic
- **src/slic3r**: The GUI application layer built on top of libslic3r
- **resources**: All application resources including images, presets, and internationalization files

### Build System
- **cmake**: Contains custom CMake modules for finding dependencies
- **deps**: Build system for external dependencies
- **deps_src**: Source code for dependencies that are built as part of the project

### Development
- **scripts**: Build and utility scripts for different platforms
- **tests**: Unit and integration tests
- **sandboxes**: Development sandboxes for experimental features

### Localization
- **localization**: Source translation files
- **resources/i18n**: Compiled translation files distributed with the application

### Documentation and Configuration
- **SoftFever_doc**: Project documentation and sponsor information
- **.github**: GitHub-specific configuration (workflows, templates)
- **.devcontainer**: Development container configuration