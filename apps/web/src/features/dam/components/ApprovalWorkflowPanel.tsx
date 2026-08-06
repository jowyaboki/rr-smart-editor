import React from 'react';
import { assetLibrary } from '../services';

interface ApprovalWorkflowPanelProps {
  assetId: string;
}

export const ApprovalWorkflowPanel: React.FC<ApprovalWorkflowPanelProps> = ({ assetId }) => {
  const asset = assetLibrary.getAsset(assetId);

  if (!asset) return null;

  return (
    <div style={{ marginTop: '8px', padding: '6px', background: '#111', borderRadius: '3px' }}>
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#888', marginBottom: '4px' }}>Approval Workflow</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: '#ccc' }}>
          Current State: <strong style={{ color: '#ff9800' }}>{asset.approval.status.toUpperCase()}</strong>
        </span>
        {asset.approval.reviewerComments && (
          <span style={{ fontSize: '9px', color: '#888', fontStyle: 'italic' }}>
            "{asset.approval.reviewerComments[asset.approval.reviewerComments.length - 1]}"
          </span>
        )}
      </div>
    </div>
  );
};
export default ApprovalWorkflowPanel;
