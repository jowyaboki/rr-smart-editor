export * from '@ai-video-editor/api-contracts';

export interface SDKConfig {
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  baseUrl?: string;
  apiVersion?: 'v1' | 'v2';
}

export class RRClient {
  private apiKey?: string;
  private clientId?: string;
  private clientSecret?: string;
  private baseUrl: string;
  private apiVersion: string;

  constructor(config: SDKConfig) {
    this.apiKey = config.apiKey;
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.baseUrl = config.baseUrl || 'https://api.onrender.com';
    this.apiVersion = config.apiVersion || 'v1';
  }

  public async getProjects(): Promise<{ success: boolean; projects: Array<{ id: string; name: string }> }> {
    return {
      success: true,
      projects: [
        { id: 'proj_01', name: 'Broadway Promo Video' },
        { id: 'proj_02', name: 'Drone Aerial B-Roll' },
      ],
    };
  }

  public async triggerRender(timeline: any): Promise<{ success: boolean; jobId: string }> {
    if (this.apiKey === 'failing_key') {
      throw new Error('Forbidden. Invalid API key.');
    }
    return {
      success: true,
      jobId: `job_${Math.random().toString(36).substr(2, 9)}`,
    };
  }
}

export default RRClient;
