# Data Models

## Core Data Structures

### Model
- **Model**: Top-level container for 3D printing projects
  - Contains multiple ModelObject instances
  - Manages materials and global settings
  - Handles file I/O operations (STL, OBJ, AMF, 3MF)
  - Supports project serialization

### ModelObject
- **ModelObject**: Represents a single 3D model in the scene
  - Contains multiple ModelVolume instances
  - Manages object transformations (position, rotation, scale)
  - Stores object-specific configuration settings
  - Handles instances (multiple copies of the same object)

### ModelVolume
- **ModelVolume**: Represents a single mesh volume within an object
  - Contains the actual 3D mesh data
  - Stores volume-specific properties and settings
  - Manages mesh transformations and modifications
  - Links to source file information

### ModelInstance
- **ModelInstance**: Represents a specific placement of a ModelObject
  - Stores position, rotation, and scale for each instance
  - Manages multiple copies of the same object
  - Handles object arrangement and collision detection

## Configuration System

### PrintConfig
- **PrintConfig**: Global print settings container
  - Printer-specific settings (nozzle diameter, bed size, etc.)
  - Slicing parameters (layer height, infill density, etc.)
  - G-code generation options
  - Temperature settings

### DynamicConfig
- **DynamicConfig**: Runtime-modifiable configuration
  - Stores current parameter values
  - Handles parameter validation and constraints
  - Supports serialization and deserialization

### ConfigOption
- **ConfigOption**: Base class for configuration options
  - **ConfigOptionFloat**: Single floating-point value
  - **ConfigOptionFloats**: Vector of floating-point values
  - **ConfigOptionInt**: Single integer value
  - **ConfigOptionInts**: Vector of integer values
  - **ConfigOptionString**: Single string value
  - **ConfigOptionStrings**: Vector of string values
  - **ConfigOptionBool**: Single boolean value
  - **ConfigOptionBools**: Vector of boolean values
  - **ConfigOptionEnum**: Enumerated value with string mapping
  - **ConfigOptionPoint**: 2D point (x, y coordinates)
  - **ConfigOptionPoints**: Vector of 2D points
  - **ConfigOptionFloatOrPercent**: Value that can be absolute or percentage

## Slicing Data Structures

### Print
- **Print**: Represents a single print job
  - Contains multiple PrintObject instances
  - Manages overall print settings and workflow
  - Handles G-code generation process
  - Coordinates multi-object printing

### PrintObject
- **PrintObject**: Represents a sliced 3D model
  - Contains multiple PrintRegion instances
  - Manages object-specific slicing parameters
  - Stores layer data and extrusion paths
  - Handles support structure generation

### PrintRegion
- **PrintRegion**: Represents a region with specific material/extruder
  - Contains extrusion settings for specific areas
  - Manages different materials within the same object
  - Handles multi-extruder assignments

### Layer
- **Layer**: Represents a single slice layer
  - Contains perimeters, infill, and support structures
  - Stores 2D geometry for the layer
  - Manages layer-specific settings and modifications

### ExtrusionEntity
- **ExtrusionEntity**: Base class for extrusion paths
  - **ExtrusionPath**: Single extrusion path with specific role
  - **ExtrusionLoop**: Closed loop of extrusion paths
  - **ExtrusionEntityCollection**: Group of extrusion entities

## Material System

### ModelMaterial
- **ModelMaterial**: Represents material properties
  - Physical properties (density, cost, etc.)
  - Printing parameters (temperature, flow, etc.)
  - Color and visual properties
  - Material-specific configurations

## Flow and Extrusion

### Flow
- **Flow**: Represents extrusion parameters
  - Calculates line width based on nozzle and settings
  - Manages flow rate calculations
  - Handles different extrusion roles (perimeter, infill, support)

## Support Generation

### SupportLayer
- **SupportLayer**: Support structure for a specific layer
  - Contains support points and structures
  - Manages support interface layers
  - Handles support density and pattern

## G-code Generation

### GCode
- **GCode**: G-code generation engine
  - Converts sliced geometry to G-code commands
  - Manages motion planning and optimization
  - Handles temperature and fan controls
  - Generates printer-specific G-code

## Enums and Constants

### Key Enumerations
- **PrinterTechnology**: FFF (Fused Filament Fabrication), SLA (Stereolithography)
- **GCodeFlavor**: Different G-code dialects (Marlin, RepRap, Repetier, etc.)
- **InfillPattern**: Various infill patterns (rectilinear, honeycomb, gyroid, etc.)
- **SupportMaterialPattern**: Support structure patterns
- **PrintSequence**: By layer or by object printing sequence
- **SeamPosition**: How to position the seam on perimeters
- **SlicingMode**: Regular, even-odd, or close holes slicing
- **DraftShield**: Draft shield enabled/disabled
- **BedType**: Different bed types (Default, Supertack, Cool, etc.)
- **NozzleType**: Nozzle material types (Hardened Steel, Stainless Steel, etc.)
- **PrinterStructure**: Printer kinematics (CoreXY, I3, HBot, Delta)
- **PerimeterGeneratorType**: Classic or Arachne perimeter generation
- **ZHopType**: Auto Lift, Normal Lift, Slope Lift, Spiral Lift
- **TimelapseType**: Traditional or Smooth timelapse modes