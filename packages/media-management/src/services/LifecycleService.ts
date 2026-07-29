import { MediaAsset, RetentionPolicy } from '../types';

export class LifecycleService {
  public enforceRetention(asset: MediaAsset, policy: RetentionPolicy): void {
    const createdTime = new Date(asset.createdAt).getTime();
    const activeDays = (Date.now() - createdTime) / (1000 * 60 * 60 * 24);

    if (activeDays > policy.retentionDays) {
      if (policy.actionAfterExpiration === 'delete') {
        asset.lifecycleState = 'deleted';
        asset.url = 'file://deleted';
      } else if (policy.actionAfterExpiration === 'archive') {
        asset.lifecycleState = 'cold';
        asset.url = asset.url + '_cold_retained';
      }
      asset.updatedAt = new Date().toISOString();
    }
  }
}

export const globalLifecycleService = new LifecycleService();
