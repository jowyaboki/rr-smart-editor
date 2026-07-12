import { ChartTheme } from '@ai-video-editor/shared';

export const ChartThemeService = {
  getDefaultTheme(): ChartTheme {
    return {
      colors: ['#1976d2', '#dc004e', '#ff9800', '#4caf50', '#9c27b0'],
      fontFamily: 'Inter, Roboto, Arial',
      fontSize: 12,
      gridColor: 'rgba(255,255,255,0.1)',
      axisColor: 'rgba(255,255,255,0.5)'
    };
  }
};
