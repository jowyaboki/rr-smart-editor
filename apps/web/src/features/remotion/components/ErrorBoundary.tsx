import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RemotionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Remotion Engine Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Box sx={{ p: 3, bgcolor: 'error.dark', color: 'white', borderRadius: 1 }}>
          <Typography variant="h6">Rendering Error</Typography>
          <Typography variant="body2">{this.state.error?.message}</Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}
