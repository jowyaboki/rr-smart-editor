import { TrackingSource, TrackingFrameData, VirtualCamera } from '../types';

export class TrackingSolver {
  /**
   * Applies Coordinate Mapping configurations (scale, offset, axis-swapping) on raw tracking data
   */
  public solve(rawData: TrackingFrameData, source: TrackingSource): TrackingFrameData {
    let position = [...rawData.position] as [number, number, number];
    let rotation = [...rawData.rotation] as [number, number, number];

    const mapping = source.coordinateMapping;

    // Apply scale mapping
    position[0] *= mapping.scale[0];
    position[1] *= mapping.scale[1];
    position[2] *= mapping.scale[2];

    // Apply axis swapping if present
    if (mapping.axesSwap) {
      const copyPos = [...position];
      if (mapping.axesSwap['x']) {
        const dest = mapping.axesSwap['x'];
        if (dest === 'y') position[1] = copyPos[0];
        if (dest === 'z') position[2] = copyPos[0];
      }
      if (mapping.axesSwap['y']) {
        const dest = mapping.axesSwap['y'];
        if (dest === 'x') position[0] = copyPos[1];
        if (dest === 'z') position[2] = copyPos[1];
      }
    }

    // Apply static offset
    position[0] += mapping.offset[0];
    position[1] += mapping.offset[1];
    position[2] += mapping.offset[2];

    return {
      timestamp: rawData.timestamp,
      position,
      rotation,
      confidence: rawData.confidence,
    };
  }

  /**
   * Simple Low-Pass Noise Filter to smooth out high frequency tracking jitter
   */
  public smooth(
    current: TrackingFrameData,
    previous: TrackingFrameData | null,
    cutoff: number
  ): TrackingFrameData {
    if (!previous) return current;

    // Alpha blending factor for low pass filter
    const alpha = Math.min(1.0, Math.max(0.01, cutoff / 10));

    const smoothVal = (curr: number, prev: number) => prev + alpha * (curr - prev);

    return {
      timestamp: current.timestamp,
      position: [
        smoothVal(current.position[0], previous.position[0]),
        smoothVal(current.position[1], previous.position[1]),
        smoothVal(current.position[2], previous.position[2]),
      ],
      rotation: [
        smoothVal(current.rotation[0], previous.rotation[0]),
        smoothVal(current.rotation[1], previous.rotation[1]),
        smoothVal(current.rotation[2], previous.rotation[2]),
      ],
      confidence: current.confidence,
    };
  }
}

export class TrackingService {
  private solver = new TrackingSolver();
  private history = new Map<string, TrackingFrameData>();

  /**
   * Translates incoming raw tracking frame into solved camera transform properties
   */
  public processTracking(
    source: TrackingSource,
    rawFrame: TrackingFrameData,
    camera: VirtualCamera
  ): VirtualCamera {
    const prevSolved = this.history.get(source.id) || null;

    // Solve spatial axes mapping and offsets
    let solved = this.solver.solve(rawFrame, source);

    // Filter sensor noise
    solved = this.solver.smooth(solved, prevSolved, source.noiseFilterCutoff);

    // Save in sliding cache history
    this.history.set(source.id, solved);

    // Sync camera transform
    return {
      ...camera,
      transform: {
        ...camera.transform,
        position: solved.position,
        rotation: solved.rotation,
      },
    };
  }

  public getHistory(sourceId: string): TrackingFrameData | undefined {
    return this.history.get(sourceId);
  }

  public clearHistory(): void {
    this.history.clear();
  }
}
