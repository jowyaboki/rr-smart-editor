import { ILicenseService, LicenseInfo } from '../types';

export class LicenseService implements ILicenseService {
  private activeLicense: LicenseInfo | null = null;

  constructor() {
    // Populate with default Community license
    this.activeLicense = {
      key: 'lic_community_default',
      edition: 'community',
      owner: 'Community User',
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(), // 1 year
      status: 'valid',
      offlineAllowed: true,
    };
  }

  public async validateLicense(licenseKey: string): Promise<LicenseInfo> {
    if (licenseKey.startsWith('enterprise_')) {
      return {
        key: licenseKey,
        edition: 'enterprise',
        owner: 'Enterprise Corporation',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        status: 'valid',
        offlineAllowed: true,
        maxFloatingWorkers: 100,
      };
    } else if (licenseKey.startsWith('professional_')) {
      return {
        key: licenseKey,
        edition: 'professional',
        owner: 'Professional Editor',
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        status: 'valid',
        offlineAllowed: false,
      };
    } else if (licenseKey === 'expired_key') {
      return {
        key: licenseKey,
        edition: 'professional',
        owner: 'Expired User',
        issuedAt: new Date(Date.now() - 100000).toISOString(),
        expiresAt: new Date(Date.now() - 1000).toISOString(),
        status: 'expired',
        offlineAllowed: false,
      };
    }

    throw new Error('Invalid license key format.');
  }

  public async getActiveLicense(): Promise<LicenseInfo | null> {
    return this.activeLicense;
  }

  public async activateOfflineLicense(offlineToken: string): Promise<LicenseInfo> {
    if (!offlineToken) {
      throw new Error('Offline token is empty.');
    }
    const license: LicenseInfo = {
      key: `lic_offline_${Date.now()}`,
      edition: 'enterprise',
      owner: 'Air-Gapped Offline Studio',
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
      status: 'valid',
      offlineAllowed: true,
    };
    this.activeLicense = license;
    return license;
  }

  public setActiveLicense(license: LicenseInfo): void {
    this.activeLicense = license;
  }
}
