import { TextEngine } from '../engine/TextEngine';
import { TypographyService } from '../services/TypographyService';

export const runTextTests = () => {
  console.log('🚀 Starting Text Engine Tests...');

  // 1. Create Object
  const textObj = TypographyService.createDefaultObject('Hello World');
  console.log(`Text object created: "${textObj.content}"`);

  // 2. Get Styles
  const styles = TextEngine.getStyleObject(textObj);
  console.log('Style object generated, font-size:', styles.fontSize);

  if (styles.fontSize !== '48px') {
    throw new Error('Default font size mismatch');
  }

  // 3. Test Alignment mapping
  textObj.layout.textAlign = 'center';
  textObj.layout.verticalAlign = 'middle';
  const layoutStyles = TextEngine.getStyleObject(textObj);
  console.log('Layout alignment (CSS):', layoutStyles.textAlign, layoutStyles.alignItems, layoutStyles.justifyContent);

  console.log('✅ Text Engine Tests Completed.');
};
