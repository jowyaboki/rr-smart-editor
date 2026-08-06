import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Divider, Chip, IconButton } from '@mui/material';
import { useReviewComments } from '../hooks/useReviewComments';
import { CheckCircle as CheckIcon, Pending as PendingIcon, Star as StarIcon, Close as CloseIcon } from '@mui/icons-material';

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

  return (
    <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#0d1527', border: '1px solid #1b2f54', borderRadius: '6px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Frame Annotations & Review Checklist
        </Typography>
        <Chip
          label={`${activeComments.length} Pending`}
          size="small"
          sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 'bold' }}
        />
      </Box>

      {/* Drawing note instruction */}
      <Box sx={{ p: 1, borderRadius: '4px', bgcolor: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
        <Typography variant="caption" sx={{ color: '#00f0ff', fontSize: '0.62rem', display: 'block', lineHeight: 1.3 }}>
          💡 Review Instruction: Draw directly on composition preview frames to overlay redline comments. Version comparison active.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: '200px', overflowY: 'auto' }}>
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
