import { Template } from '../types';

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'yt-intro',
    metadata: {
      name: 'YouTube Intro',
      description: 'A clean and professional cinematic intro.',
      category: 'Social Media',
      author: 'RR Editor',
      tags: ['youtube', 'intro', 'clean'],
      version: '1.0.0'
    },
    variables: [
      { id: 'title', type: 'string', label: 'Main Title', defaultValue: 'WELCOME' },
      { id: 'color', type: 'color', label: 'Brand Color', defaultValue: '#90caf9' }
    ],
    versions: [{
      id: 'v1',
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      timeline: { tracks: [] } // Mock timeline
    }],
    currentVersionId: 'v1',
    thumbnail: '',
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ig-reel',
    metadata: {
      name: 'Instagram Reel',
      description: 'Dynamic typography for mobile videos.',
      category: 'Social Media',
      author: 'RR Editor',
      tags: ['instagram', 'reel', 'typography'],
      version: '1.0.0'
    },
    variables: [],
    versions: [],
    currentVersionId: '',
    thumbnail: '',
    favorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
