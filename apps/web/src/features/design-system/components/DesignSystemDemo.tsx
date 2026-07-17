import React, { useState } from 'react';
import { useDesignSystem } from '../hooks/useDesignSystem';
import { useThemeToken } from '../hooks/useThemeToken';

export const DesignSystemDemo: React.FC = () => {
  const {
    activeThemeId,
    setActiveTheme,
    viewport,
    setViewport,
    locale,
    setLocale,
    themes,
    motionPresets,
  } = useDesignSystem();

  const primaryColor = useThemeToken('colors.primary');
  const secondaryColor = useThemeToken('colors.secondary');
  const backgroundColor = useThemeToken('colors.background');
  const surfaceColor = useThemeToken('colors.surface');
  const textColor = useThemeToken('colors.text');
  const borderColor = useThemeToken('colors.border');

  const [activePreset, setActivePreset] = useState<string>('fade');
  const [animateKey, setAnimateKey] = useState<number>(0);

  const handleAnimate = (presetId: string) => {
    setActivePreset(presetId);
    setAnimateKey(prev => prev + 1);
  };

  // Compile CSS animation from preset properties
  const preset = motionPresets[activePreset];
  const animationStyle = React.useMemo(() => {
    if (!preset) return {};

    const styles: React.CSSProperties = {
      transition: `all ${typeof preset.duration === 'number' ? `${preset.duration}ms` : preset.duration} ${
        preset.easing === 'bounce'
          ? 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          : preset.easing === 'elastic'
          ? 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
          : preset.easing
      }`,
    };

    if (animateKey > 0) {
      if (preset.properties.opacity) {
        styles.opacity = preset.properties.opacity[1];
      }
      if (preset.properties.transform) {
        let transformStr = '';
        if (preset.properties.transform.scale) {
          transformStr += ` scale(${preset.properties.transform.scale[1]})`;
        }
        if (preset.properties.transform.rotate) {
          transformStr += ` rotate(${preset.properties.transform.rotate[1]}deg)`;
        }
        if (preset.properties.transform.translate?.x) {
          transformStr += ` translateX(${preset.properties.transform.translate.x[1]}px)`;
        }
        if (preset.properties.transform.translate?.y) {
          transformStr += ` translateY(${preset.properties.transform.translate.y[1]}px)`;
        }
        styles.transform = transformStr.trim();
      }
      if (preset.properties.filter?.blur) {
        styles.filter = `blur(${preset.properties.filter.blur[1]})`;
      }
    } else {
      if (preset.properties.opacity) {
        styles.opacity = preset.properties.opacity[0];
      }
      if (preset.properties.transform) {
        let transformStr = '';
        if (preset.properties.transform.scale) {
          transformStr += ` scale(${preset.properties.transform.scale[0]})`;
        }
        if (preset.properties.transform.rotate) {
          transformStr += ` rotate(${preset.properties.transform.rotate[0]}deg)`;
        }
        if (preset.properties.transform.translate?.x) {
          transformStr += ` translateX(${preset.properties.transform.translate.x[0]}px)`;
        }
        if (preset.properties.transform.translate?.y) {
          transformStr += ` translateY(${preset.properties.transform.translate.y[0]}px)`;
        }
        styles.transform = transformStr.trim();
      }
      if (preset.properties.filter?.blur) {
        styles.filter = `blur(${preset.properties.filter.blur[0]})`;
      }
    }

    return styles;
  }, [preset, animateKey]);

  return (
    <div
      style={{
        backgroundColor: backgroundColor || '#0a1929',
        color: textColor || '#ffffff',
        padding: '24px',
        borderRadius: '8px',
        border: `1px solid ${borderColor || '#1e293b'}`,
        fontFamily: 'sans-serif',
        maxWidth: '800px',
        margin: '20px auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>Design System Engine</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {Object.keys(themes).map(id => (
            <button
              key={id}
              onClick={() => setActiveTheme(id)}
              style={{
                backgroundColor: activeThemeId === id ? primaryColor : '#1e293b',
                color: activeThemeId === id ? '#0a1929' : '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {themes[id].name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Color Palette section */}
        <div style={{ backgroundColor: surfaceColor || '#102031', padding: '16px', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Active Color Swatches</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: primaryColor, borderRadius: '4px', border: '1px solid #ffffff' }} />
              <div>
                <div style={{ fontWeight: 'bold' }}>Primary Color</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>{primaryColor}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: secondaryColor, borderRadius: '4px', border: '1px solid #ffffff' }} />
              <div>
                <div style={{ fontWeight: 'bold' }}>Secondary Color</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>{secondaryColor}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', backgroundColor: surfaceColor, borderRadius: '4px', border: '1px solid #ffffff' }} />
              <div>
                <div style={{ fontWeight: 'bold' }}>Surface Color</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>{surfaceColor}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Viewport & Locale controls */}
        <div style={{ backgroundColor: surfaceColor || '#102031', padding: '16px', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Responsive & Localization</h3>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', marginBottom: '6px' }}>Viewport: <strong>{viewport}</strong></div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['mobile', 'tablet', 'desktop'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setViewport(v)}
                  style={{
                    backgroundColor: viewport === v ? primaryColor : '#1e293b',
                    color: viewport === v ? '#0a1929' : '#ffffff',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', marginBottom: '6px' }}>Locale: <strong>{locale}</strong></div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['en', 'ja', 'es'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLocale(l)}
                  style={{
                    backgroundColor: locale === l ? primaryColor : '#1e293b',
                    color: locale === l ? '#0a1929' : '#ffffff',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Motion presets tester */}
      <div style={{ backgroundColor: surfaceColor || '#102031', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0' }}>Motion Presets Playground</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {Object.keys(motionPresets).map(id => (
            <button
              key={id}
              onClick={() => handleAnimate(id)}
              style={{
                backgroundColor: activePreset === id ? secondaryColor : '#1e293b',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              Play {motionPresets[id].name}
            </button>
          ))}
          <button
            onClick={() => setAnimateKey(0)}
            style={{
              backgroundColor: '#ef5350',
              color: '#ffffff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              marginLeft: 'auto',
            }}
          >
            Reset Animation State
          </button>
        </div>

        <div
          style={{
            height: '120px',
            backgroundColor: '#0a1929',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            border: `1px dashed ${borderColor || '#1e293b'}`,
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: primaryColor,
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              color: '#0a1929',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              ...animationStyle,
            }}
          >
            RR
          </div>
        </div>
      </div>
    </div>
  );
};
