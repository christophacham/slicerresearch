# Project Summary: BambuStudio

## Overview
BambuStudio is a cutting-edge, feature-rich slicing software developed by Bambu Lab. It is based on PrusaSlicer by Prusa Research, which originates from Slic3r by Alessandro Ranellucci and the RepRap community.

## Purpose
BambuStudio serves as a 3D printing slicing application that converts 3D models into G-code instructions for 3D printers. It provides project-based workflows with systematically optimized slicing algorithms and an easy-to-use graphical interface.

## Key Features
- Basic slicing features & GCode viewer
- Multiple plates management
- Remote control & monitoring
- Auto-arrange objects
- Auto-orient objects
- Hybrid/Tree/Normal support types, Customized support
- Multi-material printing and rich painting tools
- Multi-platform (Win/Mac/Linux) support
- Global/Object/Part level slicing parameters
- Advanced cooling logic controlling fan speed and dynamic print speed
- Auto brim according to mechanical analysis
- Support arc path (G2/G3)
- Support STEP format
- Assembly & explosion view
- Flushing transition-filament into infill/object during filament change

## Technical Foundation
- Based on PrusaSlicer (GNU AGPL v3)
- Originally based on Slic3r (GNU AGPL v3)
- Licensed under GNU Affero General Public License, version 3
- Optional networking plugin with non-free libraries for extended networking functionalities

## Supported Platforms
- Windows 64-bit
- macOS 64-bit
- Linux (Ubuntu/Fedora with AppImage support, Flathub version available)

## Build System
- CMake-based build system
- Cross-platform compilation support
- Multiple build scripts for different platforms (build_win.bat, BuildLinux.sh, BuildMac.sh)
- Docker support for containerized builds