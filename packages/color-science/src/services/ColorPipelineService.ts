import { ColorPipeline, Grade, ColorSpace, LUT } from '../types';
import { ColorManagementService } from './ColorManagementService';
import { GradingService } from './GradingService';
import { LUTService } from './LUTService';

export class ColorPipelineService {
  constructor(
    private readonly manager: ColorManagementService,
    private readonly grading: GradingService,
    private readonly lutService: LUTService
  ) {}

  /**
   * Evaluates the full non-destructive Color Pipeline step-by-step
   * Input RGB -> Input Transform -> Working Space -> Grading -> LUT -> Output Transform
   */
  public evaluatePipeline(
    rgb: [number, number, number],
    pipeline: ColorPipeline,
    grade: Grade,
    activeLutData?: Float32Array,
    activeLutSize?: number
  ): [number, number, number] {
    // 1. Media input (assumed in pipeline.inputTransform source space)
    const sourceSpace = pipeline.inputTransform.sourceGamut;
    const workingSpace = pipeline.workingSpace.colorSpace;

    // Simulate input mapping to Working Color Space
    // (In full execution, this Bradford conversion adapts media primaries)
    let processed = this.manager.convertColor(
      rgb,
      {
        id: 'src-space',
        name: 'Source gamut',
        type: sourceSpace,
        primaries: { red: [0.64, 0.33], green: [0.30, 0.60], blue: [0.15, 0.06], white: [0.3127, 0.3290] },
        gammaCurve: 'srgb',
        gammaValue: 2.2,
      },
      workingSpace
    );

    // [Effects Engine & Node Compositor step occurs externally in pipeline]

    // 2. Color Grading CDL + Creative controls (Non-destructive)
    processed = this.grading.solveGrade(processed, grade);

    // 3. Look Creative LUT trilinear interpolation lookup (If present)
    if (pipeline.lookTransform?.lookLutId && activeLutData && activeLutSize) {
      processed = this.lutService.trilinearInterpolate3D(processed, activeLutData, activeLutSize);
    }

    // 4. Output Transform (Working Space mapped to target DisplayProfile / OutputTransform)
    const targetSpace = pipeline.outputTransform.targetGamut;
    processed = this.manager.convertColor(
      processed,
      workingSpace,
      {
        id: 'out-space',
        name: 'Output display space',
        type: targetSpace,
        primaries: { red: [0.64, 0.33], green: [0.30, 0.60], blue: [0.15, 0.06], white: [0.3127, 0.3290] },
        gammaCurve: 'srgb',
        gammaValue: 2.2,
      }
    );

    return processed;
  }
}
