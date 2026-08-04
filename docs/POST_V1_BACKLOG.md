# Post-v1 Backlog

This list defines planned feature additions, performance optimizations, and integrations scheduled for upcoming v2 releases.

## 1. Feature Additions

- **Advanced Collaborative Cursor**: Live multi-user cursors on the timelines, synced via low-latency WebSockets.
- **Local AI Edge Model Quantization**: Support 4-bit quantizations of Whisper and Llama models to allow lightweight laptop copilot execution.
- **Deep WebGL Canvas acceleration**: Migrate the visual preview engine from canvas 2D contexts to WebGL for real-time 3D and LUT interpolation.

## 2. Platform Optimizations

- **Topological Solver Parallelization**: Speed up topological dependency resolution for gigantic dependency chains using Web Workers.
- **Incremental CDN Uploading**: Support chunked, resumable uploads for asset binary files over 50GB.

## 3. Marketplace Extensions

- **Auto-Subtitles Translator Plugin**: Dynamic real-time multi-language translations.
- **AI Color Matcher Plugin**: Automatically adapt clip CDL parameters to match the grading reference of a chosen cinematic image.
