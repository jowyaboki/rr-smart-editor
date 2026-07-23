import { IMigrationService, DatabaseMigration } from '../types';

export class MigrationService implements IMigrationService {
  private appliedMigrations: DatabaseMigration[] = [];
  private availableMigrations = [
    { id: 'mig_001_create_projects_table', name: '001_create_projects_table' },
    { id: 'mig_002_create_assets_table', name: '002_create_assets_table' },
    { id: 'mig_003_create_renders_table', name: '003_create_renders_table' },
  ];

  public async getAppliedMigrations(): Promise<DatabaseMigration[]> {
    return this.appliedMigrations;
  }

  public async migrateUp(): Promise<DatabaseMigration[]> {
    const nextBatch = this.getCurrentBatchNumber() + 1;
    const newlyApplied: DatabaseMigration[] = [];

    for (const m of this.availableMigrations) {
      if (!this.appliedMigrations.some(am => am.id === m.id)) {
        const applied: DatabaseMigration = {
          id: m.id,
          name: m.name,
          appliedAt: new Date().toISOString(),
          batch: nextBatch,
        };
        this.appliedMigrations.push(applied);
        newlyApplied.push(applied);
      }
    }

    return newlyApplied;
  }

  public async rollbackLastBatch(): Promise<DatabaseMigration[]> {
    const currentBatch = this.getCurrentBatchNumber();
    if (currentBatch === 0) return [];

    const rolledBack = this.appliedMigrations.filter(am => am.batch === currentBatch);
    this.appliedMigrations = this.appliedMigrations.filter(am => am.batch !== currentBatch);

    return rolledBack;
  }

  private getCurrentBatchNumber(): number {
    if (this.appliedMigrations.length === 0) return 0;
    return Math.max(...this.appliedMigrations.map(m => m.batch));
  }
}
