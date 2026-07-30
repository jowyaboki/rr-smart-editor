import { ModuleRegistry, globalModuleRegistry } from './services/ModuleRegistry';
import { ServiceRegistry, globalServiceRegistry } from './services/ServiceRegistry';
import { LifecycleManager, globalLifecycleManager } from './services/LifecycleManager';
import { BootstrapManager, globalBootstrapManager } from './services/BootstrapManager';
import { DependencyResolver, globalDependencyResolver } from './services/DependencyResolver';
import { CapabilityRegistry, globalCapabilityRegistry } from './services/CapabilityRegistry';
import { ConfigurationManager, globalConfigurationManager } from './services/ConfigurationManager';
import { HealthManager, globalHealthManager } from './services/HealthManager';
import { DiagnosticsManager, globalDiagnosticsManager } from './services/DiagnosticsManager';
import { registerAllSubsystemsAsModules } from './bootstrap_registry';
import { PlatformEventSystem, globalPlatformEventSystem, PlatformEvent, PlatformEventType } from './services/EventSystem';

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
export { registerAllSubsystemsAsModules };
export { PlatformEventSystem, globalPlatformEventSystem, PlatformEvent, PlatformEventType };

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
  public eventSystem: PlatformEventSystem;

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
    this.eventSystem = globalPlatformEventSystem;
  }
}

export const globalPlatformKernel = new PlatformKernel();
export default globalPlatformKernel;
