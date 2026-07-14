# API & Core Services Documentation

This document describes the design patterns, classes, and method signatures for the core services powering the RR Smart Editor's Recovery and Performance frameworks.

## 1. ProjectValidationService

`apps/web/src/features/recovery/services/ProjectValidationService.ts`

Validates schema structure and checks for broken references or corrupted hashes.

- `calculateHash(data: string): string`
  Generates a portable, synchronous, and fast checksum of a string using a polynomial hashing algorithm.
- `validateSchema(project: any): ValidationResult`
  Verifies core properties and track structures.
- `validateReferences(project: any, assets: any[]): ValidationResult`
  Checks for clips pointing to missing media assets.
- `validateSnapshotIntegrity(snapshot: ProjectSnapshot): ValidationResult`
  Recalculates snapshot hash and compares with metadata to detect corruption.

## 2. SnapshotService

`apps/web/src/features/recovery/services/SnapshotService.ts`

Manages local segmented storage and indices of immutable project checkpoints.

- `createSnapshot(params): ProjectSnapshot`
  Instantiates a frozen snapshot with timestamp, checksum, and trigger metadata.
- `saveSnapshot(snapshot: ProjectSnapshot): void`
  Stores snapshot data and appends ID to the project index.
- `getSnapshot(id: string): ProjectSnapshot | null`
  Fetches a single snapshot.
- `getProjectSnapshots(projectId: string): ProjectSnapshot[]`
  Retrieves all snapshots for a project, sorted by timestamp descending.

## 3. PerformanceProfiler

`apps/web/src/features/performance/services/PerformanceProfiler.ts`

Aggregates render time delays and manages web FPS analytics.

- `startMeasure(label: string): void`
  Registers operation start timestamp.
- `endMeasure(label: string): number`
  Retrieves operation elapsed execution time.
- `recordMetrics(params): PerformanceMetrics`
  Piles metrics into bounded history logs and reads active browser heap memory.
- `getAverages(): Omit<PerformanceMetrics, 'timestamp'>`
  Retrieves historical average stats.

## 4. CacheService

`apps/web/src/features/performance/services/CacheService.ts`

Central LRU Cache managing waveform and thumbnail assets with automatic budget eviction policies.

- `set(key: string, value: any, ttlMs?: number): void`
  Stores entry and runs budget eviction if size exceeds 50MB.
- `get(key: string): any | null`
  Retrieves valid entries or evicts expired entries.
