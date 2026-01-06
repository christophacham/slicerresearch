# Analysis Plan for PrusaSlicer Codebase

## Overview
This document outlines the comprehensive analysis plan for the PrusaSlicer codebase. The analysis will follow a structured approach to examine every aspect of the codebase, from high-level architecture to individual file details.

## Analysis Steps

### Step 1 — Setup & Plan (COMPLETED)
- ✅ Create the analysis-report/ folder structure
- ✅ Generate this PLAN.md document

### Step 2 — High-Level Discovery
- [ ] Scan root files: README.md, CMakeLists.txt, CMakePresets.json, LICENSE, version.inc, etc.
- [ ] Output in: 01-overview/01-project-summary.md
- [ ] Document technology stack in: 02-stack/01-languages.md, 02-stack/02-frameworks.md, 02-stack/03-dependencies.md, 02-stack/04-runtime-env.md
- [ ] Create directory tree in: 03-file-structure/01-directory-tree.md

### Step 3 — Deep File-by-File Walkthrough
- [ ] Traverse the codebase directory by directory, file by file
- [ ] Create file summaries in: 03-file-structure/02-file-annotations.md
- [ ] Group files logically while maintaining file-level granularity

### Step 4 — Feature Mapping
- [ ] Identify user-facing and system-level features
- [ ] Trace code paths from entry points
- [ ] Document features in appropriate folders:
  - 05-ui-features/ (UI-related features)
  - 04-core-algorithms/ (Core algorithms and logic)
  - 06-data-models/ (Data models and schemas)
  - 07-apis/ (API definitions and endpoints)

### Step 5 — Cross-Cutting Concerns
- [ ] Document error handling strategies
- [ ] Document logging/metrics/tracing
- [ ] Document security controls
- [ ] Document testing approach
- [ ] Document build/deploy pipelines
- [ ] Output in: 08-configs/, 09-tests/, 10-deployment/, 11-security/, 12-monitoring/

### Step 6 — Final Synthesis
- [ ] Generate executive summary in: 99-conclusion/01-executive-summary.md
- [ ] Document technical debt in: 99-conclusion/02-technical-debt.md
- [ ] Suggest improvements in: 99-conclusion/03-suggested-improvements.md

## Files to Process (Grouped by Directory)

### Root Directory
- README.md
- CMakeLists.txt
- CMakePresets.json
- LICENSE
- version.inc
- build_win.bat
- .gitignore
- .clang-format

### .github Directory
- CONTRIBUTING.md
- Other GitHub configuration files

### build-utils Directory
- Build utility scripts and configurations

### bundled_deps Directory
- Bundled dependencies

### cmake Directory
- CMake modules and configurations

### deps Directory
- External dependencies

### doc Directory
- Documentation files

### resources Directory
- Resource files (icons, images, translations, etc.)

### sandboxes Directory
- Sandbox/test environments

### src Directory
- Source code files (C++, potentially organized in subdirectories)

### tests Directory
- Test files and configurations

## Order of Analysis

1. Root files and documentation
2. Build system files (CMakeLists.txt, CMakePresets.json)
3. Source code directory (src/)
4. Test files (tests/)
5. Configuration and utility directories
6. Documentation and resources
7. Cross-cutting concerns
8. Final synthesis and conclusions

## Critical Rules

- Never skip a file — even ignored patterns must be explicitly noted
- If a file is binary or minified, document this fact
- If unsure about implementation details, note "Unclear — needs human verification"
- Always cite file paths and line ranges
- Use bullet points, tables, and code snippets for clarity
- Output all findings to disk in the analysis-report/ directory
- Log progress to analysis-report/progress.log after each major step