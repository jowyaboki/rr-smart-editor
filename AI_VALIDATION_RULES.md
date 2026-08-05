# AI Validation Rules - Phase 10

PR validation gates designed specifically for AI-generated code.

## 1. AI Integration Rules
* **No Duplication**: Rejects any PR re-implementing custom button or pane visual logic.
* **Typing Checks**: Strict typing must be preserved.
* **Component Verification**: Checks that modifications only compose existing elements from `@ai-video-editor/ui`.
