# Desktop Window Layout Guide

The Studio UI v5 Workspace layout engine is designed around high-performance split panes and dynamic resizers.

## Docking & Persistent Storage
* Visual layouts are managed by `react-resizable-panels` to guarantee flawless window resizing and zero lag.
* Active layout modes and preset dimensions are automatically cached locally via `LayoutPersistenceService`.
* Pre-configured modes can be imported or exported in JSON format for collaboration sync.

## Column Structuring
1. **Left Explorer Column**: Hosts project media, AI Copilot triggers, collaboration feeds, and performance heartbeats.
2. **Center Core Column**: Stacked viewport preview and multi-track timeline bars.
3. **Right Inspector Column**: Dedicated properties inspector for fine-tuned attribute control.
