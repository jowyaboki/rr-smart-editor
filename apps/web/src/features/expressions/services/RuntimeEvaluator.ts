import { ExpressionEngine } from './ExpressionEngine';

export class RuntimeEvaluator {
  /**
   * Evaluates a single expression code string with given variable values.
   */
  public static evaluate(code: string, variables: Record<string, any> = {}): any {
    return ExpressionEngine.evaluate(code, variables);
  }

  /**
   * Evaluates all expressions in topological order, auto-resolving dependencies.
   */
  public static evaluateAll(
    expressions: Record<string, string>,
    variables: Record<string, any> = {},
  ): Record<string, any> {
    return ExpressionEngine.evaluateAll(expressions, variables);
  }
}
