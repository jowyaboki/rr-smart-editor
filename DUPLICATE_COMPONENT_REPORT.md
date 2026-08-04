# Duplicate Component Report - Phase 0

This report highlights duplicated UI elements, duplicated logic blocks, and inconsistencies that must be unified into shared components.

## 1. Header & Navigation Duplication
* `Layout.tsx` implements a static permanent vertical sidebar drawer with links to Dashboard, Preview, and Workflows.
* `Editor.tsx` implements an independent custom workspace with a top-level `Toolbar.tsx` and left/right panel groups.
* There is no shared layout scheme or workflow switcher allowing swift transit back to dashboards.
* *Consolidation Strategy*: Introduce a professional unified Workspace Layout featuring responsive, resizable navigation panels, workspace presets, and dockable sidebars.

## 2. Dialog and Toast Notification Proliferation
* Custom dialog forms exist separately in `Dashboard.tsx`, `RecoveryDialog.tsx`, `ApprovalPromptDialog.tsx`, and `PermissionPromptDialog.tsx`.
* Multiple floating alert panels are used (e.g. `RecoveryNotifications.tsx` vs custom MUI `Alert` elements inside dashboards).
* *Consolidation Strategy*: Refactor modals to consume a unified shared `Modal` overlay component and channel all alerts to a consolidated notification center.

## 3. Toolbar, Control Bar, and Panel Bounds
* Left sidebars, preview layouts, and timelines use custom border configurations and background papers.
* Playback parameters and timeline overlays contain custom custom play, loop, scale, zoom, and fit buttons.
* *Consolidation Strategy*: Abstract generic layout structures (`Panel`, `Inspector`, `PropertyGrid`, `Toolbar`, `SplitView`) into the UI Package/Shared design system to eliminate layout logic duplication.
