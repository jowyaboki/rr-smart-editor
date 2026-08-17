# Intelligent Asset Pipeline Guide (v7.0)

## Overview
The Intelligent Asset Pipeline connects production briefs to media resolution and state tracking without creating a redundant asset management architecture.

## Asset State Machine
```
REQUIRED → SEARCHING → FOUND → SELECTED → APPROVED (or REJECTED / REPLACED)
```

## Features
- **Semantic Asset Specs**: Semantic description, visual style, aspect ratio, duration, and resolution requirements.
- **Replacement & Rollback**: Replace assets with candidate URIs while retaining previous URIs for immediate undo rollback.
- **Missing Asset Detection**: Automatic flag during quality gate checks if media URIs are unassigned.
