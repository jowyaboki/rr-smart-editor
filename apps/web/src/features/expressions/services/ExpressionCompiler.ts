import { ExpressionEngine } from './ExpressionEngine';
import { ASTNode, ExpressionError } from '@ai-video-editor/expression-engine';

export class ExpressionCompiler {
  public static compile(code: string): ASTNode {
    return ExpressionEngine.compile(code);
  }

  public static validate(code: string): ExpressionError | null {
    return ExpressionEngine.validate(code);
  }

  public static clearCache(): void {
    ExpressionEngine.clearCache();
  }
}
