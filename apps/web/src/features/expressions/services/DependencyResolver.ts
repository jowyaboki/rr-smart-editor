import { DependencyGraph, extractReferences, parseExpression } from '@ai-video-editor/expression-engine';

export class DependencyResolver {
  private static graph = new DependencyGraph();

  public static buildGraph(expressions: Record<string, string>): void {
    for (const [id, code] of Object.entries(expressions)) {
      if (!code || code.trim() === '') {
        this.graph.removeNode(id);
        continue;
      }
      try {
        const ast = parseExpression(code);
        const deps = extractReferences(ast);
        this.graph.addNode(id, deps);
      } catch {
        this.graph.removeNode(id);
      }
    }
  }

  public static hasCycle(): boolean {
    return this.graph.hasCycle();
  }

  public static getEvaluationOrder(): string[] {
    return this.graph.getEvaluationOrder();
  }

  public static getAffected(id: string): string[] {
    return this.graph.getAffectedNodes(id);
  }
}
