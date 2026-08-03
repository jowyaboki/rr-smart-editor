# Automation Reference

The Automation Center provides programmatic and drag-and-drop rule execution for studio media pipelines.

## 1. Trigger-Action Architecture

Workflows are mapped as `Triggers` (events that occur in the studio) and `Actions` (sequential jobs dispatched by the engine).

### Key Triggers:
- `footage_arrives`: Fired when a new asset is ingested.
- `render_complete`: Fired when a rendering node finishes output compilation.
- `approval_granted`: Fired when client grants V1 approval.

### Key Actions:
- `transcode`: Converts video format to streaming-optimized formats.
- `generate_proxies`: Spawns lightweight low-res video files for fluid timeline previews.
- `notify_editors`: Dispatches alerts.
- `assign_review`: Publishes client review links and sets deadlines.
- `publish`: Transmits the media directly to active targets (YouTube, TikTok, etc.).

## 2. Sample Workflow Rule Map

```yaml
Workflow: Ingest pipeline automation
Trigger: footage_arrives
Actions:
  - transcode
  - generate_proxies
  - notify_editors
  - assign_review
```
