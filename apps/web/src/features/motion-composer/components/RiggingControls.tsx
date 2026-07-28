import React, { useState } from 'react';
import { useMotionComposerStore } from '../store/motionComposerStore';
import { RiggingConstraint } from '@ai-video-editor/motion-composer';

export const RiggingControls: React.FC = () => {
  const { activeComp, addConstraint } = useMotionComposerStore();
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [type, setType] = useState<'look_at' | 'follow_path' | 'parent_child'>('look_at');
  const [weight, setWeight] = useState(1.0);

  if (!activeComp) return null;

  const handleCreateConstraint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !targetId) return;

    const newConstraint: RiggingConstraint = {
      id: `const_${Date.now()}`,
      type,
      sourceLayerId: sourceId,
      targetId,
      weight,
    };

    addConstraint(newConstraint);
    setSourceId('');
    setTargetId('');
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'sans-serif' }}
    >
      <div>
        <h3 style={{ fontSize: '14px', margin: '0 0 12px 0', fontWeight: 600, color: '#f8fafc' }}>
          🔗 Rigging Constraints Engine
        </h3>
        <p style={{ fontSize: '11px', color: '#71717a', margin: '0 0 16px 0' }}>
          Connect vector shapes, track layers, and cameras to establish parent relationships or
          automated look-at tracking.
        </p>
      </div>

      {/* CREATE NEW CONSTRAINT FORM */}
      <form
        onSubmit={handleCreateConstraint}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          border: '1px solid #27272a',
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: '#18181b',
        }}
      >
        <h4 style={{ fontSize: '12px', margin: '0 0 8px 0', fontWeight: 600, color: '#e2e8f0' }}>
          ➕ Add Rig Constraint
        </h4>

        <div>
          <label style={{ fontSize: '11px', color: '#a1a1aa' }}>Source Layer</label>
          <select
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            required
            style={{
              width: '100%',
              marginTop: '4px',
              backgroundColor: '#1e1e24',
              border: '1px solid #27272a',
              borderRadius: '6px',
              color: '#f8fafc',
              padding: '6px 8px',
              fontSize: '12px',
            }}
          >
            <option value="">-- Choose Source --</option>
            {activeComp.layers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#a1a1aa' }}>Target Layer / Object</label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            required
            style={{
              width: '100%',
              marginTop: '4px',
              backgroundColor: '#1e1e24',
              border: '1px solid #27272a',
              borderRadius: '6px',
              color: '#f8fafc',
              padding: '6px 8px',
              fontSize: '12px',
            }}
          >
            <option value="">-- Choose Target --</option>
            {activeComp.layers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#a1a1aa' }}>Constraint Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            style={{
              width: '100%',
              marginTop: '4px',
              backgroundColor: '#1e1e24',
              border: '1px solid #27272a',
              borderRadius: '6px',
              color: '#f8fafc',
              padding: '6px 8px',
              fontSize: '12px',
            }}
          >
            <option value="look_at">Look At (Target tracking rotation)</option>
            <option value="follow_path">Follow Path (Vector anchor translation)</option>
            <option value="parent_child">Parent Child (Coordinate inheritance)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '11px', color: '#a1a1aa' }}>Tracking Weight</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={weight}
            onChange={(e) => setWeight(parseFloat(e.target.value) || 1.0)}
            style={{
              width: '100%',
              marginTop: '4px',
              backgroundColor: '#1e1e24',
              border: '1px solid #27272a',
              borderRadius: '6px',
              color: '#f8fafc',
              padding: '6px 8px',
              fontSize: '12px',
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Activate Constraint
        </button>
      </form>

      {/* ACTIVE CONSTRAINTS LIST */}
      <div style={{ borderTop: '1px solid #27272a', paddingTop: '16px' }}>
        <h4 style={{ fontSize: '12px', margin: '0 0 12px 0', fontWeight: 600, color: '#f8fafc' }}>
          📋 Live Active Rig Constraints ({activeComp.constraints.length})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {activeComp.constraints.map((constObj) => {
            const source = activeComp.layers.find((l) => l.id === constObj.sourceLayerId);
            const target = activeComp.layers.find((l) => l.id === constObj.targetId);

            return (
              <div
                key={constObj.id}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#1e1e24',
                  borderRadius: '6px',
                  borderLeft: '4px solid #3b82f6',
                  fontSize: '11px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
                    ⚙️ {constObj.type.toUpperCase()}
                  </span>
                  <span style={{ color: '#71717a' }}>weight: {constObj.weight}</span>
                </div>
                <div style={{ color: '#a1a1aa' }}>
                  Source:{' '}
                  <strong style={{ color: '#3b82f6' }}>
                    {source?.name || constObj.sourceLayerId}
                  </strong>
                </div>
                <div style={{ color: '#a1a1aa' }}>
                  Tracks:{' '}
                  <strong style={{ color: '#10b981' }}>{target?.name || constObj.targetId}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
