import React from 'react';
import { Grid, Box, TextField, InputAdornment, Stack, Chip } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useTemplateStore } from '../store/templateStore';
import { TemplateCard } from './TemplateCard';

interface TemplateBrowserProps {
  onUseTemplate?: (id: string) => void;
}

export const TemplateBrowser: React.FC<TemplateBrowserProps> = ({ onUseTemplate }) => {
  const { templates, filters, setFilters, toggleFavorite, categories, selectTemplate } = useTemplateStore();

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.metadata.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || t.metadata.category === filters.category;
    const matchesFavorite = !filters.favoriteOnly || t.favorite;
    return matchesSearch && matchesCategory && matchesFavorite;
  });

  return (
    <Box>
      <Stack spacing={3}>
        <TextField
          placeholder="Search templates..."
          fullWidth
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
          }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="All"
            clickable
            color={!filters.category ? 'primary' : 'default'}
            onClick={() => setFilters({ category: null })}
          />
          {categories.map(cat => (
            <Chip
              key={cat.id}
              label={cat.name}
              clickable
              color={filters.category === cat.name ? 'primary' : 'default'}
              onClick={() => setFilters({ category: cat.name })}
            />
          ))}
        </Box>

        <Grid container spacing={3}>
          {filteredTemplates.map(template => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
              <TemplateCard
                template={template}
                onUse={(id) => {
                  if (onUseTemplate) onUseTemplate(id);
                  else selectTemplate(id);
                }}
                onToggleFavorite={toggleFavorite}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
};
