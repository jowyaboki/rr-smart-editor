import React, { useState } from 'react';
import { useAgentRuntime } from '../hooks/useAgentRuntime';

export const ChatConsole: React.FC = () => {
  const { messages, isRunning, sendMessage, clearHistory } = useAgentRuntime();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || isRunning) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '400px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px', background: '#222', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>AI Assistant Console</span>
        <button
          onClick={clearHistory}
          style={{ padding: '2px 8px', fontSize: '10px', background: '#333', color: '#ccc', border: '1px solid #444', cursor: 'pointer' }}
        >
          Clear
        </button>
      </div>

      <div style={{ flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.length === 0 && (
          <div style={{ color: '#666', textAlign: 'center', marginTop: '100px', fontSize: '12px' }}>
            Ask the AI Assistant to edit your timeline, tag assets, or execute render runs.
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              padding: '8px',
              borderRadius: '4px',
              maxWidth: '80%',
              fontSize: '12px',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background: msg.role === 'user' ? '#1976d2' : '#222',
              border: msg.role === 'user' ? 'none' : '1px solid #333',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#aaa', marginBottom: '2px' }}>
              {msg.role.toUpperCase()}
            </div>
            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
          </div>
        ))}
        {isRunning && (
          <div style={{ alignSelf: 'flex-start', background: '#222', padding: '8px', borderRadius: '4px', border: '1px solid #333', fontSize: '12px', color: '#aaa' }}>
            AI is thinking and planning execution...
          </div>
        )}
      </div>

      <div style={{ padding: '8px', background: '#1a1a1a', borderTop: '1px solid #333', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI (e.g. 'Generate timeline with intro clips and render')"
          style={{ flex: 1, padding: '6px 8px', fontSize: '12px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '2px' }}
        />
        <button
          onClick={handleSend}
          disabled={isRunning}
          style={{ padding: '6px 12px', fontSize: '12px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', opacity: isRunning ? 0.5 : 1 }}
        >
          Send
        </button>
      </div>
    </div>
  );
};
