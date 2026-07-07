import React from 'react';
import { Typography, Grid, Paper, Box } from '@mui/material';

const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 240, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">Recent Projects</Typography>
            <Typography color="text.secondary" sx={{ flex: 1, mt: 2 }}>
              Your recent video projects will appear here.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 240, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6">Quick Stats</Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">Total Videos: 0</Typography>
              <Typography variant="body2">Storage Used: 0%</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
