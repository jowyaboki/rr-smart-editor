import { Grade } from '../types';

export class GradingService {
  /**
   * Applies ASC CDL (American Society of Cinematographers Color Decision List)
   * Formula: output = (input * slope + offset)^power
   * Standard mapping to Lift, Gamma, Gain:
   * slope = Gain
   * offset = Offset
   * power = 1 / Gamma (with adjusted Lift mapping)
   */
  public applyCDL(
    rgb: [number, number, number],
    lift: [number, number, number],
    gamma: [number, number, number],
    gain: [number, number, number],
    offset: [number, number, number]
  ): [number, number, number] {
    const processChannel = (val: number, l: number, g: number, p: number, o: number) => {
      // Scale lift/slope maps
      const slope = p;
      const off = o + l * (1 - p);
      const power = g !== 0 ? 1.0 / Math.max(0.1, g) : 1.0;

      const v = val * slope + off;
      return Math.pow(Math.max(0, v), power);
    };

    return [
      processChannel(rgb[0], lift[0], gamma[0], gain[0], offset[0]),
      processChannel(rgb[1], lift[1], gamma[1], gain[1], offset[1]),
      processChannel(rgb[2], lift[2], gamma[2], gain[2], offset[2]),
    ];
  }

  /**
   * Applies contrast with pivot point
   * Formula: output = ((input - pivot) * contrast) + pivot
   */
  public applyContrast(
    rgb: [number, number, number],
    contrast: number,
    pivot: number = 0.435
  ): [number, number, number] {
    if (contrast === 1.0) return rgb;

    const solve = (v: number) => {
      return (v - pivot) * contrast + pivot;
    };

    return [
      Math.max(0, solve(rgb[0])),
      Math.max(0, solve(rgb[1])),
      Math.max(0, solve(rgb[2])),
    ];
  }

  /**
   * Applies temperature and tint (amber-blue & green-magenta offsets)
   */
  public applyTemperatureTint(
    rgb: [number, number, number],
    temp: number, // -100 to 100
    tint: number  // -100 to 100
  ): [number, number, number] {
    const tempOffset = temp / 500; // scaling factor
    const tintOffset = tint / 500;

    return [
      Math.max(0, rgb[0] + tempOffset), // Warm amber (R increase)
      Math.max(0, rgb[1] - tintOffset), // Green-magenta shift on G
      Math.max(0, rgb[2] - tempOffset), // Cool blue (B decrease)
    ];
  }

  /**
   * Applies saturation in working luminance weights (ACES Rec.709 coefficients)
   */
  public applySaturation(
    rgb: [number, number, number],
    sat: number,
    weights: [number, number, number] = [0.2126, 0.7152, 0.0722]
  ): [number, number, number] {
    if (sat === 1.0) return rgb;

    const luma = rgb[0] * weights[0] + rgb[1] * weights[1] + rgb[2] * weights[2];

    return [
      Math.max(0, luma + (rgb[0] - luma) * sat),
      Math.max(0, luma + (rgb[1] - luma) * sat),
      Math.max(0, luma + (rgb[2] - luma) * sat),
    ];
  }

  /**
   * Master non-destructive grade solver combining all operations sequentially
   */
  public solveGrade(rgb: [number, number, number], grade: Grade): [number, number, number] {
    // 1. Apply Temp & Tint
    let res = this.applyTemperatureTint(rgb, grade.temperature, grade.tint);

    // 2. Apply ASC CDL
    res = this.applyCDL(
      res,
      grade.lift.rgb,
      grade.gamma.rgb,
      grade.gain.rgb,
      grade.offset.rgb
    );

    // 3. Apply Contrast & Pivot
    res = this.applyContrast(res, grade.contrast, grade.pivot);

    // 4. Apply Saturation
    res = this.applySaturation(res, grade.saturation);

    return res;
  }
}
