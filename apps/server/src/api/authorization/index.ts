import { ApiGateway } from '@ai-video-editor/api-sdk';

const gateway = new ApiGateway();

export const authorizeScope = (key: string, scope: string) => {
  return gateway.authenticateRequest(key, [scope]).authorized;
};
