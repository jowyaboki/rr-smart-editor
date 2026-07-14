import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Divider
} from '@mui/material';
import {
  CheckCircle as ReadyIcon,
  Error as BlockIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { usePipelineStore } from '../store/pipelineStore';

export const ExportChecklist: React.FC = () => {
  const { checklist } = usePipelineStore();

  return (
    <Box>
      {!checklist.isReady && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Rendering is blocked by {checklist.blockingErrors.length} critical errors.
        </Alert>
      )}

      <Typography variant="subtitle1" gutterBottom>Ready to Export</Typography>
      <List dense>
        {checklist.readyItems.map((item, i) => (
          <ListItem key={i}>
            <ListItemIcon><ReadyIcon color="success" fontSize="small" /></ListItemIcon>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" gutterBottom color="error">Blocking Errors</Typography>
      <List dense>
        {checklist.blockingErrors.map((err, i) => (
          <ListItem key={i}>
            <ListItemIcon><BlockIcon color="error" fontSize="small" /></ListItemIcon>
            <ListItemText primary={err} />
          </ListItem>
        ))}
      </List>

      {checklist.warnings.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom color="warning.main">Warnings</Typography>
          <List dense>
            {checklist.warnings.map((warn, i) => (
              <ListItem key={i}>
                <ListItemIcon><InfoIcon color="warning" fontSize="small" /></ListItemIcon>
                <ListItemText primary={warn} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );
};
