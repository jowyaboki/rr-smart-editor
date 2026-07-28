# Virtual Production & Digital Studio Engine Architecture

This document outlines the architecture, data flows, and plugin model of the Virtual Production & Digital Studio Engine in RR Smart Editor.

## 1. Overview

The Virtual Production Engine serves as a lightweight orchestration layer over the platform's existing core engines (Effects Engine, Motion Graphics Composer, Project Graph, and Render Pipeline) to coordinate 3D studio environments, lights, cameras, and composite layers in a renderer-agnostic fashion.

## 2. Package Dependency Map

```
                     +---------------------------------------+
                     |                apps/web               |
                     |  (Zustand store, Hooks, React UIs)   |
                     +-------------------+-------------------+
                                         |
                                         v
                     +-------------------+-------------------+
                     |      packages/virtual-production      |
                     |     (Domain Models, Registries,       |
                     |       Adapters, Calibration)          |
                     +--+------+-------+------+-------+------+
                        |      |       |      |       |
                        v      v       v      v       v
+-------------------------+  +---+   +---+  +---+  +---------------+
| @ai-video-editor/shared |  |PG |   |MC |   |EE |  |  @ai-video-  |
|  (Schemas, Workflows)   |  |   |   |   |   |   |  |  editor/rc    |
+-------------------------+  +-+-+   +-+-+   +-+-+  +---------------+
                               |       |       |
                               |       |       +---> EffectsEngine
                               |       +-----------> CameraService / Transform3D
                               +-------------------> ProjectGraph / GraphEngine
```

## 3. Orchestration Sequence

```
[ User Change ] --> [ Transaction Engine ] --> [ Project Graph Node ]
                                                     |
                                                     v
[ Render Instructions ] <--- [ RenderInstructionBuilder ] <--- [ Studio Engine ]
         |
         v
[ Render Pipeline ] --> [ Canvas Render Viewport ]
```

## 4. Public API Interfaces

### `VirtualStudioEngine`

The central façade class acting as the single public entry point:

- `studioService`: Handles stage scaling and Snapping.
- `cameraService`: Kinematic dollies, bookmarks and presets.
- `lightingService`: Shadows and temperature conversion.
- `trackingService`: Smooth noise filtering and sync offsets.
- `calibrationService`: Evaluates lens matrices and distortion model.
- `compositingService`: Builds chains for real-time keying.
- `renderInstructionBuilder`: Translates studio configuration to standard render actions.
- `pluginRegistry`: Standard registration for 3rd-party adapters.

## 5. Plugin Integration Guide

To support third-party hardware or custom rendering adapters, register adapters directly with the plugin registry:

```typescript
import { globalVirtualStudioEngine, CameraAdapter } from '@ai-video-editor/virtual-production';

const myCustomTracker: TrackingAdapter = {
  id: 'vive-tracker-01',
  name: 'HTC Vive Tracker',
  type: 'object',
  startTracking: async () => { ... },
  stopTracking: async () => { ... },
  getLatestFrameData: async () => { ... }
};

globalVirtualStudioEngine.pluginRegistry.registerTrackingAdapter(myCustomTracker);
```
