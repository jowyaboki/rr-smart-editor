import { LightRig } from '../types';

export class LightingService {
  /**
   * Translates Kelvin temperature to RGB hex code color approximation
   * Supports standard range of 1000K to 40000K
   */
  public temperatureToHex(temp: number): string {
    temp = Math.max(1000, Math.min(40000, temp)) / 100;
    let r, g, b;

    if (temp <= 66) {
      r = 255;
      g = temp;
      g = 99.4708025861 * Math.log(g) - 161.1195681661;
      if (temp <= 19) {
        b = 0;
      } else {
        b = temp - 10;
        b = 138.5177312231 * Math.log(b) - 305.0447927307;
      }
    } else {
      r = temp - 60;
      r = 329.698727446 * Math.pow(r, -0.1332047592);
      g = temp - 60;
      g = 288.1221695283 * Math.pow(g, -0.0755148492);
      b = 255;
    }

    const clamp = (x: number) => Math.round(Math.max(0, Math.min(255, x)));
    const rh = clamp(r).toString(16).padStart(2, '0');
    const gh = clamp(g).toString(16).padStart(2, '0');
    const bh = clamp(b).toString(16).padStart(2, '0');

    return `#${rh}${gh}${bh}`;
  }

  /**
   * Selects all light nodes grouped under a specific namespace ID
   */
  public filterGroup(lights: Record<string, LightRig>, groupName: string): LightRig[] {
    return Object.values(lights).filter(l => l.groupName === groupName);
  }

  /**
   * Modifies multiple lighting channels simultaneously (Group Intensity Override)
   */
  public setGroupIntensity(
    lights: Record<string, LightRig>,
    groupName: string,
    intensity: number
  ): Record<string, LightRig> {
    const updated = { ...lights };
    for (const key of Object.keys(updated)) {
      if (updated[key].groupName === groupName) {
        updated[key] = {
          ...updated[key],
          intensity: Math.max(0, intensity),
        };
      }
    }
    return updated;
  }
}
