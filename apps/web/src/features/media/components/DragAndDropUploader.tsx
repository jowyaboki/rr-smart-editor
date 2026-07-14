import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography } from '@mui/material';
import { CloudUpload as UploadIcon } from '@mui/icons-material';

interface DragAndDropUploaderProps {
  onUpload: (files: File[]) => void;
}

export const DragAndDropUploader: React.FC<DragAndDropUploaderProps> = ({ onUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Box
      {...getRootProps()}
      sx={{
        p: 4,
        border: '2px dashed #333',
        borderRadius: 2,
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: isDragActive ? 'action.hover' : 'transparent',
        '&:hover': { bgcolor: 'action.hover' },
        transition: 'background-color 0.2s'
      }}
    >
      <input {...getInputProps()} />
      <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6">Import Media</Typography>
      <Typography variant="body2" color="text.secondary">
        Drag & drop files or folders here, or click to browse
      </Typography>
    </Box>
  );
};
