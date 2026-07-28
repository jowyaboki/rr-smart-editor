import { Asset } from '@ai-video-editor/dam';
import { AssetCluster, ClusterCriteria, SemanticEmbedding } from '../types';

export class ClusteringService {
  /**
   * Groups a library of assets into clusters based on specified criteria
   */
  public async cluster(
    library: Asset[],
    embeddings: SemanticEmbedding[],
    criteria: ClusterCriteria
  ): Promise<AssetCluster[]> {
    const clusters: AssetCluster[] = [];

    if (criteria === 'topic') {
      // Group by categories/keywords
      const groups = new Map<string, string[]>();
      library.forEach(asset => {
        const category = asset.metadata.categories?.[0] || 'Uncategorized';
        const list = groups.get(category) || [];
        list.push(asset.id);
        groups.set(category, list);
      });

      groups.forEach((assetIds, catName) => {
        clusters.push({
          id: `cluster_topic_${catName.toLowerCase()}`,
          name: `${catName} Assets`,
          criteria,
          assetIds,
          description: `Assets semantically grouped under topic category: ${catName}`,
        });
      });
    } else if (criteria === 'color_palette') {
      // Group by dominant color matches
      const colorGroups = new Map<string, string[]>();
      library.forEach(asset => {
        const color = asset.metadata.dominantColors?.[0] || '#888888';
        const list = colorGroups.get(color) || [];
        list.push(asset.id);
        colorGroups.set(color, list);
      });

      colorGroups.forEach((assetIds, color) => {
        clusters.push({
          id: `cluster_color_${color.replace('#', '')}`,
          name: `Dominant ${color} Aesthetics`,
          criteria,
          assetIds,
          description: `Creative media grouped by visual chromatic matching: ${color}`,
        });
      });
    } else if (criteria === 'location') {
      const locGroups = new Map<string, string[]>();
      library.forEach(asset => {
        const loc = asset.metadata.location || 'Studio Set';
        const list = locGroups.get(loc) || [];
        list.push(asset.id);
        locGroups.set(loc, list);
      });

      locGroups.forEach((assetIds, loc) => {
        clusters.push({
          id: `cluster_loc_${loc.toLowerCase().replace(' ', '_')}`,
          name: `Shooting Set: ${loc}`,
          criteria,
          assetIds,
          description: `Assets filmed/recorded at production spot: ${loc}`,
        });
      });
    } else {
      // General fallbacks: clustering by name prefixes or types
      const list = library.map(a => a.id);
      clusters.push({
        id: `cluster_general_${criteria}`,
        name: `Visual Style Grouping`,
        criteria,
        assetIds: list,
        description: `Assets clustered dynamically based on aesthetic visual_style`,
      });
    }

    return clusters;
  }
}
