import { CopilotSession, CopilotCommand, EditingIntent, ExecutionPlan, ChangePreview, SuggestedChange, ApprovalRequest, ConversationHistory, EditingIntentType } from '../types';

// ==========================================
// 1. INTENT SERVICE
// ==========================================
export class IntentService {
  /**
   * Detects semantic intention from natural prompt strings
   */
  public parseIntent(prompt: string): EditingIntent {
    const p = prompt.toLowerCase();

    if (p.includes('split') || p.includes('clip') || p.includes('cut') || p.includes('move')) {
      return {
        type: 'timeline_edit',
        confidence: 0.95,
        parameters: { action: p.includes('split') ? 'split' : 'move', targetId: 'clip-1', value: 5.0 },
      };
    }

    if (p.includes('replace') || p.includes('asset') || p.includes('image')) {
      return {
        type: 'asset_replace',
        confidence: 0.9,
        parameters: { originalId: 'asset-1', targetUrl: 'https://cdn.com/asset-new.png' },
      };
    }

    if (p.includes('subtitle') || p.includes('caption') || p.includes('dialogue')) {
      return {
        type: 'caption_edit',
        confidence: 0.88,
        parameters: { clipId: 'clip-1', text: 'Updated subtitle text' },
      };
    }

    // Default fallback
    return {
      type: 'timeline_edit',
      confidence: 0.5,
      parameters: { prompt },
    };
  }
}

// ==========================================
// 2. PLANNING SERVICE
// ==========================================
export class PlanningService {
  /**
   * Compiles natural prompt intentions into multi-step transaction steps based on active context
   */
  public compilePlan(intent: EditingIntent, projectGraph: any): ExecutionPlan {
    const planId = `plan-${Math.random().toString(36).substr(2, 9)}`;

    const steps = [
      {
        id: 'step-1',
        description: `Compile transaction: ${intent.type} on path ${JSON.stringify(intent.parameters)}`,
        action: intent.type === 'timeline_edit' ? 'MoveClipTransaction' : 'ModifyAssetTransaction',
        arguments: intent.parameters,
      }
    ];

    const preview: ChangePreview = {
      affectedSceneIds: ['scene-1'],
      timelineModificationsDescription: `Modify clip timeline properties: offset shift.`,
      estimatedRenderImpactMs: 4500,
      undoCheckpointId: `undo-chk-${Math.random().toString(36).substr(2, 9)}`,
    };

    return {
      id: planId,
      steps,
      preview,
    };
  }
}

// ==========================================
// 3. PREVIEW SERVICE
// ==========================================
export class PreviewService {
  public generateChangeVisualHighlights(preview: ChangePreview): string {
    return `visual-highlights-for-undo-checkpoint-${preview.undoCheckpointId}-estimated-impact-${preview.estimatedRenderImpactMs}ms`;
  }
}

// ==========================================
// 4. SUGGESTION SERVICE
// ==========================================
export class SuggestionService {
  /**
   * Proactively scans project settings to recommend pacing, style, and brand optimizations
   */
  public analyzeProjectAnomalies(project: any): SuggestedChange[] {
    const suggestions: SuggestedChange[] = [];

    // Check long silent gaps
    if (project.timeline?.audioGapsCount > 0) {
      suggestions.push({
        id: 'sug-1',
        type: 'silent_gap',
        description: 'Remove long silent gap in timeline soundtrack.',
        affectedElementId: 'audio-gap-1',
        parameters: { durationSeconds: 2.5 },
      });
    }

    // Check subtitle overlaps
    if (project.timeline?.subtitleOverlaysCount > 0) {
      suggestions.push({
        id: 'sug-2',
        type: 'subtitle_overlap',
        description: 'Resolve overlapping word-level subtitles.',
        affectedElementId: 'sub-clip-2',
        parameters: { overlapMs: 400 },
      });
    }

    return suggestions;
  }
}

// ==========================================
// 5. APPROVAL SERVICE
// ==========================================
export class ApprovalService {
  private approvals = new Map<string, ApprovalRequest>();

  public createRequest(planId: string): ApprovalRequest {
    const req: ApprovalRequest = {
      id: `req-${Math.random().toString(36).substr(2, 9)}`,
      planId,
      status: 'pending',
      requestedAt: Date.now(),
    };
    this.approvals.set(req.id, req);
    return req;
  }

  public approve(reqId: string): void {
    const req = this.approvals.get(reqId);
    if (req) {
      req.status = 'approved';
    }
  }

  public reject(reqId: string): void {
    const req = this.approvals.get(reqId);
    if (req) {
      req.status = 'rejected';
    }
  }

  public getRequest(id: string): ApprovalRequest | undefined {
    return this.approvals.get(id);
  }
}

// ==========================================
// 6. MASTER COPILOT ORCHESTRATOR
// ==========================================
export class CopilotService {
  public readonly intents = new IntentService();
  public readonly planner = new PlanningService();
  public readonly preview = new PreviewService();
  public readonly suggestions = new SuggestionService();
  public readonly approvals = new ApprovalService();

  private activeSession: CopilotSession | null = null;

  public startSession(id: string, projectId: string): CopilotSession {
    this.activeSession = {
      id,
      projectId,
      history: [],
      activePlan: null,
    };
    return this.activeSession;
  }

  public getSession(): CopilotSession | null {
    return this.activeSession;
  }

  /**
   * Pipeline Execution:
   * Prompt -> Intent -> Plan -> Preview -> User Approval -> Transaction
   */
  public async processNaturalLanguageCommand(
    prompt: string,
    projectContext: any
  ): Promise<{ textResponse: string; plan: ExecutionPlan; approvalReq: ApprovalRequest }> {
    if (!this.activeSession) {
      throw new Error('Copilot session not active.');
    }

    this.activeSession.history.push({
      id: `hist-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      message: prompt,
      timestamp: Date.now(),
    });

    // 1. Detect Semantic Intentions
    const intent = this.intents.parseIntent(prompt);

    // 2. Compile execution transaction plan
    const plan = this.planner.compilePlan(intent, projectContext);
    this.activeSession.activePlan = plan;

    // 3. Register user approval request
    const approvalReq = this.approvals.createRequest(plan.id);

    const textResponse = `I detected your editing intent to **${intent.type.toUpperCase().replace('_', ' ')}** (Confidence: ${Math.round(intent.confidence * 100)}%). I compiled an edit plan affecting ${plan.preview.affectedSceneIds.length} scene(s). Please review and approve.`;

    this.activeSession.history.push({
      id: `hist-${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      message: textResponse,
      timestamp: Date.now(),
    });

    return {
      textResponse,
      plan,
      approvalReq,
    };
  }
}
