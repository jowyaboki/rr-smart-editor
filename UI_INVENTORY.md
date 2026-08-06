# UI Inventory Audit - Phase 0

This document catalogues all views, pages, panels, drawers, dialogs, and overlays in the RR Smart Editor workspace to prepare for the UI/UX Refactor Sprint.

## 1. Top-Level Pages & Layout Containers
* **Dashboard (`apps/web/src/pages/Dashboard.tsx`)**
  * *Purpose*: User hub for project selection, statistics, and project CRUD actions (Create, Rename, Duplicate, Export, Delete).
  * *UI Components*: Lists, dialogs, form text inputs, grid containers, status cards, tooltips.
* **Editor Workspace (`apps/web/src/pages/Editor.tsx`)**
  * *Purpose*: The main non-destructive editor workspace.
  * *UI Components*: Top-level toolbar, left multi-tab sidebar (Media, AI Assistant, Text overlays, Audio, Review comments, Plugins, Performance monitors), center area (preview window, linear timeline tracking), right properties panel, and bottom status bar.
* **Video Preview Page (`apps/web/src/pages/Preview.tsx`)**
  * *Purpose*: High-fidelity preview of composed sequences with Remotion Player.
  * *UI Components*: Video viewport, playback controls panel, aspect ratio envelope containers.
* **Distributed Rendering Dash (`apps/web/src/pages/Renders.tsx`)**
  * *Purpose*: Cluster queue, active frame split monitor, worker heartbeats, and cost estimates.
  * *UI Components*: Scaling configurations, shard charts, action toolbars, node tables.
* **Dynamic Templates (`apps/web/src/pages/Templates.tsx`)**
  * *Purpose*: Scaffolding/rendering from reusable composition templates.
  * *UI Components*: Dynamic forms, visualizers, gallery card grids, search bars.
* **Workflow Automation Designer (`apps/web/src/pages/Workflows.tsx`)**
  * *Purpose*: Orchestrating custom multi-step AI rendering and delivery pipelines.
  * *UI Components*: Drag-and-drop workflow canvases, node palettes, properties editors, executing trace lists.

## 2. Shared Dialogs & Overlays
* **RecoveryDialog (`apps/web/src/features/recovery/components/RecoveryDialog.tsx`)**: Prompts user when unscheduled crashes or dirty storage states are scanned.
* **ApprovalPromptDialog (`apps/web/src/features/copilot/components/ApprovalPromptDialog.tsx`)**: Interactive dialog allowing users to confirm, edit, or reject timeline modification proposals drafted by the AI.
* **PermissionPromptDialog (`apps/web/src/features/extensions/components/PermissionPromptDialog.tsx`)**: Security modal validating plugin boundaries before installation.
* **PlanPreviewOverlay (`apps/web/src/features/copilot/components/PlanPreviewOverlay.tsx`)**: Non-modal inline frame comparisons.

## 3. Dedicated Dashboards & Specialized Inspectors
* **Security Dashboard (`apps/web/src/features/security/components/SecurityDashboard.tsx`)**: Displays active sessions, threat monitors, and compliance logs.
* **Audio Mixer Suite (`apps/web/src/features/audio/components/AudioMixerPanel.tsx`)**: Linear faders, Constant-power panners, dynamic signal routing matrices.
* **Color Grading Hub (`apps/web/src/features/color/components/ColorDashboard.tsx`)**: 3-Way color wheels, Vectorscope scopes, calibration panels, and LUT loaders.
* **Virtual Production Studio (`apps/web/src/features/virtual-production/components/StudioDashboard.tsx`)**: Telemetry charts, environment presets, camera bookmark controllers.
* **Developer API Portal (`apps/web/src/features/developer-api/components/DeveloperApiDashboard.tsx`)**: Interactive endpoint playgounds, webhooks keyring, and custom API specifications.
