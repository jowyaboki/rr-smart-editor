import { Shader, Effect, EffectChain, EffectContext, CompositingLayer, BlendMode, Mask } from '../types';
import { executeEffect } from '../effects';
import { BlendService } from '../blending';
import { MaskService } from '../masking';
import { GPUCacheManager } from '../cache';

/**
 * Registry managing custom Shaders
 */
export class ShaderRegistry {
  private shaders = new Map<string, Shader>();

  public registerShader(shader: Shader): void {
    if (this.shaders.has(shader.id)) {
      throw new Error(`Shader with id ${shader.id} is already registered.`);
    }
    this.shaders.set(shader.id, shader);
  }

  public getShader(id: string): Shader | undefined {
    return this.shaders.get(id);
  }

  public unregisterShader(id: string): boolean {
    return this.shaders.delete(id);
  }

  public listShaders(): Shader[] {
    return Array.from(this.shaders.values());
  }
}

/**
 * Registry managing standard and plugin-contributed visual Effects
 */
export class EffectRegistry {
  private effectDefinitions = new Map<string, {
    type: string;
    name: string;
    createDefault: () => Effect;
    execute?: (ctx: CanvasRenderingContext2D, width: number, height: number, effect: Effect, context: EffectContext) => void;
  }>();

  public registerEffect(
    type: string,
    name: string,
    createDefault: () => Effect,
    execute?: (ctx: CanvasRenderingContext2D, width: number, height: number, effect: Effect, context: EffectContext) => void
  ): void {
    if (this.effectDefinitions.has(type)) {
      throw new Error(`Effect definition for type "${type}" is already registered.`);
    }
    this.effectDefinitions.set(type, { type, name, createDefault, execute });
  }

  public createEffect(type: string): Effect {
    const def = this.effectDefinitions.get(type);
    if (!def) {
      throw new Error(`Unknown effect type: "${type}"`);
    }
    return def.createDefault();
  }

  public getCustomExecutor(type: string) {
    return this.effectDefinitions.get(type)?.execute;
  }

  public listRegisteredEffects(): string[] {
    return Array.from(this.effectDefinitions.keys());
  }
}

/**
 * Core rendering pipeline coordinator
 */
export class Compositor {
  constructor(
    private readonly shaderRegistry: ShaderRegistry,
    private readonly effectRegistry: EffectRegistry
  ) {}

  /**
   * Main rendering pipeline executing:
   * Input -> Mask -> Effect Chain -> Blend -> Output
   */
  public composite(
    destCtx: CanvasRenderingContext2D,
    width: number,
    height: number,
    layers: CompositingLayer[],
    context: EffectContext
  ): void {
    destCtx.clearRect(0, 0, width, height);

    const layerCanvas = document?.createElement ? document.createElement('canvas') : null;
    const layerCtx = layerCanvas ? layerCanvas.getContext('2d') : null;

    if (layerCanvas && layerCtx) {
      layerCanvas.width = width;
      layerCanvas.height = height;
    }

    for (const layer of layers) {
      if (!layer.visible || layer.opacity <= 0) continue;

      if (layerCtx && layerCanvas) {
        layerCtx.clearRect(0, 0, width, height);
        layerCtx.filter = 'none';
        layerCtx.globalAlpha = 1.0;
        layerCtx.globalCompositeOperation = 'source-over';

        this.renderSourceToContext(layerCtx, width, height, layer, context);

        if (layer.masks && layer.masks.length > 0) {
          MaskService.applyMasks(layerCtx, width, height, layer.masks, context);
        }

        this.applyEffectChain(layerCtx, width, height, layer.effects, context);

        destCtx.save();
        destCtx.globalAlpha = layer.opacity;
        BlendService.applyBlendMode(destCtx, layer.blendMode);

        const t = layer.transform;
        destCtx.translate(t.position.x, t.position.y);
        destCtx.rotate((t.rotation * Math.PI) / 180);
        destCtx.scale(t.scale.x, t.scale.y);
        destCtx.translate(-t.anchorPoint.x, -t.anchorPoint.y);

        destCtx.drawImage(layerCanvas, 0, 0);
        destCtx.restore();
      } else {
        destCtx.save();
        destCtx.globalAlpha = layer.opacity;
        destCtx.fillStyle = typeof layer.source === 'string' ? layer.source : 'rgba(0,0,0,0.5)';
        destCtx.fillRect(0, 0, width, height);
        destCtx.restore();
      }
    }
  }

  private renderSourceToContext(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    layer: CompositingLayer,
    context: EffectContext
  ): void {
    const src = layer.source;
    if (!src) return;

    if (typeof src === 'string') {
      ctx.fillStyle = src;
      ctx.fillRect(0, 0, width, height);
    } else if (typeof src === 'function') {
      src(ctx, width, height, context);
    } else {
      try {
        ctx.drawImage(src, 0, 0, width, height);
      } catch (e) {}
    }
  }

  private applyEffectChain(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    chain: EffectChain,
    context: EffectContext
  ): void {
    if (!chain || !chain.effects) return;

    for (const effect of chain.effects) {
      if (!effect.enabled) continue;

      const customExecutor = this.effectRegistry.getCustomExecutor(effect.type);
      if (customExecutor) {
        customExecutor(ctx, width, height, effect, context);
        continue;
      }

      if (effect.shaderId) {
        const shader = this.shaderRegistry.getShader(effect.shaderId);
        if (shader) {
          const params = Object.entries(effect.parameters).reduce((acc, [k, p]) => {
            acc[k] = p.value;
            return acc;
          }, {} as Record<string, any>);
          shader.execute(ctx, width, height, params, context);
          continue;
        }
      }

      executeEffect(ctx, width, height, effect, context);
    }
  }
}

/**
 * Top-level master API coordinating the Effects & Compositing engine
 */
export class EffectsEngine {
  public readonly shaderRegistry = new ShaderRegistry();
  public readonly effectRegistry = new EffectRegistry();
  public readonly cacheManager = new GPUCacheManager();
  public readonly compositor: Compositor;

  constructor() {
    this.compositor = new Compositor(this.shaderRegistry, this.effectRegistry);
  }

  public renderFrame(
    destCtx: CanvasRenderingContext2D,
    width: number,
    height: number,
    layers: CompositingLayer[],
    context: EffectContext
  ): void {
    const cacheKey = `frame-${context.frame}-${layers.map(l => l.id).join('-')}`;
    const cached = this.cacheManager.frameCache.get(cacheKey);

    if (cached) {
      destCtx.clearRect(0, 0, width, height);
      destCtx.putImageData(cached, 0, 0);
      return;
    }

    this.compositor.composite(destCtx, width, height, layers, context);

    try {
      const renderedData = destCtx.getImageData(0, 0, width, height);
      this.cacheManager.frameCache.set(cacheKey, renderedData, 1);
    } catch (e) {}
  }

  public serializeChain(chain: EffectChain): string {
    return JSON.stringify(chain);
  }

  public deserializeChain(json: string): EffectChain {
    return JSON.parse(json) as EffectChain;
  }
}
