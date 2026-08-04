# Design Token Audit - Phase 0

A review of styling structures, inline CSS overrides, and custom design tokens in the workspace.

## 1. System Color Schemes & CSS Custom Properties
The `@ai-video-editor/design-system` engine resolves tokens through dynamic parent-child themes. The `DesignSystemProvider` compiles and injects these variables directly into the document:
* `--colors-primary`: Main theme highlights.
* `--colors-secondary`: Alternating accents.
* `--colors-background`: Deep dark workspace panel bounds (`#0a1929` default).
* `--colors-surface`: Workspace panel cards background (`#102031` default).
* `--colors-text`: Primary typography contrast (`#ffffff`).
* `--colors-textMuted`: Secondary/dim text descriptions (`#b2bac2`).
* `--colors-border`: Main panel splits and delimiters (`#1e293b`).

## 2. Inconsistent Spacing Scales
* Spacing classes are mixed between raw MUI units (e.g. `sx={{ p: 2 }}` which multiplies default themes) and custom inline css paddings (e.g. `style={{ padding: '24px' }}`).
* These will be standardized into a singular, predictable 4px grid spacing system using custom CSS properties:
  * Extra Small (xs): 4px (`var(--spacing-xs)`)
  * Small (sm): 8px (`var(--spacing-sm)`)
  * Medium (md): 16px (`var(--spacing-md)`)
  * Large (lg): 24px (`var(--spacing-lg)`)
  * Extra Large (xl): 32px (`var(--spacing-xl)`)

## 3. Font / Typography Scale Audit
* Most dashboard views rely on default material headers (`variant="h4"`, `variant="h6"`, etc.).
* Inline font sizes (e.g., `fontSize: '12px'`, `fontSize: '24px'`) are spread across several feature dashboards.
* These will be refactored to consume unified typography scale variables (such as `var(--typography-body1-fontSize)` or unified styling variables of the theme).
