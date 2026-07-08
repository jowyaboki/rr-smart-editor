import { PresetService } from '../services/PresetService';

export const usePresets = () => {
  return {
    presets: PresetService.getPresets(),
  };
};
