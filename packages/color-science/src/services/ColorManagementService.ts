import { ColorSpace } from '../types';

export class ColorManagementService {
  // Primaries Chromaticity standard matrices (RGB to XYZ)
  private standardMatrices = new Map<string, number[][]>();

  constructor() {
    // sRGB to XYZ Matrix
    this.standardMatrices.set('srgb', [
      [0.4124564, 0.3575761, 0.1804375],
      [0.2126729, 0.7151522, 0.0721750],
      [0.0193339, 0.1191920, 0.9503041],
    ]);

    // Rec.709 to XYZ Matrix (extremely similar to sRGB but linear gamma)
    this.standardMatrices.set('rec709', [
      [0.4124564, 0.3575761, 0.1804375],
      [0.2126729, 0.7151522, 0.0721750],
      [0.0193339, 0.1191920, 0.9503041],
    ]);

    // Rec.2020 to XYZ Matrix
    this.standardMatrices.set('rec2020', [
      [0.636958, 0.199640, 0.113702],
      [0.262700, 0.677998, 0.059302],
      [0.000000, 0.028073, 0.760014],
    ]);

    // ACEScg to XYZ Matrix
    this.standardMatrices.set('acescg', [
      [0.66245418, 0.13400431, 0.15618751],
      [0.27222872, 0.67408177, 0.05368951],
      [-0.0055746, 0.00406073, 1.0103391],
    ]);

    // ACES2065-1 to XYZ Matrix
    this.standardMatrices.set('aces2065_1', [
      [0.9526460, 0.0000000, 0.0000936],
      [0.0000000, 1.0000000, 0.0000000],
      [0.0000000, 0.0000000, 1.0113220],
    ]);
  }

  /**
   * Translates 3x3 matrix multiplication
   */
  public multiplyMatrixVector(matrix: number[][], rgb: [number, number, number]): [number, number, number] {
    const r = rgb[0] * matrix[0][0] + rgb[1] * matrix[0][1] + rgb[2] * matrix[0][2];
    const g = rgb[0] * matrix[1][0] + rgb[1] * matrix[1][1] + rgb[2] * matrix[1][2];
    const b = rgb[0] * matrix[2][0] + rgb[1] * matrix[2][1] + rgb[2] * matrix[2][2];
    return [r, g, b];
  }

  /**
   * Solves 3x3 Matrix inversion utilizing standard cofactor method
   */
  public invertMatrix(m: number[][]): number[][] {
    const det =
      m[0][0] * (m[1][1] * m[2][2] - m[2][1] * m[1][2]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

    if (det === 0) {
      throw new Error('Matrix inversion failed: zero determinant');
    }

    const invDet = 1.0 / det;

    return [
      [
        (m[1][1] * m[2][2] - m[2][1] * m[1][2]) * invDet,
        (m[0][2] * m[2][1] - m[0][1] * m[2][2]) * invDet,
        (m[0][1] * m[1][2] - m[0][2] * m[1][1]) * invDet,
      ],
      [
        (m[1][2] * m[2][0] - m[1][0] * m[2][2]) * invDet,
        (m[0][0] * m[2][2] - m[0][2] * m[2][0]) * invDet,
        (m[0][2] * m[1][0] - m[0][0] * m[1][2]) * invDet,
      ],
      [
        (m[1][0] * m[2][1] - m[2][0] * m[1][1]) * invDet,
        (m[0][1] * m[2][0] - m[0][0] * m[2][1]) * invDet,
        (m[0][0] * m[1][1] - m[0][1] * m[1][0]) * invDet,
      ],
    ];
  }

  /**
   * Solves Bradford chromatic adaptation transition matrix between D65 and D60 (ACES standard white)
   */
  public getBradfordAdaptationMatrix(fromWhite: [number, number], toWhite: [number, number]): number[][] {
    // Simplifies to identity for equal whitepoints, or standard precompiled Bradford for D65->D60
    if (fromWhite[0] === toWhite[0] && fromWhite[1] === toWhite[1]) {
      return [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ];
    }

    // Bradford D65 -> D50 / D60 coefficient matrix
    return [
      [1.0478112, 0.0228866, -0.0501270],
      [0.0295424, 0.9904844, -0.0170491],
      [-0.0092319, 0.0150436, 0.7521316],
    ];
  }

  /**
   * Applies non-linear gamma electro-optical mapping (sRGB gamma decode)
   */
  public srgbDecode(val: number): number {
    if (val <= 0.04045) {
      return val / 12.92;
    }
    return Math.pow((val + 0.055) / 1.055, 2.4);
  }

  /**
   * Applies non-linear gamma electro-optical mapping (sRGB gamma encode)
   */
  public srgbEncode(val: number): number {
    if (val <= 0.0031308) {
      return val * 12.92;
    }
    return 1.055 * Math.pow(val, 1.0 / 2.4) - 0.055;
  }

  /**
   * Converts between source and target color spaces
   */
  public convertColor(
    rgb: [number, number, number],
    source: ColorSpace,
    target: ColorSpace
  ): [number, number, number] {
    // 1. Nonlinear decoding to Linear RGB
    let linearRgb = [...rgb] as [number, number, number];
    if (source.gammaCurve === 'srgb') {
      linearRgb = [this.srgbDecode(rgb[0]), this.srgbDecode(rgb[1]), this.srgbDecode(rgb[2])];
    } else if (source.gammaCurve === 'bt1886') {
      linearRgb = [Math.pow(Math.max(0, rgb[0]), 2.4), Math.pow(Math.max(0, rgb[1]), 2.4), Math.pow(Math.max(0, rgb[2]), 2.4)];
    }

    // 2. Linear source -> XYZ Space
    const toXyzMat = this.standardMatrices.get(source.type) || this.standardMatrices.get('srgb')!;
    let xyz = this.multiplyMatrixVector(toXyzMat, linearRgb);

    // 3. Chromatic adaptation (D65 white point to ACES D60 or custom target white point)
    const adaptMat = this.getBradfordAdaptationMatrix(source.primaries.white, target.primaries.white);
    xyz = this.multiplyMatrixVector(adaptMat, xyz);

    // 4. XYZ -> Target Linear space
    const targetToXyzMat = this.standardMatrices.get(target.type) || this.standardMatrices.get('srgb')!;
    const xyzToTargetMat = this.invertMatrix(targetToXyzMat);
    let targetLinear = this.multiplyMatrixVector(xyzToTargetMat, xyz);

    // Clamp values slightly to prevent negative primary excursions
    targetLinear = [
      Math.max(0, targetLinear[0]),
      Math.max(0, targetLinear[1]),
      Math.max(0, targetLinear[2]),
    ];

    // 5. Linear target -> Nonlinear encoding
    if (target.gammaCurve === 'srgb') {
      return [this.srgbEncode(targetLinear[0]), this.srgbEncode(targetLinear[1]), this.srgbEncode(targetLinear[2])];
    } else if (target.gammaCurve === 'bt1886') {
      return [Math.pow(targetLinear[0], 1.0 / 2.4), Math.pow(targetLinear[1], 1.0 / 2.4), Math.pow(targetLinear[2], 1.0 / 2.4)];
    }

    return targetLinear;
  }
}
