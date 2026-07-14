import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import {
  BarChart as BarIcon,
  Timeline as LineIcon,
  PieChart as PieIcon,
  DonutLarge as DonutIcon
} from '@mui/icons-material';

export const ChartPresetPicker: React.FC = () => {
  const types = [
    { id: 'bar', name: 'Bar Chart', icon: <BarIcon /> },
    { id: 'line', name: 'Line Chart', icon: <LineIcon /> },
    { id: 'pie', name: 'Pie Chart', icon: <PieIcon /> },
    { id: 'donut', name: 'Donut Chart', icon: <DonutIcon /> }
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>Add Chart</Typography>
      <Grid container spacing={1}>
        {types.map(t => (
          <Grid item xs={6} key={t.id}>
            <Card
              sx={{
                cursor: 'pointer', textAlign: 'center',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
              }}
            >
              <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                {t.icon}
                <Typography variant="caption" display="block">{t.name}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
