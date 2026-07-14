import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Chip,
  MenuItem,
  Select,
} from '@mui/material';
import { AddComment, Reply, Check, Undo, Search } from '@mui/icons-material';
import { useCollaboration } from '../hooks/useCollaboration';

interface Props {
  projectId: string;
}

export const CommentsPanel: React.FC<Props> = ({ projectId }) => {
  const { threads, addThread, addReply, resolveThread, reopenThread, filters, setFilters } =
    useCollaboration(projectId);

  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewContent] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const handleCreateThread = () => {
    if (!newTitle || !newComment) return;
    addThread({
      targetType: 'project',
      targetId: projectId,
      title: newTitle,
      authorId: 'user_editor',
      authorName: 'Local Editor',
      content: newComment,
    });
    setNewTitle('');
    setNewContent('');
  };

  const handleAddReply = (threadId: string) => {
    const text = replyInputs[threadId];
    if (!text) return;
    addReply(threadId, 'user_editor', 'Local Editor', text);
    setReplyInputs((prev) => ({ ...prev, [threadId]: '' }));
  };

  const getStatusColor = (resolved: boolean) => (resolved ? 'success' : 'warning');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      {/* Thread Creation Form */}
      <Paper
        sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Start Review Thread
        </Typography>
        <TextField
          size="small"
          fullWidth
          label="Thread Title (e.g. Intro review)"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          sx={{ mb: 1.5 }}
        />
        <TextField
          size="small"
          fullWidth
          multiline
          rows={2}
          label="What requires attention? (Use @mentions)"
          value={newComment}
          onChange={(e) => setNewContent(e.target.value)}
          sx={{ mb: 1.5 }}
        />
        <Button
          size="small"
          variant="contained"
          startIcon={<AddComment />}
          onClick={handleCreateThread}
          fullWidth
          disabled={!newTitle || !newComment}
        >
          Post Thread
        </Button>
      </Paper>

      {/* Filter panel */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search comments..."
          value={filters.searchQuery}
          onChange={(e) => setFilters({ searchQuery: e.target.value })}
          InputProps={{
            startAdornment: <Search style={{ fontSize: 16, marginRight: 6 }} />,
          }}
          sx={{ flexGrow: 1 }}
        />
        <Select
          size="small"
          value={filters.status || 'all'}
          onChange={(e) => setFilters({ status: e.target.value as any })}
          sx={{ width: 110, fontSize: '0.8rem' }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="unresolved">Open</MenuItem>
          <MenuItem value="resolved">Resolved</MenuItem>
        </Select>
      </Box>

      {/* Thread List */}
      <Box
        sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        {threads.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No threads match filters.
            </Typography>
          </Box>
        ) : (
          threads.map((thread) => (
            <Paper
              key={thread.id}
              sx={{
                p: 2,
                bgcolor: thread.resolved ? 'rgba(0,0,0,0.1)' : 'background.paper',
                border: '1px solid',
                borderColor: thread.resolved ? 'success.dark' : 'divider',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {thread.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip
                    label={thread.resolved ? 'RESOLVED' : 'OPEN'}
                    size="small"
                    color={getStatusColor(thread.resolved) as any}
                    sx={{ fontSize: '0.6rem', height: 18 }}
                  />
                  {thread.resolved ? (
                    <Tooltip title="Reopen Thread">
                      <IconButton size="small" onClick={() => reopenThread(thread.id)}>
                        <Undo sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Resolve Thread">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => resolveThread(thread.id, 'Local Editor')}
                      >
                        <Check sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              <List dense sx={{ pl: 0 }}>
                {thread.comments.map((comment) => (
                  <ListItem key={comment.id} sx={{ px: 0, alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 'bold', color: 'primary.light' }}
                        >
                          {comment.authorName} • {new Date(comment.createdAt).toLocaleTimeString()}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          color="text.primary"
                          sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}
                          dangerouslySetInnerHTML={{
                            __html: comment.content.replace(
                              /@(\w+)/g,
                              '<span style="color: #90caf9; font-weight: bold;">@$1</span>',
                            ),
                          }}
                        />
                      }
                    />
                  </ListItem>
                ))}
              </List>

              {!thread.resolved && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                  <TextField
                    size="small"
                    placeholder="Reply to thread..."
                    value={replyInputs[thread.id] || ''}
                    onChange={(e) =>
                      setReplyInputs((prev) => ({ ...prev, [thread.id]: e.target.value }))
                    }
                    sx={{ flexGrow: 1 }}
                  />
                  <IconButton color="primary" onClick={() => handleAddReply(thread.id)}>
                    <Reply />
                  </IconButton>
                </Box>
              )}
            </Paper>
          ))
        )}
      </Box>
    </Box>
  );
};
