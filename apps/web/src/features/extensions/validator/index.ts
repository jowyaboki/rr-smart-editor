import { webPackageManager } from '../installer';

export const validateLocalArchive = (payload: any) => {
  return webPackageManager.validator.validateManifest(payload);
};
