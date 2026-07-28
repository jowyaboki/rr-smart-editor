import { AudioProject, AudioTrack, AudioBus } from '../types';

export class RoutingService {
  /**
   * Resolves the sequential topological signal flow hierarchy across tracks and busses
   */
  public resolveRoutingPath(project: AudioProject, trackId: string): string[] {
    const track = project.tracks[trackId];
    if (!track) return [];

    const path: string[] = [trackId];
    let nextBusId = track.targetBusId;

    const visited = new Set<string>([trackId]);

    // Track sequential bus loops to avoid infinite audio routing feedback
    while (nextBusId && nextBusId !== 'master') {
      if (visited.has(nextBusId)) {
        throw new Error(`Infinite audio feedback loop detected at bus "${nextBusId}"!`);
      }
      visited.add(nextBusId);
      path.push(nextBusId);

      const nextBus = project.busses[nextBusId];
      nextBusId = nextBus?.targetBusId || 'master';
    }

    path.push('master');
    return path;
  }

  /**
   * Dispatches a sidechain trigger gain envelope adjustment
   */
  public calculateSidechainDuck(
    triggerPeakDb: number,
    thresholdDb: number = -18.0,
    ratio: number = 4.0,
    rangeDb: number = -12.0
  ): number {
    if (triggerPeakDb <= thresholdDb) return 1.0; // No ducking applied

    const overDb = triggerPeakDb - thresholdDb;
    const attenuationDb = -overDb * (1.0 - 1.0 / ratio);

    // Clamp ducking to max specified range limit
    const finalAttDb = Math.max(rangeDb, attenuationDb);
    return Math.pow(10.0, finalAttDb / 20.0); // return linear factor
  }
}
