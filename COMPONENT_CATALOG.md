# UI Component Catalog - Phase 10

The complete catalog of unified reusable UI components implemented inside `@ai-video-editor/ui`.

## 1. Containers & Panels
* **`Panel`**
  * *Description*: Collapsible, dockable wrapper for core workspace grids.
  * *Props*: `title?`, `actions?`, `children`, `collapsed?`, `onToggleCollapse?`
* **`Inspector`**
  * *Description*: Sidebar layout detailing selected track elements, parameters, and ABAC policies.
  * *Props*: `title`, `children`
* **`PropertyGrid`**
  * *Description*: Responsive grid for key-value property rendering.
  * *Props*: `properties: Array<{ label, value }>`

## 2. Controls & Actions
* **`Toolbar`**
  * *Description*: Clean horizontal bar aligning actions, loops, and operations.
  * *Props*: `children`
* **`SearchBar`**
  * *Description*: Unified text filtering box matching dark suite aesthetics.
  * *Props*: `value`, `onChange`, `placeholder?`
* **`PlaybackControls`**
  * *Description*: Standard play, pause, skip, and rewind controllers.
  * *Props*: `playing`, `onPlayToggle`, `onSkipNext?`, `onSkipPrev?`
* **`TimelineControls`**
  * *Description*: Scale, fit, zoom-in, and zoom-out operations.
  * *Props*: `onZoomIn`, `onZoomOut`, `onFit`

## 3. Alerts & Indicators
* **`StatusBadge`**
  * *Description*: Status alerts for background rendering tasks.
  * *Props*: `status: 'success' | 'warning' | 'error' | 'info'`, `label`
* **`NotificationCenter`**
  * *Description*: Central dropdown tracking background progress events.
  * *Props*: `notifications`, `onClear`
* **`EmptyState`**
  * *Description*: Visually centered screen fallback when list views are empty.
  * *Props*: `title`, `description`, `action?`
* **`SkeletonLoader`**
  * *Description*: Grid skeleton block for non-blocking asynchronous loads.
  * *Props*: `rows?`
