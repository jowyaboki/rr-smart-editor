// Specialized High-Performance Object Pools
// Reduces GC sweeps and allocation rates for objects instantiated thousands of times.

// 1. Timeline Clip Object Pool
export interface PooledClip {
  id: string;
  trackId: string;
  name: string;
  startFrame: number;
  duration: number;
  type: 'video' | 'audio' | 'image' | 'text';
  color?: string;
}

export class ClipPool {
  private static pool: PooledClip[] = [];

  public static acquire(
    id: string,
    trackId: string,
    name: string,
    start: number,
    duration: number,
    type: any,
  ): PooledClip {
    const item = this.pool.pop();
    if (item) {
      item.id = id;
      item.trackId = trackId;
      item.name = name;
      item.startFrame = start;
      item.duration = duration;
      item.type = type;
      return item;
    }
    return { id, trackId, name, startFrame: start, duration, type };
  }

  public static release(clip: PooledClip): void {
    if (this.pool.length < 2000) {
      // Keep pool bounded to prevent memory bloating
      this.pool.push(clip);
    }
  }

  public static clear(): void {
    this.pool = [];
  }

  public static getPoolSize(): number {
    return this.pool.length;
  }
}

// 2. Render Graph Node Pool
export interface PooledRenderNode {
  id: string;
  type: string;
  inputs: string[];
  outputs: string[];
  isDirty: boolean;
}

export class RenderNodePool {
  private static pool: PooledRenderNode[] = [];

  public static acquire(id: string, type: string): PooledRenderNode {
    const node = this.pool.pop();
    if (node) {
      node.id = id;
      node.type = type;
      node.inputs = [];
      node.outputs = [];
      node.isDirty = true;
      return node;
    }
    return { id, type, inputs: [], outputs: [], isDirty: true };
  }

  public static release(node: PooledRenderNode): void {
    if (this.pool.length < 1000) {
      this.pool.push(node);
    }
  }

  public static clear(): void {
    this.pool = [];
  }
}

// 3. Effect Evaluation Context Pool
export interface PooledEffectContext {
  id: string;
  glContextId?: number;
  parameters: Record<string, any>;
  width: number;
  height: number;
}

export class EffectContextPool {
  private static pool: PooledEffectContext[] = [];

  public static acquire(id: string, width: number, height: number): PooledEffectContext {
    const ctx = this.pool.pop();
    if (ctx) {
      ctx.id = id;
      ctx.width = width;
      ctx.height = height;
      ctx.parameters = {};
      return ctx;
    }
    return { id, width, height, parameters: {} };
  }

  public static release(ctx: PooledEffectContext): void {
    if (this.pool.length < 500) {
      this.pool.push(ctx);
    }
  }

  public static clear(): void {
    this.pool = [];
  }
}

// 4. Frame Buffer Pool (for fast canvas/pixel allocations)
export class FrameBufferPool {
  private static pool: Uint8ClampedArray[] = [];

  public static acquire(size: number): Uint8ClampedArray {
    // Find matching sized buffer in pool
    const index = this.pool.findIndex((b) => b.length === size);
    if (index !== -1) {
      const buffer = this.pool.splice(index, 1)[0];
      buffer.fill(0); // Clear buffer for reuse
      return buffer;
    }
    return new Uint8ClampedArray(size);
  }

  public static release(buffer: Uint8ClampedArray): void {
    if (this.pool.length < 100) {
      // Limit size-heavy arrays
      this.pool.push(buffer);
    }
  }

  public static clear(): void {
    this.pool = [];
  }
}

// 5. Temporary Geometry Pool (for layouts/conversions)
export interface PooledGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class GeometryPool {
  private static pool: PooledGeometry[] = [];

  public static acquire(x: number, y: number, width: number, height: number): PooledGeometry {
    const geom = this.pool.pop();
    if (geom) {
      geom.x = x;
      geom.y = y;
      geom.width = width;
      geom.height = height;
      return geom;
    }
    return { x, y, width, height };
  }

  public static release(geom: PooledGeometry): void {
    if (this.pool.length < 5000) {
      this.pool.push(geom);
    }
  }

  public static clear(): void {
    this.pool = [];
  }
}

// 6. Render Instruction Builder Pool
export interface PooledRenderInstruction {
  id: string;
  sourceAssetId: string;
  pipelineSteps: string[];
  opacity: number;
  blendMode: string;
}

export class RenderInstructionPool {
  private static pool: PooledRenderInstruction[] = [];

  public static acquire(
    id: string,
    sourceAssetId: string,
    blendMode: string = 'normal',
  ): PooledRenderInstruction {
    const inst = this.pool.pop();
    if (inst) {
      inst.id = id;
      inst.sourceAssetId = sourceAssetId;
      inst.pipelineSteps = [];
      inst.opacity = 1.0;
      inst.blendMode = blendMode;
      return inst;
    }
    return { id, sourceAssetId, pipelineSteps: [], opacity: 1.0, blendMode };
  }

  public static release(inst: PooledRenderInstruction): void {
    if (this.pool.length < 2000) {
      this.pool.push(inst);
    }
  }

  public static clear(): void {
    this.pool = [];
  }
}
