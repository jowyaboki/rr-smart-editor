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
  Chip,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTemplates, useUseTemplate } from '../hooks/useTemplates';
import {
  Panel,
  SearchBar,
  EmptyState,
  SkeletonLoader,
  Modal,
  StatusBadge,
  PropertyGrid,
} from '@ai-video-editor/ui';

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
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#ffffff' }}>
          Loading Creator Templates...
        </Typography>
        <SkeletonLoader rows={3} />
      </Box>
    );

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <EmptyState
          title="Error Loading Templates"
          description="We encountered an issue communicating with the database. Please verify your connection."
          action={
            <Button variant="contained" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </Box>
    );
  }

  return (
    <Box sx={{ color: '#ffffff' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: '0.5px' }}>
            Creator Templates Browser
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
            Accelerate your creative velocity by authoring and mapping variables on responsive production blueprints.
          </Typography>
        </Box>
      </Box>

      {/* Responsive Preview Variables Mapping & Mock placeholder controls (v15 Sprint) */}
      <Box sx={{ p: 2, mb: 3, border: '1px solid #1b2f54', borderRadius: '8px', bgcolor: '#0d1527' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', fontSize: '0.68rem', letterSpacing: '0.5px' }}>
            Template Placeholders & Variable Mapper
          </Typography>
          <Chip label="Ready to publish" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 'bold' }} />
        </Box>
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 2, lineHeight: 1.3 }}>
          Map dynamic variables to automatically customize subtitle overlays and brand safe-area asset logos on compile:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" sx={{ fontSize: '0.65rem' }}>Map Subtitles</Button>
          <Button size="small" variant="outlined" sx={{ fontSize: '0.65rem' }}>Verify Brand Safe-Area</Button>
          <Button size="small" variant="outlined" sx={{ fontSize: '0.65rem' }}>Configure Responsive Preview</Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {templates?.map((template: any) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card
              sx={{
                bgcolor: '#0d1527',
                border: '1px solid #1b2f54',
                borderRadius: '6px',
                transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: '#00f0ff',
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)'
                }
              }}
            >
              <Box
                sx={{
                  height: 140,
                  bgcolor: '#050b14',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid #1b2f54'
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Creator Template Preview
                </Typography>
              </Box>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#ffffff' }}>{template.name}</Typography>
                <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.6rem', display: 'block', mt: 0.5 }}>
                  Category: {template.category || 'General'}
                </Typography>
              </CardContent>
              <CardActions sx={{ borderTop: '1px solid #1b2f54', bgcolor: '#050b14', p: 1.5, justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleUseTemplate(template.id)}
                  sx={{
                    fontSize: '0.68rem',
                    fontWeight: 'bold',
                    bgcolor: '#00f0ff',
                    color: '#050b14',
                    '&:hover': { bgcolor: '#00d0f0' }
                  }}
                >
                  Use Template
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {templates?.length === 0 && (
        <EmptyState
          title="No Templates Found"
          description="Create and save a timeline composition sequence as a template blueprint to see it populated in this browser."
        />
      )}
    </Box>
  );
};

export default Templates;
