---
sidebar_position: 131
sidebar_label: Pipeline Architecture Questions
title: Pipeline Architecture & Design - Research Questions
description: Key research questions about pipeline architecture and design for non-planar slicing
keywords: [pipeline, architecture, design, collision, avoidance]
---

# Pipeline Architecture & Design - Research Questions

## Q31: How do papers implement real-time collision prediction during slicing versus offline validation? What trade-offs exist in computational overhead?

## Q32: What architectural patterns enable dynamic switching between collision avoidance strategies (e.g., rotation-based vs. path deformation) mid-print?

## Q33: How should hardware-specific constraints (nozzle geometry, axis limits) be abstracted in the pipeline to support both industrial robots and modified desktop printers?

## Q34: What data flow strategies prevent redundant collision checks when multiple optimization passes (e.g., path ordering + orientation) interact?