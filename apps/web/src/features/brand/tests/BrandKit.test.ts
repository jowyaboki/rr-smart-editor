import { BrandService } from '../services/BrandService';
import { ThemeResolver } from '../services/ThemeResolver';
import { PaletteService } from '../services/PaletteService';

export const runBrandTests = () => {
  console.log('🚀 Starting Brand Kit Tests...');

  // 1. Create Brand Kit
  const kit = BrandService.createDefaultKit('Test Brand', 'Acme Corp');
  console.log(`Kit created: ${kit.name}, id: ${kit.id}`);

  // 2. Resolve Theme
  const theme = ThemeResolver.resolve(kit);
  console.log('Theme resolved:', theme.palette.primary);

  // 3. Palette Validation
  const isValid = PaletteService.validateContrast(theme.palette.primary, theme.palette.secondary);
  console.log('Contrast valid:', isValid);

  console.log('✅ Brand Kit Tests Completed.');
};
