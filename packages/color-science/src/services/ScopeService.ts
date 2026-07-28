export class ScopeService {
  /**
   * Sub-samples pixel array to compute a Histogram of intensity distributions
   */
  public computeHistogram(pixels: Uint8ClampedArray, subSampleRate: number = 4): {
    red: Uint32Array;
    green: Uint32Array;
    blue: Uint32Array;
    luminance: Uint32Array;
  } {
    const red = new Uint32Array(256);
    const green = new Uint32Array(256);
    const blue = new Uint32Array(256);
    const luminance = new Uint32Array(256);

    const len = pixels.length;
    const stride = subSampleRate * 4;

    for (let i = 0; i < len; i += stride) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      red[r]++;
      green[g]++;
      blue[b]++;

      const luma = Math.round(r * 0.2126 + g * 0.7152 + b * 0.0722);
      luminance[Math.min(255, luma)]++;
    }

    return { red, green, blue, luminance };
  }

  /**
   * Computes Vectorscope coordinates mapped into normalized chromaticity CbCr channels (-0.5 to 0.5)
   */
  public computeVectorscope(pixels: Uint8ClampedArray, subSampleRate: number = 10): Array<[number, number]> {
    const coords: Array<[number, number]> = [];
    const len = pixels.length;
    const stride = subSampleRate * 4;

    for (let i = 0; i < len; i += stride) {
      const r = pixels[i] / 255;
      const g = pixels[i + 1] / 255;
      const b = pixels[i + 2] / 255;

      // RGB to YCbCr conversion factor approximation
      const cb = -0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 0.5 * r - 0.418688 * g - 0.081312 * b;

      coords.push([cb, cr]);
    }

    return coords;
  }

  /**
   * Maps luminance values to distinct exposure color bands (False Color Exposure Heatmap)
   * 0-5%: Purple (Super Underexposed)
   * 5-10%: Blue
   * 38-45%: Gray (18% middle gray calibration zone)
   * 55-60%: Pink (Skin tone calibration zone)
   * 90-95%: Yellow (Highlight alert)
   * 95-100%: Red (Super Overexposed clipping zone)
   */
  public mapFalseColor(rgb: [number, number, number]): [number, number, number] {
    const luma = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;

    if (luma < 0.05) return [0.5, 0.0, 0.5]; // Purple
    if (luma < 0.1) return [0.0, 0.0, 1.0];  // Blue
    if (luma >= 0.38 && luma <= 0.45) return [0.5, 0.5, 0.5]; // Neutral Gray
    if (luma >= 0.55 && luma <= 0.60) return [1.0, 0.4, 0.7]; // Pink
    if (luma >= 0.90 && luma < 0.95) return [1.0, 1.0, 0.0];  // Yellow
    if (luma >= 0.95) return [1.0, 0.0, 0.0]; // Red (clipping)

    // Otherwise maintain normalized green-tinted baseline to see contours
    return [0.0, luma * 0.6, 0.0];
  }
}
