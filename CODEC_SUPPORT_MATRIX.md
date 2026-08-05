# Codec Support Matrix - Phase 10 (Production Engine)

The official codec support matrix of the RR Smart Editor production media engine.

## 1. Supported Formats

| Category | Format / Codec | Hardware Decoding Acceleration |
| :--- | :--- | :--- |
| **Video Decoding** | H.264, H.265, AV1, VP9 | Enabled (via WebCodecs & FFmpeg hooks) |
| **Video Encoding** | H.264, H.265, AV1, VP9 | Enabled |
| **Audio Decoding** | AAC, PCM, WAV, FLAC | Enabled (via AudioContext APIs) |
| **Audio Encoding** | AAC, WAV, FLAC | Enabled |
