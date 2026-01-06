# PrusaSlicer Testing System

## Overview
PrusaSlicer has a comprehensive testing system using the Catch2 framework, with tests organized by functionality and component. The tests cover core algorithms, FFF printing, SLA printing, and various utility functions.

## Test Framework

### Catch2 Integration
- **tests/catch_main.hpp**: Main entry point for Catch2 test framework
- **tests/test_utils.hpp**: Test utilities and helper functions
- Uses Catch2 as the primary testing framework for unit and integration tests

## Test Organization

### Core Library Tests (tests/libslic3r/)
- **libslic3r_tests.cpp**: Main test file for the core library
- Comprehensive tests for all core slicing functionality

#### Algorithm Tests
- **test_arachne.cpp**: Arachne path planning algorithm tests
- **test_astar.cpp**: A* algorithm tests
- **test_jump_point_search.cpp**: Jump point search algorithm tests
- **test_marchingsquares.cpp**: Marching squares algorithm tests
- **test_triangulation.cpp**: Triangulation algorithm tests
- **test_voronoi.cpp**: Voronoi diagram tests

#### Data Structure Tests
- **test_anyptr.cpp**: AnyPtr utility tests
- **test_expolygon.cpp**: ExPolygon data structure tests
- **test_line.cpp**: Line data structure tests
- **test_point.cpp**: Point data structure tests
- **test_polygon.cpp**: Polygon data structure tests
- **test_polyline.cpp**: Polyline data structure tests
- **test_aabbindirect.cpp**: AABB indirect tree tests
- **test_kdtreeindirect.cpp**: KD-tree indirect tests
- **test_static_map.cpp**: Static map utility tests

#### Geometry and Mathematics Tests
- **test_geometry.cpp**: Geometry algorithm tests
- **test_measure.cpp**: Measurement utilities tests
- **test_normal_utils.cpp**: Normal vector utilities tests
- **test_min_area_boundingbox.cpp**: Minimum area bounding box tests
- **test_principal_components_2d.cpp**: 2D principal component analysis tests

#### Clipper Library Tests
- **test_clipper_utils.cpp**: Clipper utilities tests
- **test_clipper_offset.cpp**: Clipper offset tests

#### Mesh Processing Tests
- **test_meshboolean.cpp**: Mesh boolean operation tests
- **test_surface_mesh.cpp**: Surface mesh tests
- **test_trianglemesh.cpp**: Triangle mesh tests
- **test_stl.cpp**: STL file format tests
- **test_png_io.cpp**: PNG input/output tests

#### Optimization Tests
- **test_optimizers.cpp**: Optimization algorithm tests
- **test_quadric_edge_collapse.cpp**: Quadric edge collapse tests
- **test_mutable_priority_queue.cpp**: Mutable priority queue tests
- **test_mutable_polygon.cpp**: Mutable polygon tests

#### File Format Tests
- **test_3mf.cpp**: 3MF file format tests
- **test_config.cpp**: Configuration system tests

#### Specialized Feature Tests
- **test_elephant_foot_compensation.cpp**: Elephant foot compensation tests
- **test_emboss.cpp**: Embossing functionality tests
- **test_hollowing.cpp**: Hollowing algorithm tests
- **test_support_spots_generator.cpp**: Support spot generation tests
- **test_multiple_beds.cpp**: Multiple build volume tests

#### Utility Tests
- **test_utils.cpp**: General utilities tests
- **test_timeutils.cpp**: Time utilities tests
- **test_placeholder_parser.cpp**: Placeholder parsing tests
- **test_curve_fitting.cpp**: Curve fitting algorithm tests

### FFF Print Tests (tests/fff_print/)
- **fff_print_tests.cpp**: Main FFF print tests
- **benchmark_seams.cpp**: Seam placement benchmarking

#### Print Process Tests
- **test_print.cpp**: Print job tests
- **test_printobject.cpp**: Print object tests
- **test_printgcode.cpp**: Print G-code generation tests
- **test_layers.cpp**: Layer generation tests
- **test_model.cpp**: 3D model handling tests

#### Perimeter and Infill Tests
- **test_perimeters.cpp**: Perimeter generation tests
- **test_fill.cpp**: Fill pattern algorithm tests
- **test_shells.cpp**: Shell generation tests
- **test_thin_walls.cpp**: Thin wall handling tests

#### Support and Brim/Skirt Tests
- **test_support_material.cpp**: Support material generation tests
- **test_skirt_brim.cpp**: Skirt and brim generation tests

#### G-code Generation Tests
- **test_gcode.cpp**: G-code generation tests
- **test_gcodewriter.cpp**: G-code writer tests
- **test_gcode_travels.cpp**: G-code travel movement tests
- **test_gcodefindreplace.cpp**: G-code find and replace tests

#### Cooling and Retraction Tests
- **test_cooling.cpp**: Cooling logic tests
- **test_retraction.cpp**: Retraction handling tests

#### Bridge Handling Tests
- **test_bridges.cpp**: Bridge detection and handling tests
- **test_infill_above_bridges.cpp**: Infill above bridges tests

#### Seam Placement Tests
- **test_seam_aligned.cpp**: Seam alignment tests
- **test_seam_geometry.cpp**: Seam geometry tests
- **test_seam_perimeters.cpp**: Seam perimeters tests
- **test_seam_random.cpp**: Random seam placement tests
- **test_seam_rear.cpp**: Rear seam placement tests
- **test_seam_scarf.cpp**: Scarf seam placement tests
- **test_seam_shells.cpp**: Seam shells tests

#### Extrusion Tests
- **test_flow.cpp**: Flow rate calculation tests
- **test_extrusion_entity.cpp**: Extrusion entity tests
- **test_multi.cpp**: Multi-extruder tests

#### Custom G-code Tests
- **test_custom_gcode.cpp**: Custom G-code tests

#### Object Management Tests
- **test_cancel_object.cpp**: Object cancellation tests
- **test_avoid_crossing_perimeters.cpp**: Avoid crossing perimeters tests

#### Data and Utilities
- **test_data.cpp/test_data.hpp**: Test data definitions and utilities

### SLA Print Tests (tests/sla_print/)
Tests for stereolithography (resin) printing functionality

### Arrangement Tests (tests/arrange/)
Tests for object arrangement and nesting algorithms

### Utility Tests (tests/slic3rutils/)
Tests for Slic3r-specific utilities

### Thumbnail Tests (tests/thumbnails/)
Tests for thumbnail generation functionality

### C++17 Feature Tests (tests/cpp17/)
Tests for C++17-specific functionality

## Test Build System

### CMake Integration
- **tests/CMakeLists.txt**: Build configuration for tests
- Integrated with the main CMake build system
- Can be enabled/disabled with SLIC3R_BUILD_TESTS option
- Uses the same dependency system as the main application

## Test Categories

### Unit Tests
- Test individual functions and classes in isolation
- Focus on specific algorithms and data structures
- Fast execution for continuous integration

### Integration Tests
- Test interactions between multiple components
- Verify that different parts work together correctly
- Cover complete workflows and processes

### Regression Tests
- Prevent reintroduction of previously fixed bugs
- Verify that changes don't break existing functionality

## Test Coverage Areas

### Core Algorithms
- Slicing algorithms
- Path planning algorithms
- Fill pattern generation
- Support structure generation
- Seam placement algorithms

### Geometry Processing
- Polygon operations
- Mesh processing
- Boolean operations
- Transformation operations

### Configuration
- Configuration system
- Preset management
- Parameter validation

### File I/O
- STL file processing
- G-code generation
- Configuration file handling

### Performance
- Some benchmark tests included
- Focus on algorithm efficiency

## Testing Philosophy

The test suite demonstrates a comprehensive approach to testing with:
- High coverage of core algorithms
- Focus on geometric and mathematical operations
- Emphasis on edge cases and boundary conditions
- Integration testing of complete workflows
- Regular testing of critical path operations