import React from 'react';
import { useBrandStore } from '../store/brandStore';

export const PaletteInspector: React.FC = () => {
  const { activeKit } = useBrandStore();

  if (!activeKit) return null;

  const { theme, logos, voice } = activeKit;

  const renderColorBox = (label: string, hex: string) => {
    return (
      <div style={{ background: '#252526', padding: '12px', borderRadius: '6px', border: '1px solid #333', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', background: hex, borderRadius: '4px', border: '1px solid #444' }} />
        <div>
          <div style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase' }}>{label}</div>
          <code style={{ fontSize: '13px', fontWeight: 'bold' }}>{hex}</code>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', color: '#fff' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', color: '#2196f3', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        🎨 Brand Colors & Typographies
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        {renderColorBox('Primary Color', theme.colors.primary)}
        {renderColorBox('Secondary Color', theme.colors.secondary)}
        {renderColorBox('Accent Color', theme.colors.accent)}
        {renderColorBox('Background Color', theme.colors.background)}
      </div>

      <div style={{ borderTop: '1px solid #2d2d2d', paddingTop: '16px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#aaa' }}>Approved Font Tokens</h4>
        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>Heading Font: <strong style={{ color: '#fff' }}>{theme.typography.headingFont}</strong></div>
          <div>Body/Text Font: <strong style={{ color: '#fff' }}>{theme.typography.bodyFont}</strong></div>
          <div>Caption/Meta Font: <strong style={{ color: '#fff' }}>{theme.typography.captionFont}</strong></div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #2d2d2d', paddingTop: '16px', marginTop: '16px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#aaa' }}>Branding Logo Guidelines</h4>
        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>Minimum Width: <strong style={{ color: '#fff' }}>{logos.rules.minWidthPx}px</strong></div>
          <div>Preferred Region: <strong style={{ color: '#fff', textTransform: 'capitalize' }}>{logos.rules.preferredPlacement.replace('_', ' ')}</strong></div>
        </div>
      </div>
    </div>
  );
};
