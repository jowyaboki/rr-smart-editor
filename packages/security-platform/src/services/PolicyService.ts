import { Identity, AccessPolicy } from '../types';
import { globalSecurityPluginRegistry } from '../plugins';

export class PolicyService {
  private policies: Map<string, AccessPolicy> = new Map();

  constructor() {
    this.createDefaultPolicies();
  }

  private createDefaultPolicies(): void {
    const defaultPolicies: AccessPolicy[] = [
      {
        id: 'policy_internal_clearance',
        name: 'Internal Assets Clearance',
        description: 'Enforces attribute-based access level for internal media assets.',
        isActive: true,
        rules: [
          {
            id: 'rule_allow_internal',
            effect: 'allow',
            actions: ['read', 'write'],
            resources: ['assets/internal/*', 'projects/*'],
            conditions: [
              {
                attribute: 'clearanceLevel',
                operator: 'equals',
                value: 'internal',
              },
            ],
          },
          {
            id: 'rule_deny_critical_for_low_clearance',
            effect: 'deny',
            actions: ['delete'],
            resources: ['assets/critical/*'],
            conditions: [
              {
                attribute: 'clearanceLevel',
                operator: 'not_in',
                value: ['critical'],
              },
            ],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const p of defaultPolicies) {
      this.policies.set(p.id, p);
    }
  }

  public async evaluateAccess(
    identity: Identity,
    resource: string,
    action: string,
    context?: any
  ): Promise<{ allow: boolean; reason?: string }> {
    // 1. Evaluate through plugin evaluators if registered
    const evaluators = globalSecurityPluginRegistry.listPolicyEvaluators();
    for (const ev of evaluators) {
      const res = await ev.evaluate(identity, resource, action, context);
      if (!res.allow) {
        return { allow: false, reason: `PolicyEvaluatorPlugin '${ev.name}' denied access.` };
      }
    }

    // 2. Evaluate active policies
    let isAllowed = false;
    let explicitlyDenied = false;

    for (const policy of this.policies.values()) {
      if (!policy.isActive) continue;

      for (const rule of policy.rules) {
        // Match resource
        const resourceMatch = rule.resources.some((pattern) => {
          if (pattern === '*' || pattern === resource) return true;
          if (pattern.endsWith('/*')) {
            const prefix = pattern.slice(0, -2);
            return resource.startsWith(prefix);
          }
          return false;
        });

        if (!resourceMatch) continue;

        // Match action
        const actionMatch = rule.actions.includes('*') || rule.actions.includes(action);
        if (!actionMatch) continue;

        // Match ABAC conditions
        let conditionsMatch = true;
        if (rule.conditions && rule.conditions.length > 0) {
          for (const cond of rule.conditions) {
            const attrValue = identity.attributes[cond.attribute];

            if (cond.operator === 'equals') {
              if (attrValue !== cond.value) conditionsMatch = false;
            } else if (cond.operator === 'not_in') {
              const restrictList = Array.isArray(cond.value) ? cond.value : [cond.value];
              if (restrictList.includes(attrValue)) conditionsMatch = false;
            } else if (cond.operator === 'contains') {
              if (typeof attrValue === 'string' && typeof cond.value === 'string') {
                if (!attrValue.includes(cond.value)) conditionsMatch = false;
              } else {
                conditionsMatch = false;
              }
            }
          }
        }

        if (conditionsMatch) {
          if (rule.effect === 'deny') {
            explicitlyDenied = true;
          } else {
            isAllowed = true;
          }
        }
      }
    }

    if (explicitlyDenied) {
      return { allow: false, reason: 'Explicit deny rule matched.' };
    }

    if (!isAllowed) {
      return { allow: false, reason: 'No matching allow policy rules.' };
    }

    return { allow: true };
  }

  public registerPolicy(policy: AccessPolicy): void {
    this.policies.set(policy.id, policy);
  }

  public getPolicy(id: string): AccessPolicy | undefined {
    return this.policies.get(id);
  }

  public listPolicies(): AccessPolicy[] {
    return Array.from(this.policies.values());
  }
}

export const globalPolicyService = new PolicyService();
export default globalPolicyService;
