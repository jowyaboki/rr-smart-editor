import { Shader, ShaderType, ShaderSource, EffectContext } from '../types';

export class AbstractShader implements Shader {
  constructor(
    public id: string,
    public name: string,
    public type: ShaderType,
    public source: ShaderSource
  ) {}

  public compile(context: EffectContext): any {
    if (this.type === 'canvas') {
      if (!this.source.canvas) {
        throw new Error(`Shader ${this.id} is registered as canvas type but missing canvas render function.`);
      }
      return this.source.canvas;
    }

    if (this.type === 'webgl') {
      const gl = context.glContext;
      if (!gl) {
        return {
          id: this.id,
          compiled: true,
          type: 'webgl-mock',
          vertexShaderSource: this.source.webgl?.vertex,
          fragmentShaderSource: this.source.webgl?.fragment,
        };
      }

      const vertexSource = this.source.webgl?.vertex;
      const fragmentSource = this.source.webgl?.fragment;
      if (!vertexSource || !fragmentSource) {
        throw new Error(`Shader ${this.id} is registered as webgl but missing vertex or fragment sources.`);
      }

      const vs = gl.createShader(gl.VERTEX_SHADER);
      if (!vs) throw new Error('Failed to create Vertex Shader');
      gl.shaderSource(vs, vertexSource);
      gl.compileShader(vs);
      if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(vs);
        gl.deleteShader(vs);
        throw new Error(`Failed to compile vertex shader for ${this.id}: ${info}`);
      }

      const fs = gl.createShader(gl.FRAGMENT_SHADER);
      if (!fs) throw new Error('Failed to create Fragment Shader');
      gl.shaderSource(fs, fragmentSource);
      gl.compileShader(fs);
      if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(fs);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        throw new Error(`Failed to compile fragment shader for ${this.id}: ${info}`);
      }

      const program = gl.createProgram();
      if (!program) throw new Error('Failed to create WebGL program');
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        throw new Error(`Failed to link WebGL program for ${this.id}: ${info}`);
      }

      return {
        program,
        vertexShader: vs,
        fragmentShader: fs,
        uniforms: this.source.webgl?.uniforms || {},
      };
    }

    if (this.type === 'webgpu') {
      const device = context.gpuDevice;
      if (!device) {
        return {
          id: this.id,
          compiled: true,
          type: 'webgpu-mock',
          code: this.source.webgpu?.code,
          entryPoint: this.source.webgpu?.entryPoint,
        };
      }

      const code = this.source.webgpu?.code;
      if (!code) {
        throw new Error(`Shader ${this.id} is registered as WebGPU but missing shader WGSL code.`);
      }

      const shaderModule = device.createShaderModule({
        label: this.name,
        code,
      });

      return {
        shaderModule,
        entryPoint: this.source.webgpu?.entryPoint || 'main',
      };
    }

    throw new Error(`Unsupported shader type: ${this.type}`);
  }

  public execute(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    params: Record<string, any>,
    context: EffectContext
  ): void {
    if (this.type === 'canvas') {
      if (this.source.canvas) {
        this.source.canvas(ctx, width, height, params, context);
      }
    } else {
      ctx.save();
      ctx.fillStyle = params.color || 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }
}

export class CanvasShader extends AbstractShader {
  constructor(
    id: string,
    name: string,
    canvasFn: (ctx: CanvasRenderingContext2D, width: number, height: number, params: Record<string, any>, context: EffectContext) => void
  ) {
    super(id, name, 'canvas', { canvas: canvasFn });
  }
}

export class WebGLShader extends AbstractShader {
  constructor(
    id: string,
    name: string,
    vertex: string,
    fragment: string,
    uniforms: Record<string, string> = {}
  ) {
    super(id, name, 'webgl', {
      webgl: { vertex, fragment, uniforms },
    });
  }
}

export class WebGPUShader extends AbstractShader {
  constructor(
    id: string,
    name: string,
    code: string,
    entryPoint: string = 'main'
  ) {
    super(id, name, 'webgpu', {
      webgpu: { code, entryPoint },
    });
  }
}
