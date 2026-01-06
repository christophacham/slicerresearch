# Directory Tree Structure of BambuStudio

## Project Root
```
BambuStudio/
├── .dockerignore
├── .gitignore
├── .github/                    # GitHub configuration
│   ├── ISSUE_TEMPLATE/         # Issue templates
│   │   ├── bug_report.yml
│   │   ├── config.yml
│   │   └── feature_request.md
│   └── workflows/              # CI/CD workflows
│       ├── build_all.yml
│       ├── build_bambu.yml
│       ├── build_check_cache.yml
│       ├── build_deps.yml
│       └── build_ubuntu.yml
├── analysis-report/            # Analysis report (created during this analysis)
├── bbl/                      # Bambu Lab specific code
│   └── i18n/                 # Internationalization files
├── bbs_test_tools/            # Bambu Studio test tools
├── build_win.bat              # Windows build script
├── Build.PL                   # Perl build script
├── BuildLinux.sh              # Linux build script
├── BuildMac.sh                # macOS build script
├── cmake/                     # CMake modules
├── CMakeLists.txt             # Main CMake configuration
├── Containerfile              # Container build file
├── deps/                      # Dependencies build system
├── doc/                       # Documentation
├── docker/                    # Docker build configurations
├── DockerBuild.sh             # Docker build script
├── DockerEntrypoint.sh        # Docker entrypoint script
├── Dockerfile                 # Docker build file
├── DockerRun.sh               # Docker run script
├── lib/                       # Library files
├── LICENSE                    # License information
├── linux.d/                   # Linux distribution configurations
├── localazy.json              # Localization configuration
├── README.md                  # Project documentation
├── resources/                 # Application resources
├── sandboxes/                 # Development sandboxes
├── scripts/                   # Utility scripts
├── src/                       # Source code
├── t/                         # Perl tests
├── tests/                     # C++ tests
├── version.inc                # Version information
└── xs/                        # Perl XS modules
```

## Key Directories

### `.github/`
- Contains GitHub-specific configurations including issue templates and CI/CD workflows

### `bbl/`
- Bambu Lab specific code and internationalization files
- Contains localization files for multiple languages

### `cmake/`
- CMake modules and build configurations
- Contains Find modules for various dependencies

### `deps/`
- Dependencies build system
- Contains build configurations for third-party libraries

### `docker/`
- Docker build configurations for different platforms
- Contains Dockerfiles for building dependencies and app images

### `resources/`
- Application resources including images, icons, and UI assets
- Contains i18n localization files

### `src/`
- Main source code directory
- Contains the core application code (libslic3r, GUI, etc.)

### `tests/`
- C++ unit and integration tests
- Organized by different components (libslic3r, fff_print, sla_print, etc.)

### `xs/`
- Perl XS modules for interfacing between Perl and C++
- Contains Perl bindings for core functionality