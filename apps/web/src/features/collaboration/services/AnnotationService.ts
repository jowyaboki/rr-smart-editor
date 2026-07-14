import { Annotation } from '@ai-video-editor/shared';

export class AnnotationService {
  /**
   * Instantiates a new timeline annotation (marker, frame, region or text).
   */
  public static createAnnotation(params: {
    projectId: string;
    type: Annotation['type'];
    timeStart: number;
    timeEnd?: number;
    label: string;
    color?: string;
    priority?: Annotation['priority'];
    authorId: string;
  }): Annotation {
    const id = `annot_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    return {
      id,
      projectId: params.projectId,
      type: params.type,
      timeStart: params.timeStart,
      timeEnd: params.timeEnd,
      label: params.label,
      color: params.color || '#3182ce', // default blue
      priority: params.priority || 'medium',
      authorId: params.authorId,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Calculates whether an annotation is active at a specific timeline frame.
   */
  public static isActiveAtFrame(annotation: Annotation, frame: number): boolean {
    if (annotation.timeEnd !== undefined) {
      return frame >= annotation.timeStart && frame <= annotation.timeEnd;
    }
    // For single frame/marker annotations, allow a 5 frame buffer for easy click/trigger
    return Math.abs(frame - annotation.timeStart) <= 5;
  }
}
