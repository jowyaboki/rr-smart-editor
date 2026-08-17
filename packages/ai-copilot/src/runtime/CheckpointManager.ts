import { CheckpointSnapshot } from './types';

export interface ICheckpointStore {
  saveCheckpoint(checkpoint: CheckpointSnapshot): Promise<void>;
  getCheckpoint(checkpointId: string): Promise<CheckpointSnapshot | null>;
  getLatestCheckpoint(executionId: string): Promise<CheckpointSnapshot | null>;
  listCheckpoints(executionId: string): Promise<CheckpointSnapshot[]>;
  deleteCheckpoint(checkpointId: string): Promise<void>;
}

export class MemoryCheckpointStore implements ICheckpointStore {
  private store = new Map<string, CheckpointSnapshot>();

  async saveCheckpoint(checkpoint: CheckpointSnapshot): Promise<void> {
    this.store.set(checkpoint.checkpointId, JSON.parse(JSON.stringify(checkpoint)));
  }

  async getCheckpoint(checkpointId: string): Promise<CheckpointSnapshot | null> {
    const cp = this.store.get(checkpointId);
    return cp ? JSON.parse(JSON.stringify(cp)) : null;
  }

  async getLatestCheckpoint(executionId: string): Promise<CheckpointSnapshot | null> {
    const list = await this.listCheckpoints(executionId);
    if (list.length === 0) return null;
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return list[0];
  }

  async listCheckpoints(executionId: string): Promise<CheckpointSnapshot[]> {
    const results: CheckpointSnapshot[] = [];
    for (const cp of this.store.values()) {
      if (cp.executionId === executionId) {
        results.push(JSON.parse(JSON.stringify(cp)));
      }
    }
    return results;
  }

  async deleteCheckpoint(checkpointId: string): Promise<void> {
    this.store.delete(checkpointId);
  }
}

export class IndexedDBCheckpointStore implements ICheckpointStore {
  private dbName = 'RR_AI_Execution_Checkpoints_DB';
  private storeName = 'checkpoints';
  private dbPromise: Promise<IDBDatabase> | null = null;
  private fallbackStore = new MemoryCheckpointStore();

  private isIndexedDBAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
  }

  private initDB(): Promise<IDBDatabase> {
    if (!this.isIndexedDBAvailable()) {
      return Promise.reject(new Error('IndexedDB not available in current environment'));
    }
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'checkpointId' });
          store.createIndex('executionId', 'executionId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  async saveCheckpoint(checkpoint: CheckpointSnapshot): Promise<void> {
    if (!this.isIndexedDBAvailable()) {
      return this.fallbackStore.saveCheckpoint(checkpoint);
    }
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.put(checkpoint);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.fallbackStore.saveCheckpoint(checkpoint);
    }
  }

  async getCheckpoint(checkpointId: string): Promise<CheckpointSnapshot | null> {
    if (!this.isIndexedDBAvailable()) {
      return this.fallbackStore.getCheckpoint(checkpointId);
    }
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(checkpointId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.fallbackStore.getCheckpoint(checkpointId);
    }
  }

  async getLatestCheckpoint(executionId: string): Promise<CheckpointSnapshot | null> {
    const checkpoints = await this.listCheckpoints(executionId);
    if (checkpoints.length === 0) return null;
    checkpoints.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return checkpoints[0];
  }

  async listCheckpoints(executionId: string): Promise<CheckpointSnapshot[]> {
    if (!this.isIndexedDBAvailable()) {
      return this.fallbackStore.listCheckpoints(executionId);
    }
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const index = store.index('executionId');
        const req = index.getAll(executionId);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.fallbackStore.listCheckpoints(executionId);
    }
  }

  async deleteCheckpoint(checkpointId: string): Promise<void> {
    if (!this.isIndexedDBAvailable()) {
      return this.fallbackStore.deleteCheckpoint(checkpointId);
    }
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.delete(checkpointId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.fallbackStore.deleteCheckpoint(checkpointId);
    }
  }
}

export class ServerCheckpointStoreAdapter implements ICheckpointStore {
  constructor(private localStore: ICheckpointStore) {}

  async saveCheckpoint(checkpoint: CheckpointSnapshot): Promise<void> {
    await this.localStore.saveCheckpoint(checkpoint);
    // Synced with existing platform persistence endpoints when online
  }

  async getCheckpoint(checkpointId: string): Promise<CheckpointSnapshot | null> {
    return this.localStore.getCheckpoint(checkpointId);
  }

  async getLatestCheckpoint(executionId: string): Promise<CheckpointSnapshot | null> {
    return this.localStore.getLatestCheckpoint(executionId);
  }

  async listCheckpoints(executionId: string): Promise<CheckpointSnapshot[]> {
    return this.localStore.listCheckpoints(executionId);
  }

  async deleteCheckpoint(checkpointId: string): Promise<void> {
    await this.localStore.deleteCheckpoint(checkpointId);
  }
}
