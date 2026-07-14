import React, { Suspense } from 'react';
import { Box, Typography, Tabs, Tab, CircularProgress } from '@mui/material';
import {
  Movie as MediaIcon,
  Title as TextIcon,
  Audiotrack as AudioIcon,
  AutoAwesome as AIIcon,
  Speed as SpeedIcon,
  RateReview as ReviewIcon,
} from '@mui/icons-material';
import MediaManager from './MediaManager';
import AIAssistant from './AIAssistant';
import { ReviewSidebar } from '../../features/collaboration/components/ReviewSidebar';

// Lazy load heavy diagnostics panel
const PerformanceDashboard = React.lazy(() =>
  import('../../features/performance/components/PerformanceDashboard').then((m) => ({
    default: m.PerformanceDashboard,
  })),
);

interface SidebarProps {
  projectId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ projectId }) => {
  const [value, setValue] = React.useState(0);
  return (
    <Box
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}
    >
      <Tabs
        value={value}
        onChange={(e, v) => setValue(v)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab
          icon={<MediaIcon />}
          label="Media"
          sx={{ minWidth: 'auto', textTransform: 'none', fontSize: '0.75rem' }}
        />
        <Tab
          icon={<AIIcon />}
          label="AI"
          sx={{ minWidth: 'auto', textTransform: 'none', fontSize: '0.75rem' }}
        />
        <Tab
          icon={<TextIcon />}
          label="Text"
          sx={{ minWidth: 'auto', textTransform: 'none', fontSize: '0.75rem' }}
        />
        <Tab
          icon={<AudioIcon />}
          label="Audio"
          sx={{ minWidth: 'auto', textTransform: 'none', fontSize: '0.75rem' }}
        />
        <Tab
          icon={<ReviewIcon />}
          label="Review"
          sx={{ minWidth: 'auto', textTransform: 'none', fontSize: '0.75rem' }}
        />
        <Tab
          icon={<SpeedIcon />}
          label="Performance"
          sx={{ minWidth: 'auto', textTransform: 'none', fontSize: '0.75rem' }}
        />
      </Tabs>
      <Box sx={{ p: 1, flexGrow: 1, overflowY: 'auto' }}>
        {value === 0 && <MediaManager projectId={projectId} />}
        {value === 1 && <AIAssistant />}
        {value === 2 && (
          <Typography variant="body2" sx={{ p: 2 }}>
            Text Overlays
          </Typography>
        )}
        {value === 3 && (
          <Typography variant="body2" sx={{ p: 2 }}>
            Audio Tracks
          </Typography>
        )}
        {value === 4 && <ReviewSidebar projectId={projectId} />}
        {value === 5 && (
          <Suspense
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={24} />
              </Box>
            }
          >
            <PerformanceDashboard />
          </Suspense>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
