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
import { useTemplates, useUseTemplate } from '../hooks/useTemplates';

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const { data: templates, isLoading, error } = useTemplates();
  const useTemplate = useUseTemplate();

  const handleUseTemplate = async (templateId: string) => {
    const project = await useTemplate.mutateAsync(templateId);
    navigate(`/editor/${project.id}`);
  };

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

export default Templates;
