import { VirtualCamera, CameraBookmark, Transform3D, CameraRig } from '../types';

export class LensPresetRegistry {
  private presets = new Map<string, { focalLength: number; fov: number }>();

  constructor() {
    this.presets.set('18mm_wide', { focalLength: 18, fov: 90 });
    this.presets.set('24mm_landscape', { focalLength: 24, fov: 74 });
    this.presets.set('35mm_street', { focalLength: 35, fov: 54 });
    this.presets.set('50mm_standard', { focalLength: 50, fov: 40 });
    this.presets.set('85mm_portrait', { focalLength: 85, fov: 24 });
    this.presets.set('135mm_telephoto', { focalLength: 135, fov: 15 });
    this.presets.set('200mm_super_tele', { focalLength: 200, fov: 10 });
  }

  public getPreset(name: string): { focalLength: number; fov: number } | undefined {
    return this.presets.get(name);
  }

  public registerPreset(name: string, focalLength: number, fov: number): void {
    this.presets.set(name, { focalLength, fov });
  }
}

export class CameraConstraintSolver {
  /**
   * Solves spatial limits or constraints on cameras (e.g. floor plane, lookAt focus distance limits)
   */
  public clampToStageFloor(transform: Transform3D, floorY: number = 0): Transform3D {
    const updated = { ...transform };
    if (updated.position[1] < floorY) {
      updated.position[1] = floorY;
    }
    return updated;
  }
}

export class CameraRigSolver {
  /**
   * Translates dolly, crane, orbit, or handheld mechanical constraints into kinematic transforms
   */
  public solveRig(rig: CameraRig, timeSeconds: number): Transform3D {
    const baseTransform = rig.transform;
    const constraints = rig.constraints;
    const solved: Transform3D = {
      position: [...baseTransform.position],
      rotation: [...baseTransform.rotation],
      scale: [...baseTransform.scale],
      anchorPoint: [...baseTransform.anchorPoint],
      opacity: baseTransform.opacity,
    };

    switch (rig.type) {
      case 'dolly_track': {
        const len = constraints.trackLength || 5.0;
        const offsetX = Math.sin(timeSeconds * 0.5) * (len / 2);
        solved.position[0] += offsetX;
        break;
      }
      case 'crane_arm': {
        const arm = constraints.armLength || 3.0;
        solved.position[1] += Math.sin(timeSeconds * 0.3) * (arm / 2);
        solved.rotation[1] += Math.sin(timeSeconds * 0.3) * 15;
        break;
      }
      case 'orbit_arm': {
        const radius = constraints.orbitRadius || 4.0;
        const angle = timeSeconds * 0.5;
        solved.position[0] = Math.cos(angle) * radius;
        solved.position[2] = Math.sin(angle) * radius;
        solved.rotation[1] = -angle * (180 / Math.PI) + 90;
        break;
      }
      case 'handheld_rig': {
        const jitterVal = constraints.handheldJitter || 0.1;
        solved.position[0] += Math.sin(timeSeconds * 7.1) * (jitterVal * 0.3);
        solved.position[1] += Math.sin(timeSeconds * 5.9) * (jitterVal * 0.3);
        solved.position[2] += Math.cos(timeSeconds * 6.3) * (jitterVal * 0.1);
        solved.rotation[2] += Math.sin(timeSeconds * 8.2) * (jitterVal * 5.0);
        break;
      }
      default:
        break;
    }

    return solved;
  }
}

export class CameraInterpolator {
  /**
   * Linearly interpolates (lerps) between camera bookmark transforms
   */
  public interpolate(from: Transform3D, to: Transform3D, t: number): Transform3D {
    const lerp = (a: number, b: number, factor: number) => a + (b - a) * factor;
    return {
      position: [
        lerp(from.position[0], to.position[0], t),
        lerp(from.position[1], to.position[1], t),
        lerp(from.position[2], to.position[2], t),
      ],
      rotation: [
        lerp(from.rotation[0], to.rotation[0], t),
        lerp(from.rotation[1], to.rotation[1], t),
        lerp(from.rotation[2], to.rotation[2], t),
      ],
      scale: [
        lerp(from.scale[0], to.scale[0], t),
        lerp(from.scale[1], to.scale[1], t),
        lerp(from.scale[2], to.scale[2], t),
      ],
      anchorPoint: [
        lerp(from.anchorPoint[0], to.anchorPoint[0], t),
        lerp(from.anchorPoint[1], to.anchorPoint[1], t),
      ],
      opacity: lerp(from.opacity, to.opacity, t),
    };
  }
}

export class CameraService {
  public readonly lensRegistry = new LensPresetRegistry();
  public readonly constraintSolver = new CameraConstraintSolver();
  public readonly rigSolver = new CameraRigSolver();
  public readonly interpolator = new CameraInterpolator();

  public focalLengthToFov(focalLengthMm: number, sensorWidthMm: number = 36): number {
    if (focalLengthMm <= 0) return 60;
    return 2 * Math.atan(sensorWidthMm / (2 * focalLengthMm)) * (180 / Math.PI);
  }

  public applyLensPreset(camera: VirtualCamera, preset: string): VirtualCamera {
    const val = this.lensRegistry.getPreset(preset);
    if (!val) return camera;
    return {
      ...camera,
      lensPreset: preset as any,
      focalLength: val.focalLength,
      fov: val.fov,
    };
  }

  public createBookmark(camera: VirtualCamera, name: string): VirtualCamera {
    const id = `bookmark_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newBookmark: CameraBookmark = {
      id,
      name,
      transform: {
        position: [...camera.transform.position],
        rotation: [...camera.transform.rotation],
        scale: [...camera.transform.scale],
        anchorPoint: [...camera.transform.anchorPoint],
        opacity: camera.transform.opacity,
      },
      focalLength: camera.focalLength,
      timestamp: Date.now(),
    };
    return {
      ...camera,
      bookmarks: [...camera.bookmarks, newBookmark],
      activeBookmarkId: id,
    };
  }

  public solveRigConstraints(
    rigType: 'static' | 'dolly_track' | 'crane_arm' | 'orbit_arm' | 'handheld_rig',
    baseTransform: Transform3D,
    constraints: {
      trackLength?: number;
      armLength?: number;
      orbitRadius?: number;
      handheldJitter?: number;
    },
    timeSeconds: number,
  ): Transform3D {
    const rig: CameraRig = {
      id: 'temp-rig',
      name: 'Temp Rig',
      type: rigType,
      transform: baseTransform,
      activeCameraId: 'temp-cam',
      constraints,
    };
    return this.rigSolver.solveRig(rig, timeSeconds);
  }
}
