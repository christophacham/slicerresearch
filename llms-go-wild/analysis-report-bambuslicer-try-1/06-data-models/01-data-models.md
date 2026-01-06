# Data Models in BambuStudio

## Overview
BambuStudio uses a comprehensive data model system to represent 3D printing concepts, from basic geometric primitives to complex print jobs. The data models are primarily defined in the libslic3r library with Bambu-specific extensions.

## Core Geometric Models

### 1. Point
- **File**: `src/libslic3r/Point.cpp`
- **Purpose**: Represents a 2D point in space
- **Attributes**:
  - `x`, `y`: Coordinates
- **Methods**:
  - Distance calculations
  - Point operations
  - Coordinate transformations

### 2. Line
- **File**: `src/libslic3r/Line.cpp`
- **Purpose**: Represents a line segment between two points
- **Attributes**:
  - `a`, `b`: Start and end points
- **Methods**:
  - Length calculation
  - Intersection detection
  - Line operations

### 3. Polygon
- **File**: `src/libslic3r/Polygon.cpp`
- **Purpose**: Represents a 2D polygon
- **Attributes**:
  - `points`: Vector of points defining the polygon
- **Methods**:
  - Area calculation
  - Point-in-polygon tests
  - Polygon operations (union, difference, etc.)

### 4. Polyline
- **File**: `src/libslic3r/Polyline.cpp`
- **Purpose**: Represents a sequence of connected line segments
- **Attributes**:
  - `points`: Vector of points
- **Methods**:
  - Length calculation
  - Simplification
  - Smoothing operations

### 5. TriangleMesh
- **File**: `src/libslic3r/TriangleMesh.cpp`
- **Purpose**: Represents a 3D triangular mesh
- **Attributes**:
  - `facets`: Triangular faces
  - `vertices`: 3D points
  - `facets_normal`: Face normals
- **Methods**:
  - Volume calculation
  - Mesh validation
  - Repair operations
  - Slicing operations

## Slicing Data Models

### 1. ExPolygon
- **File**: `src/libslic3r/ExPolygon.cpp`
- **Purpose**: Represents a polygon with holes (external contour + internal holes)
- **Attributes**:
  - `contour`: External polygon
  - `holes`: Vector of hole polygons
- **Methods**:
  - Area calculation
  - Point containment
  - Boolean operations

### 2. Layer
- **File**: `src/libslic3r/Layer.cpp`
- **Purpose**: Represents a single layer in the sliced model
- **Attributes**:
  - `id`: Layer number
  - `height`: Layer height
  - `regions`: Layer regions
  - `slices`: Sliced polygons
- **Methods**:
  - Region management
  - Slice operations
  - Height calculations

### 3. LayerRegion
- **File**: `src/libslic3r/LayerRegion.cpp`
- **Purpose**: Represents a region within a layer with specific properties
- **Attributes**:
  - `layer`: Parent layer
  - `region_id`: Region identifier
  - `fill_surfaces`: Surfaces to fill
  - `perimeters`: Perimeter paths
- **Methods**:
  - Fill generation
  - Perimeter management
  - Surface operations

### 4. PrintRegion
- **File**: `src/libslic3r/PrintRegion.cpp`
- **Purpose**: Represents a region of the print with specific settings
- **Attributes**:
  - `config`: Region-specific configuration
  - `fill_surfaces`: Surfaces for infill
- **Methods**:
  - Configuration management
  - Surface processing

## Model Data Models

### 1. Model
- **File**: `src/libslic3r/Model.cpp`
- **Purpose**: Represents the complete 3D model with all objects
- **Attributes**:
  - `objects`: Vector of model objects
  - `materials`: Material definitions
  - `config`: Global model configuration
- **Methods**:
  - Object management
  - Configuration application
  - Model validation

### 2. ModelObject
- **File**: `src/libslic3r/Model.cpp`
- **Purpose**: Represents a single object within the model
- **Attributes**:
  - `name`: Object name
  - `volumes`: Object volumes
  - `instances`: Object instances
  - `config`: Object-specific configuration
- **Methods**:
  - Volume management
  - Instance operations
  - Transformation operations

### 3. ModelVolume
- **File**: `src/libslic3r/Model.cpp`
- **Purpose**: Represents a volume within a model object
- **Attributes**:
  - `name`: Volume name
  - `material_id`: Associated material
  - `mesh`: Triangle mesh
  - `config`: Volume-specific configuration
- **Methods**:
  - Mesh operations
  - Configuration management

### 4. ModelInstance
- **File**: `src/libslic3r/Model.cpp`
- **Purpose**: Represents a positioned instance of a model object
- **Attributes**:
  - `model_object`: Reference to parent object
  - `transform`: Positioning transformation
  - `offset`: Position offset
- **Methods**:
  - Transformation operations
  - Position calculations

## Print Data Models

### 1. Print
- **File**: `src/libslic3r/Print.cpp`
- **Purpose**: Represents a complete print job
- **Attributes**:
  - `objects`: Print objects
  - `config`: Print configuration
  - `status`: Print status
- **Methods**:
  - Object management
  - Slicing operations
  - Status tracking

### 2. PrintObject
- **File**: `src/libslic3r/PrintObject.cpp`
- **Purpose**: Represents a single object in a print job
- **Attributes**:
  - `layers`: Object layers
  - `config`: Object configuration
  - `bounding_box`: Object bounds
- **Methods**:
  - Layer management
  - Slicing operations
  - Bounding calculations

### 3. ExtrusionEntity
- **File**: `src/libslic3r/ExtrusionEntity.cpp`
- **Purpose**: Represents an extrusion path
- **Attributes**:
  - `width`: Extrusion width
  - `height`: Extrusion height
  - `role`: Extrusion role (perimeter, infill, etc.)
- **Methods**:
  - Path operations
  - Flow calculations

## Configuration Models

### 1. ConfigBase
- **File**: `src/libslic3r/Config.cpp`
- **Purpose**: Base class for all configuration objects
- **Attributes**:
  - `options`: Configuration options
  - `keys`: Available option keys
- **Methods**:
  - Option management
  - Value retrieval
  - Configuration validation

### 2. PrintConfig
- **File**: `src/libslic3r/PrintConfig.cpp`
- **Purpose**: Print-specific configuration
- **Attributes**:
  - `layer_height`: Layer height
  - `infill_density`: Infill density
  - `perimeters`: Number of perimeters
  - `support_material`: Support settings
- **Methods**:
  - Print parameter management
  - Configuration validation

### 3. DynamicConfig
- **File**: `src/libslic3r/Config.cpp`
- **Purpose**: Dynamic configuration with runtime modification
- **Attributes**:
  - `options`: Dynamic options
  - `defaults`: Default values
- **Methods**:
  - Dynamic option management
  - Value updates
  - Change tracking

## Preset Models

### 1. Preset
- **File**: `src/libslic3r/Preset.cpp`
- **Purpose**: Named configuration preset
- **Attributes**:
  - `name`: Preset name
  - `type`: Preset type (printer, filament, print)
  - `config`: Configuration data
  - `inherits`: Parent preset
- **Methods**:
  - Configuration inheritance
  - Preset management
  - Serialization

### 2. PresetBundle
- **File**: `src/libslic3r/PresetBundle.cpp`
- **Purpose**: Collection of related presets
- **Attributes**:
  - `presets`: Collection of presets
  - `printer_presets`: Printer presets
  - `filament_presets`: Filament presets
  - `print_presets`: Print presets
- **Methods**:
  - Preset organization
  - Bundle management
  - Serialization

## GUI-Specific Models

### 1. Selection
- **File**: `src/slic3r/GUI/Selection.cpp`
- **Purpose**: Represents current selection in the UI
- **Attributes**:
  - `object_idx`: Selected object index
  - `volume_idx`: Selected volume index
  - `instance_idx`: Selected instance index
- **Methods**:
  - Selection management
  - Selection validation

### 2. BoundingBox
- **File**: `src/libslic3r/BoundingBox.cpp`
- **Purpose**: Represents a 3D bounding box
- **Attributes**:
  - `min`, `max`: Minimum and maximum coordinates
- **Methods**:
  - Bounding calculations
  - Intersection tests
  - Size calculations

### 3. BuildVolume
- **File**: `src/libslic3r/BuildVolume.cpp`
- **Purpose**: Represents the printer build volume
- **Attributes**:
  - `size`: Build volume dimensions
  - `origin`: Origin offset
  - `shape`: Build volume shape
- **Methods**:
  - Volume validation
  - Position checking
  - Dimension calculations

## Slicing Process Models

### 1. SlicingContext
- **File**: `src/libslic3r/Slicing.cpp`
- **Purpose**: Context for slicing operations
- **Attributes**:
  - `config`: Slicing configuration
  - `model`: Model to slice
  - `layers`: Generated layers
- **Methods**:
  - Slicing operations
  - Context management

### 2. GCodeProcessorResult
- **File**: `src/libslic3r/GCode/GCodeProcessor.cpp`
- **Purpose**: Results from G-code processing
- **Attributes**:
  - `toolpaths`: Generated toolpaths
  - `statistics`: Processing statistics
  - `warnings`: Processing warnings
- **Methods**:
  - Result management
  - Statistics calculation

## Bambu-Specific Extensions

### 1. MachineObject
- **File**: `src/slic3r/GUI/DeviceCore/DevManager.h`
- **Purpose**: Bambu printer-specific object
- **Attributes**:
  - `device_info`: Device information
  - `printer_config`: Printer-specific configuration
  - `ams_info`: AMS (Automatic Material System) information
- **Methods**:
  - Device management
  - Connection handling

### 2. PlateData
- **File**: `src/slic3r/GUI/PartPlate.cpp`
- **Purpose**: Plate-specific data for multi-plate printing
- **Attributes**:
  - `plate_id`: Plate identifier
  - `objects`: Plate objects
  - `config`: Plate configuration
- **Methods**:
  - Plate management
  - Object organization

### 3. DevConfig
- **File**: `src/slic3r/GUI/DeviceCore/DevConfig.h`
- **Purpose**: Device configuration model
- **Attributes**:
  - `printer_model`: Printer model information
  - `nozzle_config`: Nozzle configuration
  - `ams_config`: AMS configuration
- **Methods**:
  - Device configuration management
  - Hardware-specific settings

## Serialization Models

### 1. 3MF Format Support
- **File**: `src/libslic3r/Format/3mf.cpp`
- **Purpose**: 3MF file format data model
- **Attributes**:
  - `metadata`: File metadata
  - `resources`: Model resources
  - `build_items`: Build items
- **Methods**:
  - 3MF import/export
  - Metadata handling

### 2. Project Model
- **File**: `src/slic3r/GUI/Project.cpp`
- **Purpose**: Project file data model
- **Attributes**:
  - `project_data`: Complete project data
  - `version_info`: Version information
  - `thumbnail`: Project thumbnail
- **Methods**:
  - Project serialization
  - Version management