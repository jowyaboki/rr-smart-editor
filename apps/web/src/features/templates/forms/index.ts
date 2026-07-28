import { TemplateParameter } from '../types';

/**
 * Automatically filters list of parameters based on conditional visibility logic
 */
export const getVisibleParameters = (
  params: TemplateParameter[],
  values: Record<string, any>
): TemplateParameter[] => {
  return params.filter((p) => {
    if (!p.dependsOn) return true;
    const triggerValue = values[p.dependsOn.parameterId];
    return triggerValue === p.dependsOn.conditionValue;
  });
};
