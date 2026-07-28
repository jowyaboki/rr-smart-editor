import { LUT, LUT1DData, LUT3DData } from '../types';

export class LUTService {
  private customParsers = new Map<string, any>();

  /**
   * Parses standard .cube LUT files containing 1D or 3D look-up grid data
   */
  public parseCubeLUT(content: string): { size: number; dimensions: number; data: Float32Array } {
    const lines = content.split('\n');
    let size = 2; // default
    let dims = 3;
    const dataPoints: number[] = [];

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('#')) continue;

      if (line.startsWith('LUT_3D_SIZE')) {
        const parts = line.split(/\s+/);
        size = parseInt(parts[1], 10);
        dims = 3;
        continue;
      }

      if (line.startsWith('LUT_1D_SIZE')) {
        const parts = line.split(/\s+/);
        size = parseInt(parts[1], 10);
        dims = 1;
        continue;
      }

      // Parse float values
      const parts = line.split(/\s+/).map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        dataPoints.push(parts[0], parts[1], parts[2]);
      }
    }

    return {
      size,
      dimensions: dims,
      data: new Float32Array(dataPoints),
    };
  }

  /**
   * Resolves a trilinear 3D lookup interpolation given target inputs
   */
  public trilinearInterpolate3D(
    rgb: [number, number, number],
    lutData: Float32Array,
    size: number
  ): [number, number, number] {
    // Coordinate mapping (input 0-1 mapped to grid indices 0 to size-1)
    const x = Math.min(size - 1, Math.max(0, rgb[0] * (size - 1)));
    const y = Math.min(size - 1, Math.max(0, rgb[1] * (size - 1)));
    const z = Math.min(size - 1, Math.max(0, rgb[2] * (size - 1)));

    // Grid bounds
    const x0 = Math.floor(x);
    const x1 = Math.min(size - 1, x0 + 1);
    const y0 = Math.floor(y);
    const y1 = Math.min(size - 1, y0 + 1);
    const z0 = Math.floor(z);
    const z1 = Math.min(size - 1, z0 + 1);

    // Factors
    const tx = x - x0;
    const ty = y - y0;
    const tz = z - z0;

    // Helper to get grid element index
    const getVal = (ix: number, iy: number, iz: number): [number, number, number] => {
      // flat layout index: (iz * size * size + iy * size + ix) * 3
      const idx = (iz * size * size + iy * size + ix) * 3;
      if (idx >= lutData.length) return [0, 0, 0];
      return [lutData[idx], lutData[idx + 1], lutData[idx + 2]];
    };

    // 8 Grid corners
    const c000 = getVal(x0, y0, z0);
    const c100 = getVal(x1, y0, z0);
    const c010 = getVal(x0, y1, z0);
    const c110 = getVal(x1, y1, z0);
    const c001 = getVal(x0, y0, z1);
    const c101 = getVal(x1, y0, z1);
    const c011 = getVal(x0, y1, z1);
    const c111 = getVal(x1, y1, z1);

    // Linear interpolate along X
    const lerp = (a: number, b: number, factor: number) => a + (b - a) * factor;

    const r_00 = lerp(c000[0], c100[0], tx);
    const g_00 = lerp(c000[1], c100[1], tx);
    const b_00 = lerp(c000[2], c100[2], tx);

    const r_10 = lerp(c010[0], c110[0], tx);
    const g_10 = lerp(c010[1], c110[1], tx);
    const b_10 = lerp(c010[2], c110[2], tx);

    const r_01 = lerp(c001[0], c101[0], tx);
    const g_01 = lerp(c001[1], c101[1], tx);
    const b_01 = lerp(c001[2], c101[2], tx);

    const r_11 = lerp(c011[0], c111[0], tx);
    const g_11 = lerp(c011[1], c111[1], tx);
    const b_11 = lerp(c011[2], c111[2], tx);

    // Linear interpolate along Y
    const r_0 = lerp(r_00, r_10, ty);
    const g_0 = lerp(g_00, g_10, ty);
    const b_0 = lerp(b_00, b_10, ty);

    const r_1 = lerp(r_01, r_11, ty);
    const g_1 = lerp(g_01, g_11, ty);
    const b_1 = lerp(b_01, b_11, ty);

    // Linear interpolate along Z
    const r = lerp(r_0, r_1, tz);
    const g = lerp(g_0, g_1, tz);
    const b = lerp(b_0, b_1, tz);

    return [r, g, b];
  }
}
