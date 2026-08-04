# Design Tokens Catalog - Phase 10

A breakdown of all system design tokens managed dynamically by `@ai-video-editor/design-system`.

## 1. Global Color Values
```json
{
  "colors": {
    "primary": "#90caf9",
    "secondary": "#f48fb1",
    "background": "#0a1929",
    "surface": "#102031",
    "text": "#ffffff",
    "textMuted": "#b2bac2",
    "border": "#1e293b",
    "success": "#4caf50",
    "error": "#f44336"
  }
}
```

## 2. Elevation & Shadows
```json
{
  "shadows": {
    "none": "none",
    "low": "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
    "medium": "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
    "high": "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)"
  }
}
```

## 3. Borders & Radius
```json
{
  "radius": {
    "none": "0px",
    "xs": "2px",
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "full": "9999px"
  },
  "borders": {
    "thin": "1px solid {colors.border}",
    "thick": "2px solid {colors.border}",
    "primary": "2px solid {colors.primary}"
  }
}
```
