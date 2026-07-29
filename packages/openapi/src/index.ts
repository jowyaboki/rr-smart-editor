export class OpenApiService {
  public generateOpenApi31Spec(): Record<string, any> {
    return {
      openapi: '3.1.0',
      info: {
        title: 'RR Smart Editor External Developer API Gateway',
        version: '1.0.0',
        description: 'Versioned OpenAPI spec endpoints.',
      },
      paths: {
        '/v1/projects': {
          get: {
            summary: 'List Projects',
            responses: {
              '200': {
                description: 'A successful list of projects.',
              },
            },
          },
        },
      },
    };
  }
}

export const globalOpenApiService = new OpenApiService();
export default globalOpenApiService;
