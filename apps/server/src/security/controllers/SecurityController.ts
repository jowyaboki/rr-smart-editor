import { Request, Response } from 'express';
import {
  globalSecurityPlatformEngine,
  Identity,
  Session,
  AccessPolicy,
  SecretReference,
  AuditEvent,
} from '@ai-video-editor/security-platform';

export class SecurityController {
  public async authenticate(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      if (!username) {
        res.status(400).json({ success: false, error: 'username is required.' });
        return;
      }

      const authRes = await globalSecurityPlatformEngine.identityService.authenticate(username, { password });
      if (!authRes.success) {
        res.status(401).json({ success: false, error: authRes.error });
        return;
      }

      res.json({ success: true, identity: authRes.identity });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createSession(req: Request, res: Response): Promise<void> {
    try {
      const { identityId, userAgent, ipAddress, timeoutMinutes } = req.body;
      if (!identityId) {
        res.status(400).json({ success: false, error: 'identityId is required.' });
        return;
      }

      const sess = globalSecurityPlatformEngine.sessionService.createSession(
        identityId,
        userAgent || 'Express SDK Server',
        ipAddress || '127.0.0.1',
        timeoutMinutes || 60
      );

      res.status(201).json({ success: true, session: sess });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async revokeSession(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      globalSecurityPlatformEngine.sessionService.revokeSession(id);
      res.json({ success: true, message: `Session '${id}' successfully revoked.` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async listSessions(req: Request, res: Response): Promise<void> {
    try {
      const { identityId } = req.query;
      const list = globalSecurityPlatformEngine.sessionService.listSessions(identityId as string);
      res.json({ success: true, sessions: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async createPolicy(req: Request, res: Response): Promise<void> {
    try {
      const policy: AccessPolicy = req.body;
      if (!policy.id || !policy.name || !policy.rules) {
        res.status(400).json({ success: false, error: 'id, name, and rules are required.' });
        return;
      }

      globalSecurityPlatformEngine.policyService.registerPolicy(policy);
      res.status(201).json({ success: true, policy });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async listPolicies(req: Request, res: Response): Promise<void> {
    try {
      const list = globalSecurityPlatformEngine.policyService.listPolicies();
      res.json({ success: true, policies: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async evaluateAccess(req: Request, res: Response): Promise<void> {
    try {
      const { identityId, resource, action, context } = req.body;
      if (!identityId || !resource || !action) {
        res.status(400).json({ success: false, error: 'identityId, resource, and action are required.' });
        return;
      }

      const id = globalSecurityPlatformEngine.identityService.getIdentity(identityId);
      if (!id) {
        res.status(404).json({ success: false, error: `Identity '${identityId}' not found.` });
        return;
      }

      const evalRes = await globalSecurityPlatformEngine.policyService.evaluateAccess(id, resource, action, context);
      res.json({ success: true, isAllowed: evalRes.allow, reason: evalRes.reason });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async listSecrets(req: Request, res: Response): Promise<void> {
    try {
      const list = globalSecurityPlatformEngine.secretService.listSecrets();
      res.json({ success: true, secrets: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async rotateSecret(req: Request, res: Response): Promise<void> {
    try {
      const { secretId, newValue } = req.body;
      if (!secretId || !newValue) {
        res.status(400).json({ success: false, error: 'secretId and newValue are required.' });
        return;
      }

      const ref = await globalSecurityPlatformEngine.secretService.rotateSecret(secretId, newValue);
      res.json({ success: true, secret: ref });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async validateCompliance(req: Request, res: Response): Promise<void> {
    try {
      const { framework, auditLogs } = req.body; // 'GDPR' | 'SOC2' | 'ISO27001' | 'HIPAA'
      if (!framework || !auditLogs) {
        res.status(400).json({ success: false, error: 'framework and auditLogs are required.' });
        return;
      }

      const profile = await globalSecurityPlatformEngine.complianceService.validateCompliance(framework, auditLogs);
      res.json({ success: true, complianceProfile: profile });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async listAlerts(req: Request, res: Response): Promise<void> {
    try {
      const list = globalSecurityPlatformEngine.monitoringService.listAlerts();
      res.json({ success: true, alerts: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      globalSecurityPlatformEngine.monitoringService.resolveAlert(id);
      res.json({ success: true, message: `SecurityAlert '${id}' resolved.` });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const securityController = new SecurityController();
export default securityController;
