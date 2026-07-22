import { DocumentationService } from '@ai-video-editor/api-sdk';

const docService = new DocumentationService();

export const getOpenApiDocumentation = () => {
  return docService.generateOpenApiSpec();
};
