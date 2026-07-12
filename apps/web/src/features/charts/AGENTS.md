# Data Visualization & Motion Graphics Engine Implementation Details

The chart engine provides a way to render dynamic, data-driven visualizations directly in the video timeline.

## Core Models

- **Chart**: Top-level object containing type, data bindings, layout, and animation settings.
- **ChartDataset**: Defines the link between the chart and a `DataSource` from the Data Engine.
- **ChartSeries**: Individual data lines or bar groups within the chart.
- **ChartAnimation**: Controls how the chart reveals or grows over time.

## Architecture

- **DatasetResolver**: Handles the logic of pulling raw data from a source and mapping it to the keys expected by the chart.
- **ChartRenderer**: Uses D3.js to calculate geometry and paths.
- **Remotion Integration**: The `ChartLayer` renders the chart as an animated SVG structure, ensuring smooth, frame-accurate motion graphics.

## Supported Charts

Bar, Line, Area, Pie, Donut, Scatter, Bubble, Radar, Gauge, and Timeline charts.

## Usage

Charts are integrated into the `InspectorPanel` via `ChartInspector`, allowing for real-time adjustments to axes, themes, and animation durations.
