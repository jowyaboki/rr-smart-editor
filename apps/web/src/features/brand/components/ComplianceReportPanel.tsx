import React from 'react';
import { useBrandStore } from '../store/brandStore';

export const ComplianceReportPanel: React.FC = () => {
  const { complianceReport, isLoading } = useBrandStore();

  if (isLoading) {
    return (
      <div style={{ padding: '20px', background: '#1e1e1e', borderRadius: '8px', border: '1px solid #333', textAlign: 'center', color: '#aaa' }}>
        Analyzing project asset elements...
      </div>
    );
  }

  if (!complianceReport) {
    return (
      <div style={{ padding: '20px', background: '#1e1e1e', borderRadius: '8px', border: '1px solid #333', textAlign: 'center', color: '#888', fontSize: '13px' }}>
        Run Brand Compliance check to inspect violations and brand consistency score.
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'conditional': return '#ff9800';
      case 'rejected': return '#f44336';
      default: return '#888';
    }
  };

  return (
    <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '8px', border: '1px solid #333', color: '#fff' }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '16px', color: '#e91e63', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        ⚠️ AI Brand Compliance Report
      </h3>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#252526', padding: '16px', borderRadius: '6px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#aaa' }}>Consistency Score</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: getStatusColor(complianceReport.approvalStatus) }}>
            {complianceReport.consistencyScore}/100
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#aaa' }}>Approval Status</div>
          <span
            style={{
              display: 'inline-block',
              marginTop: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              background: `${getStatusColor(complianceReport.approvalStatus)}20`,
              color: getStatusColor(complianceReport.approvalStatus),
              padding: '4px 10px',
              borderRadius: '4px',
              textTransform: 'uppercase',
            }}
          >
            {complianceReport.approvalStatus}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {complianceReport.violations.length === 0 ? (
          <div style={{ padding: '12px', background: 'rgba(76, 175, 80, 0.1)', border: '1px solid rgba(76, 175, 80, 0.3)', borderRadius: '4px', textAlign: 'center', color: '#4caf50', fontSize: '13px' }}>
            🎉 Perfect match! No brand compliance violations detected.
          </div>
        ) : (
          complianceReport.violations.map((v) => (
            <div
              key={v.id}
              style={{
                background: v.severity === 'error' ? 'rgba(244, 67, 54, 0.08)' : 'rgba(255, 152, 0, 0.08)',
                borderLeft: `4px solid ${v.severity === 'error' ? '#f44336' : '#ff9800'}`,
                padding: '12px',
                borderRadius: '4px',
                fontSize: '13px',
              }}
            >
              <div style={{ fontWeight: 'bold', color: v.severity === 'error' ? '#f44336' : '#ff9800', textTransform: 'uppercase', fontSize: '11px', marginBottom: '2px' }}>
                {v.category} Violation ({v.severity})
              </div>
              <p style={{ margin: '0 0 8px 0', color: '#eee' }}>{v.message}</p>
              <div style={{ fontSize: '11px', color: '#aaa', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                Detected: <span style={{ textDecoration: 'line-through', color: '#f44336', marginRight: '6px' }}>{v.detectedValue}</span>
                Fix: <span style={{ color: '#4caf50', fontWeight: 'bold' }}>{v.suggestedFix}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
