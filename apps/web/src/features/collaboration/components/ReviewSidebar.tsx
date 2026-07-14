import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Stack,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { Comment, Bookmark, Upload, Download, VerifiedUser } from '@mui/icons-material';
import { CommentsPanel } from './CommentsPanel';
import { AnnotationPanel } from './AnnotationPanel';
import { useCollaboration } from '../hooks/useCollaboration';
import { ReviewStatus } from '@ai-video-editor/shared';

interface Props {
  projectId: string;
}

export const ReviewSidebar: React.FC<Props> = ({ projectId }) => {
  const [tab, setTab] = useState(0);
  const { reviewStatus, setReviewStatus, exportData, importData } = useCollaboration(projectId);

  const handleExport = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project_${projectId}_review_data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        importData(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 1, gap: 1 }}>
      {/* Review Status Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <VerifiedUser sx={{ fontSize: 18 }} /> Review Workflow
        </Typography>
        <Select
          size="small"
          value={reviewStatus}
          onChange={(e) => setReviewStatus(e.target.value as ReviewStatus)}
          sx={{ height: 28, fontSize: '0.8rem', width: 140 }}
        >
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="needs_review">Needs Review</MenuItem>
          <MenuItem value="changes_requested">Changes Req.</MenuItem>
          <MenuItem value="approved">Approved</MenuItem>
          <MenuItem value="archived">Archived</MenuItem>
        </Select>
      </Box>

      {/* JSON Import/Export */}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Download />}
          onClick={handleExport}
          fullWidth
          sx={{ textTransform: 'none', fontSize: '0.75rem', height: 24 }}
        >
          Export Review
        </Button>
        <Button
          size="small"
          component="label"
          variant="outlined"
          startIcon={<Upload />}
          fullWidth
          sx={{ textTransform: 'none', fontSize: '0.75rem', height: 24 }}
        >
          Import
          <input type="file" hidden accept=".json" onChange={handleImport} />
        </Button>
      </Stack>

      <Divider sx={{ my: 1 }} />

      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        variant="fullWidth"
        sx={{ minHeight: 32, height: 32 }}
      >
        <Tab
          icon={<Comment sx={{ fontSize: 16 }} />}
          label="Comments"
          sx={{ fontSize: '0.7rem', minHeight: 32, textTransform: 'none' }}
        />
        <Tab
          icon={<Bookmark sx={{ fontSize: 16 }} />}
          label="Markers"
          sx={{ fontSize: '0.7rem', minHeight: 32, textTransform: 'none' }}
        />
      </Tabs>

      <Box sx={{ flexGrow: 1, overflow: 'hidden', mt: 1 }}>
        {tab === 0 && <CommentsPanel projectId={projectId} />}
        {tab === 1 && <AnnotationPanel projectId={projectId} />}
      </Box>
    </Box>
  );
};
