import React, { useEffect, useState } from 'react';
import { useSecurity } from '../hooks/useSecurity';
import {
  AccessPolicy,
  Session,
  SecretReference,
  SecurityAlert,
  ComplianceProfile,
  AuditEvent,
} from '@ai-video-editor/security-platform';

// ==========================================
// REUSABLE PRESENTATION WIDGETS
// ==========================================

export const PolicyCard: React.FC<{
  policy: AccessPolicy;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ policy, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      style={{
        background: isSelected ? '#2a2d32' : '#252526',
        border: isSelected ? '1px solid #2196f3' : '1px solid #333',
        borderRadius: '6px',
        padding: '10px',
        cursor: 'pointer',
        color: '#fff',
        transition: 'all 0.2s',
        marginBottom: '6px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '12px' }}>{policy.name}</strong>
        <span
          style={{
            fontSize: '9px',
            background: 'rgba(33, 150, 243, 0.2)',
            color: '#2196f3',
            padding: '1px 4px',
            borderRadius: '3px',
          }}
        >
          Active
        </span>
      </div>
      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#aaa' }}>{policy.description}</p>
    </div>
  );
};

export const AlertCard: React.FC<{
  alert: SecurityAlert;
  onResolve: () => void;
}> = ({ alert, onResolve }) => {
  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical':
        return '#f44336';
      case 'high':
        return '#ff9800';
      case 'warning':
        return '#ffeb3b';
      default:
        return '#2196f3';
    }
  };

  return (
    <div
      style={{
        background: '#2d1c1c',
        borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
        borderRadius: '4px',
        padding: '12px',
        color: '#fff',
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>⚠️ {alert.title}</span>
          <span
            style={{
              fontSize: '9px',
              textTransform: 'uppercase',
              background: 'rgba(255,255,255,0.1)',
              padding: '2px 6px',
              borderRadius: '3px',
            }}
          >
            {alert.severity}
          </span>
        </div>
        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#ccc' }}>{alert.description}</p>
      </div>
      <button
        onClick={onResolve}
        style={{
          background: '#4caf50',
          border: 'none',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        Resolve
      </button>
    </div>
  );
};

// ==========================================
// MAIN SECURITY DASHBOARD COMPONENT
// ==========================================

export const SecurityDashboard: React.FC = () => {
  const {
    identities,
    sessions,
    filteredPolicies,
    secrets,
    alerts,
    complianceProfiles,
    auditLogs,
    selectedIdentityId,
    selectedPolicyId,
    selectedAlertId,
    selectedSecretId,
    activePanel,
    searchQuery,
    isLoading,
    initStore,
    selectIdentity,
    selectPolicy,
    selectAlert,
    selectSecret,
    setActivePanel,
    setSearchQuery,
    authenticateIdentity,
    terminateSession,
    createAccessPolicy,
    rotateSecretKey,
    runComplianceAudit,
    resolveSecurityAlert,
    addAuditLog,
  } = useSecurity();

  // Local dialog inputs
  const [authUsername, setAuthUsername] = useState('Clara');
  const [authPassword, setAuthPassword] = useState('failing_password');
  const [newSecretVal, setNewSecretVal] = useState('sk_prod_updatedSecretValue_999');

  useEffect(() => {
    initStore();
  }, [initStore]);

  // Seed default secret reference if empty
  useEffect(() => {
    if (secrets.length === 0) {
      globalSecurityPlatformEngine.secretService.registerSecretReference(
        {
          id: 'sec_aws_key',
          name: 'AWS_ACCESS_KEY_ID',
          vaultPath: 'secrets/cloud/aws',
          provider: 'vault',
          version: 'v1',
          createdAt: new Date().toISOString(),
        },
        'AKIAIOSFODNN7EXAMPLE',
      );
    }
  }, [secrets]);

  const activePolicy = filteredPolicies.find((p) => p.id === selectedPolicyId);
  const activeSecret = secrets.find((s) => s.id === selectedSecretId);

  // Trigger simulated failed authentication login (which eventually prompts anomalies alarm!)
  const handleSimulatedAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await authenticateIdentity(authUsername, { password: authPassword });
    if (!success) {
      addAuditLog('authentication.failure', 'anonymous', 'failure', { username: authUsername });
    }
  };

  const handleRotateKey = async () => {
    if (!selectedSecretId) return;
    await rotateSecretKey(selectedSecretId, newSecretVal);
  };

  const handleRunAudit = async (framework: 'GDPR' | 'SOC2' | 'ISO27001' | 'HIPAA') => {
    await runComplianceAudit(framework);
  };

  const handleResolveAlert = async (id: string) => {
    await resolveSecurityAlert(id);
  };

  // Derive risk status levels
  const criticalAlertsCount = alerts.filter(
    (a) => a.status === 'active' && a.severity === 'critical',
  ).length;
  const overallSecurityScore = 100 - criticalAlertsCount * 25;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        height: '100vh',
        background: '#121212',
        color: '#e0e0e0',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* HEADER SECTION */}
      <div
        style={{
          background: '#1c1c1c',
          padding: '12px 20px',
          borderBottom: '1px solid #2d2d2d',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🛡️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
              ENTERPRISE SECURITY, GOVERNANCE & COMPLIANCE PLATFORM
            </h1>
            <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>
              Identity directory, attribute-based policy engine, credentials vaults and SOC2
              monitoring
            </p>
          </div>
        </div>

        {/* SECURITY RISK TELEMETRY */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div
            style={{
              background: '#252526',
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #333',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                color: '#888',
                display: 'block',
                textTransform: 'uppercase',
              }}
            >
              Active Threats
            </span>
            <strong
              style={{ color: criticalAlertsCount > 0 ? '#f44336' : '#4caf50', fontSize: '14px' }}
            >
              {criticalAlertsCount} Critical Alerts
            </strong>
          </div>
          <div
            style={{
              background: '#252526',
              padding: '6px 12px',
              borderRadius: '4px',
              border: '1px solid #333',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                color: '#888',
                display: 'block',
                textTransform: 'uppercase',
              }}
            >
              Security Score
            </span>
            <strong style={{ color: '#4caf50', fontSize: '14px' }}>
              {overallSecurityScore}% Secure
            </strong>
          </div>
        </div>
      </div>

      {/* THREE PANEL GRID LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 340px', overflow: 'hidden' }}>
        {/* LEFT PANEL: SIDEBAR */}
        <div
          style={{
            background: '#181818',
            borderRight: '1px solid #2d2d2d',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflowY: 'auto',
          }}
        >
          {/* POLICIES SUBSECTION */}
          <div>
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '12px',
                color: '#aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              🎛️ PBAC / ABAC Policies
            </h3>
            {filteredPolicies.map((p) => (
              <PolicyCard
                key={p.id}
                policy={p}
                isSelected={selectedPolicyId === p.id}
                onSelect={() => selectPolicy(p.id)}
              />
            ))}
          </div>

          {/* ACTIVE SESSIONS */}
          <div style={{ borderTop: '1px solid #2d2d2d', paddingTop: '16px' }}>
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '12px',
                color: '#aaa',
                textTransform: 'uppercase',
              }}
            >
              👤 Active Sessions ({sessions.filter((s) => s.status === 'active').length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {sessions
                .filter((s) => s.status === 'active')
                .map((sess) => (
                  <div
                    key={sess.id}
                    style={{
                      background: '#252526',
                      padding: '8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong>{sess.identityId}</strong>
                      <div style={{ color: '#888', fontSize: '9px' }}>
                        IP: {sess.deviceInfo.ipAddress}
                      </div>
                    </div>
                    <button
                      onClick={() => terminateSession(sess.id)}
                      style={{
                        background: '#f44336',
                        border: 'none',
                        color: '#fff',
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                      }}
                    >
                      Revoke
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* CREDENTIALS SECRETS REFERENCES */}
          <div style={{ borderTop: '1px solid #2d2d2d', paddingTop: '16px' }}>
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '12px',
                color: '#aaa',
                textTransform: 'uppercase',
              }}
            >
              🔑 Credentials Keyring Vault
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {secrets.map((sec) => (
                <div
                  key={sec.id}
                  onClick={() => selectSecret(sec.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    background: selectedSecretId === sec.id ? '#252526' : 'transparent',
                    color: selectedSecretId === sec.id ? '#fff' : '#aaa',
                  }}
                >
                  🔐 {sec.name} ({sec.version})
                </div>
              ))}
            </div>
          </div>

          {/* SIMULATE BAD LOGIN TO PROMPT THREAT PANEL */}
          <div style={{ borderTop: '1px solid #2d2d2d', paddingTop: '16px', marginTop: 'auto' }}>
            <h3
              style={{
                margin: '0 0 8px 0',
                fontSize: '11px',
                color: '#888',
                textTransform: 'uppercase',
              }}
            >
              Simulate Auth Attempter
            </h3>
            <form
              onSubmit={handleSimulatedAuth}
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <input
                type="text"
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                style={{
                  background: '#222',
                  border: '1px solid #444',
                  color: '#fff',
                  padding: '4px',
                  fontSize: '11px',
                  borderRadius: '3px',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#333',
                  border: '1px solid #444',
                  color: '#fff',
                  padding: '6px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  borderRadius: '3px',
                }}
              >
                Failed Login Attack Trigger
              </button>
            </form>
          </div>
        </div>

        {/* CENTER PANEL: MONITORING ALERTS & COMPLIANCE FRAMEWORKS */}
        <div
          style={{
            background: '#121212',
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          {/* SEARCH POLICIES */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              background: '#1a1a1a',
              padding: '10px 16px',
              borderRadius: '6px',
              border: '1px solid #2d2d2d',
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active policies, description..."
              style={{
                flex: 1,
                background: '#252526',
                border: '1px solid #3d3d3d',
                borderRadius: '4px',
                padding: '6px 12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />

            <select
              value={activePanel}
              onChange={(e) => setActivePanel(e.target.value as any)}
              style={{
                background: '#252526',
                border: '1px solid #3d3d3d',
                borderRadius: '4px',
                padding: '6px 12px',
                color: '#fff',
                fontSize: '12px',
              }}
            >
              <option value="policies">Policies Engine</option>
              <option value="sessions">Session Management</option>
              <option value="secrets">Secrets Vault</option>
              <option value="compliance">Compliance Profiles</option>
              <option value="monitoring">Alerts & Threat Detection</option>
            </select>
          </div>

          {/* ACTIVE ALERTS THREAT MONITOR */}
          {alerts.filter((a) => a.status === 'active').length > 0 && (
            <div>
              <h2
                style={{
                  margin: '0 0 10px 0',
                  fontSize: '13px',
                  color: '#ff5252',
                  textTransform: 'uppercase',
                }}
              >
                🚨 ACTIVE INTRUSIONS / SECURITY ALERTS (
                {alerts.filter((a) => a.status === 'active').length})
              </h2>
              {alerts
                .filter((a) => a.status === 'active')
                .map((a) => (
                  <AlertCard key={a.id} alert={a} onResolve={() => handleResolveAlert(a.id)} />
                ))}
            </div>
          )}

          {/* ACTIVE PANEL CONDITIONAL RENDERS */}
          {activePanel === 'policies' && (
            <div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#fff' }}>
                Access Control Engine
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {filteredPolicies.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: '#1c1c1c',
                      border: '1px solid #333',
                      padding: '16px',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', color: '#fff' }}>{p.name}</div>
                    <p style={{ fontSize: '12px', color: '#aaa', margin: '8px 0 12px 0' }}>
                      {p.description}
                    </p>
                    <div style={{ fontSize: '11px', color: '#2196f3' }}>
                      Rules Count: {p.rules.length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePanel === 'sessions' && (
            <div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#fff' }}>
                Trust Device & Sessions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      background: '#1c1c1c',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #333',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong>Identity: {s.identityId}</strong>
                      <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                        Device: {s.deviceInfo.userAgent} | Trusted:{' '}
                        {s.deviceInfo.isTrusted ? 'YES' : 'NO'}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: s.status === 'active' ? '#4caf50' : '#888',
                      }}
                    >
                      {s.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePanel === 'secrets' && (
            <div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#fff' }}>
                Application Secrets Rotation
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {secrets.map((sec) => (
                  <div
                    key={sec.id}
                    style={{
                      background: '#1c1c1c',
                      border: '1px solid #333',
                      padding: '12px',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', color: '#fff' }}>{sec.name}</div>
                    <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                      Path: {sec.vaultPath}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888' }}>
                      Rotated:{' '}
                      {sec.rotatedAt ? new Date(sec.rotatedAt).toLocaleDateString() : 'Never'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePanel === 'compliance' && (
            <div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#fff' }}>
                SOC2 / GDPR Governance Checklists
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {(['GDPR', 'SOC2', 'ISO27001', 'HIPAA'] as const).map((framework) => {
                  const profile = complianceProfiles.find((p) => p.framework === framework);
                  return (
                    <div
                      key={framework}
                      style={{
                        background: '#1c1c1c',
                        border: '1px solid #333',
                        padding: '16px',
                        borderRadius: '8px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontWeight: 'bold',
                          color: '#fff',
                        }}
                      >
                        <span>{framework} Standard</span>
                        {profile && (
                          <span style={{ color: '#4caf50' }}>
                            {profile.complianceScore}% Passed
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '11px', color: '#888', margin: '8px 0 12px 0' }}>
                        {profile
                          ? `Checked ${profile.rulesCheckedCount} criteria rules, found ${profile.violationsCount} violations.`
                          : 'Checklist not verified yet.'}
                      </p>
                      <button
                        onClick={() => handleRunAudit(framework)}
                        style={{
                          background: '#2196f3',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        Run Checklist Audit
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: INSPECTOR */}
        <div
          style={{
            background: '#181818',
            borderLeft: '1px solid #2d2d2d',
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <h3
            style={{
              margin: '0 0 4px 0',
              fontSize: '12px',
              color: '#aaa',
              textTransform: 'uppercase',
            }}
          >
            Governance Inspector
          </h3>

          {activePolicy && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  background: '#252526',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                }}
              >
                <div style={{ fontSize: '10px', color: '#aaa' }}>Policy ID</div>
                <code>{activePolicy.id}</code>
                <h4 style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#fff' }}>
                  {activePolicy.name}
                </h4>
              </div>

              {/* RULES ABAC EXPLAINER */}
              <div
                style={{
                  background: '#252526',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '11px',
                    color: '#2196f3',
                    textTransform: 'uppercase',
                  }}
                >
                  🔑 ABAC Policy Rules ({activePolicy.rules.length})
                </h4>
                {activePolicy.rules.map((rule) => (
                  <div
                    key={rule.id}
                    style={{
                      fontSize: '11px',
                      borderBottom: '1px solid #333',
                      paddingBottom: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <div>
                      Effect:{' '}
                      <strong style={{ color: rule.effect === 'allow' ? '#4caf50' : '#f44336' }}>
                        {rule.effect.toUpperCase()}
                      </strong>
                    </div>
                    <div>
                      Resources: <code style={{ color: '#fff' }}>{rule.resources.join(', ')}</code>
                    </div>
                    <div>
                      Actions: <code style={{ color: '#fff' }}>{rule.actions.join(', ')}</code>
                    </div>
                    {rule.conditions && (
                      <div style={{ color: '#ffb74d', marginTop: '4px' }}>
                        Conditions: If {rule.conditions[0].attribute} {rule.conditions[0].operator}{' '}
                        {rule.conditions[0].value}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSecret && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  background: '#252526',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                }}
              >
                <div style={{ fontSize: '10px', color: '#aaa' }}>Vault Secret Key</div>
                <strong style={{ color: '#fff' }}>{activeSecret.name}</strong>
                <div style={{ color: '#888', fontSize: '11px', marginTop: '4px' }}>
                  Version: {activeSecret.version}
                </div>
              </div>

              {/* SECURE ROTATION PANEL */}
              <div
                style={{
                  background: '#252526',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                }}
              >
                <h4
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '11px',
                    color: '#ff9800',
                    textTransform: 'uppercase',
                  }}
                >
                  🔄 Rotate Secret Key
                </h4>
                <input
                  type="text"
                  value={newSecretVal}
                  onChange={(e) => setNewSecretVal(e.target.value)}
                  placeholder="New Secret string..."
                  style={{
                    width: '100%',
                    background: '#1e1e1e',
                    border: '1px solid #333',
                    borderRadius: '4px',
                    padding: '6px',
                    color: '#fff',
                    fontSize: '11px',
                    marginBottom: '8px',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={handleRotateKey}
                  style={{
                    width: '100%',
                    background: '#ff9800',
                    border: 'none',
                    color: '#fff',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Commit Key Rotation
                </button>
              </div>
            </div>
          )}

          {!activePolicy && !activeSecret && (
            <div
              style={{
                padding: '40px 10px',
                textAlign: 'center',
                color: '#666',
                border: '1px dashed #333',
                borderRadius: '6px',
              }}
            >
              Select an access policy or a credentials secret to audit ABAC parameters or rotate
              keystores.
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM CONSOLE PANEL: TELEMETRY ALERTS AUDIT LOGS */}
      <div
        style={{
          background: '#141414',
          borderTop: '1px solid #2d2d2d',
          padding: '12px 20px',
          height: '160px',
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '20px',
        }}
      >
        {/* EVENT REALTIME LOGS */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h4
            style={{
              margin: '0 0 6px 0',
              fontSize: '11px',
              color: '#aaa',
              textTransform: 'uppercase',
            }}
          >
            🛰️ Real-time Security Event Auditing
          </h4>
          <div
            style={{
              flex: 1,
              background: '#090909',
              border: '1px solid #222',
              borderRadius: '4px',
              padding: '8px 12px',
              fontFamily: 'Monospace',
              fontSize: '11px',
              color: '#39ff14',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {auditLogs.map((log) => (
              <div key={log.id}>
                [{log.timestamp}] {log.action.toUpperCase()} by {log.actorId} -{' '}
                <strong style={{ color: log.status === 'success' ? '#4caf50' : '#f44336' }}>
                  {log.status.toUpperCase()}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* FAILED AUTH ATTACK GRAPH */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h4
            style={{
              margin: '0 0 6px 0',
              fontSize: '11px',
              color: '#aaa',
              textTransform: 'uppercase',
            }}
          >
            Active Threat Detection Gauges
          </h4>
          <div
            style={{
              background: '#1e1e1e',
              border: '1px solid #2d2d2d',
              borderRadius: '6px',
              padding: '10px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: criticalAlertsCount > 0 ? '#ff5252' : '#4caf50',
              }}
            >
              {criticalAlertsCount > 0 ? 'Threat Detected' : 'Threat Level Low'}
            </div>
            <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>
              Monitoring 192.168.1.100 live auth telemetry
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;
