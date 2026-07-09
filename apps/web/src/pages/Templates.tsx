import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { TemplateBrowser } from '@/features/templates/browser/TemplateBrowser';
import { TemplateVariableDialog } from '@/features/templates/components/TemplateVariableDialog';
import { useTemplateStore } from '@/features/templates/store/templateStore';
import { useProjectStore } from '@/features/projects/store/projectStore';
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
    </Box>
  );
};

export default TemplatesPage;
