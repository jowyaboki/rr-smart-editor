import { WebhookService } from '@ai-video-editor/api-sdk';

export const webhooks = new WebhookService();

export const triggerWebhookDelivery = (event: any, payload: any) => {
  return webhooks.triggerEvent(event, payload);
};
