import { webPackageManager } from '../installer';

export const explorerInstalledExtensions = () => {
  return webPackageManager.listInstalledPackages();
};
