# PrusaSlicer Core Algorithms

## Overview
The core algorithms of PrusaSlicer are contained in the libslic3r library, which handles all the fundamental 3D printing operations including slicing, path planning, G-code generation, and geometry processing.

## Slicing Algorithms

### Core Slicing
- **Slicing.cpp/hpp**: Main slicing algorithms that convert 3D models into printable layers
- **SlicingAdaptive.cpp/hpp**: Adaptive slicing that adjusts layer heights based on geometry
- **TriangleMeshSlicer.cpp/hpp**: Slicing algorithm specifically for triangle meshes
- **Layer.cpp/hpp**: Layer representation and management
- **LayerRegion.cpp/hpp**: Layer region handling for different parts of a layer

### Geometry Processing
- **Geometry.cpp/hpp**: Core geometric algorithms for 3D printing operations
- **Measure.cpp/hpp**: Measurement utilities for geometric calculations
- **MeasureUtils.hpp**: Additional measurement utilities
- **NormalUtils.cpp/hpp**: Normal vector calculations for 3D geometry
- **MinAreaBoundingBox.cpp/hpp**: Minimum area bounding box calculations
- **PrincipalComponents2D.cpp/hpp**: 2D principal component analysis for orientation

## Path Planning and Generation

### Arachne Path Planning
- **Arachne/**: Directory containing Arachne path planning algorithms
- Advanced path planning system for generating efficient toolpaths
- Focuses on minimizing travel distances and optimizing print quality

### Perimeter Generation
- **PerimeterGenerator.cpp/hpp**: Algorithm for generating perimeter loops
- Handles outer and inner perimeters with different strategies
- Manages perimeter ordering and overlap

### Fill Algorithms
- **Fill/**: Directory containing various fill pattern algorithms
- Multiple infill patterns: honeycomb, grid, triangles, gyroid, etc.
- Adaptive infill based on strength requirements
- Infill above bridges handling

### Seam Placement
- Algorithms for determining where to start and stop perimeters
- Multiple seam placement strategies: aligned, random, rear, scarf, etc.

## Support Generation

### Support Algorithms
- **Support/**: Directory containing support structure generation algorithms
- **SupportSpotsGenerator.cpp/hpp**: Support spot generation algorithms
- Automatic support generation based on overhang angles
- Tree support generation
- Support interface layers

## G-code Generation

### Core G-code Generation
- **GCode/**: Directory containing G-code generation algorithms
- **GCode.cpp/hpp**: Main G-code generation system
- **CustomGCode.cpp/hpp**: Custom G-code handling
- **GCodeReader.cpp/hpp**: G-code reading and parsing
- **GCodeSender.cpp/hpp**: G-code sending functionality

### G-code Features
- **Brim.cpp/hpp**: Brim generation around prints
- **CustomParametersHandling.cpp/hpp**: Handling of custom parameters in G-code
- Cooling logic implementation
- Retraction handling
- Travel optimization

## Mesh Processing

### Mesh Boolean Operations
- **MeshBoolean.cpp/hpp**: Boolean operations on meshes (union, intersection, difference)
- Used for combining and modifying 3D models
- **MeshNormals.cpp/hpp**: Mesh normal calculations
- **SlicesToTriangleMesh.cpp/hpp**: Converting slices back to triangle mesh

### Mesh Analysis
- **TriangleMesh.cpp/hpp**: Triangle mesh representation and operations
- **TriangleSelector.cpp/hpp**: Triangle selection algorithms
- **TriangleSelectorWrapper.cpp/hpp**: Wrapper for triangle selection
- **TriangleSetSampling.cpp/hpp**: Triangle set sampling
- **Triangulation.cpp/hpp**: Triangulation algorithms
- **Tesselate.cpp/hpp**: Tesselation algorithms

## Polygon Processing

### Clipper Library Integration
- **clipper.cpp/hpp**: Integration with Clipper polygon clipping library
- **clipper_z.cpp/hpp**: Extended Clipper functionality with Z coordinates
- **ClipperUtils.cpp/hpp**: Utilities for Clipper operations
- **ClipperZUtils.hpp**: Z-coordinate Clipper utilities

### Polygon Operations
- **Polygon.cpp/hpp**: Polygon data structure and operations
- **Polyline.cpp/hpp**: Polyline data structure and operations
- **ExPolygon.cpp/hpp**: Extended polygon with holes
- **PolygonTrimmer.cpp/hpp**: Polygon trimming algorithms
- **CutSurface.cpp/hpp**: Surface cutting algorithms
- **CutUtils.cpp/hpp**: Cutting utilities

### Spatial Data Structures
- **AABBMesh.cpp/hpp**: Axis-Aligned Bounding Box for meshes
- **AABBTreeIndirect.hpp**: Indirect AABB tree implementation
- **AABBTreeLines.hpp**: AABB tree for lines
- **KDTreeIndirect.hpp**: KD-tree for spatial queries
- **PointGrid.hpp**: Point grid data structure

## Optimization Algorithms

### Multi-Threading
- **Execution/**: Directory containing execution-related code
- **Thread.cpp/hpp**: Threading utilities for parallel processing
- Intel TBB integration for parallel algorithms
- Parallel slicing and path generation

### Advanced Optimization
- **Optimize/**: Directory containing optimization algorithms
- **QuadricEdgeCollapse.cpp/hpp**: Quadric edge collapse for mesh optimization
- **ShortEdgeCollapse.cpp/hpp**: Short edge collapse algorithms
- **JumpPointSearch.cpp/hpp**: Jump point search for pathfinding
- **ShortestPath.cpp/hpp**: Shortest path algorithms

## Model Processing

### 3D Model Handling
- **Model.cpp/hpp**: 3D model representation
- **ModelProcessing.cpp/hpp**: Model processing operations
- STL, OBJ, AMF file format support
- Model repair and validation

### Object Arrangement
- **ArrangeHelper.cpp/hpp**: Object arrangement utilities
- 2D nesting algorithms
- Collision detection

## Print Management

### Print Job Processing
- **Print.cpp/hpp**: Print job representation
- **PrintBase.cpp/hpp**: Base print class
- **PrintObject.cpp**: Print object implementation
- **PrintRegion.cpp**: Print region management
- **PrintApply.cpp**: Print application logic

### Extrusion Management
- **Extruder.cpp/hpp**: Extruder configuration and management
- **ExtrusionEntity.cpp/hpp**: Extrusion entity representation
- **ExtrusionEntityCollection.cpp/hpp**: Collection of extrusion entities
- **ExtrusionRole.cpp/hpp**: Extrusion role definitions
- **ExtrusionSimulator.cpp/hpp**: Extrusion simulation

### Flow Calculations
- **Flow.cpp/hpp**: Flow rate calculations
- Volumetric and linear flow calculations
- Pressure advance compensation

## Specialized Features

### Bridge Detection
- **BridgeDetector.cpp/hpp**: Bridge detection algorithms
- Automatic bridge speed and fan adjustments
- Bridge infill patterns

### Special Effects
- **Emboss.cpp/hpp**: Embossing functionality
- **EmbossShape.hpp**: Emboss shape definitions
- **Hollowing.cpp/hpp**: Hollowing algorithms
- **FuzzySkin.cpp/hpp**: Fuzzy skin surface effects

### Quality Improvements
- **ElephantFootCompensation.cpp/hpp**: Elephant foot compensation
- First layer optimization
- **InfillAboveBridges.cpp/hpp**: Infill above bridges

## File Format Support

### Input Formats
- **Format/**: Directory containing file format handlers
- STL file processing with repair capabilities
- OBJ file format support
- AMF file format support
- 3MF file format support

### Output Formats
- **PNGReadWrite.cpp/hpp**: PNG output for SLA printers
- **SVG.cpp/hpp**: SVG generation for visualization
- G-code output in multiple flavors

## SLA Printing Algorithms

### SLA Support
- **SLA/**: Directory containing stereolithography algorithms
- **SLAPrint.cpp/hpp**: SLA print implementation
- **SLAPrintSteps.cpp/hpp**: SLA print steps
- Layer generation for resin printing

## Advanced Algorithms

### Mathematical Algorithms
- **AStar.hpp**: A* pathfinding algorithm
- **MarchingSquares.hpp**: Marching squares for contour generation
- **TriangulateWall.hpp**: Wall triangulation algorithms

### Data Structures
- **MutablePolygon.cpp/hpp**: Mutable polygon implementation
- **MutablePriorityQueue.hpp**: Mutable priority queue
- **StaticMap.hpp**: Static map data structure
- **AnyPtr.hpp**: Type-erased pointer
- **clonable_ptr.hpp**: Clonable pointer implementation

### Utilities
- **utils.cpp/Utils.hpp**: General utilities
- **MTUtils.hpp**: Multi-threading utilities
- **Channel.hpp**: Communication channel utilities
- **enum_bitmask.hpp**: Enum bitmask utilities