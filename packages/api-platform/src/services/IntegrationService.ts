import { Integration } from '../types';

export class IntegrationService {
  private activeConnectors: Map<string, Integration> = new Map();

  constructor() {
    this.createDefaultConnectors();
  }

  private createDefaultConnectors(): void {
    const slack: Integration = {
      id: 'conn_slack',
      name: 'Slack Integration Hub',
      type: 'slack',
      config: { channel: '#renders-pipeline' },
      isActive: true,
    };
    const s3: Integration = {
      id: 'conn_aws_s3',
      name: 'Amazon S3 Media Archiver',
      type: 'aws_s3',
      config: { bucket: 'broadway-raw-assets' },
      isActive: true,
    };

    this.activeConnectors.set(slack.id, slack);
    this.activeConnectors.set(s3.id, s3);
  }

  public registerIntegration(connector: Integration): void {
    this.activeConnectors.set(connector.id, connector);
  }

  public listIntegrations(): Integration[] {
    return Array.from(this.activeConnectors.values());
  }
}

export const globalIntegrationService = new IntegrationService();
export default globalIntegrationService;
