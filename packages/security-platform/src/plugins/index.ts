import {
  IdentityProviderAdapter,
  AuthenticationProviderAdapter,
  PolicyEvaluatorPlugin,
  ComplianceValidatorPlugin,
  SecretProviderAdapter,
  EncryptionProviderAdapter,
} from '../types';

export class SecurityPluginRegistry {
  private identityProviders: Map<string, IdentityProviderAdapter> = new Map();
  private authProviders: Map<string, AuthenticationProviderAdapter> = new Map();
  private policyEvaluators: Map<string, PolicyEvaluatorPlugin> = new Map();
  private complianceValidators: Map<string, ComplianceValidatorPlugin> = new Map();
  private secretProviders: Map<string, SecretProviderAdapter> = new Map();
  private encryptionProviders: Map<string, EncryptionProviderAdapter> = new Map();

  public registerIdentityProvider(plugin: IdentityProviderAdapter): void {
    this.identityProviders.set(plugin.id, plugin);
  }

  public registerAuthenticationProvider(plugin: AuthenticationProviderAdapter): void {
    this.authProviders.set(plugin.id, plugin);
  }

  public registerPolicyEvaluator(plugin: PolicyEvaluatorPlugin): void {
    this.policyEvaluators.set(plugin.id, plugin);
  }

  public registerComplianceValidator(plugin: ComplianceValidatorPlugin): void {
    this.complianceValidators.set(plugin.id, plugin);
  }

  public registerSecretProvider(plugin: SecretProviderAdapter): void {
    this.secretProviders.set(plugin.id, plugin);
  }

  public registerEncryptionProvider(plugin: EncryptionProviderAdapter): void {
    this.encryptionProviders.set(plugin.id, plugin);
  }

  public getIdentityProvider(id: string): IdentityProviderAdapter | undefined {
    return this.identityProviders.get(id);
  }

  public getAuthenticationProvider(id: string): AuthenticationProviderAdapter | undefined {
    return this.authProviders.get(id);
  }

  public getPolicyEvaluator(id: string): PolicyEvaluatorPlugin | undefined {
    return this.policyEvaluators.get(id);
  }

  public getComplianceValidator(id: string): ComplianceValidatorPlugin | undefined {
    return this.complianceValidators.get(id);
  }

  public getSecretProvider(id: string): SecretProviderAdapter | undefined {
    return this.secretProviders.get(id);
  }

  public getEncryptionProvider(id: string): EncryptionProviderAdapter | undefined {
    return this.encryptionProviders.get(id);
  }

  public listIdentityProviders(): IdentityProviderAdapter[] {
    return Array.from(this.identityProviders.values());
  }

  public listAuthenticationProviders(): AuthenticationProviderAdapter[] {
    return Array.from(this.authProviders.values());
  }

  public listPolicyEvaluators(): PolicyEvaluatorPlugin[] {
    return Array.from(this.policyEvaluators.values());
  }

  public listComplianceValidators(): ComplianceValidatorPlugin[] {
    return Array.from(this.complianceValidators.values());
  }

  public listSecretProviders(): SecretProviderAdapter[] {
    return Array.from(this.secretProviders.values());
  }

  public listEncryptionProviders(): EncryptionProviderAdapter[] {
    return Array.from(this.encryptionProviders.values());
  }
}

export const globalSecurityPluginRegistry = new SecurityPluginRegistry();
export default globalSecurityPluginRegistry;
