import { MotionPreset } from '../types';

export const fadePreset: MotionPreset = {
  id: 'fade',
  name: 'Fade In/Out',
  description: 'Standard opacity fade',
  properties: {
    opacity: [0, 1],
  },
  duration: '300ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export const slidePreset: MotionPreset = {
  id: 'slide',
  name: 'Slide In/Out',
  description: 'Translates horizontally',
  properties: {
    transform: {
      translate: { x: [-100, 0] },
    },
  },
  duration: '400ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export const scalePreset: MotionPreset = {
  id: 'scale',
  name: 'Scale Up/Down',
  description: 'Scales from small to full size',
  properties: {
    transform: {
      scale: [0.8, 1],
    },
  },
  duration: '300ms',
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // Spring-like cubic bezier
};

export const rotatePreset: MotionPreset = {
  id: 'rotate',
  name: 'Rotate CW/CCW',
  description: 'Rotates full circle',
  properties: {
    transform: {
      rotate: [0, 360],
    },
  },
  duration: '500ms',
  easing: 'linear',
};

export const blurPreset: MotionPreset = {
  id: 'blur',
  name: 'Blur In/Out',
  description: 'Blurs from out-of-focus to sharp',
  properties: {
    filter: {
      blur: ['8px', '0px'],
    },
  },
  duration: '400ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export const bouncePreset: MotionPreset = {
  id: 'bounce',
  name: 'Bounce Motion',
  description: 'Boing boing bounce effect',
  properties: {
    transform: {
      translate: { y: [-30, 0] },
    },
  },
  duration: '600ms',
  easing: 'bounce',
};

export const elasticPreset: MotionPreset = {
  id: 'elastic',
  name: 'Elastic Spring',
  description: 'Wobbly spring animation',
  properties: {
    transform: {
      scale: [0.3, 1.0],
    },
  },
  duration: '800ms',
  easing: 'elastic',
};

export const customPreset: MotionPreset = {
  id: 'custom',
  name: 'Custom User Motion',
  properties: {},
  duration: 300,
  easing: 'linear',
};

export const defaultMotionPresets: Record<string, MotionPreset> = {
  fade: fadePreset,
  slide: slidePreset,
  scale: scalePreset,
  rotate: rotatePreset,
  blur: blurPreset,
  bounce: bouncePreset,
  elastic: elasticPreset,
  custom: customPreset,
};
