# Unified AI Creation Workflow Guide (v6.0)

## Workflow Architecture
The unified creator journey guides the user from an empty project idea to a rendered, delivered video without encountering disconnected subsystems or raw technical errors.

```
IDEA → AI BRIEF → PLAN REVIEW → EXECUTION → EDITOR HANDOFF → REFINEMENT → VARIANTS → REVIEW → RENDER → DELIVER
```

## Creator Journey Stages
1. **Prompt Entry & Brief Builder (`CreatorBriefBuilder.tsx`)**: Input creative prompt; AI auto-proposes audience, platform, duration, and tone.
2. **Production Plan Review (`ProductionPlanReview.tsx`)**: Pre-execution plan inspector allowing approval, edits, re-prioritization, or agent disables.
3. **Live Execution Studio (`ExecutionWorkspace.tsx`)**: Clean progress tracking in Creator View with option to switch to Advanced Technical View.
4. **Studio Editor Handoff**: Generates a multi-track, non-destructive timeline spec editable using core editing engines.
5. **Contextual AI Refinement Loop (`AIRefinementLoop.tsx`)**: Prompt-driven timeline edits ("Make intro faster") with preview, approve, and undo support.
6. **Creative Aspect Ratio Variants (`CreativeVariantsPanel.tsx`)**: Multi-platform variants (TikTok 9:16, YouTube 16:9) without duplicating core project assets.
