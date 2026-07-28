import { webPackageManager } from '../installer';

export const checkUpdatesForInstalled = async () => {
  const installed = webPackageManager.listInstalledPackages();
  return installed.map(p => ({
    id: p.manifest.id,
    currentVersion: p.manifest.version,
    latestVersion: '2.0.0', // mock upgraded version
    updateAvailable: true,
  }));
};
