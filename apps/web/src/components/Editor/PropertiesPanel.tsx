import React, { useState } from 'react';
import { Box, Typography, Divider, Button, Slider, IconButton, TextField, Chip, Tooltip } from '@mui/material';
import { PropertyGrid, SearchBar, StatusBadge } from '@ai-video-editor/ui';
import { useTimelineStore } from '../../store/useTimelineStore';
import { useWorkflowStore } from '../../store/useWorkflowStore';

const PropertiesPanel: React.FC = () => {
  const { tracks } = useTimelineStore();
  const { recentPropertiesEdited, recordPropertyEdit } = useWorkflowStore();
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>(['Opacity']);
  const [advancedMode, setAdvancedMode] = useState(false);

  const [opacity, setOpacity] = useState(100);
  const [scale, setScale] = useState(100);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [volume, setVolume] = useState(0); // dB scale

  const handleReset = () => {
    setOpacity(100);
    setScale(100);
    setPositionX(0);
    setPositionY(0);
    setVolume(0);
  };

  const toggleFavorite = (property: string) => {
    setFavorites(prev =>
      prev.includes(property) ? prev.filter(p => p !== property) : [...prev, property]
    );
  };

  const propertiesList = [
    {
      category: 'Transform',
      name: 'Opacity',
      element: (
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Slider
            size="small"
            value={opacity}
            onChange={(e, v) => {
              setOpacity(v as number);
              recordPropertyEdit('Opacity');
            }}
            min={0}
            max={100}
            sx={{ flexGrow: 1 }}
          />
          <Typography variant="caption">{opacity}%</Typography>
        </Box>
      ),
    },
    {
      category: 'Transform',
      name: 'Scale',
      element: (
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Slider
            size="small"
            value={scale}
            onChange={(e, v) => {
              setScale(v as number);
              recordPropertyEdit('Scale');
            }}
            min={1}
            max={500}
            sx={{ flexGrow: 1 }}
          />
          <Typography variant="caption">{scale}%</Typography>
        </Box>
      ),
    },
    {
      category: 'Transform',
      name: 'Position X',
      element: (
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Slider
            size="small"
            value={positionX}
            onChange={(e, v) => {
              setPositionX(v as number);
              recordPropertyEdit('Position X');
            }}
            min={-1920}
            max={1920}
            sx={{ flexGrow: 1 }}
          />
          <Typography variant="caption">{positionX}px</Typography>
        </Box>
      ),
    },
    {
      category: 'Transform',
      name: 'Position Y',
      element: (
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Slider
            size="small"
            value={positionY}
            onChange={(e, v) => {
              setPositionY(v as number);
              recordPropertyEdit('Position Y');
            }}
            min={-1080}
            max={1080}
            sx={{ flexGrow: 1 }}
          />
          <Typography variant="caption">{positionY}px</Typography>
        </Box>
      ),
    },
    {
      category: 'Audio Level',
      name: 'Fader Volume',
      element: (
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Slider
            size="small"
            value={volume}
            onChange={(e, v) => {
              setVolume(v as number);
              recordPropertyEdit('Fader Volume');
            }}
            min={-60}
            max={12}
            sx={{ flexGrow: 1 }}
          />
          <Typography variant="caption">{volume > 0 ? `+${volume}` : volume} dB</Typography>
        </Box>
      ),
    },
  ];

  const filteredProperties = propertiesList.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const favoriteProps = filteredProperties.filter((p) => favorites.includes(p.name));
  const generalProps = filteredProperties.filter((p) => !favorites.includes(p.name));

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0d1527',
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #1b2f54', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.72rem', letterSpacing: '0.5px' }}>
              Predictive Inspector
            </Typography>
            <StatusBadge status="success" label="Active" />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant={advancedMode ? 'contained' : 'outlined'}
              onClick={() => setAdvancedMode(!advancedMode)}
              sx={{ fontSize: '0.65rem', py: 0.25, px: 1, height: '24px' }}
            >
              {advancedMode ? 'Advanced' : 'Simple'}
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={handleReset}
              sx={{ fontSize: '0.65rem', py: 0.25, px: 1, height: '24px' }}
            >
              Reset All
            </Button>
          </Box>
        </Box>

        <SearchBar value={search} onChange={setSearch} placeholder="Filter clip attributes..." />
      </Box>

      {/* Frequently / Recently edited properties history */}
      {recentPropertiesEdited.length > 0 && (
        <Box sx={{ px: 2, pt: 1, pb: 0.5, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.6rem', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Recently Modified:
          </Typography>
          {recentPropertiesEdited.map((p, idx) => (
            <Chip key={idx} label={p} size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: '#12203d', color: '#00f0ff' }} />
          ))}
        </Box>
      )}

      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {favoriteProps.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', display: 'block', mb: 1.5, textTransform: 'uppercase', fontSize: '0.65rem' }}>
              ⭐ Pinned Favorites
            </Typography>
            <PropertyGrid
              properties={favoriteProps.map((p) => ({
                label: p.name,
                value: (
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
                    {p.element}
                    <IconButton size="small" onClick={() => toggleFavorite(p.name)} sx={{ p: 0.25, color: '#f59e0b' }}>
                      ★
                    </IconButton>
                  </Box>
                ),
              }))}
            />
            <Divider sx={{ my: 2, borderColor: '#1b2f54' }} />
          </Box>
        )}

        {generalProps.length > 0 ? (
          <Box>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 'bold', display: 'block', mb: 1.5, textTransform: 'uppercase', fontSize: '0.65rem' }}>
              ⚡ General parameters
            </Typography>
            <PropertyGrid
              properties={generalProps.map((p) => ({
                label: p.name,
                value: (
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1 }}>
                    {p.element}
                    <IconButton size="small" onClick={() => toggleFavorite(p.name)} sx={{ p: 0.25, color: '#94a3b8', '&:hover': { color: '#f59e0b' } }}>
                      ☆
                    </IconButton>
                  </Box>
                ),
              }))}
            />
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', textAlign: 'center', py: 3 }}>
            No matching settings.
          </Typography>
        )}

        {/* Enterprise governance / workspace permissions visualization */}
        <Box sx={{ mt: 3, p: 1.5, border: '1px solid #1b2f54', borderRadius: '4px', bgcolor: 'rgba(0,0,0,0.15)' }}>
          <Typography variant="caption" color="secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1, fontSize: '0.65rem', textTransform: 'uppercase' }}>
            🔐 Enterprise Governance & Permissions
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>User Role</Typography>
            <Typography variant="caption" sx={{ color: '#00f0ff', fontWeight: 'bold' }}>Manager (Read/Write/Delete)</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>ABAC Boundary Audit</Typography>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>Verified (SOC2 compliant)</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>Lifecycle state</Typography>
            <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>Active (Retention: 7 Yrs)</Typography>
          </Box>
        </Box>

        {advancedMode && (
          <Box sx={{ mt: 3, p: 1.5, border: '1px solid #1b2f54', borderRadius: '4px', bgcolor: 'rgba(0,0,0,0.15)' }}>
            <Typography variant="caption" color="secondary" sx={{ fontWeight: 'bold', display: 'block', mb: 1, fontSize: '0.65rem', textTransform: 'uppercase' }}>
              🛠️ Technical Metadata / Warnings
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', lineHeight: 1.4 }}>
              Composition Frame Rate: 30.00 FPS<br />
              Video Aspect Ratio: 16:9 widescreen (1920x1080)<br />
              Render Driver: WebGL Acceleration enabled<br />
              Compliance audit status: <Typography component="span" variant="caption" sx={{ color: '#10b981', fontWeight: 'bold' }}>Passed (100%)</Typography>
            </Typography>
          </Box>
        )}
      </Box>

      {/* Inline Documentation & AI explanations */}
      <Box sx={{ p: 1.5, borderTop: '1px solid #1b2f54', bgcolor: '#050b14' }}>
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.68rem', fontStyle: 'italic', lineHeight: 1.3 }}>
          💡 AI Explanation: Opacity scales determine standard pixel alpha overlay bounds. Easing maps frame transitions smoothly.
        </Typography>
      </Box>
    </Box>
  );
};

export default PropertiesPanel;
