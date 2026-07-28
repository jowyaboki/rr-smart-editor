import { useEffect, useCallback } from 'react';
import { useExpressionStore } from '../store/expressionStore';
import { RuntimeEvaluator } from '../services/RuntimeEvaluator';

export function useExpressions() {
  const bindings = useExpressionStore((state) => state.bindings);
  const globalVariables = useExpressionStore((state) => state.globalVariables);
  const updateEvaluations = useExpressionStore((state) => state.updateEvaluations);

  const evaluateAllBindings = useCallback(() => {
    // 1. Collect all enabled expressions
    const activeExpressions: Record<string, string> = {};
    for (const [id, binding] of Object.entries(bindings)) {
      if (binding.enabled && binding.code && binding.code.trim() !== '') {
        activeExpressions[id] = binding.code;
      }
    }

    if (Object.keys(activeExpressions).length === 0) {
      return;
    }

    const evaluations: Record<string, any> = {};
    const errors: Record<string, any> = {};

    try {
      // 2. Evaluate all active expressions in topological order
      const results = RuntimeEvaluator.evaluateAll(activeExpressions, globalVariables);

      // Copy results back
      for (const id of Object.keys(activeExpressions)) {
        evaluations[id] = results[id];
      }
    } catch (err: any) {
      // If a dependency graph evaluation fails (e.g., cycle or dynamic runtime error),
      // we can try to evaluate individual expressions or isolate the error.
      // Let's isolate the errors by evaluating each expression individually if evaluateAll failed,
      // so the user gets detailed errors for the exact culprit!
      for (const id of Object.keys(activeExpressions)) {
        try {
          // Attempt to evaluate singly with the current global variables
          const res = RuntimeEvaluator.evaluate(activeExpressions[id], { ...globalVariables, ...evaluations });
          evaluations[id] = res;
        } catch (singleErr: any) {
          errors[id] = { message: singleErr.message || 'Evaluation error' };
        }
      }
    }

    // 3. Update the store with the new evaluations and errors
    updateEvaluations(evaluations, errors);
  }, [bindings, globalVariables, updateEvaluations]);

  // Re-run evaluations whenever global variables (like playhead time/frame) or bindings change
  useEffect(() => {
    evaluateAllBindings();
  }, [evaluateAllBindings]);

  return {
    evaluateAllBindings,
  };
}
