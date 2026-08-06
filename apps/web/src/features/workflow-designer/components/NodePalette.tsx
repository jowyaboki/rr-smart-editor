import React, { useState } from 'react';
import { listPaletteNodeTypes } from '../palette';
import { Box, Typography, TextField, List, ListItem, ListItemText, Chip, Tooltip } from '@mui/material';
import { HelpOutline as HelpIcon, ArrowForward as ArrowIcon } from '@mui/icons-material';

export const NodePalette: React.FC = () => {
  const nodeTypes = listPaletteNodeTypes();
  const [query, setQuery] = useState('');

  const filtered = nodeTypes.filter(node =>
    node.label.toLowerCase().includes(query.toLowerCase()) ||
    node.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: '#0d1527', border: '1px solid #1b2f54', borderRadius: '6px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Node Palette & Adapters
        </Typography>
        <Chip label="Compatible" size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 'bold' }} />
      </Box>

      <TextField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter visual Blueprint nodes..."
        size="small"
        fullWidth
        InputProps={{
          sx: { fontSize: '0.72rem', color: '#ffffff', bgcolor: '#050b14' }
        }}
      />

      {/* Expose existing platform capabilities (Timeline, AI, Renders, Color, Audio) as reusable nodes */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: '200px', overflowY: 'auto' }}>
        {filtered.map((node) => (
          <Tooltip key={node.type} title={`Orchestrates standard ${node.category} service module.`}>
            <Box
              sx={{
                p: 1,
                borderRadius: '4px',
                bgcolor: '#12203d',
                border: '1px solid #1b2f54',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'grab',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: '#00f0ff',
                  bgcolor: 'rgba(0, 240, 255, 0.03)'
                }
              }}
            >
              <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.72rem' }}>
                {node.label}
              </Typography>
              <Chip
                label={node.category}
                size="small"
                sx={{
                  height: 14,
                  fontSize: '0.55rem',
                  bgcolor: '#050b14',
                  color: '#00f0ff',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
              />
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};
export default NodePalette;
