# Core Algorithms

## Slicing Algorithm
- **Layer Generation**: Converts 3D models into 2D cross-sections at specified heights
- **Variable Layer Heights**: Supports adaptive layer heights based on model geometry
- **Spiral Vase Mode**: Special slicing mode for single-walled hollow objects

## Flow Calculation
- **Extrusion Width**: Calculates appropriate line width based on nozzle diameter and material properties
- **Flow Rate**: Computes volume per unit length for consistent material deposition
- **Auto Width**: Provides default extrusion widths based on role (perimeter, infill, support)

## G-code Generation
- **Motion Planning**: Optimizes travel paths to minimize print time
- **Retraction Logic**: Manages filament retraction to prevent stringing
- **Temperature Control**: Handles heating and cooling sequences
- **Multi-extruder Support**: Manages tool changes and priming/wiping operations

## Support Generation
- **Tree Support**: Advanced support structures that branch from the build plate
- **Organic Support**: Support structures that grow organically from the model
- **Standard Support**: Traditional grid-based support structures
- **Support Interface**: Special layers between support and model for easy removal

## Infill Patterns
- **Rectilinear**: Grid pattern for standard infill
- **Honeycomb**: Hexagonal pattern for strength-to-weight ratio
- **Gyroid**: Continuous pattern for isotropic properties
- **Concentric**: Circular pattern for specific applications
- **Lightning**: Optimized path for minimal material usage

## Path Planning
- **Perimeter Generation**: Creates outer and inner wall paths
- **Infill Generation**: Fills internal areas with specified patterns
- **Top/Bottom Shell**: Creates solid layers on top and bottom surfaces
- **Bridging**: Handles spans between solid areas without support

## Collision Detection
- **Sequential Print Validation**: Ensures objects don't collide during print sequence
- **Layered Print Validation**: Checks for collisions in layer-by-layer printing
- **Wipe Tower Integration**: Validates tool change areas don't interfere with prints

## Multi-Material Handling
- **Filament Compatibility**: Checks temperature and property compatibility
- **Extruder Assignment**: Manages multiple extruders and material changes
- **Purge Volumes**: Calculates required purge volumes during tool changes