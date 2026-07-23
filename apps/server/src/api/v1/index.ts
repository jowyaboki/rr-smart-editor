import { ApiGateway } from '@ai-video-editor/api-sdk';

const gateway = new ApiGateway();

export const handleApiV1Request = (key: string, route: string, requiredScopes: string[]) => {
  const auth = gateway.authenticateRequest(key, requiredScopes);
  if (!auth.authorized) {
    return { success: false, error: { code: auth.reason || 'UNAUTHORIZED', message: 'API key authorization failed.' } };
  }

  const limitCheck = gateway.enforceRateLimit(key);
  if (!limitCheck.allowed) {
    return { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please retry later.' } };
  }

  return {
    success: true,
    data: { route, status: 'processed', remainingRequests: limitCheck.remaining },
  };
};
