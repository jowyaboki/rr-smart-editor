# Audio Studio Implementation Details

The audio studio provides a non-destructive multi-track environment for professional sound design and mixing.

## Core Models

- **AudioTrack**: Container for clips, effects, and track-level mixer settings (Mute/Solo/Volume/Pan).
- **AudioClip**: References an asset and defines timing, local volume, and automation.
- **AudioAutomation**: Keyframe-based control for volume, pan, and gain.
- **WaveformData**: Pre-calculated peak data for efficient UI rendering.

## Architecture

- **MixerService**: Central logic for calculating final output levels across tracks and the master bus.
- **WaveformService**: (Stub) for extracting peaks from audio assets using Web Audio API.
- **AudioEngine**: Evaluates automation curves and prepares rendering parameters for Remotion.

## Remotion Integration

Clips are mapped directly to Remotion's `<Audio />` component, with computed volumes applied frame-by-frame based on track settings and automation keyframes.

## UI Components

- **AudioTrackView**: Renders clips and waveforms on the timeline.
- **AudioMixerPanel**: Provides a standard fader-based interface for managing the mix.
