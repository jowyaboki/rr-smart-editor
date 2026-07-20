import { Effect, EffectParameter, EffectContext } from '../types';

/**
 * Creates a unique default configuration for a specific parameter
 */
function createParam(
  id: string,
  name: string,
  type: any,
  val: any,
  min?: number,
  max?: number,
  step?: number,
  options?: string[]
): EffectParameter {
  return { id, name, type, value: val, default: val, min, max, step, options };
}

/**
 * Factory class to create default Effect configurations
 */
export class EffectFactory {
  public static createBlur(radius: number = 5): Effect {
    return {
      id: `blur-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Blur',
      type: 'blur',
      enabled: true,
      parameters: {
        radius: createParam('radius', 'Radius', 'number', radius, 0, 100, 1),
      },
    };
  }

  public static createGaussianBlur(sigma: number = 3): Effect {
    return {
      id: `gaussian-blur-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Gaussian Blur',
      type: 'gaussian_blur',
      enabled: true,
      parameters: {
        sigma: createParam('sigma', 'Sigma', 'number', sigma, 0, 50, 0.1),
      },
    };
  }

  public static createGlow(intensity: number = 0.5, radius: number = 10, color: string = '#ffffff'): Effect {
    return {
      id: `glow-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Glow',
      type: 'glow',
      enabled: true,
      parameters: {
        intensity: createParam('intensity', 'Intensity', 'number', intensity, 0, 1, 0.05),
        radius: createParam('radius', 'Radius', 'number', radius, 0, 100, 1),
        color: createParam('color', 'Color', 'color', color),
      },
    };
  }

  public static createShadow(offsetX: number = 5, offsetY: number = 5, blur: number = 5, color: string = '#000000', opacity: number = 0.5): Effect {
    return {
      id: `shadow-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Shadow',
      type: 'shadow',
      enabled: true,
      parameters: {
        offsetX: createParam('offsetX', 'Offset X', 'number', offsetX, -100, 100, 1),
        offsetY: createParam('offsetY', 'Offset Y', 'number', offsetY, -100, 100, 1),
        blur: createParam('blur', 'Blur', 'number', blur, 0, 100, 1),
        color: createParam('color', 'Color', 'color', color),
        opacity: createParam('opacity', 'Opacity', 'number', opacity, 0, 1, 0.05),
      },
    };
  }

  public static createBrightness(intensity: number = 1.0): Effect {
    return {
      id: `brightness-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Brightness',
      type: 'brightness',
      enabled: true,
      parameters: {
        intensity: createParam('intensity', 'Intensity', 'number', intensity, 0, 3, 0.01),
      },
    };
  }

  public static createContrast(intensity: number = 1.0): Effect {
    return {
      id: `contrast-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Contrast',
      type: 'contrast',
      enabled: true,
      parameters: {
        intensity: createParam('intensity', 'Intensity', 'number', intensity, 0, 3, 0.01),
      },
    };
  }

  public static createExposure(exposure: number = 0.0): Effect {
    return {
      id: `exposure-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Exposure',
      type: 'exposure',
      enabled: true,
      parameters: {
        exposure: createParam('exposure', 'Exposure', 'number', exposure, -5, 5, 0.05),
      },
    };
  }

  public static createSaturation(saturation: number = 1.0): Effect {
    return {
      id: `saturation-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Saturation',
      type: 'saturation',
      enabled: true,
      parameters: {
        saturation: createParam('saturation', 'Saturation', 'number', saturation, 0, 3, 0.01),
      },
    };
  }

  public static createHue(angle: number = 0): Effect {
    return {
      id: `hue-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Hue Shift',
      type: 'hue',
      enabled: true,
      parameters: {
        angle: createParam('angle', 'Angle', 'number', angle, 0, 360, 1),
      },
    };
  }

  public static createTint(color: string = '#ff0000', intensity: number = 0.5): Effect {
    return {
      id: `tint-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Tint',
      type: 'tint',
      enabled: true,
      parameters: {
        color: createParam('color', 'Color', 'color', color),
        intensity: createParam('intensity', 'Intensity', 'number', intensity, 0, 1, 0.05),
      },
    };
  }

  public static createCurves(points: { x: number; y: number }[] = [{ x: 0, y: 0 }, { x: 1, y: 1 }]): Effect {
    return {
      id: `curves-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Curves',
      type: 'curves',
      enabled: true,
      parameters: {
        points: createParam('points', 'Points', 'curve', points),
      },
    };
  }

  public static createLevels(inputMin: number = 0, inputMax: number = 255, gamma: number = 1.0, outputMin: number = 0, outputMax: number = 255): Effect {
    return {
      id: `levels-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Levels',
      type: 'levels',
      enabled: true,
      parameters: {
        inputMin: createParam('inputMin', 'Input Min', 'number', inputMin, 0, 255, 1),
        inputMax: createParam('inputMax', 'Input Max', 'number', inputMax, 0, 255, 1),
        gamma: createParam('gamma', 'Gamma', 'number', gamma, 0.1, 10.0, 0.05),
        outputMin: createParam('outputMin', 'Output Min', 'number', outputMin, 0, 255, 1),
        outputMax: createParam('outputMax', 'Output Max', 'number', outputMax, 0, 255, 1),
      },
    };
  }

  public static createColorBalance(cyanRed: number = 0, magentaGreen: number = 0, yellowBlue: number = 0): Effect {
    return {
      id: `color-balance-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Color Balance',
      type: 'color_balance',
      enabled: true,
      parameters: {
        cyanRed: createParam('cyanRed', 'Cyan - Red', 'number', cyanRed, -100, 100, 1),
        magentaGreen: createParam('magentaGreen', 'Magenta - Green', 'number', magentaGreen, -100, 100, 1),
        yellowBlue: createParam('yellowBlue', 'Yellow - Blue', 'number', yellowBlue, -100, 100, 1),
      },
    };
  }

  public static createSharpen(intensity: number = 0.5): Effect {
    return {
      id: `sharpen-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Sharpen',
      type: 'sharpen',
      enabled: true,
      parameters: {
        intensity: createParam('intensity', 'Intensity', 'number', intensity, 0, 5, 0.1),
      },
    };
  }

  public static createNoise(amount: number = 0.1): Effect {
    return {
      id: `noise-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Noise',
      type: 'noise',
      enabled: true,
      parameters: {
        amount: createParam('amount', 'Amount', 'number', amount, 0, 1, 0.01),
      },
    };
  }

  public static createGrain(intensity: number = 0.1, size: number = 1.5): Effect {
    return {
      id: `grain-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Grain',
      type: 'grain',
      enabled: true,
      parameters: {
        intensity: createParam('intensity', 'Intensity', 'number', intensity, 0, 1, 0.01),
        size: createParam('size', 'Size', 'number', size, 0.5, 10, 0.1),
      },
    };
  }

  public static createVignette(amount: number = 0.5, falloff: number = 0.5, color: string = '#000000'): Effect {
    return {
      id: `vignette-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Vignette',
      type: 'vignette',
      enabled: true,
      parameters: {
        amount: createParam('amount', 'Amount', 'number', amount, 0, 1, 0.01),
        falloff: createParam('falloff', 'Falloff', 'number', falloff, 0, 1, 0.01),
        color: createParam('color', 'Color', 'color', color),
      },
    };
  }

  public static createChromaticAberration(offset: number = 5): Effect {
    return {
      id: `chromatic-aberration-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Chromatic Aberration',
      type: 'chromatic_aberration',
      enabled: true,
      parameters: {
        offset: createParam('offset', 'Offset', 'number', offset, 0, 50, 1),
      },
    };
  }

  public static createPixelate(size: number = 8): Effect {
    return {
      id: `pixelate-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Pixelate',
      type: 'pixelate',
      enabled: true,
      parameters: {
        size: createParam('size', 'Pixel Size', 'number', size, 1, 100, 1),
      },
    };
  }

  public static createPosterize(levels: number = 4): Effect {
    return {
      id: `posterize-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Posterize',
      type: 'posterize',
      enabled: true,
      parameters: {
        levels: createParam('levels', 'Levels', 'number', levels, 2, 256, 1),
      },
    };
  }

  public static createEmboss(intensity: number = 1.0): Effect {
    return {
      id: `emboss-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Emboss',
      type: 'emboss',
      enabled: true,
      parameters: {
        intensity: createParam('intensity', 'Intensity', 'number', intensity, 0, 5, 0.1),
      },
    };
  }

  public static createEdgeDetect(threshold: number = 0.1): Effect {
    return {
      id: `edge-detect-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Edge Detect',
      type: 'edge_detect',
      enabled: true,
      parameters: {
        threshold: createParam('threshold', 'Threshold', 'number', threshold, 0, 1, 0.01),
      },
    };
  }
}

/**
 * Executes a specific Effect on a Canvas context.
 * Performs fast filter strings for standard tasks and custom pixel manipulation where required.
 */
export function executeEffect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  effect: Effect,
  context: EffectContext
): void {
  if (!effect.enabled) return;

  const getNumVal = (key: string, def: number): number => {
    return typeof effect.parameters[key]?.value === 'number' ? effect.parameters[key].value : def;
  };

  const getStrVal = (key: string, def: string): string => {
    return effect.parameters[key]?.value !== undefined ? String(effect.parameters[key].value) : def;
  };

  const getAnyVal = (key: string, def: any): any => {
    return effect.parameters[key]?.value !== undefined ? effect.parameters[key].value : def;
  };

  switch (effect.type) {
    case 'blur': {
      const r = getNumVal('radius', 5);
      ctx.filter = ctx.filter === 'none' ? `blur(${r}px)` : `${ctx.filter} blur(${r}px)`;
      break;
    }

    case 'gaussian_blur': {
      const s = getNumVal('sigma', 3);
      ctx.filter = ctx.filter === 'none' ? `blur(${s}px)` : `${ctx.filter} blur(${s}px)`;
      break;
    }

    case 'brightness': {
      const b = getNumVal('intensity', 1.0);
      ctx.filter = ctx.filter === 'none' ? `brightness(${b})` : `${ctx.filter} brightness(${b})`;
      break;
    }

    case 'contrast': {
      const c = getNumVal('intensity', 1.0);
      ctx.filter = ctx.filter === 'none' ? `contrast(${c})` : `${ctx.filter} contrast(${c})`;
      break;
    }

    case 'saturation': {
      const s = getNumVal('saturation', 1.0);
      ctx.filter = ctx.filter === 'none' ? `saturate(${s})` : `${ctx.filter} saturate(${s})`;
      break;
    }

    case 'hue': {
      const h = getNumVal('angle', 0);
      ctx.filter = ctx.filter === 'none' ? `hue-rotate(${h}deg)` : `${ctx.filter} hue-rotate(${h}deg)`;
      break;
    }

    case 'shadow': {
      const ox = getNumVal('offsetX', 5);
      const oy = getNumVal('offsetY', 5);
      const bl = getNumVal('blur', 5);
      const col = getStrVal('color', '#000000');
      ctx.filter = ctx.filter === 'none' ? `drop-shadow(${ox}px ${oy}px ${bl}px ${col})` : `${ctx.filter} drop-shadow(${ox}px ${oy}px ${bl}px ${col})`;
      break;
    }

    case 'exposure': {
      const exp = getNumVal('exposure', 0);
      const mult = Math.pow(2, exp);
      ctx.filter = ctx.filter === 'none' ? `brightness(${mult})` : `${ctx.filter} brightness(${mult})`;
      break;
    }

    case 'glow': {
      const intensity = getNumVal('intensity', 0.5);
      const radius = getNumVal('radius', 10);
      const color = getStrVal('color', '#ffffff');
      ctx.filter = ctx.filter === 'none' ? `drop-shadow(0px 0px ${radius}px ${color})` : `${ctx.filter} drop-shadow(0px 0px ${radius}px ${color})`;
      ctx.save();
      ctx.globalAlpha = intensity;
      ctx.shadowColor = color;
      ctx.shadowBlur = radius;
      ctx.restore();
      break;
    }

    case 'tint': {
      const color = getStrVal('color', '#ff0000');
      const intensity = getNumVal('intensity', 0.5);
      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = color;
      ctx.globalAlpha = intensity;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      break;
    }

    case 'pixelate': {
      const size = Math.max(1, Math.round(getNumVal('size', 8)));
      if (size <= 1) break;
      const tempCanvas = document?.createElement ? document.createElement('canvas') : null;
      if (tempCanvas) {
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(ctx.canvas, 0, 0);
          ctx.clearRect(0, 0, width, height);
          ctx.save();
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(tempCanvas, 0, 0, width, height, 0, 0, Math.ceil(width / size), Math.ceil(height / size));
          const pixelatedCanvas = document.createElement('canvas');
          pixelatedCanvas.width = Math.ceil(width / size);
          pixelatedCanvas.height = Math.ceil(height / size);
          const pixelatedCtx = pixelatedCanvas.getContext('2d');
          if (pixelatedCtx) {
            pixelatedCtx.imageSmoothingEnabled = false;
            pixelatedCtx.drawImage(tempCanvas, 0, 0, width, height, 0, 0, pixelatedCanvas.width, pixelatedCanvas.height);
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(pixelatedCanvas, 0, 0, pixelatedCanvas.width, pixelatedCanvas.height, 0, 0, width, height);
          }
          ctx.restore();
        }
      } else {
        try {
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;
          for (let y = 0; y < height; y += size) {
            for (let x = 0; x < width; x += size) {
              const pixelIdx = (y * width + x) * 4;
              const r = data[pixelIdx];
              const g = data[pixelIdx + 1];
              const b = data[pixelIdx + 2];
              const a = data[pixelIdx + 3];

              for (let py = 0; py < size && y + py < height; py++) {
                for (let px = 0; px < size && x + px < width; px++) {
                  const idx = ((y + py) * width + (x + px)) * 4;
                  data[idx] = r;
                  data[idx + 1] = g;
                  data[idx + 2] = b;
                  data[idx + 3] = a;
                }
              }
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } catch (e) {}
      }
      break;
    }

    case 'noise':
    case 'grain': {
      const amount = effect.type === 'noise' ? getNumVal('amount', 0.1) : getNumVal('intensity', 0.1);
      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const len = data.length;
        for (let i = 0; i < len; i += 4) {
          const noise = (Math.random() - 0.5) * amount * 255;
          data[i] = Math.min(255, Math.max(0, data[i] + noise));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {}
      break;
    }

    case 'vignette': {
      const amount = getNumVal('amount', 0.5);
      const falloff = getNumVal('falloff', 0.5);
      const color = getStrVal('color', '#000000');
      ctx.save();
      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
      const grad = ctx.createRadialGradient(
        centerX, centerY, maxRadius * (1 - amount),
        centerX, centerY, maxRadius * (1 - amount + falloff)
      );
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, color);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
      break;
    }

    case 'chromatic_aberration': {
      const offset = Math.round(getNumVal('offset', 5));
      if (offset <= 0) break;
      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const rData = new Uint8ClampedArray(imgData.data);
        const bData = new Uint8ClampedArray(imgData.data);
        const data = imgData.data;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const destIdx = (y * width + x) * 4;
            const rx = Math.max(0, x - offset);
            const bx = Math.min(width - 1, x + offset);

            const rIdx = (y * width + rx) * 4;
            const bIdx = (y * width + bx) * 4;

            data[destIdx] = rData[rIdx];
            data[destIdx + 2] = bData[bIdx + 2];
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {}
      break;
    }

    case 'posterize': {
      const levels = Math.max(2, getNumVal('levels', 4));
      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const len = data.length;
        const step = 255 / (levels - 1);
        for (let i = 0; i < len; i += 4) {
          data[i] = Math.round(data[i] / step) * step;
          data[i + 1] = Math.round(data[i + 1] / step) * step;
          data[i + 2] = Math.round(data[i + 2] / step) * step;
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {}
      break;
    }

    case 'curves': {
      const points = getAnyVal('points', [{ x: 0, y: 0 }, { x: 1, y: 1 }]);
      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const len = data.length;
        const lookup = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
          const t = i / 255;
          let y = t;
          if (points.length >= 2) {
            const p1 = points[0];
            const p2 = points[points.length - 1];
            y = p1.y + (t - p1.x) * (p2.y - p1.y) / (p2.x - p1.x);
          }
          lookup[i] = Math.min(255, Math.max(0, Math.round(y * 255)));
        }
        for (let i = 0; i < len; i += 4) {
          data[i] = lookup[data[i]];
          data[i + 1] = lookup[data[i + 1]];
          data[i + 2] = lookup[data[i + 2]];
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {}
      break;
    }

    case 'levels': {
      const inMin = getNumVal('inputMin', 0);
      const inMax = getNumVal('inputMax', 255);
      const gamma = getNumVal('gamma', 1.0);
      const outMin = getNumVal('outputMin', 0);
      const outMax = getNumVal('outputMax', 255);

      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const len = data.length;
        const lookup = new Uint8Array(256);
        const range = inMax - inMin || 1;
        const outRange = outMax - outMin;

        for (let i = 0; i < 256; i++) {
          let val = Math.min(1, Math.max(0, (i - inMin) / range));
          val = Math.pow(val, 1 / gamma);
          lookup[i] = Math.min(255, Math.max(0, Math.round(val * outRange + outMin)));
        }

        for (let i = 0; i < len; i += 4) {
          data[i] = lookup[data[i]];
          data[i + 1] = lookup[data[i + 1]];
          data[i + 2] = lookup[data[i + 2]];
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {}
      break;
    }

    case 'color_balance': {
      const cr = getNumVal('cyanRed', 0) / 100 * 255;
      const mg = getNumVal('magentaGreen', 0) / 100 * 255;
      const yb = getNumVal('yellowBlue', 0) / 100 * 255;

      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const len = data.length;

        for (let i = 0; i < len; i += 4) {
          data[i] = Math.min(255, Math.max(0, data[i] + cr));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + mg));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + yb));
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {}
      break;
    }

    case 'sharpen': {
      const intensity = getNumVal('intensity', 0.5);
      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const input = new Uint8ClampedArray(imgData.data);
        const data = imgData.data;
        const i = intensity;
        const w = width;

        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * w + x) * 4;
            for (let c = 0; c < 3; c++) {
              const current = input[idx + c];
              const top = input[((y - 1) * w + x) * 4 + c];
              const bottom = input[((y + 1) * w + x) * 4 + c];
              const left = input[(y * w + (x - 1)) * 4 + c];
              const right = input[(y * w + (x + 1)) * 4 + c];

              const res = current * (1 + 4 * i) - (top + bottom + left + right) * i;
              data[idx + c] = Math.min(255, Math.max(0, res));
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {}
      break;
    }

    case 'emboss': {
      const intensity = getNumVal('intensity', 1.0);
      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const input = new Uint8ClampedArray(imgData.data);
        const data = imgData.data;
        const i = intensity;
        const w = width;

        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * w + x) * 4;
            for (let c = 0; c < 3; c++) {
              const tl = input[((y - 1) * w + (x - 1)) * 4 + c];
              const br = input[((y + 1) * w + (x + 1)) * 4 + c];
              const res = (br - tl) * i + 128;
              data[idx + c] = Math.min(255, Math.max(0, res));
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {}
      break;
    }

    case 'edge_detect': {
      const threshold = getNumVal('threshold', 0.1) * 255;
      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const input = new Uint8ClampedArray(imgData.data);
        const data = imgData.data;
        const w = width;

        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * w + x) * 4;

            const getIntensity = (px: number, py: number) => {
              const pIdx = (py * w + px) * 4;
              return (input[pIdx] + input[pIdx + 1] + input[pIdx + 2]) / 3;
            };

            const h = (getIntensity(x + 1, y - 1) + 2 * getIntensity(x + 1, y) + getIntensity(x + 1, y + 1)) -
                      (getIntensity(x - 1, y - 1) + 2 * getIntensity(x - 1, y) + getIntensity(x - 1, y + 1));

            const v = (getIntensity(x - 1, y + 1) + 2 * getIntensity(x, y + 1) + getIntensity(x + 1, y + 1)) -
                      (getIntensity(x - 1, y - 1) + 2 * getIntensity(x, y - 1) + getIntensity(x + 1, y - 1));

            const mag = Math.sqrt(h * h + v * v);
            const edgeVal = mag > threshold ? 255 : 0;

            data[idx] = edgeVal;
            data[idx + 1] = edgeVal;
            data[idx + 2] = edgeVal;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {}
      break;
    }

    default:
      break;
  }
}
