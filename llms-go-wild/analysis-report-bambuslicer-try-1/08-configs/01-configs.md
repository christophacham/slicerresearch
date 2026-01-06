# Configuration in BambuStudio

## Overview
BambuStudio uses a sophisticated configuration system with multiple layers of settings, presets, and inheritance. The configuration system manages printer settings, filament properties, print parameters, and application preferences.

## Configuration Architecture

### 1. Configuration Hierarchy
BambuStudio implements a hierarchical configuration system with the following layers:
- **System presets**: Factory-default configurations
- **User presets**: User-created configurations
- **Project settings**: Project-specific overrides
- **Runtime settings**: Temporary session modifications

### 2. Configuration Files
- **Location**: `%APPDATA%/BambuStudio/` (Windows), `~/.config/BambuStudio/` (Linux), `~/Library/Application Support/BambuStudio/` (macOS)
- **Format**: INI-style configuration files with JSON extensions
- **Types**: 
  - `app_config.ini`: Application preferences
  - `presets/`: Directory containing printer, filament, and print presets
  - `project.ini`: Project-specific settings

## Core Configuration Components

### 1. ConfigBase Class
- **File**: `src/libslic3r/Config.cpp`
- **Purpose**: Base class for all configuration objects
- **Features**:
  - Generic option storage
  - Type-safe value retrieval
  - Configuration validation
  - Serialization support

### 2. PrintConfig Class
- **File**: `src/libslic3r/PrintConfig.cpp`
- **Purpose**: Print-specific configuration parameters
- **Key Parameters**:
  - Layer settings (layer_height, top_solid_layers, bottom_solid_layers)
  - Infill settings (fill_density, fill_pattern, solid_infill_every_layers)
  - Perimeter settings (perimeters, external_perimeters_first, thin_walls)
  - Support settings (support_material, support_material_angle)
  - Speed settings (travel_speed, perimeter_speed, infill_speed)
  - Temperature settings (bed_temperature, first_layer_temperature, temperature)

### 3. DynamicPrintConfig Class
- **File**: `src/libslic3r/Config.cpp`
- **Purpose**: Dynamic configuration with runtime modification
- **Features**:
  - Runtime parameter changes
  - Configuration change tracking
  - Undo/redo support for configuration changes

## Preset System

### 1. Preset Class
- **File**: `src/libslic3r/Preset.cpp`
- **Purpose**: Named configuration preset
- **Types**:
  - Printer presets: Define printer capabilities and settings
  - Filament presets: Define material properties
  - Print presets: Define print quality settings
  - System presets: Factory-default configurations
  - User presets: Custom user configurations

### 2. PresetBundle Class
- **File**: `src/libslic3r/PresetBundle.cpp`
- **Purpose**: Collection of related presets
- **Features**:
  - Organized preset management
  - Cross-preset validation
  - Preset inheritance and overrides

## Configuration Categories

### 1. Printer Configuration
- **Parameters**:
  - Printer dimensions (printer_width, printer_depth, printer_height)
  - Nozzle diameter (nozzle_diameter)
  - Extruder count (extruders)
  - Build volume shape (bed_shape)
  - Firmware settings (gcode_flavor, start_gcode, end_gcode)
  - Hardware capabilities (max_print_height, machine_max_acceleration_extruding, machine_max_acceleration_retracting)

### 2. Filament Configuration
- **Parameters**:
  - Material properties (filament_diameter, filament_density, filament_cost)
  - Printing temperatures (temperature, first_layer_temperature, bed_temperature)
  - Retraction settings (retract_length, retract_speed, retract_lift)
  - Flow settings (extrusion_multiplier, filament_max_volumetric_speed)
  - Color information (filament_color)

### 3. Print Configuration
- **Parameters**:
  - Quality settings (layer_height, perimeters, fill_density)
  - Speed settings (travel_speed, perimeter_speed, infill_speed)
  - Support settings (support_material, support_material_angle, support_material_contact_distance)
  - Brim/skirt settings (brim_width, skirt_height, skirt_loops)
  - Advanced settings (avoid_crossing_perimeters, external_perimeters_first, thin_walls)

## Configuration Inheritance

### 1. Inheritance Chain
- **System presets** → **User presets** → **Project settings** → **Runtime modifications**
- Each level can override settings from the previous level
- Changes cascade down to dependent configurations

### 2. Inheritance Rules
- Printer presets can inherit from other printer presets
- Filament presets can inherit from other filament presets
- Print presets can inherit from other print presets
- Project settings override all preset settings

## Configuration Validation

### 1. Parameter Validation
- **File**: `src/libslic3r/Config.cpp`
- **Features**:
  - Range validation for numeric parameters
  - Enum validation for option parameters
  - Cross-parameter validation
  - Dependency checking

### 2. Preset Validation
- **File**: `src/slic3r/GUI/Tab.cpp`
- **Features**:
  - Printer-filament compatibility checking
  - Print parameter validation
  - Hardware capability verification

## Configuration Storage

### 1. File Format
- **Format**: INI-style with sections for different parameter types
- **Example**:
```
[print]
layer_height = 0.2
perimeters = 3
fill_density = 20%

[filament]
temperature = 200
bed_temperature = 60
filament_diameter = 1.75
```

### 2. Storage Locations
- **System presets**: Bundled with application
- **User presets**: User configuration directory
- **Project settings**: Embedded in project files
- **Application settings**: App-specific configuration directory

## GUI Configuration Interface

### 1. Parameter Panels
- **File**: `src/slic3r/GUI/ParamsPanel.cpp`
- **Features**:
  - Categorized parameter organization
  - Real-time validation
  - Search and filter capabilities
  - Parameter descriptions and tooltips

### 2. Preset Management
- **File**: `src/slic3r/GUI/Tab.cpp`
- **Features**:
  - Preset creation and editing
  - Preset import/export
  - Preset sharing capabilities
  - Preset validation

## Configuration Import/Export

### 1. Preset Import/Export
- **File**: `src/slic3r/GUI/Tab.cpp`
- **Formats**:
  - INI files for individual presets
  - Bundle files for multiple presets
  - Project files with embedded configurations

### 2. Configuration Bundles
- **Features**:
  - Complete preset collections
  - Cross-preset dependency management
  - Version compatibility checking

## Application Configuration

### 1. App Configuration
- **File**: `src/libslic3r/AppConfig.cpp`
- **Parameters**:
  - UI preferences (language, theme, window positions)
  - Default settings (default_filament, default_print)
  - Network settings (printer discovery, proxy settings)
  - Performance settings (thread_count, cache_size)

### 2. UI Configuration
- **Parameters**:
  - Window layout and sizes
  - Toolbar visibility and positions
  - Keyboard shortcuts
  - Theme and color settings

## Configuration Updates

### 1. Preset Updates
- **File**: `src/Utils/PresetUpdater.cpp`
- **Features**:
  - Automatic preset updates
  - Compatibility checking
  - Migration of old settings

### 2. Configuration Migration
- **Features**:
  - Version-to-version migration
  - Parameter renaming and reorganization
  - Backward compatibility maintenance

## Bambu-Specific Configuration

### 1. Device Configuration
- **File**: `src/slic3r/GUI/DeviceCore/DevConfig.h`
- **Parameters**:
  - Printer model identification
  - AMS (Automatic Material System) settings
  - Nozzle configuration
  - Hardware-specific parameters

### 2. Network Configuration
- **Parameters**:
  - Printer connection settings
  - MQTT configuration
  - Authentication credentials
  - Network discovery settings

## Configuration Validation and Error Handling

### 1. Validation Process
- **File**: `src/slic3r/GUI/Tab.cpp`
- **Steps**:
  - Parameter range checking
  - Cross-parameter validation
  - Hardware capability verification
  - Error reporting and correction suggestions

### 2. Error Recovery
- **Features**:
  - Fallback to default values
  - Configuration backup and restore
  - Error reporting and diagnostics

## Configuration Caching

### 1. Performance Optimization
- **Features**:
  - Configuration value caching
  - Lazy loading of presets
  - Memory-efficient storage

### 2. Cache Management
- **Features**:
  - Automatic cache invalidation
  - Cache persistence across sessions
  - Memory usage optimization