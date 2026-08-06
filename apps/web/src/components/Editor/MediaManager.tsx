import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Sync as SyncIcon,
  StarBorder as FavoriteIcon,
  FolderOpen as FolderIcon,
} from '@mui/icons-material';
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
  const [favorites, setFavorites] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        uploadMedia.mutate(file);
      });
    },
    [uploadMedia],
  );

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

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Upload Dropzone */}
      <Box
        {...getRootProps()}
        sx={{
          p: 2,
          mb: 2,
          border: '2px dashed #1b2f54',
          borderRadius: '8px',
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'rgba(0, 240, 255, 0.05)' : 'transparent',
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: 'rgba(0, 240, 255, 0.03)',
            borderColor: '#00f0ff',
          },
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 32, color: '#94a3b8', mb: 1 }} />
        <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
          {isDragActive ? 'Drop assets now' : 'Drag or click to import files'}
        </Typography>
      </Box>

      {/* Collections Sub-header */}
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, overflowX: 'auto', pb: 0.5 }}>
        <Chip
          label="All Assets"
          size="small"
          icon={<FolderIcon style={{ fontSize: '12px' }} />}
          sx={{ bgcolor: '#12203d', color: '#ffffff', fontSize: '0.65rem', fontWeight: 'bold' }}
        />
        <Chip
          label="Favorites"
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.03)', color: '#94a3b8', fontSize: '0.65rem' }}
        />
        <Chip
          label="AI Summaries"
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.03)', color: '#94a3b8', fontSize: '0.65rem' }}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={24} color="primary" />
        </Box>
      ) : (
        <Grid container spacing={1.5} sx={{ overflowY: 'auto', flexGrow: 1 }}>
          {media?.map((item) => {
            const isFav = favorites.includes(item.id);
            return (
              <Grid item xs={6} key={item.id}>
                <Card
                  sx={{
                    bgcolor: '#0d1527',
                    border: '1px solid #1b2f54',
                    borderRadius: '6px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: '#00f0ff',
                      boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)',
                    },
                  }}
                  onClick={() => handleMediaClick(item)}
                >
                  {/* Sync status badges / Hover controls */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      zIndex: 2,
                      display: 'flex',
                      gap: 0.5,
                    }}
                  >
                    <Tooltip title={isFav ? 'Remove Favorite' : 'Mark Favorite'}>
                      <IconButton
                        size="small"
                        onClick={(e) => toggleFavorite(e, item.id)}
                        sx={{
                          p: 0.25,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          color: isFav ? '#f59e0b' : '#94a3b8',
                          '&:hover': { color: '#f59e0b', bgcolor: 'rgba(0,0,0,0.8)' },
                        }}
                      >
                        <FavoriteIcon style={{ fontSize: '10px' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Synced with Cloud Storage">
                      <Box
                        sx={{
                          p: 0.25,
                          bgcolor: 'rgba(0,0,0,0.5)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <SyncIcon style={{ fontSize: '10px', color: '#10b981' }} />
                      </Box>
                    </Tooltip>
                  </Box>

                  <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: '#050b14' }}>
                    {item.type === 'image' ? (
                      <CardMedia
                        component="img"
                        image={`${API_URL}${item.url}`}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : item.type === 'video' ? (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <video
                          src={`${API_URL}${item.url}`}
                          muted
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FileIcon sx={{ fontSize: 32, color: '#10b981' }} />
                      </Box>
                    )}
                  </Box>
                  <CardContent sx={{ p: '8px !important', bgcolor: '#0d1527' }}>
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{
                        display: 'block',
                        fontWeight: 'bold',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: '#94a3b8', fontSize: '0.62rem', textTransform: 'uppercase' }}
                      >
                        {item.type}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: '#10b981', fontSize: '0.62rem', fontWeight: 'bold' }}
                      >
                        {(item.size / 1024 / 1024).toFixed(1)} MB
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default MediaManager;
