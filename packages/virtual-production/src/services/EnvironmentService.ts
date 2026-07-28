import { Environment } from '../types';

export class EnvironmentService {
  /**
   * Generates a new environment config block (HDRI or skybox)
   */
  public createEnvironment(
    id: string,
    name: string,
    type: 'hdri' | 'skybox_360' | 'image_backplate' | 'video_feed' | 'procedural',
    url?: string,
  ): Environment {
    return {
      id,
      name,
      type,
      sourceUrl: url,
      proceduralParams: {},
      exposure: 1.0,
      blurAmount: 0.0,
      rotationY: 0.0,
    };
  }

  /**
   * Applies procedural parameters to shader variables
   */
  public updateProceduralParams(env: Environment, params: Record<string, any>): Environment {
    if (env.type !== 'procedural') return env;
    return {
      ...env,
      proceduralParams: {
        ...env.proceduralParams,
        ...params,
      },
    };
  }

  /**
   * Updates standard exposure level
   */
  public setExposure(env: Environment, exposure: number): Environment {
    return {
      ...env,
      exposure: Math.max(0, exposure),
    };
  }
}
