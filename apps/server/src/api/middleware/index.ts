import { ApiGateway } from '@ai-video-editor/api-sdk';

const gateway = new ApiGateway();

export const rateLimitMiddleware = (apiKey: string) => {
  const check = gateway.enforceRateLimit(apiKey);
  return {
    allowed: check.allowed,
    headers: {
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': String(check.remaining),
      'X-RateLimit-Reset': '60000',
    },
  };
};
