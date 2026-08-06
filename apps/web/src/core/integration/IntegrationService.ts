import { EngineRegistry, EngineInstance, EngineInfo } from './EngineRegistry';
import { LifecycleManager } from './LifecycleManager';
import { EventBridge, eventBridge } from './EventBridge';

export class IntegrationService {
  public readonly registry = new EngineRegistry();
  public readonly lifecycle: LifecycleManager;
  public readonly eventBridge = eventBridge;

  constructor() {
    this.lifecycle = new LifecycleManager(this.registry);
    this.registerAllEngines();
    this.setupGlobalEventRouting();
  }

  /**
   * Registers all 15 core RR Smart Editor engines into the coherent ecosystem
   */
  private registerAllEngines(): void {
    const defaultEngineCreator = (name: string, version: string, dependencies: string[]): EngineInstance => ({
      name,
      version,
      dependencies,
      status: 'idle',
      health: 'healthy',
      initialize: async () => {
        // Core engine setup mock
      },
      suspend: async () => {},
      resume: async () => {},
      dispose: async () => {},
    });

    // Register each of the 15 requested engines with versioning and dependency links
    this.registry.registerEngine(defaultEngineCreator('Variable Engine', '1.0.0', []));
    this.registry.registerEngine(defaultEngineCreator('Expression Engine', '1.0.0', ['Variable Engine']));
    this.registry.registerEngine(defaultEngineCreator('Motion Engine', '1.0.0', ['Variable Engine']));
    this.registry.registerEngine(defaultEngineCreator('Audio Engine', '1.0.0', []));
    this.registry.registerEngine(defaultEngineCreator('Media Pipeline', '1.0.0', []));
    this.registry.registerEngine(defaultEngineCreator('Project Graph', '1.0.0', ['Media Pipeline']));
    this.registry.registerEngine(defaultEngineCreator('Transaction Engine', '1.0.0', ['Project Graph']));
    this.registry.registerEngine(defaultEngineCreator('Timeline Engine', '1.0.0', ['Transaction Engine']));
    this.registry.registerEngine(defaultEngineCreator('Effects Engine', '1.0.0', ['Timeline Engine']));
    this.registry.registerEngine(defaultEngineCreator('Playback Engine', '1.0.0', ['Timeline Engine', 'Audio Engine', 'Effects Engine', 'Motion Engine', 'Expression Engine']));
    this.registry.registerEngine(defaultEngineCreator('Plugin SDK', '1.0.0', ['Playback Engine']));
    this.registry.registerEngine(defaultEngineCreator('Package Manager', '1.0.0', ['Plugin SDK']));
    this.registry.registerEngine(defaultEngineCreator('Workflow Engine', '1.0.0', ['Package Manager']));
    this.registry.registerEngine(defaultEngineCreator('AI Agent Runtime', '1.0.0', ['Workflow Engine']));
    this.registry.registerEngine(defaultEngineCreator('Render Pipeline', '1.0.0', ['Timeline Engine', 'Playback Engine', 'Workflow Engine']));
  }

  /**
   * Sets up secure decoupled event routing across engines
   */
  private setupGlobalEventRouting(): void {
    // 1. TimelineChanged -> Playback Engine refresh
    this.eventBridge.subscribe('TimelineChanged', (payload) => {
      this.eventBridge.publish('PlaybackSeek', payload);
    });

    // 2. VariablesChanged -> Expression Engine re-evaluate
    this.eventBridge.subscribe('VariablesChanged', (payload) => {
      this.eventBridge.publish('ExpressionsEvaluate', payload);
    });

    // 3. AssetImported -> Media Pipeline -> Project Graph -> Timeline refresh
    this.eventBridge.subscribe('AssetImported', (asset) => {
      this.eventBridge.publish('MediaPipelineProcess', asset);
    });
    this.eventBridge.subscribe('MediaPipelineProcessed', (processedAsset) => {
      this.eventBridge.publish('ProjectGraphInsert', processedAsset);
    });
    this.eventBridge.subscribe('ProjectGraphUpdated', () => {
      this.eventBridge.publish('TimelineRefresh', {});
    });

    // 4. RenderCompleted -> Publishing -> Workflow -> Notifications
    this.eventBridge.subscribe('RenderCompleted', (renderJob) => {
      this.eventBridge.publish('PublishingUpload', renderJob);
    });
    this.eventBridge.subscribe('PublishingUploaded', (publishResult) => {
      this.eventBridge.publish('WorkflowTrigger', { trigger: 'publish_success', data: publishResult });
    });
    this.eventBridge.subscribe('WorkflowTriggered', (workflowResult) => {
      this.eventBridge.publish('NotificationSend', { type: 'slack', message: 'Publish Success notification' });
    });
  }

  /**
   * Collects dynamic telemetry and health diagnostics
   */
  public getDiagnostics(): EngineInfo[] {
    return this.registry.listEngines().map(e => ({
      name: e.name,
      version: e.version,
      status: e.status,
      health: e.health,
      dependencies: e.dependencies,
      error: e.error,
    }));
  }
}
export const integrationService = new IntegrationService();
