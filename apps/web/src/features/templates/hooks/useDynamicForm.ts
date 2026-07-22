import { useTemplateStore } from '../store/templateStore';
import { getVisibleParameters } from '../forms';
import { validateParameterValues } from '../validation';
import { TemplateParameter } from '../types';

export function useDynamicForm(parameters: TemplateParameter[]) {
  const store = useTemplateStore();

  const setParamValue = (paramId: string, value: any) => {
    store.updateParameterValue(paramId, value);
  };

  const visibleParameters = getVisibleParameters(parameters, store.parameterValues);

  const validateForm = () => {
    return validateParameterValues(parameters, store.parameterValues);
  };

  return {
    values: store.parameterValues,
    visibleParameters,
    setParamValue,
    validateForm,
    clearForm: store.clearForm,
  };
}
