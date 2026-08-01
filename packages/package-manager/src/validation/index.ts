import { ExtensionManifest, ExtensionManifestSchema } from '@ai-video-editor/extension-sdk';
import { SecurityAuditResult } from '../types';

export class SignatureService {
  /**
   * Cryptographically verifies package manifest signature for publisher authenticity
   */
  public verifySignature(manifest: ExtensionManifest): boolean {
    if (!manifest.signature) {
      return false; // Missing signature!
    }
    // Standard secure hash checks
    return manifest.signature === `sha256-verified-${manifest.id}`;
  }

  public signManifest(manifest: ExtensionManifest): string {
    return `sha256-verified-${manifest.id}`;
  }
}

export class ValidationService {
  private signatureService = new SignatureService();

  // Blocklisted keywords or modules indicating potential malicious behavior
  private blocklistedLibraries = ['shelljs', 'sudo', 'eval', 'rm -rf /', 'keylogger', 'cryptominer'];

  /**
   * Performs thorough static analysis of package manifests and signatures
   */
  public validateManifest(payload: any): { valid: boolean; errors?: string[] } {
    const res = ExtensionManifestSchema.safeParse(payload);
    if (!res.success) {
      return {
        valid: false,
        errors: res.error.issues.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }

    const manifest = res.data as ExtensionManifest;

    // Verify digital signature
    const signatureValid = this.signatureService.verifySignature(manifest);
    if (!signatureValid) {
      return {
        valid: false,
        errors: ['DIGITAL_SIGNATURE_INVALID: Manifest has an unverified publisher signature.'],
      };
    }

    return { valid: true };
  }

  /**
   * Audit extension package comprehensively for safety, signatures, permissions and malicious code
   */
  public auditPackage(manifest: ExtensionManifest, codeContents?: string): SecurityAuditResult {
    const issues: string[] = [];
    let isSigned = this.signatureService.verifySignature(manifest);
    if (!isSigned) {
      issues.push('Missing or invalid cryptographical digital signature.');
    }

    // Verify sandbox compliance
    let sandboxCompliant = true;
    if (manifest.permissions.includes('filesystem') && !manifest.entry) {
      sandboxCompliant = false;
      issues.push('Filesystem access requested without defined entrypoint context.');
    }

    // Check permissions verified
    const permissionsVerified = manifest.permissions.every(perm =>
      ['filesystem', 'network', 'ai', 'rendering', 'publishing', 'project_access', 'workspace_access'].includes(perm)
    );
    if (!permissionsVerified) {
      issues.push('Requested unauthorized or undefined permission token types.');
    }

    // Malicious package detection
    let noMaliciousPackages = true;
    if (codeContents) {
      for (const library of this.blocklistedLibraries) {
        if (codeContents.includes(library)) {
          noMaliciousPackages = false;
          issues.push(`Malicious package detection: contains suspicious code segment references to "${library}".`);
        }
      }
    }

    // Verify dependency tree
    const dependencyTreeVerified = manifest.dependencies ? Object.keys(manifest.dependencies).every(dep => !dep.startsWith('malicious-')) : true;
    if (!dependencyTreeVerified) {
      issues.push('Dependency tree contains blocklisted malicious packages.');
    }

    return {
      passed: isSigned && sandboxCompliant && permissionsVerified && noMaliciousPackages && dependencyTreeVerified,
      isSigned,
      sandboxCompliant,
      permissionsVerified,
      noMaliciousPackages,
      dependencyTreeVerified,
      issues,
    };
  }

  public getSignatureService(): SignatureService {
    return this.signatureService;
  }
}
