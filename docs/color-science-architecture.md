# Professional Color Science Engine Architecture

This document outlines the professional color management, HDR profiles, trilinear 3D interpolation lookup solvers, and high-performance scope analytics implemented inside the Color Science Engine.

## 1. Overview
The Color Science Engine functions as the authoritative, non-destructive color processing layer of RR Smart Editor. It preserves image processing delegatibility to standard engines (Effects, Node Compositor) while providing mathematically strict color mapping:

```
Media
  ↓
Input Transform (Bradford Chromatic Primary adaptations)
  ↓
Working Color Space (Linear ACEScg Workspace)
  ↓
Effects Engine & Node Compositor (Standard composition)
  ↓
Color Grade (Non-destructive CDL Lift, Gamma, Gain, contrast, and pivot)
  ↓
Look LUT (.cube trilinear 3D interpolation lookup)
  ↓
Output Transform (Mapped to sRGB or Rec.709 display profiles)
  ↓
Render Pipeline
```

## 2. Core Primary Conversion Mathematics
The Bradford Chromatic Adaptation applies linear primaries transforms to map input camera gamuts to working ACEScg spaces:

$$X_{adapted} = M_{adaptation} \times X_{source}$$

Matrices are strictly inverted and cached in `ColorManagementService` to guarantee float precision.

## 3. 3D LUT Trilinear Grid Lookup Solver
LUT lookups resolve 3D grid volumes using trilinear interpolation across 8 grid boundary points:

```
          c011 ___________ c111
              /|         /|
             / |        / |
      c001  /__|_______/  | c101
           |   |       |  |
           |   |c010   |  | c110
           |  /________|__/
           | /         | /
           |/__________|/
         c000         c100
```

Size factors are scaled dynamically to avoid out-of-bounds array reads.
