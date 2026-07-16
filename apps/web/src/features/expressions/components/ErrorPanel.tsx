import React from 'react';
import { ExpressionError } from '@ai-video-editor/expression-engine';

interface ErrorPanelProps {
  error: ExpressionError | null;
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div
      style={{
        backgroundColor: '#2d1a1e',
        border: '1px solid #ff4a5a',
        borderRadius: '4px',
        padding: '10px 14px',
        color: '#ff8a9a',
        fontFamily: 'monospace',
        fontSize: '12px',
        marginTop: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '14px' }}>⚠️</span> Expression Error
      </div>
      <div>{error.message}</div>
      {error.snippet && (
        <pre
          style={{
            backgroundColor: '#1b1013',
            padding: '6px',
            borderRadius: '2px',
            margin: '4px 0 0 0',
            overflowX: 'auto',
          }}
        >
          {error.snippet}
        </pre>
      )}
    </div>
  );
};
