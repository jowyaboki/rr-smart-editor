# Component Dependency Map - Phase 0

This document tracks visual components, layout anchors, and feature-specific dependencies in the web application to guarantee non-destructive presentation refactors.

## 1. Left Navigation Drawer / App Layout
```
Layout.tsx (Shared)
  ├─ AppBar (Title & Session)
  ├─ Drawer
  │   ├─ Dashboard link -> /
  │   ├─ Preview link -> /preview
  │   ├─ Workflows link -> /workflows
  │   ├─ Projects link
  │   └─ Settings link
  └─ Main Content Wrapper
```

## 2. Editor Layout Architecture
```
Editor.tsx (Page Wrapper)
  ├─ ThemeProvider (darkTheme)
  ├─ CssBaseline
  ├─ Toolbar (ProjectId actions, Export, Render triggers)
  ├─ PanelGroup (Horizontal Split)
  │   ├─ Left Sidebar Panel (Tabs)
  │   │   ├─ Tab 1: MediaManager -> MediaBrowser & Ingestion
  │   │   ├─ Tab 2: AIAssistant -> CopilotChatWindow & ProactiveSuggestionsPanel
  │   │   ├─ Tab 3: TextOverlays placeholder
  │   │   ├─ Tab 4: AudioTracks placeholder
  │   │   ├─ Tab 5: ReviewSidebar -> CommentsPanel & AnnotationCanvas
  │   │   ├─ Tab 6: PluginManagerPanel -> ExtensionExplorer & PermissionPromptDialog
  │   │   └─ Tab 7: PerformanceDashboard
  │   ├─ Center Area Panel (Vertical Split)
  │   │   ├─ Preview Window (Video Playback, Annotation overlay canvas)
  │   │   └─ Timeline (Tracks, Waveforms, VirtualTimeline)
  │   └─ Right Properties Panel (ABAC, Color, Metadata controls)
  ├─ StatusBar (AutoSaveStatusIndicator, active node counts)
  ├─ RecoveryDialog
  └─ RecoveryNotifications (Zustand toast stream)
```

## 3. Page Routes Matrix
* `/` -> `Dashboard.tsx`
* `/preview` -> `Preview.tsx`
* `/templates` -> `Templates.tsx`
* `/workflows` -> `Workflows.tsx`
* `/renders` -> `Renders.tsx`
* `/editor/:id` -> `Editor.tsx` (Unwrapped from primary sidebar to avoid workspace constraints)
