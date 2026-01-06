# PrusaSlicer GUI Features

## Overview
The PrusaSlicer GUI is built using wxWidgets and includes advanced 3D visualization capabilities, configuration management, and user interaction features.

## Main Application Components

### Application Core
- **GUI_App.cpp/hpp**: Main application class managing the overall application state
- **GUI.cpp/hpp**: Core GUI functionality
- **GUI_Init.cpp/hpp**: GUI initialization
- **GUI_Factories.cpp/hpp**: GUI component factories

### Main Window and Layout
- **MainFrame.cpp/hpp**: Main application window
- **Tab.cpp/hpp**: Tab management system
- **Sidebar.cpp/hpp**: Sidebar UI component
- **TopBar.cpp/hpp**: Top toolbar
- **TopBarMenus.cpp/hpp**: Top bar menu system
- **Notebook.cpp/hpp**: Notebook (tabbed interface) component

## 3D Visualization System

### 3D Rendering
- **3DBed.cpp/hpp**: 3D build plate visualization
- **3DScene.cpp/hpp**: 3D scene management
- **GLCanvas3D.cpp/hpp**: OpenGL canvas for 3D rendering
- **GLModel.cpp/hpp**: OpenGL model representation
- **GLShader.cpp/hpp**: OpenGL shader management
- **GLShadersManager.cpp/hpp**: Shader manager
- **GLTexture.cpp/hpp**: OpenGL texture handling
- **OpenGLManager.cpp/hpp**: OpenGL context management
- **Camera.cpp/hpp**: 3D camera implementation
- **CameraUtils.cpp/hpp**: Camera utilities
- **CoordAxes.cpp/hpp**: Coordinate axes visualization

### 3D Interaction
- **Mouse3DController.cpp/hpp**: 3D mouse interaction controller
- **Mouse3DHandlerMac.mm**: macOS-specific mouse handling
- **SceneRaycaster.cpp/hpp**: 3D scene raycasting for object selection
- **SurfaceDrag.cpp/hpp**: Surface dragging functionality

### 2D Visualization
- **2DBed.cpp/hpp**: 2D build plate visualization
- **DoubleSliderForGcode.cpp/hpp**: G-code double slider control
- **DoubleSliderForLayers.cpp/hpp**: Layer double slider control
- **RulerForDoubleSlider.cpp/hpp**: Ruler for double slider controls
- **GLSelectionRectangle.cpp/hpp**: OpenGL selection rectangle

## Object Management

### Object Plater
- **Plater.cpp/hpp**: Object plating system
- **GUI_ObjectList.cpp/hpp**: Object list management
- **GUI_ObjectManipulation.cpp/hpp**: Object manipulation
- **GUI_ObjectSettings.cpp/hpp**: Object settings
- **GUI_ObjectLayers.cpp/hpp**: Object layer management

### Object Selection and Data
- **Selection.cpp/hpp**: Object selection system
- **ObjectDataViewModel.cpp/hpp**: Object data view model
- **InstanceCheck.cpp/hpp**: Instance checking
- **InstanceCheckMac.h/mm**: macOS-specific instance checking

## Configuration System

### Preset Management
- **ConfigWizard.cpp/hpp**: Configuration wizard
- **ConfigWizard_private.hpp**: Private config wizard implementation
- **ConfigWizardWebViewPage.cpp/hpp**: Web view page for config wizard
- **PresetComboBoxes.cpp/hpp**: Preset combo boxes
- **SavePresetDialog.cpp/hpp**: Save preset dialog
- **ConfigSnapshotDialog.cpp/hpp**: Configuration snapshot dialog
- **PresetHints.cpp/hpp**: Preset hints
- **PresetArchiveDatabase.cpp/hpp**: Preset archive database

### Configuration Manipulation
- **ConfigManipulation.cpp/hpp**: Configuration manipulation utilities
- **FrequentlyChangedParameters.cpp/hpp**: Frequently changed parameters
- **ConfigExceptions.hpp**: Configuration exceptions

## Dialogs and User Interaction

### Common Dialogs
- **AboutDialog.cpp/hpp**: About dialog
- **BedShapeDialog.cpp/hpp**: Bed shape dialog
- **BonjourDialog.cpp/hpp**: Bonjour network dialog
- **BulkExportDialog.cpp/hpp**: Bulk export dialog
- **EditGCodeDialog.cpp/hpp**: G-code editing dialog
- **ExtruderSequenceDialog.cpp/hpp**: Extruder sequence dialog
- **FirmwareDialog.cpp/hpp**: Firmware dialog
- **GalleryDialog.cpp/hpp**: Gallery dialog
- **LoadStepDialog.cpp/hpp**: Load step dialog
- **LoginDialog.cpp/hpp**: Login dialog
- **PhysicalPrinterDialog.cpp/hpp**: Physical printer dialog
- **Preferences.cpp/hpp**: Preferences dialog
- **SavePresetDialog.cpp/hpp**: Save preset dialog
- **SendSystemInfoDialog.cpp/hpp**: Send system info dialog
- **SysInfoDialog.cpp/hpp**: System info dialog
- **UnsavedChangesDialog.cpp/hpp**: Unsaved changes dialog
- **WifiConfigDialog.cpp/hpp**: WiFi configuration dialog
- **WipeTowerDialog.cpp/hpp**: Wipe tower dialog

### Message and Notification Dialogs
- **MsgDialog.cpp/hpp**: Message dialog
- **HintNotification.cpp/hpp**: Hint notifications
- **NotificationManager.cpp/hpp**: Notification manager

## G-code and Preview

### G-code Viewer
- **GCodeViewer.cpp/hpp**: G-code viewer
- **GUI_Preview.cpp/hpp**: GUI preview functionality
- **ExtraRenderers.cpp/hpp**: Extra rendering functionality

## Input Controls

### Custom Controls
- **BitmapComboBox.cpp/hpp**: Bitmap combo box control
- **BitmapCache.cpp/hpp**: Bitmap caching system
- **ButtonsDescription.cpp/hpp**: Buttons description
- **Field.cpp/hpp**: Input field management
- **OptionsGroup.cpp/hpp**: Options group control
- **OG_CustomCtrl.cpp/hpp**: Custom option group controls
- **TextLines.cpp/hpp**: Text lines control

### ImGui Integration
- **ImGuiDoubleSlider.cpp/hpp**: ImGui double slider
- **ImGuiPureWrap.cpp/hpp**: ImGui pure wrapper
- **ImGuiWrapper.cpp/hpp**: ImGui wrapper
- **ArrangeSettingsDialogImgui.cpp/hpp**: Arrange settings dialog (ImGui)

## Web View Components

### Web Integration
- **WebView.cpp/hpp**: Web view component
- **WebView2.h**: WebView2 header
- **WebViewDialog.cpp/hpp**: Web view dialog
- **WebViewPanel.cpp/hpp**: Web view panel
- **WebViewPlatformUtils.hpp**: Web view platform utilities
- **WebViewPlatformUtilsLinux.cpp**: Linux web view utilities
- **WebViewPlatformUtilsMac.mm**: macOS web view utilities
- **WebViewPlatformUtilsWin32.cpp**: Windows web view utilities

## System Integration

### Platform-Specific Features
- **DesktopIntegrationDialog.cpp/hpp**: Desktop integration dialog
- **RemovableDriveManager.cpp/hpp**: Removable drive manager
- **RemovableDriveManagerMM.h/mm**: macOS removable drive manager
- **ConnectRequestHandler.cpp/hpp**: Connection request handler

### Updates and Downloads
- **Downloader.cpp/hpp**: Download manager
- **DownloaderFileGet.cpp/hpp**: File download functionality
- **UpdatesUIManager.cpp/hpp**: Updates UI manager
- **UpdateDialogs.cpp/hpp**: Update dialogs

## User Account System

### Account Management
- **UserAccount.cpp/hpp**: User account management
- **UserAccountCommunication.cpp/hpp**: Account communication
- **UserAccountSession.cpp/hpp**: Account session management
- **UserAccountUtils.cpp/hpp**: Account utilities

## Utilities and Helpers

### UI Utilities
- **GUI_Utils.cpp/hpp**: GUI utilities
- **GUI_Geometry.cpp/hpp**: GUI geometry utilities
- **I18N.cpp/hpp**: Internationalization utilities
- **IconManager.cpp/hpp**: Icon management
- **Search.cpp/hpp**: Search functionality
- **ProjectDirtyStateManager.cpp/hpp**: Project dirty state management
- **ProgressStatusBar.cpp/hpp**: Progress status bar

### Background Processing
- **BackgroundSlicingProcess.cpp/hpp**: Background slicing process
- **FileArchiveDialog.cpp/hpp**: File archive dialog

### Keyboard Shortcuts
- **KBShortcutsDialog.cpp/hpp**: Keyboard shortcuts dialog

### 3D Printing Specific
- **RammingChart.cpp/hpp**: Ramming chart visualization
- **PrintHostDialogs.cpp/hpp**: Print host dialogs

## Gizmos and Advanced Features

### Gizmos Directory
- **Gizmos/**: Directory containing 3D manipulation gizmos
- **Jobs/**: Directory containing background job management
- **LibVGCode/**: Directory containing vector G-code components
- **Widgets/**: Directory containing custom UI widgets

## Event System

### Event Management
- **Event.hpp**: Event system definitions
- **TickCodesManager.cpp/hpp**: Tick codes manager

## Platform-Specific Code

### Cross-Platform Utilities
- **wxExtensions.cpp/hpp**: wxWidgets extensions
- **wxinit.h**: wxWidgets initialization