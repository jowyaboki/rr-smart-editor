import { webLogger } from '../services';

export const logDiagnosticEvent = (name: string, payload: any) => {
  return webLogger.log('info', 'EventBus', name, `Recorded event: ${name}`, { correlationId: payload?.id });
};
