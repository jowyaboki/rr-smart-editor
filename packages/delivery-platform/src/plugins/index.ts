import {
  ExporterAdapter,
  EncoderAdapter,
  PackagerAdapter,
  DeliveryProviderAdapter,
  QCValidatorAdapter,
  ExportPreset,
} from '../types';

export class DeliveryPluginRegistry {
  private exporters: Map<string, ExporterAdapter> = new Map();
  private encoders: Map<string, EncoderAdapter> = new Map();
  private packagers: Map<string, PackagerAdapter> = new Map();
  private providers: Map<string, DeliveryProviderAdapter> = new Map();
  private validators: Map<string, QCValidatorAdapter> = new Map();
  private presetLibraries: Map<string, ExportPreset[]> = new Map();

  public registerExporter(adapter: ExporterAdapter): void {
    this.exporters.set(adapter.id, adapter);
  }

  public registerEncoder(adapter: EncoderAdapter): void {
    this.encoders.set(adapter.id, adapter);
  }

  public registerPackager(adapter: PackagerAdapter): void {
    this.packagers.set(adapter.id, adapter);
  }

  public registerDeliveryProvider(adapter: DeliveryProviderAdapter): void {
    this.providers.set(adapter.id, adapter);
  }

  public registerQCValidator(adapter: QCValidatorAdapter): void {
    this.validators.set(adapter.id, adapter);
  }

  public registerPresetLibrary(libraryId: string, presets: ExportPreset[]): void {
    this.presetLibraries.set(libraryId, presets);
  }

  public getExporter(id: string): ExporterAdapter | undefined {
    return this.exporters.get(id);
  }

  public getEncoder(id: string): EncoderAdapter | undefined {
    return this.encoders.get(id);
  }

  public getPackager(id: string): PackagerAdapter | undefined {
    return this.packagers.get(id);
  }

  public getDeliveryProvider(id: string): DeliveryProviderAdapter | undefined {
    return this.providers.get(id);
  }

  public getQCValidator(id: string): QCValidatorAdapter | undefined {
    return this.validators.get(id);
  }

  public listExporters(): ExporterAdapter[] {
    return Array.from(this.exporters.values());
  }

  public listEncoders(): EncoderAdapter[] {
    return Array.from(this.encoders.values());
  }

  public listPackagers(): PackagerAdapter[] {
    return Array.from(this.packagers.values());
  }

  public listDeliveryProviders(): DeliveryProviderAdapter[] {
    return Array.from(this.providers.values());
  }

  public listQCValidators(): QCValidatorAdapter[] {
    return Array.from(this.validators.values());
  }

  public listPresetsFromLibraries(): ExportPreset[] {
    const all: ExportPreset[] = [];
    for (const presets of this.presetLibraries.values()) {
      all.push(...presets);
    }
    return all;
  }
}

export const globalDeliveryPluginRegistry = new DeliveryPluginRegistry();
