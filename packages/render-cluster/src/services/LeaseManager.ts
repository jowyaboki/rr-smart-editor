import { WorkerLease } from '../types';

export class LeaseManager {
  private leases: Map<string, WorkerLease> = new Map();

  public acquireLease(nodeId: string, jobId: string, shardId: string, durationMs: number = 60000): WorkerLease | null {
    // Check if node is already leased
    const activeLease = this.getLeaseForNode(nodeId);
    if (activeLease && new Date(activeLease.expiresAt).getTime() > Date.now()) {
      return null; // Node already leased and not expired
    }

    const lease: WorkerLease = {
      id: `lease_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      nodeId,
      jobId,
      shardId,
      leasedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + durationMs).toISOString(),
    };

    this.leases.set(lease.id, lease);
    return lease;
  }

  public releaseLease(leaseId: string): boolean {
    const lease = this.leases.get(leaseId);
    if (!lease) return false;

    lease.releasedAt = new Date().toISOString();
    this.leases.delete(leaseId);
    return true;
  }

  public getLeaseForNode(nodeId: string): WorkerLease | undefined {
    return Array.from(this.leases.values()).find(l => l.nodeId === nodeId && !l.releasedAt);
  }
}
