import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import { BatchItem } from '@ai-video-editor/shared';

interface BatchItemGridProps {
  items: BatchItem[];
}

export const BatchItemGrid: React.FC<BatchItemGridProps> = ({ items }) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Resolved Variables</TableCell>
            <TableCell>Error</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell variant="caption">{item.id.slice(0, 8)}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={item.status}
                  color={item.status === 'completed' ? 'success' : item.status === 'failed' ? 'error' : 'default'}
                />
              </TableCell>
              <TableCell>
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                  {JSON.stringify(item.resolvedVariables)}
                </Typography>
              </TableCell>
              <TableCell color="error">
                <Typography variant="caption" color="error">{item.error}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
