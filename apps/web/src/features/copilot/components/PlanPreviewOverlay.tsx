import React from 'react';
import { ExecutionPlan } from '../types';

interface PlanPreviewOverlayProps {
  plan: ExecutionPlan;
}

export const PlanPreviewOverlay: React.FC<PlanPreviewOverlayProps> = ({ plan }) => {
  return (
    <div style={{ marginTop: '12px', padding: '10px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px' }}>
      <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '6px', color: '#ff9800' }}>
        Proposed Transaction Changes Preview
      </span>
      <div style={{ fontSize: '10px', color: '#ccc', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div>Affected Scenes: {plan.preview.affectedSceneIds.join(', ')}</div>
        <div>Modifications: {plan.preview.timelineModificationsDescription}</div>
        <div>Estimated Render Impact: {plan.preview.estimatedRenderImpactMs}ms</div>
        <div style={{ color: '#888', marginTop: '4px' }}>
          Undo Checkpoint ID: {plan.preview.undoCheckpointId}
        </div>
      </div>
    </div>
  );
};
export default PlanPreviewOverlay;
