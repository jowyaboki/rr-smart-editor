import { PresetService, globalPresetService } from './services/PresetService';
import { ValidationService, globalValidationService } from './services/ValidationService';
import { EncodingService, globalEncodingService } from './services/EncodingService';
import { PackagingService, globalPackagingService } from './services/PackagingService';
import { DistributionService, globalDistributionService } from './services/DistributionService';
import { ExportService, globalExportService } from './services/ExportService';
import { DeliveryService, globalDeliveryService } from './services/DeliveryService';

export * from './types';
export * from './plugins';
export { PresetService, globalPresetService };
export { ValidationService, globalValidationService };
export { EncodingService, globalEncodingService };
export { PackagingService, globalPackagingService };
export { DistributionService, globalDistributionService };
export { ExportService, globalExportService };
export { DeliveryService, globalDeliveryService };

export class DeliveryPlatformEngine {
  public presetService: PresetService;
  public validationService: ValidationService;
  public encodingService: EncodingService;
  public packagingService: PackagingService;
  public distributionService: DistributionService;
  public exportService: ExportService;
  public deliveryService: DeliveryService;

  constructor() {
    this.presetService = globalPresetService;
    this.validationService = globalValidationService;
    this.encodingService = globalEncodingService;
    this.packagingService = globalPackagingService;
    this.distributionService = globalDistributionService;
    this.exportService = globalExportService;
    this.deliveryService = globalDeliveryService;
  }
}
export const globalDeliveryPlatformEngine = new DeliveryPlatformEngine();
