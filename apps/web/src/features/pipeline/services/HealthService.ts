import { ProjectHealth, OptimizationTip } from '@ai-video-editor/shared';
import { ValidationEngine } from './ValidationEngine';

export const HealthService = {
  async calculateHealth(): Promise<ProjectHealth> {
    const checklist = await ValidationEngine.validateProject();

    const tips: OptimizationTip[] = [];

    checklist.blockingErrors.forEach(err => {
      tips.push({
        id: Math.random().toString(),
        type: 'error',
        message: err,
        fixable: false,
        category: 'media'
      });
    });

    checklist.warnings.forEach(warn => {
      tips.push({
        id: Math.random().toString(),
        type: 'warning',
        message: warn,
        fixable: true,
        category: 'timeline'
      });
    });

    const errorPenalty = checklist.blockingErrors.length * 20;
    const warningPenalty = checklist.warnings.length * 5;
    const score = Math.max(0, 100 - errorPenalty - warningPenalty);

    return {
      score,
      warnings: checklist.warnings.length,
      errors: checklist.blockingErrors.length,
      tips,
      lastChecked: new Date().toISOString()
    };
  }
};
