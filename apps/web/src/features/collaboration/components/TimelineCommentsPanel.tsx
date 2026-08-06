import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Divider, Chip, Tooltip } from '@mui/material';
import { useReviewComments } from '../hooks/useReviewComments';
import {
  CheckCircle as CheckIcon,
  Pending as PendingIcon,
  Forum as DiscussionIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material';

export const TimelineCommentsPanel: React.FC = () => {
  const { comments, resolveComment, addComment } = useReviewComments();
  const [newText, setNewText] = useState('');

  const activeComments = comments.filter((c) => !c.resolved);
  const resolvedComments = comments.filter((c) => c.resolved);

  const handleAdd = () => {
    if (newText.trim()) {
      addComment(newText, 150); // Mocks adding feedback at Frame 150
      setNewText('');
    }
  };

  const notificationEvents = [
    { id: 'notif-1', text: 'Sarah locked Workspace layers', time: '12m ago', type: 'system' },
    { id: 'notif-2', text: 'Michael approved Intro scene (Frame 120)', time: '40m ago', type: 'review' },
    { id: 'notif-3', text: 'Render Job Shard #2 finished processing', time: '1h ago', type: 'render' },
  ];

  return (
    <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#0d1527', border: '1px solid #1b2f54', borderRadius: '6px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Production Communication Feed
        </Typography>
        <Chip
          label={`${activeComments.length} Open Discussions`}
          size="small"
          sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff', fontWeight: 'bold' }}
        />
      </Box>

      {/* Checklist instructions drawing overlay */}
      <Box sx={{ p: 1, borderRadius: '4px', bgcolor: 'rgba(236, 72, 153, 0.05)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
        <Typography variant="caption" sx={{ color: '#ec4899', fontSize: '0.62rem', display: 'block', lineHeight: 1.3 }}>
          💡 Active review session checklist: Version comparison active. Frame-accurate redline drawing annotation toggle ready.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: '180px', overflowY: 'auto' }}>
        {activeComments.map((comment) => (
          <Box
            key={comment.id}
            sx={{
              p: 1,
              bgcolor: '#12203d',
              border: '1px solid #1b2f54',
              borderRadius: '4px',
              transition: 'border-color 0.15s ease',
              '&:hover': { borderColor: '#ec4899' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#00f0ff', fontWeight: 'bold', fontSize: '0.65rem' }}>
                {comment.authorName || 'Guest Reviewer'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {comment.frame !== undefined && (
                  <Chip
                    label={`Frame ${comment.frame}`}
                    size="small"
                    sx={{ height: 14, fontSize: '0.55rem', bgcolor: '#050b14', color: '#94a3b8' }}
                  />
                )}
                <Button
                  size="small"
                  onClick={() => resolveComment(comment.id)}
                  sx={{
                    p: '1px 6px',
                    minWidth: 'unset',
                    fontSize: '0.55rem',
                    bgcolor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    fontWeight: 'bold',
                    '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.3)' },
                  }}
                >
                  Resolve
                </Button>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: '#ffffff', fontSize: '0.7rem', display: 'block', lineHeight: 1.3 }}>
              {comment.text}
            </Typography>
          </Box>
        ))}

        {resolvedComments.map((comment) => (
          <Box
            key={comment.id}
            sx={{
              p: 1,
              bgcolor: 'rgba(255,255,255,0.02)',
              border: '1px dashed #1b2f54',
              borderRadius: '4px',
              opacity: 0.5,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '0.65rem' }}>
                {comment.text}
              </Typography>
              <Chip label="Resolved" size="small" icon={<CheckIcon style={{ fontSize: 10, color: '#10b981' }} />} sx={{ height: 14, fontSize: '0.55rem' }} />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Global Activity notifications feed inside the panel */}
      <Divider sx={{ borderColor: '#1b2f54' }} />
      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.62rem' }}>
        Live System Alerts
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {notificationEvents.map((evt) => (
          <Box key={evt.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <NotificationIcon style={{ fontSize: 10, color: '#ec4899' }} />
              <Typography variant="caption" sx={{ color: '#ffffff', fontSize: '0.65rem' }}>
                {evt.text}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.58rem' }}>
              {evt.time}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: '#1b2f54' }} />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add frame feedback..."
          size="small"
          fullWidth
          InputProps={{
            sx: { fontSize: '0.72rem', color: '#ffffff', bgcolor: '#050b14' },
          }}
        />
        <Button
          size="small"
          variant="contained"
          onClick={handleAdd}
          sx={{ fontSize: '0.68rem', bgcolor: '#ec4899', color: '#ffffff', fontWeight: 'bold', '&:hover': { bgcolor: '#d92680' } }}
        >
          Post
        </Button>
      </Box>
    </Box>
  );
};

export default TimelineCommentsPanel;
