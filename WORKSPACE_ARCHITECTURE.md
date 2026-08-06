# Workspace Architecture & Orchestration

The Workspace Orchestration layer connects standard timelines, rendering splits, and AI suggestions into a professional, non-linear creative suite.

## 1. Unified Selection Context Model
State is centralized inside `useWorkflowStore` containing:
* `workspaceMode`: Current viewport preset (Focus, Edit, Audio, Color, AI, etc.)
* `selectedContext`: Active selected platform element (Video Clip, Audio Clip, Subtitle, Camera, environment, etc.)

```
[Clip Selection Event]
        │
        ▼
 [useWorkflowStore] ────► [ContextualToolbar] ───► Expose splitting/transcription actions
        │
        └───────────────► [InspectorPanel]  ───► Dynamically load favorite faders/sliders
```

## 2. Desktop Workspace Presets
Clicking on any Persistent Workflow Navigator phase dynamically rescales panels:
* **Audio**: Waveforms maximized, timeline dominant, left mixer sliders displayed.
* **Color**: Left vectorscopes and LUT calibration cards prioritized.
* **Review**: Pinned comment channels, timeline timestamps aligned.
