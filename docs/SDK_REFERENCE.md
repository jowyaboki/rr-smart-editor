# Public Client SDK Reference

The `@ai-video-editor/public-sdk` package provides clean, high-performance, v1.0 backward-compatible bindings to interact with RR Smart Editor projects, timelines, renders, and AI pipelines.

## 1. Initializing the Client

```typescript
import { RRClient } from '@ai-video-editor/public-sdk';

const client = new RRClient({
  apiKey: 'your_production_api_key',
  baseUrl: 'https://api.onrender.com'
});
```

## 2. API References

### Project API
- `client.getProjects()`: Lists available projects.
- `client.createProject(name, config)`: Spawns a new project.
- `client.updateProject(id, payload)`: Modifies metadata.

### Timeline API
- `client.getTimeline(projectId)`: Retrieves the current tracks.
- `client.insertClips(projectId, trackId, clips)`: Inserts clip items.
- `client.deleteClips(projectId, clipIds)`: Removes clip items.

### Playback API
- `client.play(projectId)`: Starts canvas playback.
- `client.pause(projectId)`: Pauses timeline playhead.
- `client.seek(projectId, frame)`: Seeks playhead frame.

### Render API
- `client.triggerRender(timeline)`: Submits compilation render job.
- `client.getRenderStatus(jobId)`: Polling status checks.

### AI API
- `client.generateScript(prompt, tone)`: Generates natural scripting templates.
- `client.generateAudioCaptions(audioUrl)`: Transcription alignments.
