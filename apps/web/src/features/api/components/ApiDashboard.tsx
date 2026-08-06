import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { ApiKey, Webhook, WebhookEvent, Integration } from '@ai-video-editor/api-platform';

// ==========================================
// REUSABLE PRESENTATION WIDGETS
// ==========================================

export const ApiKeyCard: React.FC<{
  apiKey: ApiKey;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ apiKey, isSelected, onSelect }) => {
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
        <strong style={{ fontSize: '12px' }}>{apiKey.name}</strong>
        <span
          style={{
            fontSize: '9px',
            background: 'rgba(76, 175, 80, 0.2)',
            color: '#4caf50',
            padding: '1px 4px',
            borderRadius: '3px',
          }}
        >
          Active
        </span>
      </div>
      <div
        style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#aaa', fontFamily: 'monospace' }}
      >
        Prefix: {apiKey.keyPrefix}************
      </div>
    </div>
  );
};

export const WebhookEventRow: React.FC<{
  event: WebhookEvent;
}> = ({ event }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#4caf50';
      case 'failed':
        return '#f44336';
      case 'retrying':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <div
      style={{
        background: '#1a1a1b',
        padding: '8px 12px',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px',
        color: '#fff',
        marginBottom: '4px',
      }}
    >
      <div>
        <strong>{event.event}</strong>
        <span style={{ color: '#888', marginLeft: '8px' }}>Attempt #{event.attemptsCount}</span>
      </div>
      <span
        style={{
          color: getStatusColor(event.deliveryStatus),
          fontWeight: 'bold',
          textTransform: 'uppercase',
        }}
      >
        {event.deliveryStatus}
      </span>
    </div>
  );
};

// ==========================================
// MAIN DEVELOPER API DASHBOARD COMPONENT
// ==========================================

export const ApiDashboard: React.FC = () => {
  const {
    apiKeys,
    webhooks,
    webhookEvents,
    integrations,
    developerLogs,
    playgroundPath,
    playgroundMethod,
    playgroundHeaders,
    playgroundBody,
    playgroundResponse,
    playgroundResponseStatus,
    selectedApiKeyId,
    selectedWebhookId,
    activePanel,
    isLoading,
    initStore,
    selectApiKey,
    selectWebhook,
    setActivePanel,
    setPlayground,
    createApiKey,
    rotateApiKeySecret,
    registerWebhookEndpoint,
    dispatchPlaygroundRequest,
    generateClientSDK,
    addDevLog,
  } = useApi();

  const [newKeyName, setNewKeyName] = useState('Broadway Web Integration Key');
  const [newWebhookUrl, setNewWebhookUrl] = useState('https://hooks.slack.com/services/broadway');
  const [selectedLanguage, setSelectedLanguage] = useState<'typescript' | 'python' | 'go'>(
    'typescript',
  );

  useEffect(() => {
    initStore();
  }, [initStore]);

  const activeKey = apiKeys.find((k) => k.id === selectedApiKeyId);
  const activeWebhook = webhooks.find((w) => w.id === selectedWebhookId);

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    await createApiKey(newKeyName, ['projects:read', 'renders:write']);
    setNewKeyName('');
  };

  const handleRegisterWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl) return;
    await registerWebhookEndpoint(newWebhookUrl, 'secure_hmac_secret_999', ['render.completed']);
    setNewWebhookUrl('');
  };

  const handleRotateSecret = async () => {
    if (!selectedApiKeyId) return;
    await rotateApiKeySecret(selectedApiKeyId);
  };

  const handleDispatchPlayground = async () => {
    await dispatchPlaygroundRequest();
  };

  const generatedSDKContent = generateClientSDK(selectedLanguage);

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
          <span style={{ fontSize: '24px' }}>🔌</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
              ENTERPRISE API GATEWAY, PUBLIC SDK AND INTEGRATIONS
            </h1>
            <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>
              Stable external endpoints gateway, dynamic webhooks deliveries, and multilang client
              SDK generators
            </p>
          </div>
        </div>

        {/* TOP STATUS WIDGETS */}
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
              API Keys Active
            </span>
            <strong style={{ color: '#2196f3', fontSize: '14px' }}>
              {apiKeys.length} Registered
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
              Webhooks Configured
            </span>
            <strong style={{ color: '#4caf50', fontSize: '14px' }}>
              {webhooks.length} Endpoints
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
          {/* API KEYS KEYRING */}
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
              🔑 API Keyring Keys
            </h3>
            {apiKeys.map((k) => (
              <ApiKeyCard
                key={k.id}
                apiKey={k}
                isSelected={selectedApiKeyId === k.id}
                onSelect={() => selectApiKey(k.id)}
              />
            ))}

            {/* CREATE KEY */}
            <form
              onSubmit={handleCreateApiKey}
              style={{ display: 'flex', gap: '6px', marginTop: '8px' }}
            >
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key Name"
                style={{
                  flex: 1,
                  background: '#222',
                  border: '1px solid #3d3d3d',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#2196f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </form>
          </div>

          {/* REGISTERED WEBHOOKS */}
          <div style={{ borderTop: '1px solid #2d2d2d', paddingTop: '16px' }}>
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '12px',
                color: '#aaa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              📡 Webhooks Subscriptions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {webhooks.map((w) => (
                <div
                  key={w.id}
                  onClick={() => selectWebhook(w.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    background: selectedWebhookId === w.id ? '#252526' : 'transparent',
                    color: selectedWebhookId === w.id ? '#fff' : '#aaa',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  🌐 {w.url}
                </div>
              ))}
            </div>

            {/* REGISTER WEBHOOK */}
            <form
              onSubmit={handleRegisterWebhook}
              style={{ display: 'flex', gap: '6px', marginTop: '8px' }}
            >
              <input
                type="text"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://webhook-url.com"
                style={{
                  flex: 1,
                  background: '#222',
                  border: '1px solid #3d3d3d',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  color: '#fff',
                  fontSize: '11px',
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#2196f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                +
              </button>
            </form>
          </div>

          {/* MENU SELECTIONS */}
          <div style={{ borderTop: '1px solid #2d2d2d', paddingTop: '16px' }}>
            <h3
              style={{
                margin: '0 0 8px 0',
                fontSize: '12px',
                color: '#aaa',
                textTransform: 'uppercase',
              }}
            >
              Navigation
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {(['playground', 'keys', 'webhooks', 'documentation', 'integrations'] as const).map(
                (p) => (
                  <div
                    key={p}
                    onClick={() => setActivePanel(p)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      textTransform: 'capitalize',
                      background: activePanel === p ? '#252526' : 'transparent',
                      color: activePanel === p ? '#fff' : '#aaa',
                    }}
                  >
                    ⚙️ {p === 'playground' ? 'API Playground console' : p}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* CENTER PANEL: INTERACTIVE PLAYGROUND & EXAMPLES */}
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
          {/* SEARCH ACTIONS BAR */}
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
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Active Route Target:</span>
            <select
              value={`${playgroundMethod}:${playgroundPath}`}
              onChange={(e) => {
                const parts = e.target.value.split(':');
                setPlayground(parts[1], parts[0] as any);
              }}
              style={{
                background: '#252526',
                border: '1px solid #3d3d3d',
                borderRadius: '4px',
                padding: '6px 12px',
                color: '#fff',
                fontSize: '12px',
              }}
            >
              <option value="GET:/v1/projects">GET /v1/projects</option>
              <option value="POST:/v1/renders">POST /v1/renders (Triggers webhook event)</option>
            </select>

            <button
              onClick={handleDispatchPlayground}
              style={{
                background: '#2196f3',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 12px',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Send API Request
            </button>
          </div>

          {/* PLAYGROUND RESPONSES */}
          {activePanel === 'playground' && (
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1.2fr', gap: '16px', flex: 1 }}>
              {/* PLAYGROUND REQUEST BODY / HEADERS */}
              <div
                style={{
                  background: '#1c1c1c',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <h3
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: '12px',
                    color: '#aaa',
                    textTransform: 'uppercase',
                  }}
                >
                  Request Headers & Payload
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    fontSize: '11px',
                    color: '#ccc',
                    marginBottom: '8px',
                  }}
                >
                  <span>
                    Method: <strong style={{ color: '#ff9800' }}>{playgroundMethod}</strong>
                  </span>
                  <span>
                    Path: <strong style={{ color: '#fff' }}>{playgroundPath}</strong>
                  </span>
                </div>
                <pre
                  style={{
                    flex: 1,
                    background: '#090909',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: '#e0e0e0',
                    margin: 0,
                    overflowY: 'auto',
                  }}
                >
                  {JSON.stringify(playgroundHeaders, null, 2)}
                </pre>
              </div>

              {/* RESPONSE INSPECTOR */}
              <div
                style={{
                  background: '#1c1c1c',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#aaa',
                      textTransform: 'uppercase',
                    }}
                  >
                    Response Payload Inspector
                  </h3>
                  {playgroundResponseStatus && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color:
                          playgroundResponseStatus === 200 || playgroundResponseStatus === 201
                            ? '#4caf50'
                            : '#f44336',
                      }}
                    >
                      Status: {playgroundResponseStatus}
                    </span>
                  )}
                </div>
                <pre
                  style={{
                    flex: 1,
                    background: '#090909',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    color: '#39ff14',
                    margin: 0,
                    overflowY: 'auto',
                  }}
                >
                  {playgroundResponse
                    ? JSON.stringify(playgroundResponse, null, 2)
                    : 'No response generated yet. Send a request above...'}
                </pre>
              </div>
            </div>
          )}

          {activePanel === 'webhooks' && (
            <div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#fff' }}>
                Webhook Delivery History Logs
              </h2>
              {webhookEvents.length === 0 ? (
                <div
                  style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#666',
                    border: '1px dashed #333',
                    borderRadius: '8px',
                  }}
                >
                  No webhooks sent yet. Send a POST /v1/renders request in the playground to trigger
                  automated event dispatches!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {webhookEvents.map((evt) => (
                    <WebhookEventRow key={evt.id} event={evt} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activePanel === 'documentation' && (
            <div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#fff' }}>
                Dynamic Multi-language Public SDK Reference
              </h2>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {(['typescript', 'python', 'go'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    style={{
                      background: selectedLanguage === lang ? '#2196f3' : '#333',
                      border: 'none',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
              <pre
                style={{
                  background: '#090909',
                  padding: '12px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: '#fff',
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {generatedSDKContent}
              </pre>
            </div>
          )}

          {activePanel === 'integrations' && (
            <div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#fff' }}>
                Connected Integrations Hub
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {integrations.map((conn) => (
                  <div
                    key={conn.id}
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
                      <span>{conn.name}</span>
                      <span style={{ color: '#4caf50', fontSize: '11px' }}>Connected</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#aaa', margin: '8px 0 0 0' }}>
                      Type: {conn.type.toUpperCase()}
                    </p>
                    <code
                      style={{
                        fontSize: '11px',
                        color: '#00bcd4',
                        marginTop: '6px',
                        display: 'block',
                      }}
                    >
                      Config: {JSON.stringify(conn.config)}
                    </code>
                  </div>
                ))}
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
            Scope & Quotas
          </h3>

          {activeKey && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  background: '#252526',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                }}
              >
                <div style={{ fontSize: '10px', color: '#aaa' }}>Selected Key ID</div>
                <code>{activeKey.id}</code>
                <h4 style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#fff' }}>
                  {activeKey.name}
                </h4>
              </div>

              {/* SCOPES CHECKLIST */}
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
                  🔑 Active Token Scopes
                </h4>
                {activeKey.scopes.map((scope) => (
                  <div key={scope} style={{ fontSize: '11px', color: '#ccc', marginBottom: '4px' }}>
                    ✓ {scope}
                  </div>
                ))}
              </div>

              {/* RATE LIMIT CODES */}
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
                  ⏱️ API Rate Quotas
                </h4>
                <div
                  style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}
                >
                  <div>
                    Rate Limit: <strong>60 requests / min</strong>
                  </div>
                  <div>
                    Daily Quotas limit: <strong>10,000 / day</strong>
                  </div>
                </div>
              </div>

              {/* ROTATION BUTTON */}
              <button
                onClick={handleRotateSecret}
                style={{
                  background: '#ff9800',
                  color: '#fff',
                  border: 'none',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Rotate Secret credentials hashes
              </button>
            </div>
          )}

          {activeWebhook && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  background: '#252526',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                }}
              >
                <div style={{ fontSize: '10px', color: '#aaa' }}>Selected Webhook ID</div>
                <code>{activeWebhook.id}</code>
                <p
                  style={{
                    margin: '8px 0 0 0',
                    fontSize: '12px',
                    color: '#fff',
                    wordBreak: 'break-all',
                  }}
                >
                  {activeWebhook.url}
                </p>
              </div>

              {/* WEBHOOK DETAILS */}
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
                    color: '#e91e63',
                    textTransform: 'uppercase',
                  }}
                >
                  📡 Subscribed Events ({activeWebhook.subscribedEvents.length})
                </h4>
                {activeWebhook.subscribedEvents.map((evt) => (
                  <div key={evt} style={{ fontSize: '11px', color: '#ccc', marginBottom: '4px' }}>
                    ✓ {evt}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!activeKey && !activeWebhook && (
            <div
              style={{
                padding: '40px 10px',
                textAlign: 'center',
                color: '#666',
                border: '1px dashed #333',
                borderRadius: '6px',
              }}
            >
              Select an API key or webhook endpoint from side keyring to inspect active scopes or
              rotate signing secrets.
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM CONSOLE PANEL: TELEMETRY & LOGS */}
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
        {/* LOGS CONSOLE */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h4
            style={{
              margin: '0 0 6px 0',
              fontSize: '11px',
              color: '#aaa',
              textTransform: 'uppercase',
            }}
          >
            🖥️ API Gateway Events Console
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
              color: '#00e5ff',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {developerLogs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        </div>

        {/* WEBHOOK DELIVERY GAUGE */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h4
            style={{
              margin: '0 0 6px 0',
              fontSize: '11px',
              color: '#aaa',
              textTransform: 'uppercase',
            }}
          >
            Webhook Deliveries Status
          </h4>
          <div
            style={{
              background: '#1e1e1e',
              border: '1px solid #2d2d2d',
              borderRadius: '6px',
              padding: '10px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: '#888' }}>Total Dispatches</div>
              <strong style={{ fontSize: '16px', color: '#fff' }}>{webhookEvents.length}</strong>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#888' }}>Success Rate</div>
              <strong style={{ fontSize: '14px', color: '#4caf50' }}>100%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDashboard;
