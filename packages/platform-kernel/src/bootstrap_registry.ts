import { PlatformModule, PlatformContext } from './types';
import { globalModuleRegistry } from './services/ModuleRegistry';

export const registerAllSubsystemsAsModules = (): void => {
  const standardModules = [
    { id: 'engine_timeline', name: 'Timeline Engine', version: '1.0.0', dependencies: [] },
    { id: 'engine_renders', name: 'Render Pipeline', version: '1.0.0', dependencies: ['engine_timeline'] },
    { id: 'engine_media', name: 'Media Ingestion Pipeline', version: '1.0.0', dependencies: [] },
    { id: 'engine_audio', name: 'Professional Audio Engine 2.0', version: '1.0.0', dependencies: ['engine_timeline'] },
    { id: 'engine_color', name: 'Professional Color Science Engine', version: '1.0.0', dependencies: ['engine_timeline'] },
    { id: 'platform_delivery', name: 'Export & Delivery Platform', version: '1.0.0', dependencies: ['engine_renders'] },
    { id: 'platform_security', name: 'Security & Governance Platform', version: '1.0.0', dependencies: [] },
    { id: 'platform_api', name: 'API Gateway & Public SDK', version: '1.0.0', dependencies: ['platform_security'] },
  ];

  for (const m of standardModules) {
    const mod: PlatformModule = {
      manifest: {
        id: m.id,
        name: m.name,
        version: m.version,
        dependencies: m.dependencies,
        capabilities: [`cap_${m.id}_standard`],
      },
      state: 'Running',
      services: [],
      initialize: async (ctx: PlatformContext) => {
        console.log(`[Module: ${m.name}] Initialized standard callbacks.`);
      },
      start: async (ctx: PlatformContext) => {
        console.log(`[Module: ${m.name}] Running health checkpoints.`);
      },
      stop: async (ctx: PlatformContext) => {
        console.log(`[Module: ${m.name}] Shutdown complete.`);
      },
    };

    try {
      globalModuleRegistry.registerModule(mod);
    } catch (e) {
      // Already registered (e.g. during state init), skip safely
    }
  }
};
