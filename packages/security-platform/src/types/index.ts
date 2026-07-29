import { z } from 'zod';

// Identity models
export interface Identity {
  id: string;
  username: string;
  email: string;
  status: 'active' | 'suspended' | 'deactivated';
  mfaEnabled: boolean;
  mfaSecret?: string;
  authProvider: 'password' | 'oauth2' | 'oidc' | 'saml' | 'ldap' | 'ad' | 'passkeys';
  attributes: Record<string, any>; // ABAC attributes e.g., department, location, clearancLevel
  createdAt: string;
  updatedAt: string;
}

export const IdentitySchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  status: z.enum(['active', 'suspended', 'deactivated']),
  mfaEnabled: z.boolean(),
  mfaSecret: z.string().optional(),
  authProvider: z.enum(['password', 'oauth2', 'oidc', 'saml', 'ldap', 'ad', 'passkeys']),
  attributes: z.record(z.string(), z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Session models
export interface Session {
  id: string;
  identityId: string;
  deviceInfo: {
    deviceId: string;
    userAgent: string;
    ipAddress: string;
    isTrusted: boolean;
  };
  createdAt: string;
  expiresAt: string;
  lastActiveAt: string;
  status: 'active' | 'revoked' | 'expired';
}

export const SessionSchema = z.object({
  id: z.string(),
  identityId: z.string(),
  deviceInfo: z.object({
    deviceId: z.string(),
    userAgent: z.string(),
    ipAddress: z.string(),
    isTrusted: z.boolean(),
  }),
  createdAt: z.string(),
  expiresAt: z.string(),
  lastActiveAt: z.string(),
  status: z.enum(['active', 'revoked', 'expired']),
});

// AccessPolicy and PolicyRules
export interface PolicyRule {
  id: string;
  effect: 'allow' | 'deny';
  actions: string[]; // e.g. ['read', 'write', 'delete']
  resources: string[]; // e.g. ['assets/*', 'projects/*']
  conditions?: Array<{
    attribute: string; // e.g., identity.attributes.department
    operator: 'equals' | 'contains' | 'in' | 'not_in' | 'exists';
    value: string | string[];
  }>;
}

export const PolicyRuleSchema = z.object({
  id: z.string(),
  effect: z.enum(['allow', 'deny']),
  actions: z.array(z.string()),
  resources: z.array(z.string()),
  conditions: z
    .array(
      z.object({
        attribute: z.string(),
        operator: z.enum(['equals', 'contains', 'in', 'not_in', 'exists']),
        value: z.union([z.string(), z.array(z.string())]),
      })
    )
    .optional(),
});

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  rules: PolicyRule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const AccessPolicySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  rules: z.array(PolicyRuleSchema),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Security Profile
export interface SecurityProfile {
  id: string;
  identityId: string;
  passwordComplexity: {
    minLength: number;
    requireNumbers: boolean;
    requireSpecial: boolean;
  };
  allowedIPs: string[];
  maxConcurrentSessions: number;
  sessionTimeoutMinutes: number;
}

export const SecurityProfileSchema = z.object({
  id: z.string(),
  identityId: z.string(),
  passwordComplexity: z.object({
    minLength: z.number().default(8),
    requireNumbers: z.boolean(),
    requireSpecial: z.boolean(),
  }),
  allowedIPs: z.array(z.string()),
  maxConcurrentSessions: z.number().default(5),
  sessionTimeoutMinutes: z.number().default(60),
});

// Secrets
export interface SecretReference {
  id: string;
  name: string; // e.g. AWS_ACCESS_KEY_ID
  vaultPath: string; // e.g. secrets/aws
  provider: string; // e.g. vault, aws_secrets_manager
  version: string;
  createdAt: string;
  rotatedAt?: string;
}

export const SecretReferenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  vaultPath: z.string(),
  provider: z.string(),
  version: z.string(),
  createdAt: z.string(),
  rotatedAt: z.string().optional(),
});

// Encryption
export interface EncryptionKey {
  id: string;
  alias: string;
  algorithm: string; // e.g., AES-256-GCM
  status: 'active' | 'retired' | 'compromised';
  createdAt: string;
  rotatedAt?: string;
}

export const EncryptionKeySchema = z.object({
  id: z.string(),
  alias: z.string(),
  algorithm: z.string(),
  status: z.enum(['active', 'retired', 'compromised']),
  createdAt: z.string(),
  rotatedAt: z.string().optional(),
});

// Certificates
export interface Certificate {
  id: string;
  commonName: string;
  issuer: string;
  expiresAt: string;
  status: 'valid' | 'revoked' | 'expired';
  publicKeyFingerprint: string;
  createdAt: string;
}

export const CertificateSchema = z.object({
  id: z.string(),
  commonName: z.string(),
  issuer: z.string(),
  expiresAt: z.string(),
  status: z.enum(['valid', 'revoked', 'expired']),
  publicKeyFingerprint: z.string(),
  createdAt: z.string(),
});

// Audit
export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string; // e.g., authentication.success, policy.violation
  actorId: string;
  actorType: 'user' | 'system' | 'plugin';
  resourceId?: string;
  status: 'success' | 'failure';
  details: Record<string, any>;
  ipAddress: string;
}

export const AuditEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  action: z.string(),
  actorId: z.string(),
  actorType: z.enum(['user', 'system', 'plugin']),
  resourceId: z.string().optional(),
  status: z.enum(['success', 'failure']),
  details: z.record(z.string(), z.any()),
  ipAddress: z.string(),
});

// Compliance Profile
export interface ComplianceProfile {
  id: string;
  framework: 'GDPR' | 'SOC2' | 'ISO27001' | 'HIPAA';
  rulesCheckedCount: number;
  violationsCount: number;
  complianceScore: number; // 0 - 100
  lastAuditedAt: string;
  dataResidencyCountry: string; // e.g. "DE" for GDPR Compliance
}

export const ComplianceProfileSchema = z.object({
  id: z.string(),
  framework: z.enum(['GDPR', 'SOC2', 'ISO27001', 'HIPAA']),
  rulesCheckedCount: z.number(),
  violationsCount: z.number(),
  complianceScore: z.number().min(0).max(100),
  lastAuditedAt: z.string(),
  dataResidencyCountry: z.string(),
});

// Risk Management & Monitoring
export interface RiskAssessment {
  id: string;
  identityId: string;
  riskScore: number; // 0 - 100
  anomaliesDetected: string[];
  lastCheckedAt: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const RiskAssessmentSchema = z.object({
  id: z.string(),
  identityId: z.string(),
  riskScore: z.number().min(0).max(100),
  anomaliesDetected: z.array(z.string()),
  lastCheckedAt: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
});

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: 'anomaly_detection' | 'api_abuse' | 'escalation' | 'auth_failure';
  status: 'active' | 'resolved' | 'muted';
  timestamp: string;
}

export const SecurityAlertSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  source: z.enum(['anomaly_detection', 'api_abuse', 'escalation', 'auth_failure']),
  status: z.enum(['active', 'resolved', 'muted']),
  timestamp: z.string(),
});

// Provider Adapter Interfaces for Plugin Support
export interface IdentityProviderAdapter {
  id: string;
  name: string;
  authenticate(credentials: Record<string, any>): Promise<{ success: boolean; identity?: Identity; error?: string }>;
}

export interface AuthenticationProviderAdapter {
  id: string;
  name: string;
  supportedMethods: string[]; // e.g. ['password', 'mfa', 'passkeys']
  verify(method: string, data: Record<string, any>): Promise<{ success: boolean; token?: string }>;
}

export interface PolicyEvaluatorPlugin {
  id: string;
  name: string;
  evaluate(identity: Identity, resource: string, action: string, context?: any): Promise<{ allow: boolean; policyId?: string }>;
}

export interface ComplianceValidatorPlugin {
  id: string;
  name: string;
  supportedFrameworks: string[];
  validate(framework: string, records: any[]): Promise<ComplianceProfile>;
}

export interface SecretProviderAdapter {
  id: string;
  name: string;
  getSecret(path: string): Promise<string>;
  putSecret(path: string, value: string): Promise<void>;
}

export interface EncryptionProviderAdapter {
  id: string;
  name: string;
  encrypt(plaintext: Buffer, keyId: string): Promise<{ ciphertext: Buffer; keyVersion: string }>;
  decrypt(ciphertext: Buffer, keyId: string, keyVersion: string): Promise<Buffer>;
}
