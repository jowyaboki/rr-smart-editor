# Professional Audio Engine 2.0 Architecture

This document outlines the professional audio processing, bus/aux sends routing, EBU R128 loudness management, automation interpolation, and transcription adapters implemented inside the Audio Engine.

## 1. Overview
The Audio Engine 2.0 serves as the centralized non-destructive audio routing and mixing system of RR Smart Editor. It preserves timing and render sequencing delegatibility to standard engines (Timeline, Render Pipeline) while providing mathematically strict audio routing and DSP mapping:

```
Dialogue and Music Tracks (Volume faders & panning)
  ↓
Insert Effect Chain (EQ Biquads, Limiter ratio gates)
  ↓
Send gains (Aux Sends & Routing Matrix)
  ↓
Submix & Master Bus (Summing node outputs)
  ↓
Loudness meters (EBU R128 LUFS & True Peak measurements)
  ↓
Playback Engine / Final Render Export
```

## 2. Decibel Mapping & Constant-Power Panning
Signal level decibels are mapped to linear multipliers for Float32 gain amplification:

$$gain = 10^{\frac{db}{20}}$$

Panning follows constant-power trigonometric laws to preserve perceived sound pressure levels across the stereo field:

$$L = \cos(angle), \quad R = \sin(angle)$$

## 3. Automation Splines
Automation keyframes interpolate across Linear, Hold, or Bezier curves:
*   **Linear:** $V(t) = V_0 + t(V_1 - V_0)$
*   **Bezier:** Smooth quadratic ease-in-out curve fitting.
