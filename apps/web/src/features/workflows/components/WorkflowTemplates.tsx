import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import {
  AutoAwesome as TemplateIcon,
  AddCircle as CreateIcon,
} from '@mui/icons-material';
import { useWorkflowEngine } from '../hooks/useWorkflowEngine';

export const WorkflowTemplates: React.FC = () => {
  const engine = useWorkflowEngine();

  const handleInstantiate = (templateId: string) => {
    engine.instantiateFromTemplate(templateId);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TemplateIcon color="primary" /> Reusable Pipeline Blueprints
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2.5}>
        {engine.templates.map((tpl) => (
          <Grid item xs={12} sm={6} md={4} key={tpl.id}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                  {tpl.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
                  Category: {tpl.category || 'General'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {tpl.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<CreateIcon />}
                  fullWidth
                  onClick={() => handleInstantiate(tpl.id)}
                >
                  Instantiate Flow
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};
