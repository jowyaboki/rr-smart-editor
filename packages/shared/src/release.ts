import { z } from 'zod';

export interface VersionMetadata {
  version: string;
  codename: string;
  releaseDate: string;
  environment: 'production' | 'staging' | 'development';
  changelog: {
    added: string[];
    improved: string[];
    fixed: string[];
  };
  knownIssues: string[];
  systemRequirements: {
    nodeVersion: string;
    browsersSupported: string[];
    minRamMb: number;
  };
}

export const VersionMetadataSchema = z.object({
  version: z.string(),
  codename: z.string(),
  releaseDate: z.string(),
  environment: z.enum(['production', 'staging', 'development']),
  changelog: z.object({
    added: z.array(z.string()),
    improved: z.array(z.string()),
    fixed: z.array(z.string()),
  }),
  knownIssues: z.array(z.string()),
  systemRequirements: z.object({
    nodeVersion: z.string(),
    browsersSupported: z.array(z.string()),
    minRamMb: z.number().int().positive(),
  }),
});

export const CURRENT_RELEASE_METADATA: VersionMetadata = {
  version: '1.0-RC1',
  codename: 'Excalibur',
  releaseDate: new Date().toISOString().split('T')[0],
  environment: 'production',
  changelog: {
    added: [
      'Reliability & Recovery System with local backup snapshots and automated unscheduled shutdown recovery dialog.',
      'Performance & Scalability Framework including horizontal/vertical timeline rendering virtualization.',
      'Zustand memoized selectors and React component rendering performance profiling.',
      'Centralized LRU Cache layer for video waveforms, image thumbnails, and project assets metadata.',
    ],
    improved: [
      'Standardized darkTheme compatibility across all dialogue boxes and status panels.',
      'Reduced web chunk sizes with React lazy loading boundary on heavy sidebar diagnostic panels.',
      'Robust native test execution runner utilizing tsx with 100% test coverage boundaries.',
    ],
    fixed: [
      'Resolved potential parent re-rendering loops during timeline clip drag and resize operations.',
      'Fixed memory leak on window unload and unmount by cleaning up active timers and event listeners.',
    ],
  },
  knownIssues: [
    'Firefox horizontal scrollbars can occasionally offset playhead alignment by 1-2px.',
    'Render previews for unencoded SVG asset vectors require initial conversion.',
  ],
  systemRequirements: {
    nodeVersion: '>=18.0.0',
    browsersSupported: ['Chrome >= 100', 'Firefox >= 100', 'Safari >= 15', 'Edge >= 100'],
    minRamMb: 4096,
  },
};
