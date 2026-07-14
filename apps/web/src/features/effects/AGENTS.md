# Effects Engine Implementation Details

The effects engine allows for stackable, non-destructive visual filters and styling on timeline clips.

## Core Models

- **Effect**: Static definition of an effect (parameters, category).
- **EffectInstance**: A specific application of an effect to a clip.
- **EffectAnimation**: Keyframe-based animation data for effect parameters.

## Architecture

- **EffectRegistry**: The central source of truth for all supported effects.
- **EffectEngine**: Orchestrates the evaluation of the effect stack, calculating current parameter values based on keyframes.
- **Remotion Integration**: The `EffectWrapper` applies the results of `evaluateStack` as standard CSS filters (blur, grayscale, etc.) in the render tree.

## Supported Filters

Currently supports: Opacity, Blur, Brightness, Contrast, Saturation, Grayscale, Sepia, and Invert.

## Future Expansion

The registry-based system is designed for easy plugin integration. Numeric parameters automatically support linear interpolation for animation.
