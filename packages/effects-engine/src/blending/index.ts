import { BlendMode } from '../types';

export class BlendService {
  /**
   * Maps standard NLE blend mode to HTML5 Canvas globalCompositeOperation
   */
  public static mapToCompositeOperation(mode: BlendMode): GlobalCompositeOperation {
    switch (mode) {
      case 'normal':
        return 'source-over';
      case 'multiply':
        return 'multiply';
      case 'screen':
        return 'screen';
      case 'overlay':
        return 'overlay';
      case 'soft_light':
        return 'soft-light';
      case 'hard_light':
        return 'hard-light';
      case 'darken':
        return 'darken';
      case 'lighten':
        return 'lighten';
      case 'difference':
        return 'difference';
      case 'exclusion':
        return 'exclusion';
      case 'color_dodge':
        return 'color-dodge';
      case 'color_burn':
        return 'color-burn';
      case 'linear_dodge':
        return 'plus-lighter';
      default:
        return 'source-over';
    }
  }

  /**
   * Applies the blend mode on a canvas context
   */
  public static applyBlendMode(ctx: CanvasRenderingContext2D, mode: BlendMode): void {
    ctx.globalCompositeOperation = this.mapToCompositeOperation(mode);
  }

  /**
   * Non-destructive software pixel-level blending fallback (e.g. for WebGL/WebGPU textures or offscreen Node frames)
   */
  public static blendPixels(
    backdrop: Uint8ClampedArray,
    source: Uint8ClampedArray,
    out: Uint8ClampedArray,
    mode: BlendMode,
    opacity: number = 1.0
  ): void {
    const len = backdrop.length;
    for (let i = 0; i < len; i += 4) {
      const bR = backdrop[i] / 255;
      const bG = backdrop[i + 1] / 255;
      const bB = backdrop[i + 2] / 255;
      const bA = backdrop[i + 3] / 255;

      const sR = source[i] / 255;
      const sG = source[i + 1] / 255;
      const sB = source[i + 2] / 255;
      const sA = source[i + 3] / 255;

      let rR = 0;
      let rG = 0;
      let rB = 0;

      switch (mode) {
        case 'normal':
          rR = sR;
          rG = sG;
          rB = sB;
          break;
        case 'multiply':
          rR = bR * sR;
          rG = bG * sG;
          rB = bB * sB;
          break;
        case 'screen':
          rR = 1 - (1 - bR) * (1 - sR);
          rG = 1 - (1 - bG) * (1 - sG);
          rB = 1 - (1 - bB) * (1 - sB);
          break;
        case 'overlay':
          rR = bR < 0.5 ? 2 * bR * sR : 1 - 2 * (1 - bR) * (1 - sR);
          rG = bG < 0.5 ? 2 * bG * sG : 1 - 2 * (1 - bG) * (1 - sG);
          rB = bB < 0.5 ? 2 * bB * sB : 1 - 2 * (1 - bB) * (1 - sB);
          break;
        case 'soft_light':
          rR = sR < 0.5 ? 2 * bR * sR + bR * bR * (1 - 2 * sR) : Math.sqrt(bR) * (2 * sR - 1) + 2 * bR * (1 - sR);
          rG = sG < 0.5 ? 2 * bG * sG + bG * bG * (1 - 2 * sG) : Math.sqrt(bG) * (2 * sG - 1) + 2 * bG * (1 - sG);
          rB = sB < 0.5 ? 2 * bB * sB + bB * bB * (1 - 2 * sB) : Math.sqrt(bB) * (2 * sB - 1) + 2 * bB * (1 - sB);
          break;
        case 'hard_light':
          rR = sR < 0.5 ? 2 * bR * sR : 1 - 2 * (1 - bR) * (1 - sR);
          rG = sG < 0.5 ? 2 * bG * sG : 1 - 2 * (1 - bG) * (1 - sG);
          rB = sB < 0.5 ? 2 * bB * sB : 1 - 2 * (1 - bB) * (1 - sB);
          break;
        case 'darken':
          rR = Math.min(bR, sR);
          rG = Math.min(bG, sG);
          rB = Math.min(bB, sB);
          break;
        case 'lighten':
          rR = Math.max(bR, sR);
          rG = Math.max(bG, sG);
          rB = Math.max(bB, sB);
          break;
        case 'difference':
          rR = Math.abs(bR - sR);
          rG = Math.abs(bG - sG);
          rB = Math.abs(bB - sB);
          break;
        case 'exclusion':
          rR = bR + sR - 2 * bR * sR;
          rG = bG + sG - 2 * bG * sG;
          rB = bB + sB - 2 * bB * sB;
          break;
        case 'color_dodge':
          rR = sR === 1 ? 1 : Math.min(1, bR / (1 - sR));
          rG = sG === 1 ? 1 : Math.min(1, bG / (1 - sG));
          rB = sB === 1 ? 1 : Math.min(1, bB / (1 - sB));
          break;
        case 'color_burn':
          rR = sR === 0 ? 0 : 1 - Math.min(1, (1 - bR) / sR);
          rG = sG === 0 ? 0 : 1 - Math.min(1, (1 - bG) / sG);
          rB = sB === 0 ? 0 : 1 - Math.min(1, (1 - bB) / sB);
          break;
        case 'linear_dodge':
          rR = Math.min(1, bR + sR);
          rG = Math.min(1, bG + sG);
          rB = Math.min(1, bB + sB);
          break;
        default:
          rR = sR;
          rG = sG;
          rB = sB;
          break;
      }

      const outA = sA * opacity + bA * (1 - sA * opacity);
      if (outA > 0) {
        out[i] = Math.round(((sR * sA * opacity + bR * bA * (1 - sA * opacity)) / outA) * 255);
        out[i + 1] = Math.round(((sG * sA * opacity + bG * bA * (1 - sA * opacity)) / outA) * 255);
        out[i + 2] = Math.round(((sB * sA * opacity + bR * bA * (1 - sA * opacity)) / outA) * 255);
      } else {
        out[i] = 0;
        out[i + 1] = 0;
        out[i + 2] = 0;
      }
      out[i + 3] = Math.round(outA * 255);
    }
  }
}
