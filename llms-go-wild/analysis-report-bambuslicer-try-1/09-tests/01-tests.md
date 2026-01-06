# Testing in BambuStudio

## Overview
BambuStudio implements a comprehensive testing strategy with multiple layers of testing including unit tests, integration tests, and system tests. The testing framework is built around Catch2 for C++ tests and Perl for legacy tests.

## Test Organization

### 1. Test Directory Structure
- **Location**: `tests/` directory
- **Organization**:
  - `libslic3r/`: Unit tests for core library components
  - `fff_print/`: Tests for FFF (Fused Filament Fabrication) printing functionality
  - `sla_print/`: Tests for SLA (Stereolithography) printing functionality
  - `libnest2d/`: Tests for nesting library
  - `slic3rutils/`: Tests for utility functions
  - `cpp17/`: C++17 specific tests
  - `data/`: Test data files (models, configurations, expected outputs)

### 2. Test Frameworks
- **Primary Framework**: Catch2 for C++ unit and integration tests
- **Secondary Framework**: Perl with Test::More for legacy tests
- **Supporting Tools**: CMake test integration, custom test utilities

## Unit Testing

### 1. Core Library Tests
- **Location**: `tests/libslic3r/`
- **Coverage**:
  - Geometry operations (Point, Polygon, Polyline, TriangleMesh)
  - Configuration management (Config, PrintConfig)
  - Slicing algorithms (Layer, LayerRegion, PerimeterGenerator)
  - File format handling (STL, 3MF, OBJ, AMF)
  - Mathematical utilities (Geometry, ClipperUtils)

#### Key Test Files:
- `test_geometry.cpp`: Geometric calculations and transformations
- `test_polygon.cpp`: Polygon operations and algorithms
- `test_config.cpp`: Configuration system validation
- `test_stl.cpp`: STL file format handling
- `test_clipper_utils.cpp`: Polygon clipping operations
- `test_marchingsquares.cpp`: Marching squares algorithm
- `test_voronoi.cpp`: Voronoi diagram generation

### 2. Slicing Algorithm Tests
- **Coverage**:
  - Layer generation accuracy
  - Perimeter generation correctness
  - Infill pattern generation
  - Support structure generation
  - Bridge detection and compensation
  - Elephant foot compensation

#### Test Categories:
- **Accuracy Tests**: Verify geometric correctness
- **Performance Tests**: Measure algorithm efficiency
- **Edge Case Tests**: Handle unusual input conditions
- **Regression Tests**: Prevent bug reintroduction

### 3. Model Processing Tests
- **Coverage**:
  - Model loading and validation
  - Mesh repair operations
  - Model transformation (scale, rotate, mirror)
  - Instance management
  - Volume calculations

## Integration Testing

### 1. FFF Printing Tests
- **Location**: `tests/fff_print/`
- **Coverage**:
  - Complete slicing pipeline
  - G-code generation accuracy
  - Print parameter validation
  - Multi-material handling
  - Support generation integration

#### Key Test Files:
- `test_print.cpp`: Complete print job processing
- `test_gcode.cpp`: G-code generation and validation
- `test_model.cpp`: Model processing pipeline
- `test_fill.cpp`: Infill algorithm integration
- `test_flow.cpp`: Flow rate calculations
- `test_support_material.cpp`: Support generation integration

### 2. SLA Printing Tests
- **Location**: `tests/sla_print/`
- **Coverage**:
  - SLA-specific slicing algorithms
  - Support point generation
  - Hollowing operations
  - Slice validation

#### Key Test Files:
- `sla_print_tests.cpp`: SLA-specific functionality
- `sla_supptgen_tests.cpp`: SLA support generation
- `sla_raycast_tests.cpp`: Raycasting operations

### 3. File Format Tests
- **Coverage**:
  - STL import/export validation
  - 3MF round-trip testing
  - OBJ format handling
  - AMF format handling
  - G-code validation

## System Testing

### 1. End-to-End Tests
- **Coverage**:
  - Complete slicing workflow
  - File import/export operations
  - Configuration application
  - G-code generation and validation

### 2. Performance Tests
- **Coverage**:
  - Slicing time measurements
  - Memory usage tracking
  - Multi-threading efficiency
  - Large model processing

## Test Data

### 1. Test Models
- **Location**: `tests/data/`
- **Types**:
  - Simple geometric shapes (cube, cylinder, sphere)
  - Complex models with overhangs
  - Models with thin walls
  - Models with bridging requirements
  - Models with support needs

#### Example Models:
- `20mm_cube.obj`: Basic cube for simple tests
- `bridge.obj`: Model with bridging requirements
- `overhang.obj`: Model with overhangs for support testing
- `pyramid.obj`: Model for layer generation testing

### 2. Configuration Files
- **Location**: `tests/data/test_config/`
- **Types**:
  - Valid configuration files
  - Invalid configuration files for error testing
  - Edge case configurations
  - Legacy configuration formats

## Test Utilities

### 1. Test Framework
- **Location**: `tests/catch2/`
- **Components**:
  - Catch2 header files
  - Custom reporters
  - Test utilities

### 2. Test Helpers
- **Location**: `tests/test_utils.hpp`
- **Features**:
  - Common test assertions
  - Mock object creation
  - Test data generation
  - Result validation utilities

## Perl Tests

### 1. Legacy Tests
- **Location**: `t/` directory and `xs/t/`
- **Coverage**:
  - XS module functionality
  - Perl-C++ interface validation
  - Legacy algorithms

#### Key Test Files:
- `t/angles.t`: Angle calculation tests
- `t/slice.t`: Slicing algorithm tests
- `t/gcode.t`: G-code generation tests
- `xs/t/*.t`: XS module tests

## Build System Integration

### 1. CMake Test Integration
- **Files**: `tests/CMakeLists.txt`, `tests/*/CMakeLists.txt`
- **Features**:
  - Automatic test discovery
  - Test compilation and linking
  - Test execution during build
  - Test result reporting

### 2. Test Execution
- **Commands**:
  - `make test`: Run all tests
  - `ctest`: CTest interface
  - `ctest -V`: Verbose test output
  - `ctest -R <pattern>`: Run tests matching pattern

## Test Categories

### 1. Unit Tests
- **Purpose**: Test individual functions and classes
- **Scope**: Single components or algorithms
- **Speed**: Fast execution
- **Coverage**: Core functionality validation

### 2. Integration Tests
- **Purpose**: Test component interactions
- **Scope**: Multiple components working together
- **Speed**: Moderate execution time
- **Coverage**: Workflow validation

### 3. Regression Tests
- **Purpose**: Prevent bug reintroduction
- **Scope**: Previously reported issues
- **Speed**: Varies by test
- **Coverage**: Bug fix validation

## Testing Philosophy

### 1. Test-Driven Development
- **Approach**: Write tests before implementation
- **Benefits**: Clear requirements, better design
- **Application**: New features and refactoring

### 2. Behavior-Driven Development
- **Approach**: Test user-facing behavior
- **Benefits**: Focus on functionality over implementation
- **Application**: UI and workflow testing

## Code Coverage

### 1. Coverage Analysis
- **Tools**: gcov, lcov for C++ coverage
- **Goals**: High coverage for critical algorithms
- **Metrics**: Function, line, and branch coverage

### 2. Coverage Reporting
- **Output**: HTML coverage reports
- **Integration**: CI/CD pipeline
- **Thresholds**: Minimum coverage requirements

## Continuous Integration Testing

### 1. CI Integration
- **Platforms**: Windows, Linux, macOS
- **Tools**: GitHub Actions, Docker-based testing
- **Frequency**: Per-commit testing

### 2. Test Environments
- **Docker**: Isolated test environments
- **Matrix Builds**: Multiple configurations
- **Parallel Execution**: Faster test runs

## Test Maintenance

### 1. Test Updates
- **Process**: Update tests when functionality changes
- **Review**: Code review includes test updates
- **Documentation**: Test purpose and expectations

### 2. Test Performance
- **Monitoring**: Track test execution time
- **Optimization**: Maintain fast test suites
- **Parallelization**: Execute tests in parallel when possible

## Specialized Tests

### 1. Memory Tests
- **Tools**: Valgrind, AddressSanitizer
- **Coverage**: Memory leak detection
- **Integration**: CI/CD pipeline

### 2. Thread Safety Tests
- **Coverage**: Multi-threading validation
- **Tools**: ThreadSanitizer
- **Scenarios**: Concurrent access patterns

### 3. Fuzz Testing
- **Approach**: Random input generation
- **Tools**: Custom fuzzing utilities
- **Coverage**: Error handling and robustness

## Test Documentation

### 1. Test Descriptions
- **Format**: Inline documentation in test files
- **Content**: Test purpose, inputs, expected outputs
- **Maintenance**: Updated with test changes

### 2. Test Results
- **Format**: XML and console output
- **Integration**: CI/CD result reporting
- **Analysis**: Historical trend tracking