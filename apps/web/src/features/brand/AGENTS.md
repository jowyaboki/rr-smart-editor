# Brand Kit & Design System Implementation Details

The brand kit provides centralized design tokens (colors, fonts, logos) for the editor.

## Core Models

- **BrandKit**: The top-level container for branding.
- **BrandPalette**: Defines primary, secondary, and accent colors.
- **BrandFont**: Manages system and custom fonts with categorization.
- **BrandLogo**: Stores multiple logo variants (favicon, primary, etc.).

## Key Services

- **ThemeResolver**: Converts a `BrandKit` into a `BrandTheme` for consumption by UI components or Remotion.
- **PaletteService**: Provides logic for palette generation and (mocked) contrast validation.
- **FontService**: Handles dynamic font registration in the browser.

## Integration

- **Projects**: Each project can optionally link to a `brandKitId`.
- **AI**: The `AIOrchestrator` uses the `ThemeResolver` to inject branding tokens into prompts and content generation logic.

## Usage

Access branding through the `useBrand` hook, which provides the active kit and its resolved theme.
