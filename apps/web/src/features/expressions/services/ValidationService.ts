import { ExpressionEngine } from './ExpressionEngine';
import { DependencyResolver } from './DependencyResolver';
import { ExpressionError } from '@ai-video-editor/expression-engine';

export class ValidationService {
  /**
   * Validates a single expression's syntax and custom rules.
   */
  public static validateExpression(code: string): ExpressionError | null {
    return ExpressionEngine.validate(code);
  }

  /**
   * Checks a set of expressions for circular references.
   * Returns a list of error messages.
   */
  public static validateExpressionsSet(expressions: Record<string, string>): string[] {
    const errors: string[] = [];

    // Check syntax of each
    for (const [id, code] of Object.entries(expressions)) {
      const err = this.validateExpression(code);
      if (err) {
        errors.push(`Syntax error in [${id}]: ${err.message}`);
      }
    }

    // Check for cycles
    try {
      DependencyResolver.buildGraph(expressions);
      if (DependencyResolver.hasCycle()) {
        errors.push('Circular reference detected among expressions');
      }
    } catch (err: any) {
      errors.push(err.message || 'Circular reference check failed');
    }

    return errors;
  }
}
