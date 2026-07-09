import { Template, TemplateVersion } from '../types';
import { VariableResolver } from './VariableResolver';

export const TemplateCompiler = {
  compile(template: Template, versionId: string, variableValues: Record<string, any>): any {
    const version = template.versions.find(v => v.id === versionId);
    if (!version) throw new Error('Template version not found');

    return VariableResolver.resolve(version.timeline, template.variables, variableValues);
  }
};
