import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Stack,
  CircularProgress,
  Divider,
  Avatar
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as UserIcon,
  DeleteSweep as ClearIcon
} from '@mui/icons-material';
import { useAIStore } from '../store/aiStore';

export const AIChatPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isStreaming, clearHistory } = useAIStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>AI Creative Studio</Typography>
        <IconButton size="small" onClick={clearHistory} title="Clear history"><ClearIcon fontSize="small" /></IconButton>
      </Box>

      <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        <Stack spacing={2}>
          {messages.map((msg) => (
            <Box key={msg.id} sx={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <Paper
                sx={{
                  p: 1.5,
                  bgcolor: msg.role === 'user' ? 'primary.dark' : 'background.default',
                  borderRadius: 2,
                  position: 'relative'
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Typography>
              </Paper>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                {msg.role === 'user' ? 'You' : 'Assistant'}
              </Typography>
            </Box>
          ))}
          {isStreaming && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <BotIcon fontSize="small" color="primary" />
              <CircularProgress size={12} />
            </Box>
          )}
        </Stack>
      </Box>

      <Box sx={{ p: 2, borderTop: '1px solid #333' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Ask AI to help with your video..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          InputProps={{
            endAdornment: (
              <IconButton onClick={handleSend} disabled={!input.trim() || isStreaming}>
                <SendIcon />
              </IconButton>
            ),
          }}
        />
      </Box>
    </Box>
  );
};
