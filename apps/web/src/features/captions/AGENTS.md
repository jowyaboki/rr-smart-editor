# Caption Studio Implementation Details

The Caption Studio provides word-level synchronization between audio/speech and on-screen text.

## Core Models

- **CaptionTrack**: Container for a transcript and styling.
- **CaptionSegment**: A sentence or phrase-level block of text with timing.
- **CaptionWord**: Individual word timing for high-performance highlighting.
- **Transcript**: The complete sequence of segments for a track.

## Integration

- **Typography**: Captions reuse the `TextEngine` and its `TextStyle` models.
- **Timeline**: Captions are displayed in a dedicated area above the standard tracks, supporting specialized segment manipulation.
- **Remotion**: The `CaptionLayer` uses the `CaptionEngine` to perform real-time word-by-word highlighting during playback.

## Formatting

Supports import/export for SRT and VTT formats via the `TranscriptService`.

## Future AI Support

The structure of `CaptionWord` and `confidence` scores in the models is designed to seamlessly integrate with AI transcription providers like OpenAI Whisper or Deepgram.
