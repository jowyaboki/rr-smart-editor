import { Asset } from '../../../packages/dam/src/types';

export class ServerDAMManager {
  private serverAssets = new Map<string, Asset>();

  public saveServerAsset(asset: Asset): void {
    this.serverAssets.set(asset.id, asset);
  }

  public getServerAsset(id: string): Asset | undefined {
    return this.serverAssets.get(id);
  }

  public listServerAssets(): Asset[] {
    return Array.from(this.serverAssets.values());
  }
}
export const serverDAM = new ServerDAMManager();
