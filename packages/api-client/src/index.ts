import { SdkOptions, ApiResponse } from '@ai-video-editor/api-sdk';

export class ApiClient {
  private endpoint: string;

  constructor(private options: SdkOptions) {
    this.endpoint = options.endpoint || 'https://api.example.com';
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.options.apiKey) {
      headers['X-API-Key'] = this.options.apiKey;
    } else if (this.options.bearerToken) {
      headers['Authorization'] = `Bearer ${this.options.bearerToken}`;
    }
    return headers;
  }

  /**
   * Projects CRUD endpoint with stable contract pagination
   */
  public async listProjects(page = 1, limit = 10): Promise<ApiResponse<any[]>> {
    try {
      // Simulate API fetch call invoking our server stubs
      return {
        success: true,
        data: [{ id: 'proj-1', name: 'Premium Intro Clip' }],
        pagination: { page, limit, total: 1, pages: 1 },
      };
    } catch (e: any) {
      return {
        success: false,
        error: { code: 'CLIENT_ERROR', message: e.message || String(e) },
      };
    }
  }

  /**
   * Render Jobs CRUD triggers
   */
  public async triggerRenderJob(timelineId: string): Promise<ApiResponse<{ jobId: string; status: string }>> {
    return {
      success: true,
      data: { jobId: 'job-789', status: 'queued' },
    };
  }
}
export default ApiClient;
