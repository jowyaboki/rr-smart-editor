# AI to Studio Editor Handoff Specification

## Seamless Handoff Protocol
Upon graph completion, the `timeline_building` agent produces a structured `projectTimeline` spec containing:
- Multi-track video and audio clip arrangements.
- Keyframe positions, trim handles, and transition markers.
- Subtitle and caption track specifications.

## Non-Destructive Editing
Opening the generated project in the Studio Editor loads all tracks as editable clips without rasterizing or locking core media elements.
