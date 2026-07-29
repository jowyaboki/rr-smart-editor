import { ApiRequest, ApiScope } from '../types';
import { globalApiPluginRegistry } from '../plugins';

export class ApiGatewayService {
  public async handleRequest(
    request: ApiRequest,
    activeScopes: ApiScope[]
  ): Promise<{ statusCode: number; body: Record<string, any> }> {
    // Look up plugin endpoint first
    const endpoint = globalApiPluginRegistry.getEndpoint(request.method, request.path);
    if (endpoint) {
      // Validate scopes
      const hasScopes = endpoint.requiredScopes.every((s) => activeScopes.includes(s));
      if (!hasScopes) {
        return {
          statusCode: 403,
          body: { success: false, error: 'Forbidden. Insufficient token scopes.' },
        };
      }
      return endpoint.handler(request);
    }

    // Default stable gateway routes mock
    if (request.path === '/v1/projects' && request.method === 'GET') {
      return {
        statusCode: 200,
        body: {
          success: true,
          projects: [
            { id: 'proj_01', name: 'Broadway Promo Video', createdAt: new Date().toISOString() },
            { id: 'proj_02', name: 'Drone Aerial B-Roll', createdAt: new Date().toISOString() },
          ],
        },
      };
    }

    if (request.path === '/v1/renders' && request.method === 'POST') {
      const hasWriteScope = activeScopes.includes('renders:write');
      if (!hasWriteScope) {
        return { statusCode: 403, body: { success: false, error: 'Scope renders:write required.' } };
      }
      return {
        statusCode: 201,
        body: {
          success: true,
          job: {
            id: `job_${Math.random().toString(36).substr(2, 9)}`,
            status: 'queued',
            createdAt: new Date().toISOString(),
          },
        },
      };
    }

    return {
      statusCode: 404,
      body: { success: false, error: `Route '${request.method} ${request.path}' not found on versioned gateway.` },
    };
  }
}

export const globalApiGatewayService = new ApiGatewayService();
export default globalApiGatewayService;
