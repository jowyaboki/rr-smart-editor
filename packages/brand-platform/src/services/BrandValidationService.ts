import { BrandKit, BrandScore, BrandViolation, BrandValidatorPlugin } from '../types';

export class BrandValidationService {
  private customValidators: BrandValidatorPlugin[] = [];

  public registerValidatorPlugin(validator: BrandValidatorPlugin): void {
    this.customValidators.push(validator);
  }

  /**
   * Scans a generated project composition and validates design tokens, voice parameters, logos, and fonts
   */
  public async validateProject(project: any, kit: BrandKit): Promise<BrandScore> {
    const violations: BrandViolation[] = [];

    const timeline = project.timeline || { clips: [] };
    const clips = timeline.clips || [];

    // 1. Color validation: check if all text/theme colors utilized are allowed in the palette
    clips.forEach((clip: any) => {
      if (clip.style && clip.style.color) {
        const isAllowed = kit.theme.colors.allowedColors.includes(clip.style.color);
        if (!isAllowed) {
          violations.push({
            id: `viol_color_${clip.id}`,
            category: 'color',
            severity: 'error',
            message: `Clip '${clip.name || clip.id}' uses unapproved color '${clip.style.color}'.`,
            detectedValue: clip.style.color,
            suggestedFix: `Replace color with approved brand primary: '${kit.theme.colors.primary}'`,
          });
        }
      }
    });

    // 2. Font validation: check if fonts used are approved heading or body fonts
    clips.forEach((clip: any) => {
      if (clip.style && clip.style.fontFamily) {
        const isApproved =
          clip.style.fontFamily === kit.theme.typography.headingFont ||
          clip.style.fontFamily === kit.theme.typography.bodyFont ||
          clip.style.fontFamily === kit.theme.typography.fallbackFont;
        if (!isApproved) {
          violations.push({
            id: `viol_font_${clip.id}`,
            category: 'font',
            severity: 'warning',
            message: `Clip '${clip.name || clip.id}' uses unapproved font family '${clip.style.fontFamily}'.`,
            detectedValue: clip.style.fontFamily,
            suggestedFix: `Replace font with approved brand typography: '${kit.theme.typography.bodyFont}'`,
          });
        }
      }
    });

    // 3. Logo placement rules check
    const logoClips = clips.filter((c: any) => c.type === 'logo' || c.name?.toLowerCase().includes('logo'));
    logoClips.forEach((clip: any) => {
      if (clip.style && clip.style.width && clip.style.width < kit.logos.rules.minWidthPx) {
        violations.push({
          id: `viol_logo_size_${clip.id}`,
          category: 'logo',
          severity: 'error',
          message: `Logo '${clip.name}' width (${clip.style.width}px) is below minimum allowed size of ${kit.logos.rules.minWidthPx}px.`,
          detectedValue: `${clip.style.width}px`,
          suggestedFix: `Resize logo to at least ${kit.logos.rules.minWidthPx}px to maintain clear resolution.`,
        });
      }
      if (clip.style && clip.style.placement && clip.style.placement !== kit.logos.rules.preferredPlacement) {
        violations.push({
          id: `viol_logo_placement_${clip.id}`,
          category: 'logo',
          severity: 'warning',
          message: `Logo placed in unapproved region '${clip.style.placement}'.`,
          detectedValue: clip.style.placement,
          suggestedFix: `Relocate logo to preferred placement region: '${kit.logos.rules.preferredPlacement}'`,
        });
      }
    });

    // 4. Voice check (Tonal rules)
    if (project.voiceText) {
      const text = project.voiceText.toLowerCase();
      kit.voice.prohibitedWords.forEach(word => {
        if (text.includes(word.toLowerCase())) {
          violations.push({
            id: `viol_voice_prohibited_${word}`,
            category: 'voice',
            severity: 'error',
            message: `Prohibited terminology used in text: "${word}".`,
            detectedValue: word,
            suggestedFix: 'Remove this phrasing or utilize approved alternative terms.',
          });
        }
      });
    }

    // Run pluggable custom validators
    for (const plugin of this.customValidators) {
      const customViolations = await plugin.validate(project, kit);
      violations.push(...customViolations);
    }

    // Calculate Consistency Score
    const errorsCount = violations.filter(v => v.severity === 'error').length;
    const warningsCount = violations.filter(v => v.severity === 'warning').length;
    const consistencyScore = Math.max(0, 100 - errorsCount * 15 - warningsCount * 5);

    const approvalStatus = consistencyScore > 85 ? 'approved' : consistencyScore > 65 ? 'conditional' : 'rejected';

    return {
      consistencyScore,
      violations,
      suggestedFixes: violations.map(v => v.suggestedFix),
      approvalStatus,
    };
  }
}
