import { webTemplateEngine } from '../engine';

export const validateParameterValues = (params: any[], values: any) => {
  return webTemplateEngine.validation.validateValues(params, values);
};
