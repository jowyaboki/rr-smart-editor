import { IdentityService, globalIdentityService } from './services/IdentityService';
import { PolicyService, globalPolicyService } from './services/PolicyService';
import { SessionService, globalSessionService } from './services/SessionService';
import { SecretService, globalSecretService } from './services/SecretService';
import { EncryptionService, globalEncryptionService } from './services/EncryptionService';
import { ComplianceService, globalComplianceService } from './services/ComplianceService';
import { SecurityMonitoringService, globalSecurityMonitoringService } from './services/SecurityMonitoringService';

export * from './types';
export * from './plugins';
export { IdentityService, globalIdentityService };
export { PolicyService, globalPolicyService };
export { SessionService, globalSessionService };
export { SecretService, globalSecretService };
export { EncryptionService, globalEncryptionService };
export { ComplianceService, globalComplianceService };
export { SecurityMonitoringService, globalSecurityMonitoringService };

export class SecurityPlatformEngine {
  public identityService: IdentityService;
  public policyService: PolicyService;
  public sessionService: SessionService;
  public secretService: SecretService;
  public encryptionService: EncryptionService;
  public complianceService: ComplianceService;
  public monitoringService: SecurityMonitoringService;

  constructor() {
    this.identityService = globalIdentityService;
    this.policyService = globalPolicyService;
    this.sessionService = globalSessionService;
    this.secretService = globalSecretService;
    this.encryptionService = globalEncryptionService;
    this.complianceService = globalComplianceService;
    this.monitoringService = globalSecurityMonitoringService;
  }
}

export const globalSecurityPlatformEngine = new SecurityPlatformEngine();
export default globalSecurityPlatformEngine;
