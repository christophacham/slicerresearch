# APIs

## Network Communication

### HTTP Client
- **Http**: HTTP client implementation using libcurl
  - Supports GET, POST, PUT, PATCH, DELETE methods
  - Handles authentication (Basic, Digest)
  - Manages headers and form data
  - Supports file uploads and downloads
  - Implements progress callbacks and error handling
  - Provides timeout and size limit controls

### Network Agent
- **NetworkAgent**: High-level network communication
  - Manages network requests and responses
  - Handles API endpoints for various services
  - Provides network status and connectivity checks

## Printer Communication

### Print Host Integration
- **PrintHost**: Base class for printer communication
  - **OctoPrint**: Integration with OctoPrint server
  - **PrusaLink**: Integration with PrusaLink server
  - **Duet**: Integration with Duet firmware
  - **AstroBox**: Integration with AstroBox
  - **CrealityPrint**: Integration with Creality printers
  - **ESP3D**: Integration with ESP3D firmware
  - **FlashAir**: Integration with FlashAir SD cards
  - **MKS**: Integration with MKS WiFi modules
  - **Obico**: Integration with Obico remote monitoring
  - **Repetier**: Integration with Repetier server
  - **SimplyPrint**: Integration with SimplyPrint
  - **ElegooLink**: Integration with Elegoo printers

### Communication Protocols
- **Bonjour**: Service discovery for networked printers
- **WebSocket**: Real-time communication with printers
- **Serial**: Direct serial communication with printers
- **TCP**: Direct TCP communication with printers

## File Transfer

### File Operations
- **FileTransferUtils**: File transfer utilities
  - Upload/download G-code files
  - Handle file metadata and thumbnails
  - Manage file progress and status

## Configuration Management

### Preset Updates
- **PresetUpdater**: Configuration preset management
  - Download and update printer/filament/process presets
  - Handle preset validation and compatibility
  - Manage preset synchronization

## Authentication

### Authorization
- **AuthorizationType**: Different authentication methods
  - API key authentication
  - Username/password authentication
  - OAuth integration

## G-code Processing

### G-code Generation
- **GCodeWriter**: G-code generation and formatting
  - Convert sliced geometry to G-code commands
  - Handle printer-specific G-code dialects
  - Manage temperature and fan controls

### G-code Analysis
- **GCodeReader**: Parse and analyze existing G-code
  - Extract layer information
  - Analyze print time estimates
  - Validate G-code syntax

## 3D Model Processing

### File Import/Export
- **Model Import**: Support for various 3D model formats
  - STL: Standard Triangle Language
  - OBJ: Wavefront OBJ format
  - AMF: Additive Manufacturing Format
  - 3MF: 3D Manufacturing Format
  - STEP: Standard for the Exchange of Product Data

## System Integration

### Desktop Integration
- **Desktop Integration**: System-level integration features
  - File association registration
  - Context menu integration
  - System tray notifications

### Platform-Specific Features
- **MacDarkMode**: macOS dark mode support
- **RetinaHelper**: High-DPI display support
- **InstanceCheck**: Single instance enforcement