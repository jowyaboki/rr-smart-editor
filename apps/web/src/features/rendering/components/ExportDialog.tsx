import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { ExportChecklist } from '@/features/pipeline/components/ExportChecklist';
import { WorkflowEngine } from '@/features/pipeline/services/WorkflowEngine';
import { usePipelineStore } from '@/features/pipeline/store/pipelineStore';
import { useRendering } from '../hooks/useRendering';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ open, onClose }) => {
  const { startRender } = useRendering();
  const { checklist } = usePipelineStore();
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (open) {
      setIsValidating(true);
      WorkflowEngine.transitionTo('validation').finally(() => setIsValidating(false));
    }
  }, [open]);

  const handleStartRender = async () => {
    const success = await WorkflowEngine.transitionTo('rendering');
    if (success) {
      startRender();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Project</DialogTitle>
      <DialogContent>
        {isValidating ? (
          <Typography>Validating project readiness...</Typography>
        ) : (
          <ExportChecklist />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!checklist.isReady || isValidating}
          onClick={handleStartRender}
        >
          Start Rendering
        </Button>
      </DialogActions>
    </Dialog>
  );
};
