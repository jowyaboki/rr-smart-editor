export interface OnlineMarketplaceQuery {
  category?: string;
  searchQuery?: string;
}

export const queryMarketplace = async (query: OnlineMarketplaceQuery) => {
  return [
    {
      id: 'ext-youtube',
      name: 'youtube-publisher',
      displayName: 'YouTube Publishing Adapter',
      description: 'Allows publishing direct exports to YouTube with caption integrations.',
      version: '1.2.0',
      category: 'publishing_adapter',
      installed: false,
      enabled: false,
      downloads: 4200,
      rating: 4.7,
    },
    {
      id: 'ext-transitions',
      name: 'transition-pack-v1',
      displayName: 'Premium Transitions Pack',
      description: 'Adds 50+ beautiful modern camera slide and zoom transitions.',
      version: '1.0.0',
      category: 'transition',
      installed: false,
      enabled: false,
      downloads: 8900,
      rating: 4.9,
    }
  ];
};
