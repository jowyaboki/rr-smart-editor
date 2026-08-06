# Live Collaboration Layer Architecture

The Live Collaboration layer facilitates seamless, multi-user real-time orchestration without state lockouts.

## State Distribution Engine
* **Connected Collaborators**: Managed by the global context store `useWorkflowStore.ts`.
* **Playhead Broadcasts**: Teammate playback positions map dynamically onto the ruler space in the form of labeled vertical line guides.
* **Selection Broadcasting**: Actively selected track items are given color-coded dashed outlines to prevent collision overlaps.
