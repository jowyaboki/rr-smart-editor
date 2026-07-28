import { ColorSpace, LUT, OutputTransform, DisplayProfile } from '../types';

export class ColorPluginRegistry {
  private customColorSpaces = new Map<string, ColorSpace>();
  private registeredLuts = new Map<string, LUT>();
  private displayTransforms = new Map<string, OutputTransform>();
  private displayProfiles = new Map<string, DisplayProfile>();

  public registerColorSpace(space: ColorSpace): void {
    this.customColorSpaces.set(space.id, space);
  }

  public getColorSpace(id: string): ColorSpace | undefined {
    return this.customColorSpaces.get(id);
  }

  public listColorSpaces(): ColorSpace[] {
    return Array.from(this.customColorSpaces.values());
  }

  public registerLUT(lut: LUT): void {
    this.registeredLuts.set(lut.id, lut);
  }

  public getLUT(id: string): LUT | undefined {
    return this.registeredLuts.get(id);
  }

  public listLUTs(): LUT[] {
    return Array.from(this.registeredLuts.values());
  }

  public registerDisplayTransform(transform: OutputTransform): void {
    this.displayTransforms.set(transform.id, transform);
  }

  public getDisplayTransform(id: string): OutputTransform | undefined {
    return this.displayTransforms.get(id);
  }

  public listDisplayTransforms(): OutputTransform[] {
    return Array.from(this.displayTransforms.values());
  }

  public registerDisplayProfile(profile: DisplayProfile): void {
    this.displayProfiles.set(profile.id, profile);
  }

  public getDisplayProfile(id: string): DisplayProfile | undefined {
    return this.displayProfiles.get(id);
  }

  public listDisplayProfiles(): DisplayProfile[] {
    return Array.from(this.displayProfiles.values());
  }

  public clear(): void {
    this.customColorSpaces.clear();
    this.registeredLuts.clear();
    this.displayTransforms.clear();
    this.displayProfiles.clear();
  }
}

export const globalColorPluginRegistry = new ColorPluginRegistry();
