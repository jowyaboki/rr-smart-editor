import { webPackageManager } from '../installer';

export const extensionLifecycleService = {
  install: (payload: any) => webPackageManager.installPackage(payload),
  enable: (id: string) => webPackageManager.enablePackage(id),
  disable: (id: string) => webPackageManager.disablePackage(id),
  uninstall: (id: string) => webPackageManager.uninstallPackage(id),
  repair: (id: string) => webPackageManager.repairPackage(id),
  export: () => webPackageManager.exportCollection(),
};
