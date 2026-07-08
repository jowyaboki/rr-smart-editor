import React from 'react';
import { Box, TextField, InputAdornment, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { Search as SearchIcon, Favorite as FavoriteIcon } from '@mui/icons-material';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  favoriteOnly: boolean;
  onFavoriteToggle: (val: boolean) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, favoriteOnly, onFavoriteToggle }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <TextField
        placeholder="Search projects..."
        fullWidth
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <ToggleButtonGroup
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
