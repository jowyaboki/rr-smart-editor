import { Effect } from '@ai-video-editor/shared';

export const EffectRegistry: Effect[] = [
  {
    id: 'opacity',
    name: 'Opacity',
    category: 'style',
    isStackable: true,
    parameters: [{ id: 'value', name: 'Level', type: 'number', defaultValue: 1, min: 0, max: 1, step: 0.01 }]
  },
  {
    id: 'blur',
    name: 'Blur',
    category: 'filter',
    isStackable: true,
    parameters: [{ id: 'radius', name: 'Radius', type: 'number', defaultValue: 0, min: 0, max: 50 }]
  },
  {
    id: 'brightness',
    name: 'Brightness',
    category: 'color',
    isStackable: true,
    parameters: [{ id: 'level', name: 'Level', type: 'number', defaultValue: 1, min: 0, max: 5, step: 0.1 }]
  },
  {
    id: 'contrast',
    name: 'Contrast',
    category: 'color',
    isStackable: true,
    parameters: [{ id: 'level', name: 'Level', type: 'number', defaultValue: 1, min: 0, max: 5, step: 0.1 }]
  },
  {
    id: 'saturation',
    name: 'Saturation',
    category: 'color',
    isStackable: true,
    parameters: [{ id: 'level', name: 'Level', type: 'number', defaultValue: 1, min: 0, max: 5, step: 0.1 }]
  },
  {
    id: 'grayscale',
    name: 'Grayscale',
    category: 'color',
    isStackable: true,
    parameters: [{ id: 'amount', name: 'Amount', type: 'number', defaultValue: 0, min: 0, max: 1, step: 0.1 }]
  },
  {
    id: 'sepia',
    name: 'Sepia',
    category: 'color',
    isStackable: true,
    parameters: [{ id: 'amount', name: 'Amount', type: 'number', defaultValue: 0, min: 0, max: 1, step: 0.1 }]
  },
  {
    id: 'invert',
    name: 'Invert',
    category: 'filter',
    isStackable: true,
    parameters: [{ id: 'amount', name: 'Amount', type: 'number', defaultValue: 0, min: 0, max: 1, step: 0.1 }]
  }
];
