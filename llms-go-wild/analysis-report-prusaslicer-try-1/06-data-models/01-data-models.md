# PrusaSlicer Data Models

## Overview
The data models in PrusaSlicer are primarily contained within the libslic3r library and represent the core data structures used for 3D printing operations, from 3D models to G-code generation.

## 3D Geometry Data Models

### Basic Geometric Primitives
- **Point.cpp/hpp**: 2D and 3D point representation
  - Core data structure for coordinate representation
  - Used throughout the system for geometric calculations

- **Line.cpp/hpp**: Line segment representation
  - Represents line segments in 2D and 3D space
  - Used for path planning and geometric operations

- **Polygon.cpp/hpp**: Polygon data structure
  - Represents 2D polygons with vertices
  - Used for layer processing and fill patterns

- **Polyline.cpp/hpp**: Polyline data structure
  - Represents connected line segments
  - Used for perimeters and toolpaths

### Advanced Geometric Models
- **ExPolygon.cpp/hpp**: Extended polygon with holes
  - Represents polygons with internal holes
  - Critical for representing layer slices with internal voids
  - **ExPolygonSerialize.hpp**: Serialization for ExPolygon data

- **Surface.cpp/hpp**: Surface data structure
  - Represents different types of surfaces in a layer
  - Types include top, bottom, side, bridge surfaces

- **SurfaceCollection.cpp/hpp**: Collection of surfaces
  - Groups related surfaces together
  - Used for organizing layer data

### Mesh Data Models
- **TriangleMesh.cpp/hpp**: Triangle mesh representation
  - Represents 3D models as collections of triangles
  - Core data structure for 3D model processing
  - Includes mesh validation and repair capabilities

- **SurfaceMesh.hpp**: Surface mesh representation
  - Specialized mesh for surface representation
  - Used in support generation and surface processing

- **Model.cpp/hpp**: 3D model representation
  - Top-level model container with multiple objects
  - Handles multiple volumes and materials
  - Manages model transformations and metadata

- **ObjectID.cpp/hpp**: Object identification system
  - Unique identification for model objects
  - Used for tracking objects through processing pipeline

## Layer and Print Data Models

### Layer Structure
- **Layer.cpp/hpp**: Print layer representation
  - Represents a single layer in the print
  - Contains regions, perimeters, and infill
  - Manages layer-specific settings

- **LayerRegion.cpp/hpp**: Layer region implementation
  - Represents a region within a layer
  - Contains specific settings for that region
  - Handles different materials within a layer

### Print Job Models
- **Print.cpp/hpp**: Print job representation
  - Top-level print job container
  - Manages multiple objects and their settings
  - Coordinates the entire printing process

- **PrintBase.cpp/hpp**: Base print class
  - Base class for print operations
  - Defines common print functionality

- **PrintObject.cpp**: Print object implementation
  - Represents a single object within a print job
  - Contains sliced layers and print settings

- **PrintRegion.cpp**: Print region implementation
  - Represents a region within a print
  - Manages regional print settings

## Configuration and Settings Models

### Application Configuration
- **AppConfig.cpp/hpp**: Application configuration
  - Stores application-wide settings
  - Manages user preferences and UI settings

- **Config.cpp/hpp**: Core configuration system
  - Generic configuration handling
  - Supports serialization and validation

### Print Configuration
- **PrintConfig.cpp/hpp**: Print-specific configuration
  - Settings for print parameters (speed, temperature, etc.)
  - Handles validation and defaults
  - Supports multiple extruders

### Preset System
- **Preset.cpp/hpp**: Configuration preset
  - Stores named configuration sets
  - Supports import/export functionality

- **PresetBundle.cpp/hpp**: Bundle of presets
  - Groups related presets together
  - Manages preset collections

## Extrusion and Flow Models

### Extruder Configuration
- **Extruder.cpp/hpp**: Extruder configuration
  - Represents a single extruder in the printer
  - Contains extruder-specific settings
  - Manages tool change operations

### Extrusion Entities
- **ExtrusionEntity.cpp/hpp**: Extrusion entity representation
  - Base class for extrusion operations
  - Represents paths where material is extruded

- **ExtrusionEntityCollection.cpp/hpp**: Collection of extrusion entities
  - Groups related extrusion operations
  - Manages collections of perimeters, infill, etc.

- **ExtrusionRole.cpp/hpp**: Extrusion role definitions
  - Defines different roles for extrusion (perimeter, infill, support, etc.)
  - Used to determine how extrusion paths should be processed

### Flow Calculations
- **Flow.cpp/hpp**: Flow rate calculations
  - Calculates flow rates based on speed and extrusion width
  - Handles volumetric and linear extrusion
  - Manages pressure advance calculations

## Build Volume and Bed Models

### Build Volume
- **BuildVolume.cpp/hpp**: Build volume representation
  - Defines the printable area of the printer
  - Handles bed shape and dimensions
  - Manages multiple build volumes if supported

### Bed Models
- **MultipleBeds.cpp/hpp**: Multiple build volume support
  - Handles printers with multiple build volumes
  - Manages coordination between multiple beds

## Support and Special Feature Models

### Support Structures
- **SupportSpotsGenerator.cpp/hpp**: Support spot generation
  - Generates locations for support structures
  - Analyzes overhangs and determines support needs

### Special Effects
- **Emboss.cpp/hpp**: Embossing functionality
  - Represents embossing operations
  - Handles texture application to surfaces

- **EmbossShape.hpp**: Emboss shape definitions
  - Defines shapes used for embossing

## Serialization and Versioning

### Data Serialization
- **AnyPtr.hpp**: Type-erased pointer
  - Allows storing different types in containers
  - Used for flexible data structures

- **clonable_ptr.hpp**: Clonable pointer implementation
  - Smart pointer with cloning capability
  - Used for polymorphic data structures

### Version Management
- **Semver.cpp/hpp**: Semantic versioning
  - Handles version strings and comparisons
  - Used for configuration and profile versioning

## Spatial Data Structures

### Bounding Volumes
- **AABBMesh.cpp/hpp**: Axis-Aligned Bounding Box for meshes
  - Spatial acceleration structure for meshes
  - Improves collision detection and spatial queries

- **BoundingBox.cpp/hpp**: Bounding box implementation
  - Represents axis-aligned bounding boxes
  - Used for spatial partitioning

### Spatial Indexing
- **ExPolygonsIndex.cpp/hpp**: Indexed collection of ExPolygons
  - Spatial index for ExPolygon collections
  - Improves geometric operations performance

## File Format Models

### File Readers
- **FileReader.cpp/hpp**: File reading utilities
  - Base class for file format readers
  - Handles different 3D model formats

### Format-Specific Models
- **Format/**: Directory containing file format handlers
  - Specific models for different file formats
  - Handles STL, OBJ, AMF, and other formats

## Threading and Execution Models

### Thread Management
- **Thread.cpp/hpp**: Threading utilities
  - Thread management and synchronization
  - Used for parallel processing

### Execution Models
- **Execution/**: Directory containing execution-related models
  - Models for managing parallel execution
  - Task scheduling and coordination

## Utility Data Models

### Time Management
- **Time.cpp/hpp**: Time utilities
  - Time measurement and tracking
  - Used for performance monitoring

- **Timer.cpp/hpp**: Timer implementation
  - Timing utilities for performance measurement

### Generic Utilities
- **Utils.hpp**: General utility data structures
  - Common data structures used throughout the codebase
  - Utility functions and constants

## Specialized Algorithms Data Models

### Path Planning
- **MutablePolygon.cpp/hpp**: Mutable polygon implementation
  - Polygon that can be modified after creation
  - Used in path planning algorithms

### Optimization
- **MutablePriorityQueue.hpp**: Mutable priority queue
  - Priority queue that allows modification of priorities
  - Used in optimization algorithms

### Static Maps
- **StaticMap.hpp**: Static map data structure
  - Compile-time initialized map
  - Used for configuration and lookup tables

## Error Handling Models

### Exception Handling
- **Exception.hpp**: Exception definitions
  - Base exceptions for the library
  - Specific exception types for different error conditions

- **FileParserError.hpp**: File parsing error handling
  - Specific errors for file parsing operations
  - Detailed error information for file format issues

## Enumerations and Constants

### Bitmask Utilities
- **enum_bitmask.hpp**: Enum bitmask utilities
  - Allows combining enum values with bitwise operations
  - Used for flags and option combinations