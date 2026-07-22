import { organizationService } from '../services';

export const createNewOrganization = (name: string, domain?: string) => {
  return organizationService.createOrganization(name, domain);
};
export const getActiveOrganization = (orgId: string) => {
  return organizationService.getOrganization(orgId);
};
