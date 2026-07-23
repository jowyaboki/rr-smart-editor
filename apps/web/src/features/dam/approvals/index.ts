import { assetLibrary } from '../services';

export const approveMediaAsset = (assetId: string, reviewerName: string) => {
  const asset = assetLibrary.getAsset(assetId);
  if (asset) {
    assetLibrary.approvals.transitionStatus(asset, 'approved', reviewerName, 'Conforms to standards.');
  }
};
