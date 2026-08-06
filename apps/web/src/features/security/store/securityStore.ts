import { create } from 'zustand';
import {
  globalSecurityPlatformEngine,
  Identity,
  Session,
  AccessPolicy,
  SecretReference,
  SecurityAlert,
  ComplianceProfile,
  AuditEvent,
} from '@ai-video-editor/security-platform';

interface SecurityState {
  identities: Identity[];
  sessions: Session[];
  policies: AccessPolicy[];
  secrets: SecretReference[];
  alerts: SecurityAlert[];
  complianceProfiles: ComplianceProfile[];
  auditLogs: AuditEvent[];

  // Selection & Filters
  selectedIdentityId: string | null;
  selectedPolicyId: string | null;
  selectedAlertId: string | null;
  selectedSecretId: string | null;
  activePanel: 'policies' | 'sessions' | 'secrets' | 'compliance' | 'monitoring';
  searchQuery: string;
  isLoading: boolean;

  // Actions
  initStore: () => void;
  loadIdentities: () => void;
  loadSessions: () => void;
  loadPolicies: () => void;
  loadSecrets: () => void;
  loadAlerts: () => void;
  selectIdentity: (id: string | null) => void;
  selectPolicy: (id: string | null) => void;
  selectAlert: (id: string | null) => void;
  selectSecret: (id: string | null) => void;
  setActivePanel: (panel: 'policies' | 'sessions' | 'secrets' | 'compliance' | 'monitoring') => void;
  setSearchQuery: (query: string) => void;

  // Delegation Actions
  authenticateIdentity: (username: string, credentials: any) => Promise<boolean>;
  terminateSession: (sessionId: string) => Promise<void>;
  createAccessPolicy: (policy: AccessPolicy) => Promise<void>;
  rotateSecretKey: (secretId: string, newValue: string) => Promise<void>;
  runComplianceAudit: (framework: 'GDPR' | 'SOC2' | 'ISO27001' | 'HIPAA') => Promise<void>;
  resolveSecurityAlert: (alertId: string) => Promise<void>;
  addAuditLog: (action: string, identityId: string, status: 'success' | 'failure', details: any) => void;
}

export const useSecurityStore = create<SecurityState>((set, get) => {
  return {
    identities: [],
    sessions: [],
    policies: [],
    secrets: [],
    alerts: [],
    complianceProfiles: [],
    auditLogs: [],

    selectedIdentityId: null,
    selectedPolicyId: null,
    selectedAlertId: null,
    selectedSecretId: null,
    activePanel: 'policies',
    searchQuery: '',
    isLoading: false,

    initStore: () => {
      get().loadIdentities();
      get().loadPolicies();
      get().loadSessions();
      get().loadSecrets();
      get().loadAlerts();

      // Seed default baseline audit logs
      set({
        auditLogs: [
          {
            id: 'evt_01',
            timestamp: new Date(Date.now() - 50000).toISOString(),
            action: 'authentication.success',
            actorId: 'user_jules',
            actorType: 'user',
            status: 'success',
            details: { authProvider: 'password', country: 'US' },
            ipAddress: '192.168.1.100',
          },
          {
            id: 'evt_02',
            timestamp: new Date(Date.now() - 30000).toISOString(),
            action: 'secret.access',
            actorId: 'user_jules',
            actorType: 'user',
            resourceId: 'sec_stripe_key',
            status: 'success',
            details: { reason: 'payment API initialization' },
            ipAddress: '192.168.1.100',
          },
        ],
      });
    },

    loadIdentities: () => {
      const list = globalSecurityPlatformEngine.identityService.listIdentities();
      set({ identities: list });
    },

    loadSessions: () => {
      const list = globalSecurityPlatformEngine.sessionService.listSessions();
      set({ sessions: list });
    },

    loadPolicies: () => {
      const list = globalSecurityPlatformEngine.policyService.listPolicies();
      set({ policies: list });
    },

    loadSecrets: () => {
      const list = globalSecurityPlatformEngine.secretService.listSecrets();
      set({ secrets: list });
    },

    loadAlerts: () => {
      const list = globalSecurityPlatformEngine.monitoringService.listAlerts();
      set({ alerts: list });
    },

    selectIdentity: (id) => set({ selectedIdentityId: id }),
    selectPolicy: (id) => set({ selectedPolicyId: id }),
    selectAlert: (id) => set({ selectedAlertId: id }),
    selectSecret: (id) => set({ selectedSecretId: id }),
    setActivePanel: (panel) => set({ activePanel: panel }),
    setSearchQuery: (query) => set({ searchQuery: query }),

    // Delegation actions (no business logic in Zustand)
    authenticateIdentity: async (username, credentials) => {
      const authRes = await globalSecurityPlatformEngine.identityService.authenticate(username, credentials);
      get().addAuditLog(
        authRes.success ? 'authentication.success' : 'authentication.failure',
        authRes.identity?.id || 'anonymous',
        authRes.success ? 'success' : 'failure',
        { error: authRes.error }
      );
      return authRes.success;
    },

    terminateSession: async (sessionId) => {
      globalSecurityPlatformEngine.sessionService.revokeSession(sessionId);
      get().loadSessions();
      get().addAuditLog('session.revocation', 'system', 'success', { sessionId });
    },

    createAccessPolicy: async (policy) => {
      globalSecurityPlatformEngine.policyService.registerPolicy(policy);
      get().loadPolicies();
      get().addAuditLog('policy.registration', 'system', 'success', { policyId: policy.id });
    },

    rotateSecretKey: async (secretId, newValue) => {
      await globalSecurityPlatformEngine.secretService.rotateSecret(secretId, newValue);
      get().loadSecrets();
      get().addAuditLog('secret.rotation', 'system', 'success', { secretId });
    },

    runComplianceAudit: async (framework) => {
      set({ isLoading: true });
      try {
        const profile = await globalSecurityPlatformEngine.complianceService.validateCompliance(framework, get().auditLogs);
        const list = [...get().complianceProfiles];
        const idx = list.findIndex((p) => p.framework === framework);
        if (idx >= 0) {
          list[idx] = profile;
        } else {
          list.push(profile);
        }
        set({ complianceProfiles: list });
        get().addAuditLog('compliance.audit_run', 'system', 'success', { framework, score: profile.complianceScore });
      } finally {
        set({ isLoading: false });
      }
    },

    resolveSecurityAlert: async (alertId) => {
      globalSecurityPlatformEngine.monitoringService.resolveAlert(alertId);
      get().loadAlerts();
      get().addAuditLog('alert.resolution', 'system', 'success', { alertId });
    },

    addAuditLog: (action, identityId, status, details) => {
      const log: AuditEvent = {
        id: `evt_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        action,
        actorId: identityId,
        actorType: 'user',
        status,
        details: details || {},
        ipAddress: '192.168.1.100',
      };

      const updatedLogs = [log, ...get().auditLogs].slice(0, 100); // keep last 100
      set({ auditLogs: updatedLogs });

      // Run real-time monitoring on new logs to trigger potential security anomalies
      const freshAlerts = globalSecurityPlatformEngine.monitoringService.analyzeAuditLogsForAnomalies(updatedLogs);
      if (freshAlerts.length > 0) {
        get().loadAlerts();
      }
    },
  };
});

export default useSecurityStore;
