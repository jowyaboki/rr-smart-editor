import React, { useState } from 'react';
import { Box, Typography, TextField, List, ListItem, ListItemText, Divider, Chip, Button } from '@mui/material';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { Book as BookIcon, Keyboard as KeyboardIcon, AutoAwesome as TutorialIcon } from '@mui/icons-material';

export const KnowledgeHub: React.FC = () => {
  const { searchArticles } = useWorkflowStore();
  const [query, setQuery] = useState('');

  const filtered = searchArticles(query);

  const popularShortcuts = [
    { keys: 'Ctrl + K', desc: 'Fuzzy command launcher' },
    { keys: 'Space', desc: 'Toggle timeline player' },
    { keys: 'Ctrl + L', desc: 'Lock active workspaces layout' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2.5 }}>
      {/* 1. In-context search input */}
      <Box sx={{ p: 1 }}>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Knowledge Hub & tutorials..."
          size="small"
          fullWidth
          InputProps={{
            sx: { fontSize: '0.72rem', color: '#ffffff', bgcolor: '#050b14' }
          }}
        />
      </Box>

      {/* 2. Popular hotkeys reference list */}
      <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <KeyboardIcon sx={{ color: '#00f0ff', fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Popular Editor Shortcuts
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {popularShortcuts.map((sc, idx) => (
            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.65rem' }}>{sc.desc}</Typography>
              <Chip label={sc.keys} size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: '#050b14', color: '#00f0ff', fontWeight: 'bold' }} />
            </Box>
          ))}
        </Box>
      </Box>

      {/* 3. Compiled tutorials and best practices */}
      <Box sx={{ p: 1.5, border: '1px solid #1b2f54', borderRadius: '6px', bgcolor: '#0d1527', overflowY: 'auto', flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <BookIcon sx={{ color: '#00f0ff', fontSize: 16 }} />
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Interactive Tutorials & Guides
          </Typography>
        </Box>

        {filtered.length === 0 ? (
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', textAlign: 'center', py: 3 }}>
            No articles match your query.
          </Typography>
        ) : (
          <List sx={{ p: 0 }}>
            {filtered.map(art => (
              <ListItem
                key={art.id}
                dense
                sx={{
                  bgcolor: 'rgba(255,255,255,0.01)',
                  mb: 1,
                  borderRadius: '4px',
                  border: '1px solid #1b2f54',
                  '&:hover': { borderColor: '#00f0ff', bgcolor: 'rgba(0,240,255,0.02)' }
                }}
              >
                <ListItemText
                  primary={art.title}
                  secondary={art.content}
                  primaryTypographyProps={{ fontSize: '0.72rem', fontWeight: 'bold', color: '#00f0ff' }}
                  secondaryTypographyProps={{ fontSize: '0.62rem', color: '#94a3b8', sx: { mt: 0.5, lineHeight: 1.3 } }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};
export default KnowledgeHub;
