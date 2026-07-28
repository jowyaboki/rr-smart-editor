import { Mask, EffectContext, CurvePoint } from '../types';

export class MaskService {
  /**
   * Applies a series of Masks onto a target context.
   * Modifies the context's current clipping path or alpha channel.
   * To execute non-destructively, we draw the layer, generate a mask buffer, and then apply it.
   */
  public static applyMasks(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    masks: Mask[],
    context: EffectContext
  ): void {
    if (!masks || masks.length === 0) return;

    // Create an offscreen canvas for the combined mask
    const maskCanvas = document?.createElement ? document.createElement('canvas') : null;
    if (!maskCanvas) {
      // Safe fallback on environments without DOM
      return;
    }

    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    // By default, if we have masks, we start with a transparent mask buffer,
    // and each enabled mask adds to it (or intersects it).
    // Let's draw a white mask representing the visibility of the masks.
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, width, height);

    for (const mask of masks) {
      if (!mask.enabled) continue;

      maskCtx.save();

      // Implement Feathering on the mask sub-drawing
      if (mask.feather > 0) {
        maskCtx.filter = `blur(${mask.feather}px)`;
      }

      // Draw the mask source (White on Black)
      maskCtx.fillStyle = 'white';
      maskCtx.strokeStyle = 'white';

      switch (mask.type) {
        case 'shape': {
          const pts = mask.points || [];
          if (pts.length > 0) {
            // Apply Expansion by shifting points outwards relative to center
            let finalPts = pts;
            if (mask.expansion !== 0) {
              const center = this.calculateCenter(pts);
              finalPts = pts.map(p => {
                const dx = p.x - center.x;
                const dy = p.y - center.y;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                return {
                  x: p.x + (dx / len) * mask.expansion,
                  y: p.y + (dy / len) * mask.expansion,
                };
              });
            }

            // If Animated Mask is active, we can perturb points based on context time
            if (mask.animated) {
              const t = context.time;
              finalPts = finalPts.map((p, idx) => ({
                x: p.x + Math.sin(t + idx) * 10,
                y: p.y + Math.cos(t + idx) * 10,
              }));
            }

            maskCtx.beginPath();
            maskCtx.moveTo(finalPts[0].x, finalPts[0].y);
            for (let i = 1; i < finalPts.length; i++) {
              maskCtx.lineTo(finalPts[i].x, finalPts[i].y);
            }
            maskCtx.closePath();
            maskCtx.fill();
          }
          break;
        }

        case 'gradient': {
          const gradSettings = mask.gradient;
          if (gradSettings) {
            const grad = maskCtx.createLinearGradient(
              gradSettings.start.x,
              gradSettings.start.y,
              gradSettings.end.x,
              gradSettings.end.y
            );
            for (const stop of gradSettings.stops) {
              grad.addColorStop(stop.offset, stop.color);
            }
            maskCtx.fillStyle = grad;
            maskCtx.fillRect(0, 0, width, height);
          }
          break;
        }

        case 'alpha': {
          // Alpha mask from an external resource or solid alpha mapping
          maskCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          maskCtx.fillRect(0, 0, width, height);
          break;
        }

        case 'luma': {
          // Luma mask uses brightness. Let's create a grayscale gradient simulation
          const grad = maskCtx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, 'black');
          grad.addColorStop(1, 'white');
          maskCtx.fillStyle = grad;
          maskCtx.fillRect(0, 0, width, height);
          break;
        }
      }

      maskCtx.restore();

      // Handle Inversion of the mask
      if (mask.inverted) {
        const imgData = maskCtx.getImageData(0, 0, width, height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];         // Invert red
          data[i + 1] = 255 - data[i + 1]; // Invert green
          data[i + 2] = 255 - data[i + 2]; // Invert blue
        }
        maskCtx.putImageData(imgData, 0, 0);
      }
    }

    // Blend the mask with the main canvas context using 'destination-in'
    ctx.save();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskCanvas, 0, 0);
    ctx.restore();
  }

  /**
   * Helper to compute polygon center
   */
  private static calculateCenter(pts: CurvePoint[]): CurvePoint {
    let sumX = 0;
    let sumY = 0;
    for (const p of pts) {
      sumX += p.x;
      sumY += p.y;
    }
    return {
      x: sumX / (pts.length || 1),
      y: sumY / (pts.length || 1),
    };
  }

  /**
   * Pure-pixel software evaluation of masks (e.g. for WebGL texture masks or node environment)
   */
  public static evaluateMaskPixel(
    mask: Mask,
    x: number,
    y: number,
    width: number,
    height: number,
    time: number = 0
  ): number {
    if (!mask.enabled) return 1.0;

    let val = 1.0;

    switch (mask.type) {
      case 'shape': {
        const pts = mask.points || [];
        if (pts.length === 0) return 1.0;
        // Raycasting algorithm for point in polygon
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const xi = pts[i].x;
          const yi = pts[i].y;
          const xj = pts[j].x;
          const yj = pts[j].y;

          const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / ((yj - yi) || 1) + xi);
          if (intersect) inside = !inside;
        }
        val = inside ? 1.0 : 0.0;
        break;
      }

      case 'gradient': {
        const grad = mask.gradient;
        if (!grad) return 1.0;
        // Project (x, y) onto the gradient line start -> end
        const dx = grad.end.x - grad.start.x;
        const dy = grad.end.y - grad.start.y;
        const lenSq = dx * dx + dy * dy || 1;
        const t = Math.min(1, Math.max(0, ((x - grad.start.x) * dx + (y - grad.start.y) * dy) / lenSq));

        // Piecewise linear interpolation of gradient stops
        const sortedStops = [...grad.stops].sort((a, b) => a.offset - b.offset);
        if (sortedStops.length === 0) val = t;
        else if (t <= sortedStops[0].offset) val = 1.0; // simple luma proxy
        else if (t >= sortedStops[sortedStops.length - 1].offset) val = 0.0;
        else {
          for (let i = 0; i < sortedStops.length - 1; i++) {
            const s1 = sortedStops[i];
            const s2 = sortedStops[i + 1];
            if (t >= s1.offset && t <= s2.offset) {
              const ratio = (t - s1.offset) / (s2.offset - s1.offset || 1);
              val = 1 - ratio; // Map color transitions to simple alpha fade
              break;
            }
          }
        }
        break;
      }

      default:
        val = 1.0;
        break;
    }

    if (mask.inverted) {
      val = 1.0 - val;
    }

    return val;
  }
}
