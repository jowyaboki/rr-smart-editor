import { Webhook, WebhookEvent } from '@ai-video-editor/api-contracts';

export class WebhookService {
  private webhooks: Map<string, Webhook> = new Map();
  private sentEvents: Map<string, WebhookEvent> = new Map();

  public registerWebhook(hook: Webhook): void {
    this.webhooks.set(hook.id, hook);
  }

  public async dispatchEvent(event: string, payload: Record<string, any>): Promise<WebhookEvent[]> {
    const list = Array.from(this.webhooks.values());
    const dispatched: WebhookEvent[] = [];

    for (const hook of list) {
      if (!hook.isActive) continue;
      if (hook.subscribedEvents.includes('*') || hook.subscribedEvents.includes(event)) {
        const eventId = `evt_${Math.random().toString(36).substr(2, 9)}`;

        const webhookEvent: WebhookEvent = {
          id: eventId,
          webhookId: hook.id,
          event,
          payload,
          timestamp: new Date().toISOString(),
          deliveryStatus: 'pending',
          attemptsCount: 0,
        };

        this.sentEvents.set(eventId, webhookEvent);

        // Perform async simulated delivery
        this.deliverEvent(webhookEvent, hook).catch((err) => {
          console.error(`Failed to deliver webhook event ${eventId}:`, err);
        });

        dispatched.push(webhookEvent);
      }
    }

    return dispatched;
  }

  private async deliverEvent(event: WebhookEvent, hook: Webhook): Promise<void> {
    event.attemptsCount += 1;
    event.deliveryStatus = 'retrying';

    // Mock secure HMAC signature headers (signature validation)
    const signature = `sha256=MOCK_SIGNED_PAYLOAD_FOR_SECRET_${hook.secret}`;

    // Simulate endpoint delivery
    try {
      if (hook.url === 'http://failing-endpoint.com') {
        throw new Error('500 Internal Server Error');
      }

      event.deliveryStatus = 'success';
      event.lastAttemptResponse = '200 OK';
    } catch (err: any) {
      event.lastAttemptResponse = err.message;
      const maxRetries = hook.retryPolicy?.maxRetries ?? 2;

      if (event.attemptsCount <= maxRetries) {
        // Wait retry backoff and redeliver
        const delay = hook.retryPolicy?.backoffMs ?? 10;
        await new Promise((r) => setTimeout(r, delay));
        await this.deliverEvent(event, hook);
      } else {
        event.deliveryStatus = 'failed';
      }
    }
  }

  public getEvent(id: string): WebhookEvent | undefined {
    return this.sentEvents.get(id);
  }

  public listWebhooks(): Webhook[] {
    return Array.from(this.webhooks.values());
  }

  public listSentEvents(): WebhookEvent[] {
    return Array.from(this.sentEvents.values());
  }
}

export const globalWebhookService = new WebhookService();
export default globalWebhookService;
