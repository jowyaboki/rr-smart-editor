import { IDigitalTwin, SimulationEvent } from '@ai-video-editor/simulation-engine';

export class ReplayService {
  public stepForward(twin: IDigitalTwin): void {
    if (twin.replayPointer < twin.history.length - 1) {
      twin.replayToStep(twin.replayPointer + 1);
    }
  }

  public stepBackward(twin: IDigitalTwin): void {
    if (twin.replayPointer > -1) {
      twin.replayToStep(twin.replayPointer - 1);
    }
  }

  public timeTravel(twin: IDigitalTwin, stepIndex: number): void {
    twin.replayToStep(stepIndex);
  }

  public rollback(twin: IDigitalTwin): SimulationEvent | null {
    return twin.rollbackStep();
  }

  /**
   * Generates a structural and properties diff between original and simulated project timelines
   */
  public getTimelineDiff(originalTimeline: any, simulatedTimeline: any): {
    addedClips: any[];
    removedClips: any[];
    modifiedClips: Array<{ id: string; field: string; before: any; after: any }>;
  } {
    const originalClips = originalTimeline?.clips || [];
    const simulatedClips = simulatedTimeline?.clips || [];

    const addedClips = simulatedClips.filter((sc: any) => !originalClips.some((oc: any) => oc.id === sc.id));
    const removedClips = originalClips.filter((oc: any) => !simulatedClips.some((sc: any) => sc.id === oc.id));
    const modifiedClips: any[] = [];

    simulatedClips.forEach((sc: any) => {
      const oc = originalClips.find((c: any) => c.id === sc.id);
      if (oc) {
        Object.keys(sc).forEach(key => {
          if (key !== 'stateDelta' && JSON.stringify(sc[key]) !== JSON.stringify(oc[key])) {
            modifiedClips.push({
              id: sc.id,
              field: key,
              before: oc[key],
              after: sc[key],
            });
          }
        });
      }
    });

    return {
      addedClips,
      removedClips,
      modifiedClips,
    };
  }
}
