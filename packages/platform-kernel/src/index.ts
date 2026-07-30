import { ModuleRegistry, globalModuleRegistry } from './services/ModuleRegistry';
import { ServiceRegistry, globalServiceRegistry } from './services/ServiceRegistry';
import { LifecycleManager, globalLifecycleManager } from './services/LifecycleManager';
import { BootstrapManager, globalBootstrapManager } from './services/BootstrapManager';
import { DependencyResolver, globalDependencyResolver } from './services/DependencyResolver';
import { CapabilityRegistry, globalCapabilityRegistry } from './services/CapabilityRegistry';
import { ConfigurationManager, globalConfigurationManager } from './services/ConfigurationManager';
import { HealthManager, globalHealthManager } from './services/HealthManager';
import { DiagnosticsManager, globalDiagnosticsManager } from './services/DiagnosticsManager';

export * from './types';
export { ModuleRegistry, globalModuleRegistry };
export { ServiceRegistry, globalServiceRegistry };
export { LifecycleManager, globalLifecycleManager };
export { BootstrapManager, globalBootstrapManager };
export { DependencyResolver, globalDependencyResolver };
export { CapabilityRegistry, globalCapabilityRegistry };
export { ConfigurationManager, globalConfigurationManager };
export { HealthManager, globalHealthManager };
export { DiagnosticsManager, globalDiagnosticsManager };

export class PlatformKernel {
  public moduleRegistry: ModuleRegistry;
  public serviceRegistry: ServiceRegistry;
  public lifecycleManager: LifecycleManager;
  public bootstrapManager: BootstrapManager;
  public dependencyResolver: DependencyResolver;
  public capabilityRegistry: CapabilityRegistry;
  public configurationManager: ConfigurationManager;
  public healthManager: HealthManager;
  public diagnosticsManager: DiagnosticsManager;

  constructor() {
    this.moduleRegistry = globalModuleRegistry;
    this.serviceRegistry = globalServiceRegistry;
    this.lifecycleManager = globalLifecycleManager;
    this.bootstrapManager = globalBootstrapManager;
    this.dependencyResolver = globalDependencyResolver;
    this.capabilityRegistry = globalCapabilityRegistry;
    this.configurationManager = globalConfigurationManager;
    this.healthManager = globalHealthManager;
    this.diagnosticsManager = globalDiagnosticsManager;
  }
}

export const globalPlatformKernel = new PlatformKernel();
export default globalPlatformKernel;
