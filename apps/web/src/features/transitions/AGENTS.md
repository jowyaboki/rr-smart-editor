# Transition Engine Implementation Details

Transitions are first-class timeline objects that define how one clip transforms into another.

## Core Models

- **Transition**: Definition of a transition type and its settings.
- **TransitionInstance**: A specific occurrence of a transition on the timeline.
- **TransitionPreset**: Predefined configurations (Fade, Crossfade, etc.).

## Components

- **TimelineTransitionBlock**: Visual representation on the timeline. Supports selection and (future) resizing.
- **TransitionInspector**: Detailed configuration for the selected transition.
- **TransitionWrapper (Remotion)**: High-level component that applies the animation logic using Remotion's `interpolate` and `useCurrentFrame`.

## Engine Logic

The `TransitionEngine` calculates normalized progress (0-1) for any given frame, which can then be used to drive CSS properties (opacity, transform, blur) or Remotion sequences.
