import React from 'react';

interface UndoCheckpointAlertProps {
  checkpointId: string;
}

export const UndoCheckpointAlert: React.FC<UndoCheckpointAlertProps> = ({ checkpointId }) => {
  return (
    <div style={{ padding: '8px', background: '#2e7d32', color: '#fff', fontSize: '11px', borderRadius: '4px', marginTop: '12px' }}>
      ✓ Success! Changes successfully executed. Transaction checkpoint recorded: <strong>{checkpointId}</strong> (Press Cmd+Z to undo).
    </div>
  );
};
export default UndoCheckpointAlert;
