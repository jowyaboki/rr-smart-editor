export class DocumentationService {
  public generateOpenApiJSON(): Record<string, any> {
    return {
      openapi: '3.0.0',
      info: {
        title: 'RR Smart Editor Public API Gateway',
        version: '1.0.0',
        description: 'Versioned REST API for external third-party developer integrations.',
      },
      paths: {
        '/v1/projects': {
          get: {
            summary: 'List Projects',
            responses: {
              '200': {
                description: 'A successful list of studio projects.',
              },
            },
          },
        },
        '/v1/renders': {
          post: {
            summary: 'Trigger Render Workflow',
            responses: {
              '201': {
                description: 'Render job queued successfully.',
              },
            },
          },
        },
      },
    };
  }
}

export const globalDocumentationService = new DocumentationService();
export default globalDocumentationService;
