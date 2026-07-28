import { CompositeLayer } from '../types';

export class CompositingService {
  /**
   * Maps green screen, luma key, or alpha key settings into an effects-engine chain configuration
   */
  public buildCompositingChain(layer: CompositeLayer): {
    id: string;
    effects: Array<{
      id: string;
      name: string;
      type: string;
      enabled: boolean;
      parameters: Record<string, any>;
    }>;
  } {
    const chainId = `chain_${layer.id}`;
    const effects: any[] = [];

    const keying = layer.keying;
    if (keying.type === 'chroma_green_screen' || keying.type === 'chroma_custom') {
      const color = keying.type === 'chroma_green_screen' ? '#00ff00' : keying.chroma.keyColor;
      effects.push({
        id: `chroma_key_${layer.id}`,
        name: 'Chroma Key',
        type: 'chroma_key',
        enabled: true,
        parameters: {
          keyColor: {
            id: 'keyColor',
            name: 'Key Color',
            type: 'color',
            value: color,
            default: '#00ff00',
          },
          tolerance: {
            id: 'tolerance',
            name: 'Tolerance',
            type: 'number',
            value: keying.chroma.tolerance,
            default: 0.4,
          },
          edgeFeather: {
            id: 'edgeFeather',
            name: 'Edge Feather',
            type: 'number',
            value: keying.chroma.edgeFeather,
            default: 0,
          },
          spillReduction: {
            id: 'spillReduction',
            name: 'Spill Reduction',
            type: 'number',
            value: keying.chroma.spillReduction,
            default: 0.5,
          },
        },
      });
    } else if (keying.type === 'luma') {
      effects.push({
        id: `luma_key_${layer.id}`,
        name: 'Luma Key',
        type: 'luma_key', // Or Custom Shader
        enabled: true,
        parameters: {
          threshold: {
            id: 'threshold',
            name: 'Threshold',
            type: 'number',
            value: keying.luma.threshold,
            default: 0.5,
          },
          tolerance: {
            id: 'tolerance',
            name: 'Tolerance',
            type: 'number',
            value: keying.luma.tolerance,
            default: 0.1,
          },
          invert: {
            id: 'invert',
            name: 'Invert',
            type: 'boolean',
            value: keying.luma.invert,
            default: false,
          },
        },
      });
    }

    return {
      id: chainId,
      effects,
    };
  }

  /**
   * Transforms a CompositeLayer into standard EffectsEngine layer representations
   */
  public toEffectsLayer(layer: CompositeLayer, customSource?: any): any {
    const chain = this.buildCompositingChain(layer);
    return {
      id: layer.id,
      name: layer.name,
      visible: layer.visible,
      opacity: layer.opacity,
      blendMode: layer.blendMode,
      masks: [],
      effects: chain,
      transform: {
        position: { x: layer.transform3d.position[0], y: layer.transform3d.position[1] },
        scale: { x: layer.transform3d.scale[0], y: layer.transform3d.scale[1] },
        rotation: layer.transform3d.rotation[2], // Roll rotation mapped to 2D
        anchorPoint: { x: layer.transform3d.anchorPoint[0], y: layer.transform3d.anchorPoint[1] },
      },
      source: customSource || layer.sourceId,
    };
  }
}
