import { GeneratorService } from './services/GeneratorService';
import { ValidationService } from './services/ValidationService';
import { BenchmarkService } from './services/BenchmarkService';
import { DocumentationService } from './services/DocumentationService';
import {
  GeneratorType,
  GeneratorConfig,
  ValidationResult,
  ManifestSchema,
  BenchmarkMetrics,
  DocumentationMetadata,
  DebuggerSession,
  LivePreviewOptions,
  DevKitCliContribution,
  DevKitValidator,
} from './types';

export * from './types';
export * from './services/GeneratorService';
export * from './services/ValidationService';
export * from './services/BenchmarkService';
export * from './services/DocumentationService';

export class DevKitPlatformEngine {
  public generatorService: GeneratorService;
  public validationService: ValidationService;
  public benchmarkService: BenchmarkService;
  public documentationService: DocumentationService;

  constructor() {
    this.generatorService = new GeneratorService();
    this.validationService = new ValidationService();
    this.benchmarkService = new BenchmarkService();
    this.documentationService = new DocumentationService();
  }
}

export const globalDevKitPlatformEngine = new DevKitPlatformEngine();
