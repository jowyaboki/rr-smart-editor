import { ApiGateway } from '@ai-video-editor/api-sdk';

const gateway = new ApiGateway();

export const authenticateApiKey = (key: string) => {
  return gateway.authenticateRequest(key, []);
};
