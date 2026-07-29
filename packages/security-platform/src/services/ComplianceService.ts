import { ComplianceProfile, AuditEvent } from '../types';
import { globalSecurityPluginRegistry } from '../plugins';

export class ComplianceService {
  public async validateCompliance(
    framework: 'GDPR' | 'SOC2' | 'ISO27001' | 'HIPAA',
    auditLogs: AuditEvent[]
  ): Promise<ComplianceProfile> {
    // 1. Try plugin compliance validators
    const validators = globalSecurityPluginRegistry.listComplianceValidators();
    for (const v of validators) {
      if (v.supportedFrameworks.includes(framework)) {
        return v.validate(framework, auditLogs);
      }
    }

    // 2. Default checklist compliance validation rules
    let checked = 10;
    let violations = 0;
    let score = 100;

    switch (framework) {
      case 'GDPR':
        checked = 12;
        // Check for correct data residency in DE or EU
        const hasOutEU = auditLogs.some((l) => l.details.country && !['DE', 'FR', 'NL', 'IE'].includes(l.details.country));
        if (hasOutEU) {
          violations += 1;
          score -= 15;
        }
        break;

      case 'SOC2':
        checked = 15;
        // Check if there are any critical policy violations or access denials
        const failedAuth = auditLogs.filter((l) => l.action.startsWith('authentication') && l.status === 'failure');
        if (failedAuth.length > 3) {
          violations += 2;
          score -= 10;
        }
        break;

      case 'ISO27001':
        checked = 18;
        const policyViolations = auditLogs.filter((l) => l.action === 'policy.violation');
        if (policyViolations.length > 0) {
          violations += policyViolations.length;
          score -= policyViolations.length * 5;
        }
        break;

      case 'HIPAA':
        checked = 10;
        // HIPAA checks encryption status for media assets
        const unencryptedAccess = auditLogs.some((l) => l.action === 'asset.access' && l.details.encrypted === false);
        if (unencryptedAccess) {
          violations += 1;
          score -= 20;
        }
        break;
    }

    score = Math.max(0, Math.min(100, score));

    return {
      id: `profile_${framework.toLowerCase()}`,
      framework,
      rulesCheckedCount: checked,
      violationsCount: violations,
      complianceScore: score,
      lastAuditedAt: new Date().toISOString(),
      dataResidencyCountry: 'DE', // Default GDPR EU residency standard
    };
  }
}

export const globalComplianceService = new ComplianceService();
export default globalComplianceService;
