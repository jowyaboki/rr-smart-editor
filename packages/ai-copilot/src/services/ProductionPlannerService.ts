import { ProductionBrief, ProductionArtifact } from './AIAgentOrchestrationService';

export interface Milestone {
  id: string;
  name: string;
  stage: 'planning' | 'writing' | 'storyboard' | 'editing' | 'review' | 'render' | 'publish';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  estimatedDurationMs: number;
  assignedAgent?: string;
  approvalRequired: boolean;
}

export interface ProductionPlan {
  id: string;
  brief: ProductionBrief;
  milestones: Milestone[];
  risks: string[];
  recoveryStrategy: string;
  createdAt: string;
}

export class ProductionPlannerService {
  private activePlans: Map<string, ProductionPlan> = new Map();

  /**
   * Converts a structured Production Brief into an executable, editable Production Plan.
   */
  public createProductionPlan(brief: ProductionBrief): ProductionPlan {
    const planId = `plan-${Math.random().toString(36).substr(2, 5)}`;

    const milestones: Milestone[] = [
      {
        id: 'ms-1',
        name: 'Compile Creative Objectives & Brief Alignment',
        stage: 'planning',
        status: 'completed',
        estimatedDurationMs: 1200,
        assignedAgent: 'Sarah (Creative Director)',
        approvalRequired: true
      },
      {
        id: 'ms-2',
        name: 'Script Writing & Voiceover Line Formatting',
        stage: 'writing',
        status: 'in_progress',
        estimatedDurationMs: 2500,
        assignedAgent: 'Michael (Script Writer)',
        approvalRequired: true
      },
      {
        id: 'ms-3',
        name: 'Storyboard Visual Placeholders & Asset Requirements',
        stage: 'storyboard',
        status: 'pending',
        estimatedDurationMs: 3000,
        assignedAgent: 'James (Storyboard Planner)',
        approvalRequired: true
      },
      {
        id: 'ms-4',
        name: 'Multi-Track Timeline Clip Insertion',
        stage: 'editing',
        status: 'pending',
        estimatedDurationMs: 4000,
        assignedAgent: 'Timeline Builder Engine',
        approvalRequired: false
      },
      {
        id: 'ms-5',
        name: 'Frame-accurate Review & Subtitle Translation',
        stage: 'review',
        status: 'pending',
        estimatedDurationMs: 2000,
        assignedAgent: 'Guest Reviewer',
        approvalRequired: true
      },
      {
        id: 'ms-6',
        name: 'Distributed Render Sharding & SLA Packaging',
        stage: 'render',
        status: 'pending',
        estimatedDurationMs: 5000,
        assignedAgent: 'Render Cluster Engine',
        approvalRequired: false
      }
    ];

    const plan: ProductionPlan = {
      id: planId,
      brief,
      milestones,
      risks: [
        'High compute demand during render sharding phase.',
        'Unresolved audio background noise on track A1.'
      ],
      recoveryStrategy: 'Enable deterministic SQL fallback and automatic high-pass audio filtering.',
      createdAt: new Date().toISOString()
    };

    this.activePlans.set(planId, plan);
    return plan;
  }

  public getPlan(planId: string): ProductionPlan | undefined {
    return this.activePlans.get(planId);
  }

  public updateMilestoneStatus(planId: string, milestoneId: string, status: Milestone['status']) {
    const plan = this.activePlans.get(planId);
    if (plan) {
      const ms = plan.milestones.find(m => m.id === milestoneId);
      if (ms) {
        ms.status = status;
      }
    }
  }
}

export const globalProductionPlannerService = new ProductionPlannerService();
export default globalProductionPlannerService;
