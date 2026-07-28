import { Composition, PreCompositionLayer } from '../types';
import { ComposerService } from './ComposerService';

export class CompositionService {
  private composer: ComposerService;

  constructor(composer: ComposerService) {
    this.composer = composer;
  }

  /**
   * Performs recursive nesting validation to prevent cyclic precomposition structures
   */
  public hasCyclicNesting(targetCompId: string, nestedCompId: string): boolean {
    if (targetCompId === nestedCompId) {
      return true;
    }

    const nestedComp = this.composer.getComposition(nestedCompId);
    if (!nestedComp) {
      return false;
    }

    // Scan nested comp's layers for PreComposition layers
    const preCompLayers = nestedComp.layers.filter(
      (l) => l.type === 'pre_composition',
    ) as PreCompositionLayer[];
    for (const layer of preCompLayers) {
      if (this.hasCyclicNesting(targetCompId, layer.nestedCompositionId)) {
        return true;
      }
    }

    return false;
  }
}
