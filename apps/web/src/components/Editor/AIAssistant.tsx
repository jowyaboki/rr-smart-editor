import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  CircularProgress,
  Divider,
  Grid
} from '@mui/material';
import {
  AutoAwesome as AIIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  Mic as VoiceIcon
} from '@mui/icons-material';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AIAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerateScript = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setResult(data.script);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AIIcon fontSize="small" color="primary" /> AI Assistant
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Stack spacing={2}>
        <TextField
          label="What are you making?"
          multiline
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A 30-second promo for a futuristic coffee machine"
          fullWidth
          size="small"
        />

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TextIcon />}
              size="small"
              onClick={handleGenerateScript}
              disabled={loading || !prompt}
            >
              Script
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant="outlined" startIcon={<ImageIcon />} size="small" disabled={loading}>
              Images
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant="outlined" startIcon={<VoiceIcon />} size="small" disabled={loading}>
              Voice
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button fullWidth variant="outlined" startIcon={<AIIcon />} size="small" disabled={loading}>
              Full Video
            </Button>
          </Grid>
        </Grid>

        {loading && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} /></Box>}

        {result && (
          <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.default' }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>Generated Result:</Typography>
            <Typography variant="body2">{result}</Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};

export default AIAssistant;
