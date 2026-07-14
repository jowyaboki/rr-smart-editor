import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider
} from '@mui/material';
import {
  Folder as FolderIcon,
  CreateNewFolder as AddFolderIcon,
  Delete as DeleteIcon,
  AllInbox as AllIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useFolders } from '../hooks/useFolders';

export const MediaSidebar: React.FC = () => {
  const { folders, createFolder, deleteFolder, selectedFolderId } = useFolders();

  return (
    <Box sx={{ width: 240, borderRight: '1px solid #333', height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2">Library</Typography>
        <IconButton size="small" onClick={() => {
          const name = prompt('Folder name:');
          if (name) createFolder(name);
        }}>
          <AddFolderIcon fontSize="small" />
        </IconButton>
      </Box>
      <Divider />
      <List dense>
        <ListItem selected={!selectedFolderId}>
          <ListItemIcon><AllIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="All Assets" />
        </ListItem>
        <ListItem>
          <ListItemIcon><StarIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primary="Favorites" />
        </ListItem>
      </List>
      <Divider sx={{ my: 1 }} />
      <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>Folders</Typography>
      <List dense>
        {folders.map(folder => (
          <ListItem
            key={folder.id}
            selected={selectedFolderId === folder.id}
          >
            <ListItemIcon><FolderIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary={folder.name} />
            <IconButton size="small" onClick={() => deleteFolder(folder.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
