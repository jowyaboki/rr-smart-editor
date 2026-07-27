import { ComposerService } from './services/ComposerService';
import { LayerService } from './services/LayerService';
import { CompositionService } from './services/CompositionService';
import { RigService } from './services/RigService';
import { CameraService } from './services/CameraService';
import { TemplateService } from './services/TemplateService';
import {
  LayerType,
  ShapeType,
  Transform3D,
  CompositionLayer,
  PreCompositionLayer,
  ShapeStyle,
  ShapePath,
  ShapeLayer,
  TextLayer,
  CameraLayer,
  RiggingConstraint,
  Composition,
  LayerTypePlugin,
  ShapeGeneratorPlugin,
} from './types';

export * from './types';
export * from './services/ComposerService';
export * from './services/LayerService';
export * from './services/CompositionService';
export * from './services/RigService';
export * from './services/CameraService';
export * from './services/TemplateService';

export class MotionGraphicsComposerEngine {
  public composerService: ComposerService;
  public layerService: LayerService;
  public compositionService: CompositionService;
  public rigService: RigService;
  public cameraService: CameraService;
  public templateService: TemplateService;

  constructor() {
    this.composerService = new ComposerService();
    this.layerService = new LayerService();
    this.compositionService = new CompositionService(this.composerService);
    this.rigService = new RigService();
    this.cameraService = new CameraService();
    this.templateService = new TemplateService();
  }
}

export const globalMotionGraphicsComposerEngine = new MotionGraphicsComposerEngine();
