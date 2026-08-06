import React, { useEffect, useState } from 'react';
import { useBrandStore } from '../store/brandStore';
import { PaletteInspector } from './PaletteInspector';
import { ComplianceReportPanel } from './ComplianceReportPanel';
import { VersionHistory } from './VersionHistory';

export const BrandDashboard: React.FC = () => {
  const { initBrandStore, validateProject, createVersionSnapshot } = useBrandStore();
  const [snapshotVersion, setSnapshotVersion] = useState<string>('1.1.0');
  const [snapshotChangelog, setSnapshotChangelog] = useState<string>('Refined typography tokens.');

  useEffect(() => {
    initBrandStore();
  }, []);

  const handleRunComplianceAudit = () => {
    // Generate a mock project with compliance discrepancies to test AI brand enforcement
    const mockProject = {
      id: 'proj_sundance_rc',
      name: 'Smart Sundance Trailer',
      voiceText: 'This is the cheapest editing soft on web!', // Prohibited word 'cheapest'
      timeline: {
        clips: [
          { id: 'clip_text_1', name: 'Intro Caption', type: 'text', style: { color: '#ff0000', fontFamily: 'Comic Sans' } }, // Color unallowed, font unapproved
          { id: 'logo_spot_1', name: 'Brand Watermark Logo', type: 'logo', style: { width: 50, placement: 'centered' } }, // Logo too small, unapproved placement
        ],
      },
    };
    validateProject(mockProject);
  };

  const handleCreateSnapshot = () => {
    if (!snapshotVersion) return;
    createVersionSnapshot(snapshotVersion, 'Jules', snapshotChangelog);
  };

  return (
    <div style={{ padding: '24px', background: '#121212', minHeight: '100vh', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #222', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>🛡️</span> Enterprise Brand Management Platform
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#aaa' }}>
            Central corporate brand asset registry, visual token compilers, version snapshots, and AI brand rules compliance enforcement.
          </p>
        </div>
        <button
          onClick={handleRunComplianceAudit}
          style={{
            background: '#e91e63',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          🔍 Run Brand Compliance Audit
        </button>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* Left hand: Colors inspector & Compliance details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <PaletteInspector />
          <ComplianceReportPanel />
        </div>

        {/* Right hand: Versions history and snapshot actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Create snapshot panel */}
          <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '15px', color: '#ff9800', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              📸 Create Version Snapshot
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '4px' }}>Snapshot Version</label>
                <input
                  type="text"
                  value={snapshotVersion}
                  onChange={(e) => setSnapshotVersion(e.target.value)}
                  style={{ width: '100%', background: '#151515', color: '#fff', border: '1px solid #444', borderRadius: '4px', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#aaa', marginBottom: '4px' }}>Changelog / Notes</label>
                <input
                  type="text"
                  value={snapshotChangelog}
                  onChange={(e) => setSnapshotChangelog(e.target.value)}
                  style={{ width: '100%', background: '#151515', color: '#fff', border: '1px solid #444', borderRadius: '4px', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>

              <button
                onClick={handleCreateSnapshot}
                style={{
                  background: '#ff9800',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginTop: '10px',
                }}
              >
                Save Brand Snapshot
              </button>
            </div>
          </div>

          <VersionHistory />
        </div>
      </div>
    </div>
  );
};
