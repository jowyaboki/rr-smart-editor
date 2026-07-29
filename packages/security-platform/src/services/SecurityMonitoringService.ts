import { SecurityAlert, RiskAssessment, AuditEvent } from '../types';

export class SecurityMonitoringService {
  private alerts: SecurityAlert[] = [];
  private assessments: Map<string, RiskAssessment> = new Map();

  public analyzeAuditLogsForAnomalies(logs: AuditEvent[]): SecurityAlert[] {
    const freshAlerts: SecurityAlert[] = [];

    // 1. Detect brute-force (excessive failed auths from same IP)
    const failedAuths = logs.filter((l) => l.action.startsWith('authentication') && l.status === 'failure');
    const ips = failedAuths.map((l) => l.ipAddress);
    const uniqueIps = Array.from(new Set(ips));

    for (const ip of uniqueIps) {
      const count = ips.filter((x) => x === ip).length;
      if (count > 3) {
        const alert: SecurityAlert = {
          id: `alert_brute_${ip.replace(/\./g, '_')}`,
          title: 'Potential Brute-force Anomaly Detected',
          description: `IP address '${ip}' has triggered ${count} failed authentication attempts in a short timeframe.`,
          severity: 'error',
          source: 'auth_failure',
          status: 'active',
          timestamp: new Date().toISOString(),
        };
        this.addAlert(alert);
        freshAlerts.push(alert);
      }
    }

    // 2. Detect permission escalations or access violations
    const denials = logs.filter((l) => l.action === 'policy.violation');
    if (denials.length > 2) {
      const alert: SecurityAlert = {
        id: `alert_escalation_denied`,
        title: 'Excessive Policy Violations Blocked',
        description: `Multiple ABAC and RBAC conditional denials occurred on protected assets resources.`,
        severity: 'critical',
        source: 'escalation',
        status: 'active',
        timestamp: new Date().toISOString(),
      };
      this.addAlert(alert);
      freshAlerts.push(alert);
    }

    return freshAlerts;
  }

  public getOrCreateRiskAssessment(identityId: string, logs: AuditEvent[]): RiskAssessment {
    let assess = this.assessments.get(identityId);
    if (!assess) {
      // Analyze logs to evaluate risk score
      const failCount = logs.filter((l) => l.actorId === identityId && l.status === 'failure').length;
      const violationCount = logs.filter((l) => l.actorId === identityId && l.action === 'policy.violation').length;

      const riskScore = Math.min(100, failCount * 10 + violationCount * 20);
      const severity = riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low';

      assess = {
        id: `assess_${identityId}`,
        identityId,
        riskScore,
        anomaliesDetected: violationCount > 0 ? ['Policy Access Denial Anomaly'] : [],
        lastCheckedAt: new Date().toISOString(),
        severity,
      };

      this.assessments.set(identityId, assess);
    }

    return assess;
  }

  public addAlert(alert: SecurityAlert): void {
    const exists = this.alerts.some((a) => a.id === alert.id);
    if (!exists) {
      this.alerts.push(alert);
    }
  }

  public listAlerts(): SecurityAlert[] {
    return this.alerts;
  }

  public resolveAlert(alertId: string): void {
    const target = this.alerts.find((a) => a.id === alertId);
    if (target) {
      target.status = 'resolved';
    }
  }
}

export const globalSecurityMonitoringService = new SecurityMonitoringService();
export default globalSecurityMonitoringService;
