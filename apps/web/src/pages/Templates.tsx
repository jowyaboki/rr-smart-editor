import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { TemplateBrowser } from '@/features/templates/browser/TemplateBrowser';
import { TemplateVariableDialog } from '@/features/templates/components/TemplateVariableDialog';
import { useTemplateStore } from '@/features/templates/store/templateStore';
import { useProjectStore } from '@/features/projects/store/projectStore';
import React from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { TemplateCompiler } from '@/features/templates/services/TemplateCompiler';

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { templates, selectTemplate, selectedTemplateId } = useTemplateStore();
  const createProject = useProjectStore(state => state.createProject);

  const [variableDialogOpen, setVariableDialogOpen] = useState(false);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || null;

  const handleUseTemplate = (id: string) => {
    selectTemplate(id);
    setVariableDialogOpen(true);
  };

  const handleConfirmTemplate = async (values: Record<string, any>) => {
    if (!selectedTemplate) return;

    const timeline = TemplateCompiler.compile(selectedTemplate, selectedTemplate.currentVersionId, values);
    const project = await createProject({
      name: `New ${selectedTemplate.metadata.name}`,
      timeline
    });

    navigate(`/editor/${project.id}`);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Templates Library</Typography>

      <Box sx={{ mt: 4 }}>
        <TemplateBrowser onUseTemplate={handleUseTemplate} />
      </Box>

      <TemplateVariableDialog
        template={selectedTemplate}
        open={variableDialogOpen}
        onClose={() => setVariableDialogOpen(false)}
        onConfirm={handleConfirmTemplate}
      />
  if (isLoading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">Error loading templates</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Templates
      </Typography>
      <Grid container spacing={3}>
        {templates?.map((template: any) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card>
              <Box
                sx={{
                  height: 140,
                  bgcolor: 'grey.900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" color="grey.700">
                  Template Preview
                </Typography>
              </Box>
              <CardContent>
                <Typography variant="h6">{template.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {template.category}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleUseTemplate(template.id)}
                >
                  Use Template
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {templates?.length === 0 && (
          <Grid item xs={12}>
            <Typography color="text.secondary">
              No templates available. Save a project as a template to see it here.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TemplatesPage;
