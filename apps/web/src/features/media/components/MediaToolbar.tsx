import React from 'react';
import { Box, TextField, InputAdornment, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Search as SearchIcon, Favorite as FavoriteIcon, GridView as GridIcon, List as ListIcon } from '@mui/icons-material';

interface MediaToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  favoriteOnly: boolean;
  onFavoriteToggle: (val: boolean) => void;
}

export const MediaToolbar: React.FC<MediaToolbarProps> = ({ search, onSearchChange, favoriteOnly, onFavoriteToggle }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
      <TextField
        placeholder="Search library..."
        size="small"
        fullWidth
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <ToggleButtonGroup
        size="small"
        value={favoriteOnly ? 'favorites' : ''}
        exclusive
        onChange={(e, val) => onFavoriteToggle(val === 'favorites')}
      >
        <ToggleButton value="favorites">
          <FavoriteIcon color={favoriteOnly ? 'error' : 'inherit'} />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
