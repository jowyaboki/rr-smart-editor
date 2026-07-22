import { permissionService } from '../services';

export const checkPrivilege = (role: any, required: any) => {
  return permissionService.isAuthorized(role, required);
};
