import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Add as AddIcon,
  ColorLens as PaletteIcon,
  TextFields as FontIcon,
  Image as LogoIcon,
  Brush as StyleIcon
} from '@mui/icons-material';
import { useBrandStore } from '../store/brandStore';
import { PaletteEditor } from '../components/PaletteEditor';
import { BrandService } from '../services/BrandService';

export const BrandKitPage: React.FC = () => {
  const { brandKits, addBrandKit, activeBrandKitId, setActiveBrandKit } = useBrandStore();
  const [tabValue, setTabValue] = useState(0);

  const activeKit = brandKits.find(k => k.id === activeBrandKitId);

  const handleCreateKit = () => {
    const newKit = BrandService.createDefaultKit('New Brand Kit', 'My Company');
    addBrandKit(newKit);
    setActiveBrandKit(newKit.id);
  };

  return (
    <Box sx={{ p: 4, height: '100%', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Brand Kits</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateKit}
        >
          New Brand Kit
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={3}>
          <Typography variant="h6" gutterBottom>Your Brands</Typography>
          <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
            {brandKits.map((kit) => (
              <ListItem
                button
                key={kit.id}
                selected={kit.id === activeBrandKitId}
                onClick={() => setActiveBrandKit(kit.id)}
              >
                <ListItemText primary={kit.name} secondary={kit.companyName} />
              </ListItem>
            ))}
          </List>
        </Grid>

        <Grid item xs={12} md={9}>
          {activeKit ? (
            <Card>
              <CardContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                  <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                    <Tab icon={<PaletteIcon />} label="Palettes" iconPosition="start" />
                    <Tab icon={<LogoIcon />} label="Logos" iconPosition="start" />
                    <Tab icon={<FontIcon />} label="Fonts" iconPosition="start" />
                    <Tab icon={<StyleIcon />} label="Styles" iconPosition="start" />
                  </Tabs>
                </Box>

                {tabValue === 0 && (
                  <Box>
                    {activeKit.palettes.map(p => (
                      <PaletteEditor
                        key={p.id}
                        palette={p}
                        onUpdate={(updates) => {
                          // Handle palette update
                        }}
                      />
                    ))}
                    <Button startIcon={<AddIcon />}>Add Palette</Button>
                  </Box>
                )}

                {tabValue === 1 && <Typography>Logo Manager Placeholder</Typography>}
                {tabValue === 2 && <Typography>Font Manager Placeholder</Typography>}
                {tabValue === 3 && <Typography>Style Config Placeholder</Typography>}
              </CardContent>
            </Card>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography color="text.secondary">Select a brand kit or create a new one to get started.</Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
