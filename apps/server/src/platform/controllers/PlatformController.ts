import { Request, Response } from 'express';
import {
  globalPlatformKernel,
  PlatformContext,
} from '@ai-video-editor/platform-kernel';

export class PlatformController {
  public async getModules(req: Request, res: Response): Promise<void> {
    try {
      const list = globalPlatformKernel.moduleRegistry.listModules().map((m) => ({
        id: m.manifest.id,
        name: m.manifest.name,
        version: m.manifest.version,
        dependencies: m.manifest.dependencies,
        capabilities: m.manifest.capabilities,
        state: m.state,
      }));
      res.json({ success: true, modules: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getServices(req: Request, res: Response): Promise<void> {
    try {
      const list = globalPlatformKernel.serviceRegistry.listServices().map((s) => ({
        id: s.descriptor.id,
        interfaceName: s.descriptor.interfaceName,
        implementationClass: s.descriptor.implementationClass,
        isSingleton: s.descriptor.isSingleton,
        scope: s.descriptor.scope,
      }));
      res.json({ success: true, services: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getHealth(req: Request, res: Response): Promise<void> {
    try {
      const status = globalPlatformKernel.healthManager.getHealthStatus();
      res.json({ success: true, health: status });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async getDiagnostics(req: Request, res: Response): Promise<void> {
    try {
      const timeline = globalPlatformKernel.diagnosticsManager.getDiagnosticsTimeline();
      const graph = globalPlatformKernel.diagnosticsManager.getModuleDependencyGraph();

      res.json({
        success: true,
        timeline,
        graph,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async triggerRestart(req: Request, res: Response): Promise<void> {
    try {
      const ctx: PlatformContext = {
        kernelId: 'kernel_rest_call',
        env: 'production',
        startTime: new Date().toISOString(),
        configuration: { global: {}, workspace: {}, moduleOverrides: {} },
      };

      globalPlatformKernel.healthManager.clearTelemetry();
      await globalPlatformKernel.bootstrapManager.shutdown(ctx);
      await globalPlatformKernel.bootstrapManager.bootstrap(ctx);

      res.json({ success: true, message: 'Platform Kernel hot restart executed successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const platformController = new PlatformController();
export default platformController;
