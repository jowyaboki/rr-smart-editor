import { CalibrationProfile } from '../types';

export class CalibrationService {
  /**
   * Computes a color correction white-point alignment scaling factor based on target whitepoint coordinates
   */
  public getCalibrationMatrix(profile: CalibrationProfile): number[][] {
    const w = profile.measuredWhitePoint;
    const b = profile.measuredBlackPoint;

    // Scale factors to align measured white/black levels to target
    const rScale = 1.0 / (w[0] - b[0] || 1.0);
    const gScale = 1.0 / (w[1] - b[1] || 1.0);
    const bScale = 1.0 / (w[2] - b[2] || 1.0);

    return [
      [rScale, 0, 0],
      [0, gScale, 0],
      [0, 0, bScale],
    ];
  }

  /**
   * Generates a new profile representation
   */
  public generateCalibrationProfile(
    id: string,
    name: string,
    measuredWhite: [number, number, number],
    measuredBlack: [number, number, number]
  ): CalibrationProfile {
    return {
      id,
      name,
      monitorId: 'monitor-ref-001',
      measuredWhitePoint: measuredWhite,
      measuredBlackPoint: measuredBlack,
      gammaResponse: 2.4,
      calibrationTarget: 'rec709_d65',
      timestamp: Date.now(),
    };
  }
}
