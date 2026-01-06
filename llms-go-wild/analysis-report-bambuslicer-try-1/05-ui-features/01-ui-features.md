# UI Features in BambuStudio

## Overview
BambuStudio features a comprehensive GUI built with wxWidgets that provides a professional 3D printing workflow. The interface is organized around multiple tabs and panels for different aspects of the 3D printing process.

## Main Interface Components

### 1. MainFrame
- **File**: `src/slic3r/GUI/MainFrame.cpp`
- **Purpose**: Main application window containing all UI elements
- **Features**: 
  - Tabbed interface with multiple views
  - Menu and toolbar system
  - Status bar with progress indicators
  - Responsive layout management

### 2. 3D Canvas
- **File**: `src/slic3r/GUI/GLCanvas3D.cpp`
- **Purpose**: 3D model visualization and interaction
- **Features**:
  - Interactive 3D model manipulation
  - Multiple view modes (isometric, top, front, side)
  - Real-time rendering with OpenGL
  - Object selection and transformation
  - Layer-by-layer preview

### 3. Plater System
- **File**: `src/slic3r/GUI/Plater.cpp`
- **Purpose**: 3D model placement and arrangement on the print bed
- **Features**:
  - Drag-and-drop model placement
  - Automatic arrangement algorithms
  - Object rotation and scaling
  - Instance duplication
  - Collision detection
  - Print volume validation

## Tab System

### 1. Home Tab
- **Purpose**: Project management and file operations
- **Features**:
  - New/open/save project functionality
  - Recent projects list
  - Quick access to common operations

### 2. 3D Editor Tab
- **File**: `src/slic3r/GUI/Plater.cpp`
- **Purpose**: Primary 3D model editing interface
- **Features**:
  - Model manipulation tools
  - Object properties panel
  - Layer preview
  - G-code simulation

### 3. Preview Tab
- **File**: `src/slic3r/GUI/GCodePreview.cpp`
- **Purpose**: G-code visualization and analysis
- **Features**:
  - Layer-by-layer G-code preview
  - Toolpath visualization
  - Print time estimation
  - Material usage calculation

### 4. Monitor Tab
- **File**: `src/slic3r/GUI/Monitor.cpp`
- **Purpose**: Printer monitoring and control
- **Features**:
  - Live camera feed from printer
  - Print job status monitoring
  - Remote printer control
  - Print history tracking

### 5. Multi-Device Tab
- **File**: `src/slic3r/GUI/MultiMachinePage.cpp`
- **Purpose**: Multi-printer management
- **Features**:
  - Multiple printer monitoring
  - Queue management
  - Fleet control

## Configuration System

### 1. Preset Management
- **File**: `src/slic3r/GUI/Tab.cpp`
- **Purpose**: Slicing parameter management
- **Features**:
  - Printer presets
  - Filament presets
  - Print presets
  - Preset inheritance system
  - Import/export functionality

### 2. Parameter Panels
- **File**: `src/slic3r/GUI/ParamsPanel.cpp`
- **Purpose**: Slicing parameter configuration
- **Features**:
  - Categorized parameter organization
  - Search and filter functionality
  - Parameter validation
  - Real-time preview of changes

## Object Management

### 1. Object List
- **File**: `src/slic3r/GUI/ObjectList.cpp`
- **Purpose**: Model object management
- **Features**:
  - Hierarchical object display
  - Visibility toggling
  - Object selection
  - Property editing

### 2. Object Settings
- **File**: `src/slic3r/GUI/ObjectSettings.cpp`
- **Purpose**: Per-object parameter configuration
- **Features**:
  - Individual object settings
  - Material assignment
  - Print sequence configuration

### 3. Object Layers
- **File**: `src/slic3r/GUI/ObjectLayers.cpp`
- **Purpose**: Layer-specific object configuration
- **Features**:
  - Layer height control
  - Layer-specific parameters
  - Height range settings

## Advanced Tools

### 1. G-Code Viewer
- **File**: `src/slic3r/GUI/GCodePreview.cpp`
- **Purpose**: G-code analysis and visualization
- **Features**:
  - Toolpath visualization
  - Speed/feedrate visualization
  - Layer navigation
  - G-code analysis

### 2. Support Editing
- **File**: `src/slic3r/GUI/Gizmos/GLGizmoFdmSupports.cpp`
- **Purpose**: Manual support structure editing
- **Features**:
  - Interactive support point placement
  - Support parameter adjustment
  - Real-time support preview

### 3. Measurement Tools
- **File**: `src/slic3r/GUI/Gizmos/GLGizmoMeasure.cpp`
- **Purpose**: Model measurement and analysis
- **Features**:
  - Distance measurement
  - Angle measurement
  - Area calculation

## Gizmo System

### 1. Transformation Gizmos
- **File**: `src/slic3r/GUI/Gizmos/`
- **Purpose**: Interactive 3D transformations
- **Features**:
  - Move, rotate, scale gizmos
  - Axis-constrained transformations
  - Real-time feedback

### 2. Cutting Tools
- **File**: `src/slic3r/GUI/Gizmos/GLGizmoCut.cpp`
- **Purpose**: Model cutting and segmentation
- **Features**:
  - Plane-based cutting
  - Advanced cutting tools
  - Boolean operations

## Device Integration

### 1. Printer Connection
- **File**: `src/Utils/NetworkAgent.cpp`
- **Purpose**: Bambu printer integration
- **Features**:
  - Automatic printer discovery
  - Secure connection management
  - Real-time status updates

### 2. AMS Management
- **File**: `src/slic3r/GUI/Widgets/AMSControl.cpp`
- **Purpose**: Automatic Material System control
- **Features**:
  - Filament tracking
  - AMS status monitoring
  - Automatic filament assignment

## User Experience Features

### 1. Dark Mode
- **File**: `src/slic3r/GUI/dark_mode/`
- **Purpose**: Dark/light theme support
- **Features**:
  - System-aware theming
  - Custom color schemes
  - Consistent UI appearance

### 2. Keyboard Shortcuts
- **File**: `src/slic3r/GUI/KBShortcutsDialog.cpp`
- **Purpose**: Keyboard navigation and shortcuts
- **Features**:
  - Customizable shortcuts
  - Shortcut reference dialog
  - Context-sensitive shortcuts

### 3. Notification System
- **File**: `src/slic3r/GUI/NotificationManager.cpp`
- **Purpose**: User notifications and alerts
- **Features**:
  - In-app notifications
  - Priority-based alerts
  - Notification history

### 4. Progress Indicators
- **File**: `src/slic3r/GUI/ProgressStatusBar.cpp`
- **Purpose**: Operation progress tracking
- **Features**:
  - Real-time progress updates
  - Operation status display
  - Estimated time remaining

## File Operations

### 1. Import/Export
- **File**: `src/slic3r/GUI/Plater.cpp`
- **Purpose**: Model and configuration file handling
- **Features**:
  - Multiple 3D format support (STL, OBJ, 3MF, AMF)
  - G-code export
  - Project file management
  - Configuration bundles

### 2. Backup and Recovery
- **File**: `src/slic3r/GUI/UnsavedChangesDialog.cpp`
- **Purpose**: Data protection and recovery
- **Features**:
  - Auto-save functionality
  - Crash recovery
  - Unsaved changes warning

## Customization Features

### 1. UI Layout
- **File**: `src/slic3r/GUI/MainFrame.cpp`
- **Purpose**: Interface customization
- **Features**:
  - Resizable panels
  - Collapsible toolbars
  - Customizable workspace

### 2. Workflow Customization
- **File**: `src/slic3r/GUI/Preferences.cpp`
- **Purpose**: User preference management
- **Features**:
  - Interface settings
  - Default parameters
  - Workflow preferences