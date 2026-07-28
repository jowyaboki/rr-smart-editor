import { Composition, PreCompositionLayer } from '../types';

export class TemplateService {
  /**
   * Generates a reusable motion graphic template (MOGRT) configuration from a composition
   */
  public generateTemplate(comp: Composition): {
    templateId: string;
    name: string;
    overrideableFields: Array<{ layerId: string; name: string; type: string; currentValue: any }>;
  } {
    const overrideableFields: Array<any> = [];

    comp.layers.forEach((layer) => {
      if (layer.type === 'text') {
        overrideableFields.push({
          layerId: layer.id,
          name: layer.name,
          type: 'text_content',
          currentValue: (layer as any).text,
        });
      } else if (layer.type === 'shape') {
        overrideableFields.push({
          layerId: layer.id,
          name: `${layer.name} Color`,
          type: 'color',
          currentValue: (layer as any).style?.fillColor || '#ffffff',
        });
      }
    });

    return {
      templateId: `tpl_${comp.id}`,
      name: `${comp.name} Motion Template`,
      overrideableFields,
    };
  }

  /**
   * Applies custom template overrides to a precomposition layer
   */
  public applyOverrides(layer: PreCompositionLayer, overrides: Record<string, any>): void {
    layer.overrides = {
      ...layer.overrides,
      ...overrides,
    };
  }
}
