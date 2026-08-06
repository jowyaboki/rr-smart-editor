import React, { useState, useEffect } from 'react';
import { useAICopilot } from '../hooks/useAICopilot';
import { PlanPreviewOverlay } from './PlanPreviewOverlay';
import { ApprovalPromptDialog } from './ApprovalPromptDialog';
import { ProactiveSuggestionsPanel } from './ProactiveSuggestionsPanel';

export const CopilotChatWindow: React.FC = () => {
  const { messages, activePlan, approvalRequest, loading, startCopilotSession, sendPromptToCopilot } = useAICopilot();
  const [input, setInput] = useState('');

  useEffect(() => {
    startCopilotSession('sess-copilot', 'proj-active');
  }, []);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendPromptToCopilot(input, {
      timeline: { audioGapsCount: 1, subtitleOverlaysCount: 1 },
    });
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '400px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '6px', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '8px 12px', background: '#222', borderBottom: '1px solid #333', fontSize: '12px', fontWeight: 'bold' }}>
        AI Editing Copilot
      </div>

      <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.length === 0 && (
          <div style={{ color: '#555', fontSize: '11px', textAlign: 'center', marginTop: '100px' }}>
            Instruct the Copilot to split clips, mix audio tracks, or replace background assets using natural language.
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              padding: '8px',
              borderRadius: '4px',
              maxWidth: '85%',
              fontSize: '11px',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background: msg.role === 'user' ? '#1976d2' : '#222',
              border: msg.role === 'user' ? 'none' : '1px solid #333',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '9px', color: '#888', marginBottom: '2px' }}>
              {msg.role.toUpperCase()}
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
          </div>
        ))}

        {/* Nested panels overlay */}
        {activePlan && (
          <div>
            <PlanPreviewOverlay plan={activePlan} />
            <ApprovalPromptDialog />
          </div>
        )}

        <ProactiveSuggestionsPanel />
      </div>

      <div style={{ padding: '8px', background: '#1a1a1a', borderTop: '1px solid #333', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="e.g. 'Split the intro clip at 5 seconds'..."
          style={{ flex: 1, padding: '6px 12px', fontSize: '11px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '3px' }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{ padding: '6px 14px', fontSize: '11px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
};
export default CopilotChatWindow;
