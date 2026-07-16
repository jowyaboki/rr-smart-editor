// Seedable random number generator for determinism
let currentSeed = 12345;
export function setRandomSeed(seed: number) {
  currentSeed = seed;
}

export function deterministicRandom(): number {
  // LCG parameters
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);
  currentSeed = (a * currentSeed + c) % m;
  return currentSeed / m;
}

// Simple deterministic sine-based 1D/2D/3D pseudo-noise
export function noise1D(x: number): number {
  const sinVal = Math.sin(x) * 43758.5453123;
  return sinVal - Math.floor(sinVal);
}

export function noise2D(x: number, y: number): number {
  const sinVal = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
  return sinVal - Math.floor(sinVal);
}

export function noise3D(x: number, y: number, z: number): number {
  const sinVal = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453123;
  return sinVal - Math.floor(sinVal);
}

export const builtInFunctions: Record<string, Function> = {
  clamp: (val: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, val));
  },

  lerp: (start: number, end: number, t: number): number => {
    const clampedT = Math.max(0, Math.min(1, t));
    return start + (end - start) * clampedT;
  },

  linear: (t: number, tMin: number, tMax: number, value1: number, value2: number): number => {
    if (tMax === tMin) return value1;
    const proportion = (t - tMin) / (tMax - tMin);
    const clampedProp = Math.max(0, Math.min(1, proportion));
    return value1 + (value2 - value1) * clampedProp;
  },

  ease: (t: number, tMin: number, tMax: number, value1: number, value2: number): number => {
    if (tMax === tMin) return value1;
    const proportion = (t - tMin) / (tMax - tMin);
    const clampedProp = Math.max(0, Math.min(1, proportion));
    // Cubic ease in-out: 3t^2 - 2t^3
    const easedProp = clampedProp * clampedProp * (3 - 2 * clampedProp);
    return value1 + (value2 - value1) * easedProp;
  },

  random: (minOrMax?: number, max?: number): number => {
    const r = deterministicRandom();
    if (minOrMax === undefined) {
      return r;
    }
    if (max === undefined) {
      return r * minOrMax;
    }
    return minOrMax + r * (max - minOrMax);
  },

  noise: (x: number, y?: number, z?: number): number => {
    if (y === undefined && z === undefined) {
      return noise1D(x);
    }
    if (z === undefined && y !== undefined) {
      return noise2D(x, y);
    }
    if (y !== undefined && z !== undefined) {
      return noise3D(x, y, z);
    }
    return 0;
  },

  wiggle: (freq: number, amp: number, timeVal: number = 0, octaves: number = 1): number => {
    let value = 0;
    let curFreq = freq;
    let curAmp = amp;
    for (let i = 0; i < octaves; i++) {
      value += (noise1D(timeVal * curFreq) * 2 - 1) * curAmp;
      curFreq *= 2;
      curAmp *= 0.5;
    }
    return value;
  },

  smooth: (values: number[], width = 5): number => {
    if (!Array.isArray(values) || values.length === 0) return 0;
    const count = Math.min(width, values.length);
    const slice = values.slice(-count);
    const sum = slice.reduce((acc, v) => acc + v, 0);
    return sum / slice.length;
  },

  sin: (x: number): number => Math.sin(x),
  cos: (x: number): number => Math.cos(x),
  tan: (x: number): number => Math.tan(x),
  min: (...args: number[]): number => Math.min(...args),
  max: (...args: number[]): number => Math.max(...args),
  abs: (x: number): number => Math.abs(x),
  floor: (x: number): number => Math.floor(x),
  ceil: (x: number): number => Math.ceil(x),
  round: (x: number): number => Math.round(x),
};
