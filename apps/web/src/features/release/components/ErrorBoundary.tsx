import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering crash:', error, errorInfo);
  }

  private handleReset = () => {
    // Clear potentially corrupted workspace parameters and reload
    localStorage.removeItem('rr_active_renders_');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            bgcolor: '#0a1929',
            p: 3,
          }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 4,
              maxWidth: 500,
              textAlign: 'center',
              bgcolor: '#102031',
              color: 'white',
              border: '1px solid #1a365d',
            }}
          >
            <ErrorOutline color="error" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              Editor Render Crash Detected
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              An unexpected error occurred while rendering the workspace layout:{' '}
              {this.state.error?.message || 'Unknown render context exception.'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Refresh />}
              onClick={this.handleReset}
              sx={{ textTransform: 'none' }}
            >
              Reset & Recover Editor
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
