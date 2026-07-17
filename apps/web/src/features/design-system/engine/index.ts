import { DesignSystemService } from '@ai-video-editor/design-system';
import { darkTheme, lightTheme, brandTheme, customTheme } from '../themes';
import { defaultIconSet } from '../icons';
import { defaultMotionPresets } from '../motion';

// Instantiate the singleton design system engine
export const webDesignSystemEngine = new DesignSystemService(
  'RR Smart Editor Web Design System',
  '1.0.0'
);

// Register default themes
webDesignSystemEngine.registerTheme(darkTheme);
webDesignSystemEngine.registerTheme(lightTheme);
webDesignSystemEngine.registerTheme(brandTheme);
webDesignSystemEngine.registerTheme(customTheme);

// Set default active theme
webDesignSystemEngine.setActiveTheme('dark-theme');

// Register default icon packs
webDesignSystemEngine.registerIconSet(defaultIconSet);

// Register default motion presets
for (const preset of Object.values(defaultMotionPresets)) {
  webDesignSystemEngine.registerMotionPreset(preset);
}
