import { QualityGateRule, ExecutionContextSnapshot } from './types';

export class QualityGateValidator {
  static async validateRules(
    rules: QualityGateRule[],
    context: ExecutionContextSnapshot
  ): Promise<{ passed: boolean; scores: Record<string, number>; errors: string[] }> {
    const scores: Record<string, number> = {};
    const errors: string[] = [];
    let allPassed = true;

    for (const rule of rules) {
      if (rule.type === 'automatic' && rule.handler) {
        const result = await rule.handler(context);
        if (!result.passed) {
          allPassed = false;
          errors.push(result.reason || `Quality gate '${rule.name}' failed`);
        }
        if (result.score !== undefined) {
          scores[rule.id] = result.score;
        }
      } else if (rule.type === 'asset_completeness') {
        if (rule.requiredFields) {
          for (const field of rule.requiredFields) {
            if (!context.variables[field] && !context.artifacts.some(a => a.name === field)) {
              allPassed = false;
              errors.push(`Missing required asset field '${field}' for gate '${rule.name}'`);
            }
          }
        }
      } else if (rule.type === 'scoring' && rule.minScore !== undefined) {
        const currentScore = context.variables.qualityScore || 100;
        scores[rule.id] = currentScore;
        if (currentScore < rule.minScore) {
          allPassed = false;
          errors.push(`Score ${currentScore} below required threshold ${rule.minScore} for gate '${rule.name}'`);
        }
      }
    }

    return { passed: allPassed, scores, errors };
  }
}
