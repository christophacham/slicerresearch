# APIs in BambuStudio

## Overview
BambuStudio provides multiple API layers for different purposes: internal C++ APIs for core functionality, network APIs for printer communication, and CLI APIs for command-line operations.

## Internal C++ APIs

### 1. libslic3r Core API
- **Files**: `src/libslic3r/*.hpp`
- **Purpose**: Core slicing and geometry processing functionality
- **Key Classes**:
  - `Slic3r::Model`: 3D model representation and manipulation
  - `Slic3r::Print`: Print job creation and processing
  - `Slic3r::Config`: Configuration management
  - `Slic3r::TriangleMesh`: 3D mesh operations
  - `Slic3r::ExPolygon`: 2D polygon operations with holes

#### Key Methods:
- `Model::load_from_file()`: Load 3D models from various formats
- `Print::process()`: Execute the slicing process
- `TriangleMesh::repair()`: Repair mesh geometry
- `Config::apply()`: Apply configuration settings

### 2. Slicing API
- **Files**: `src/libslic3r/Slicing.*`
- **Purpose**: 3D model slicing functionality
- **Key Classes**:
  - `Slic3r::Slicing`: Layer generation and slicing operations
  - `Slic3r::Layer`: Individual layer processing
  - `Slic3r::LayerRegion`: Region-specific layer processing

#### Key Methods:
- `Slicing::slice()`: Perform slicing operation
- `Layer::make_perimeters()`: Generate perimeter paths
- `Layer::fill_surface()`: Generate infill patterns

### 3. G-code Generation API
- **Files**: `src/libslic3r/GCode/`
- **Purpose**: G-code generation from sliced geometry
- **Key Classes**:
  - `Slic3r::GCode`: Main G-code generation
  - `Slic3r::GCodeWriter`: G-code output formatting
  - `Slic3r::GCodeSender`: G-code transmission

#### Key Methods:
- `GCode::process()`: Generate G-code from sliced data
- `GCodeWriter::write()`: Write G-code to output
- `GCodeSender::send()`: Send G-code to printer

### 4. Geometry Processing API
- **Files**: `src/libslic3r/Geometry.*`
- **Purpose**: Geometric calculations and transformations
- **Key Classes**:
  - `Slic3r::Geometry`: General geometric operations
  - `Slic3r::ClipperUtils`: Polygon clipping operations

#### Key Methods:
- `Geometry::scale()`: Scale geometric data
- `Geometry::rotate()`: Rotate geometric data
- `Geometry::clipper_offset()`: Polygon offset operations

## Network APIs

### 1. Printer Communication API
- **Files**: `src/Utils/NetworkAgent.cpp`, `src/Utils/bambu_networking.hpp`
- **Purpose**: Communication with Bambu printers
- **Key Classes**:
  - `Slic3r::NetworkAgent`: Network communication management
  - `Slic3r::PrintHost`: Print host communication

#### Key Methods:
- `NetworkAgent::connect()`: Establish connection to printer
- `NetworkAgent::send_gcode()`: Send G-code to printer
- `NetworkAgent::get_status()`: Retrieve printer status
- `NetworkAgent::subscribe()`: Subscribe to printer events

### 2. HTTP API
- **Files**: `src/Utils/Http.cpp`, `src/slic3r/GUI/HttpServer.cpp`
- **Purpose**: HTTP communication for web services
- **Key Classes**:
  - `Slic3r::Http`: HTTP client operations
  - `Slic3r::GUI::HttpServer`: HTTP server for local services

#### Key Methods:
- `Http::get()`: Perform HTTP GET request
- `Http::post()`: Perform HTTP POST request
- `HttpServer::start()`: Start local HTTP server

### 3. MQTT API
- **Files**: Various files in `src/Utils/` and `src/slic3r/GUI/`
- **Purpose**: MQTT-based communication with Bambu printers
- **Key Methods**:
- `connect_to_printer()`: Connect to printer via MQTT
- `send_command()`: Send command to printer
- `subscribe_to_topic()`: Subscribe to printer topics

## Command Line Interface (CLI) API

### 1. CLI Class
- **File**: `src/BambuStudio.cpp`
- **Purpose**: Command-line interface for batch operations
- **Key Methods**:
- `CLI::run()`: Execute CLI operations
- `CLI::setup()`: Parse command-line arguments
- `CLI::slice()`: Perform slicing from command line

#### CLI Parameters:
- `--load`: Load configuration file
- `--save`: Save configuration file
- `--slice`: Perform slicing operation
- `--export-gcode`: Export G-code
- `--output-dir`: Specify output directory

## GUI APIs

### 1. GUI Application API
- **Files**: `src/slic3r/GUI/GUI_App.*`
- **Purpose**: GUI application management
- **Key Classes**:
  - `Slic3r::GUI::GUI_App`: Main GUI application class

#### Key Methods:
- `GUI_App::OnInit()`: Initialize GUI application
- `GUI_App::post_init()`: Post-initialization setup
- `GUI_App::shutdown()`: Clean shutdown

### 2. Plater API
- **Files**: `src/slic3r/GUI/Plater.*`
- **Purpose**: 3D model placement and manipulation
- **Key Classes**:
  - `Slic3r::GUI::Plater`: Model plating operations

#### Key Methods:
- `Plater::load_model()`: Load 3D model
- `Plater::arrange()`: Arrange models on plate
- `Plater::slice()`: Initiate slicing process
- `Plater::export_gcode()`: Export generated G-code

### 3. Configuration API
- **Files**: `src/slic3r/GUI/Tab.*`, `src/slic3r/GUI/ParamsPanel.*`
- **Purpose**: Configuration management in GUI
- **Key Classes**:
  - `Slic3r::GUI::Tab`: Configuration tabs
  - `Slic3r::GUI::ParamsPanel`: Parameter panels

#### Key Methods:
- `Tab::load_presets()`: Load configuration presets
- `ParamsPanel::update()`: Update parameter values

## Plugin APIs

### 1. Plugin System API
- **Files**: Various files in `src/slic3r/GUI/` and `src/Utils/`
- **Purpose**: Plugin and extension system
- **Key Methods**:
- `load_plugin()`: Load plugin
- `install_plugin()`: Install plugin
- `update_plugins()`: Update plugins

## File Format APIs

### 1. Model Format API
- **Files**: `src/libslic3r/Format/`
- **Purpose**: Support for various 3D model formats
- **Key Classes**:
  - `Slic3r::Format::STL`: STL format handling
  - `Slic3r::Format::AMF`: AMF format handling
  - `Slic3r::Format::ThreeMF`: 3MF format handling

#### Key Methods:
- `STL::read()`: Read STL file
- `STL::write()`: Write STL file
- `ThreeMF::load()`: Load 3MF file
- `ThreeMF::save()`: Save 3MF file

### 2. G-code Format API
- **Files**: `src/libslic3r/Format/GCode.*`
- **Purpose**: G-code format handling
- **Key Methods**:
- `GCode::read()`: Read G-code file
- `GCode::write()`: Write G-code file

## Device Management APIs

### 1. Device Core API
- **Files**: `src/slic3r/GUI/DeviceCore/`
- **Purpose**: Device (printer) management
- **Key Classes**:
  - `Slic3r::DeviceManager`: Device management
  - `Slic3r::DevConfig`: Device configuration

#### Key Methods:
- `DeviceManager::connect()`: Connect to device
- `DeviceManager::get_device_list()`: Get available devices
- `DevConfig::apply()`: Apply device configuration

### 2. AMS (Automatic Material System) API
- **Files**: `src/slic3r/GUI/Widgets/AMSControl.*`
- **Purpose**: AMS management
- **Key Methods**:
- `AMSControl::get_filament_info()`: Get filament information
- `AMSControl::switch_filament()`: Switch filament

## User Management APIs

### 1. User Management API
- **Files**: `src/Utils/UserManager.*`
- **Purpose**: User account management
- **Key Classes**:
  - `Slic3r::UserManager`: User management

#### Key Methods:
- `UserManager::login()`: User login
- `UserManager::logout()`: User logout
- `UserManager::get_user_info()`: Get user information

## Notification APIs

### 1. Notification System API
- **Files**: `src/slic3r/GUI/NotificationManager.*`
- **Purpose**: User notification system
- **Key Classes**:
  - `Slic3r::GUI::NotificationManager`: Notification management

#### Key Methods:
- `NotificationManager::push_notification()`: Push notification
- `NotificationManager::show_notification()`: Show notification

## Task Management APIs

### 1. Task Management API
- **Files**: `src/slic3r/GUI/TaskManager.*`
- **Purpose**: Background task management
- **Key Classes**:
  - `Slic3r::TaskManager`: Task management

#### Key Methods:
- `TaskManager::add_task()`: Add background task
- `TaskManager::get_task_status()`: Get task status

## Job Processing APIs

### 1. Job Processing API
- **Files**: `src/slic3r/GUI/Jobs/`
- **Purpose**: Background job processing
- **Key Classes**:
  - `Slic3r::GUI::PrintJob`: Print job processing
  - `Slic3r::GUI::SendJob`: Send job processing
  - `Slic3r::GUI::ArrangeJob`: Arrange job processing

#### Key Methods:
- `PrintJob::process()`: Process print job
- `SendJob::send()`: Send job to printer
- `ArrangeJob::arrange()`: Arrange models

## Localization APIs

### 1. Internationalization API
- **Files**: `src/slic3r/GUI/I18N.*`
- **Purpose**: Internationalization support
- **Key Classes**:
  - `Slic3r::GUI::I18N`: Internationalization

#### Key Methods:
- `I18N::translate()`: Translate text
- `I18N::load_language()`: Load language

## 3D Rendering APIs

### 1. OpenGL Rendering API
- **Files**: `src/slic3r/GUI/GLCanvas3D.*`, `src/slic3r/GUI/OpenGLManager.*`
- **Purpose**: 3D rendering and visualization
- **Key Classes**:
  - `Slic3r::GUI::GLCanvas3D`: 3D canvas
  - `Slic3r::GUI::OpenGLManager`: OpenGL management

#### Key Methods:
- `GLCanvas3D::render()`: Render 3D scene
- `OpenGLManager::init()`: Initialize OpenGL

## Error Handling APIs

### 1. Exception Handling API
- **Files**: `src/libslic3r/Exception.*`
- **Purpose**: Exception handling
- **Key Classes**:
  - `Slic3r::Exception`: Base exception class
  - `Slic3r::FileParserError`: File parsing errors

#### Key Methods:
- `Exception::what()`: Get error message
- `FileParserError::get_error_info()`: Get parsing error info

## Utility APIs

### 1. File Utilities API
- **Files**: `src/libslic3r/Utils.*`, `src/Utils/FileHelp.*`
- **Purpose**: File operations and utilities
- **Key Methods**:
- `Utils::get_file_extension()`: Get file extension
- `FileHelp::file_exists()`: Check if file exists

### 2. Process Utilities API
- **Files**: `src/Utils/Process.*`
- **Purpose**: Process management
- **Key Methods**:
- `Process::run()`: Run external process
- `Process::terminate()`: Terminate process

## Version Management APIs

### 1. Version Management API
- **Files**: `src/libslic3r/Semver.*`
- **Purpose**: Version management and comparison
- **Key Classes**:
  - `Slic3r::Semver`: Semantic versioning

#### Key Methods:
- `Semver::compare()`: Compare versions
- `Semver::parse()`: Parse version string