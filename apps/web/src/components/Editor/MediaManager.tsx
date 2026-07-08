import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { CloudUpload as UploadIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';
import { useMedia, useUploadMedia } from '@/hooks/useMedia';
import { useTimelineStore } from '@/store/useTimelineStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface MediaManagerProps {
  projectId: string;
}

const MediaManager: React.FC<MediaManagerProps> = ({ projectId }) => {
  const { data: media, isLoading } = useMedia(projectId);
  const uploadMedia = useUploadMedia(projectId);
  const addClip = useTimelineStore((state) => state.addClip);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      uploadMedia.mutate(file);
    });
  }, [uploadMedia]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleMediaClick = (item: any) => {
    addClip('v1', {
      name: item.name,
      type: item.type === 'image' ? 'image' : item.type === 'video' ? 'video' : 'audio',
      start: 0,
      duration: item.duration ? Math.round(item.duration * 30) : 150,
      mediaId: item.id,
      url: `${API_URL}${item.url}`,
    });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        {...getRootProps()}
        sx={{
          p: 2,
          mb: 2,
          border: '2px dashed #333',
          borderRadius: 2,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'transparent',
          '&:hover': { bgcolor: 'action.hover' }
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {isDragActive ? 'Drop files here' : 'Drag & drop or click to upload'}
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} /></Box>
      ) : (
        <Grid container spacing={1} sx={{ overflowY: 'auto', flexGrow: 1 }}>
          {media?.map((item) => (
            <Grid item xs={6} key={item.id}>
              <Card
                sx={{ bgcolor: 'background.default', cursor: 'pointer', '&:hover': { outline: '2px solid primary.main' } }}
                onClick={() => handleMediaClick(item)}
              >
                <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: '#000' }}>
                  {item.type === 'image' ? (
                    <CardMedia
                      component="img"
                      image={`${API_URL}${item.url}`}
                      sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : item.type === 'video' ? (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <video src={`${API_URL}${item.url}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </Box>
                  ) : (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileIcon sx={{ fontSize: 40 }} />
                    </Box>
                  )}
                </Box>
                <CardContent sx={{ p: '8px !important' }}>
                  <Typography variant="caption" noWrap sx={{ display: 'block' }}>{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.type.toUpperCase()} • {(item.size / 1024 / 1024).toFixed(1)} MB
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MediaManager;
