import React from 'react';
import { useExecutionApprovals } from '../hooks/useExecutionApprovals';

export const ApprovalPromptDialog: React.FC = () => {
  const { approvalRequest, approveCurrentPlan, rejectCurrentPlan } = useExecutionApprovals();

  if (!approvalRequest) return null;

  return (
    <div style={{ marginTop: '8px', padding: '10px', background: '#222', border: '1px solid #444', borderRadius: '4px', textAlign: 'center' }}>
      <p style={{ fontSize: '11px', margin: '0 0 10px 0', color: '#ccc' }}>
        Are you sure you want to execute these compiled modifications through secure Transactions?
      </p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button
          onClick={rejectCurrentPlan}
          style={{ padding: '3px 12px', fontSize: '10px', background: '#555', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer' }}
        >
          Reject
        </button>
        <button
          onClick={() => approveCurrentPlan(() => {})}
          style={{ padding: '3px 12px', fontSize: '10px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Approve & Execute
        </button>
      </div>
    </div>
  );
};
export default ApprovalPromptDialog;
