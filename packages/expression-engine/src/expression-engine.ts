import { ASTNode, ExpressionContext, ExpressionError } from './types';
import { parseExpression } from './parser';
import { evaluateAST } from './interpreter';
import { builtInFunctions, setRandomSeed } from './builtins';
import { DependencyGraph, extractReferences } from './dependency-graph';

export class ExpressionEngine {
  private astCache = new Map<string, ASTNode>();
  private dependencyGraph = new DependencyGraph();

  // Plugin registered extensions
  private pluginFunctions = new Map<string, Function>();
  private pluginVariables = new Map<string, any>();
  private pluginBindings = new Map<string, () => any>();
  private pluginValidators: ((expression: string, ast: ASTNode) => ExpressionError | null)[] = [];

  constructor() {
    this.clearCache();
  }

  /**
   * Clears the AST compilation cache.
   */
  public clearCache(): void {
    this.astCache.clear();
  }

  /**
   * Compiles an expression string into an AST. Uses cache if available.
   */
  public compile(expression: string): ASTNode {
    const trimmed = expression.trim();
    if (this.astCache.has(trimmed)) {
      return this.astCache.get(trimmed)!;
    }

    try {
      const ast = parseExpression(trimmed);
      this.astCache.set(trimmed, ast);
      return ast;
    } catch (err: any) {
      throw new Error(`Compilation Error: ${err.message}`);
    }
  }

  /**
   * Validates an expression. Returns null if valid, or an ExpressionError if invalid.
   */
  public validate(expression: string): ExpressionError | null {
    try {
      const ast = this.compile(expression);
      // Run custom plugin validators
      for (const validator of this.pluginValidators) {
        const err = validator(expression, ast);
        if (err) return err;
      }
      return null;
    } catch (err: any) {
      return {
        message: err.message || 'Syntax Error',
      };
    }
  }

  /**
   * Safely registers a custom function (Plugin extension).
   */
  public registerFunction(name: string, fn: Function): void {
    this.pluginFunctions.set(name, fn);
  }

  /**
   * Safely registers a custom variable (Plugin extension).
   */
  public registerVariable(name: string, value: any): void {
    this.pluginVariables.set(name, value);
  }

  /**
   * Safely registers a property binding resolver (Plugin extension).
   */
  public registerPropertyBinding(name: string, resolver: () => any): void {
    this.pluginBindings.set(name, resolver);
  }

  /**
   * Registers a custom AST validator (Plugin extension).
   */
  public registerValidator(validator: (expression: string, ast: ASTNode) => ExpressionError | null): void {
    this.pluginValidators.push(validator);
  }

  /**
   * Unregisters custom functions/variables.
   */
  public resetPlugins(): void {
    this.pluginFunctions.clear();
    this.pluginVariables.clear();
    this.pluginBindings.clear();
    this.pluginValidators = [];
  }

  /**
   * Evaluates a single compiled AST node with the given variables.
   */
  public evaluateAST(ast: ASTNode, variables: Record<string, any> = {}): any {
    // Merge built-in functions, plugin functions, built-in variables, plugin variables and dynamic variables
    const mergedFunctions: Record<string, Function> = {
      ...builtInFunctions,
    };
    this.pluginFunctions.forEach((fn, name) => {
      mergedFunctions[name] = fn;
    });

    const mergedVariables: Record<string, any> = {};

    // Apply plugin bindings (resolvers)
    this.pluginBindings.forEach((resolver, name) => {
      try {
        mergedVariables[name] = resolver();
      } catch {
        // Fallback or ignore
      }
    });

    // Apply plugin variables
    this.pluginVariables.forEach((val, name) => {
      mergedVariables[name] = val;
    });

    // Apply run-specific variables
    Object.assign(mergedVariables, variables);

    // Seed the LCG using context frame/time if available for deterministic wiggles/randoms
    const seedTime = typeof variables.time === 'number' ? variables.time : 0;
    const seedFrame = typeof variables.frame === 'number' ? variables.frame : 0;
    const seedValue = Math.floor((seedTime * 1000 + seedFrame + 12345) % 1000000);
    setRandomSeed(seedValue);

    // Bind time/frame to wiggle helper
    if ('wiggle' in mergedFunctions) {
      const origWiggle = mergedFunctions.wiggle;
      mergedFunctions.wiggle = (freq: number, amp: number, customTime?: number, octaves?: number) => {
        const activeTime = customTime !== undefined ? customTime : (variables.time !== undefined ? variables.time : 0);
        return origWiggle(freq, amp, activeTime, octaves);
      };
    }

    const context: ExpressionContext = {
      variables: mergedVariables,
      functions: mergedFunctions,
      resolveReference: (path: string) => {
        // Support deep property access resolution if requested
        const parts = path.split('.');
        let current: any = mergedVariables;
        for (const part of parts) {
          if (current !== null && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            return undefined;
          }
        }
        return current;
      },
    };

    return evaluateAST(ast, context);
  }

  /**
   * Evaluates an expression string directly with given variables.
   */
  public evaluate(expression: string, variables: Record<string, any> = {}): any {
    const ast = this.compile(expression);
    return this.evaluateAST(ast, variables);
  }

  /**
   * Evaluates multiple expressions in topological/correct order based on their references.
   * Tracks and resolves dependencies automatically.
   */
  public evaluateAll(
    expressions: Record<string, string>, // key is expression identifier (e.g. "layer.position"), value is expression string
    globalVars: Record<string, any> = {},
  ): Record<string, any> {
    const graph = new DependencyGraph();
    const compiledASTs = new Map<string, ASTNode>();

    // 1. Compile all expressions and populate dependency graph
    for (const [id, expr] of Object.entries(expressions)) {
      if (!expr || expr.trim() === '') {
        continue;
      }
      try {
        const ast = this.compile(expr);
        compiledASTs.set(id, ast);
        const deps = extractReferences(ast);
        graph.addNode(id, deps);
      } catch (err: any) {
        throw new Error(`Error in expression [${id}]: ${err.message}`);
      }
    }

    // Check for circular dependencies
    if (graph.hasCycle()) {
      throw new Error('Circular dependency detected within expressions');
    }

    // 2. Get evaluation order
    const evalOrder = graph.getEvaluationOrder();

    // 3. Evaluate in order, storing each result in local variables pool
    const results: Record<string, any> = { ...globalVars };

    // Function to set deep values (e.g., "layer.transform.position") in variables
    const setDeepValue = (obj: any, path: string, val: any) => {
      const parts = path.split('.');
      let current = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
          current[part] = {};
        }
        current = current[part];
      }
      current[parts[parts.length - 1]] = val;
    };

    for (const id of evalOrder) {
      const ast = compiledASTs.get(id);
      if (ast) {
        try {
          const res = this.evaluateAST(ast, results);
          // Save in results so subsequent expressions can reference it
          results[id] = res;
          setDeepValue(results, id, res);
        } catch (err: any) {
          throw new Error(`Evaluation Error in expression [${id}]: ${err.message}`);
        }
      }
    }

    // Extract only the expression keys for the final output
    const output: Record<string, any> = {};
    for (const id of Object.keys(expressions)) {
      output[id] = results[id];
    }

    return output;
  }
}
