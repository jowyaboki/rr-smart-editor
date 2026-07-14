import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { AutoSaveStatusIndicator } from '../../features/recovery/components/AutoSaveStatusIndicator';
import { SnapshotBrowser } from '../../features/recovery/components/SnapshotBrowser';
import { useProjects } from '../../hooks/useProjects';

const StatusBar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: projects } = useProjects();
  const [browserOpen, setBrowserOpen] = useState(false);

  const currentProject = projects?.find((p) => p.id === id);
  const projectName = currentProject?.name || 'Untitled Project';

  return (
    <Box
      sx={{
        p: 0.5,
        px: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'primary.dark',
        color: 'white',
        borderTop: '1px solid #1a365d',
        height: 36,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          Ready
        </Typography>
        {id && <AutoSaveStatusIndicator projectId={id} projectName={projectName} />}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {id && (
          <>
            <Button
              size="small"
              variant="text"
              color="inherit"
              startIcon={<HistoryIcon style={{ fontSize: 14 }} />}
              onClick={() => setBrowserOpen(true)}
              sx={{
                height: 24,
                fontSize: '0.75rem',
                textTransform: 'none',
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              Snapshots History
            </Button>
            <SnapshotBrowser
              projectId={id}
              open={browserOpen}
              onClose={() => setBrowserOpen(false)}
            />
          </>
        )}
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          1920x1080 | 30fps
        </Typography>
      </Box>
    </Box>
  );
};

export default StatusBar;
