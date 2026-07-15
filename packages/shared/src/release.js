"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CURRENT_RELEASE_METADATA = exports.VersionMetadataSchema = void 0;
const zod_1 = require("zod");
exports.VersionMetadataSchema = zod_1.z.object({
    version: zod_1.z.string(),
    codename: zod_1.z.string(),
    releaseDate: zod_1.z.string(),
    environment: zod_1.z.enum(['production', 'staging', 'development']),
    changelog: zod_1.z.object({
        added: zod_1.z.array(zod_1.z.string()),
        improved: zod_1.z.array(zod_1.z.string()),
        fixed: zod_1.z.array(zod_1.z.string()),
    }),
    knownIssues: zod_1.z.array(zod_1.z.string()),
    systemRequirements: zod_1.z.object({
        nodeVersion: zod_1.z.string(),
        browsersSupported: zod_1.z.array(zod_1.z.string()),
        minRamMb: zod_1.z.number().int().positive(),
    }),
});
exports.CURRENT_RELEASE_METADATA = {
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
//# sourceMappingURL=release.js.map