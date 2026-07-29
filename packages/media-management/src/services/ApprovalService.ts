import { MediaAsset, ApprovalRequest, ApprovalWorkflow } from '../types';
import { globalMediaManagementPluginRegistry } from '../plugins';

export class ApprovalService {
  private requests: Map<string, ApprovalRequest> = new Map();

  public submitForApproval(
    asset: MediaAsset,
    versionId: string,
    requestedBy: string,
    approvers: string[],
    workflowId?: string
  ): ApprovalRequest {
    const reqId = `req_${asset.id}_${versionId}`;

    const request: ApprovalRequest = {
      id: reqId,
      assetId: asset.id,
      versionId,
      requestedBy,
      approvers,
      currentStatus: 'review',
      comments: [`[${new Date().toISOString()}] Submitted for approval review by ${requestedBy}.`],
      updatedAt: new Date().toISOString(),
    };

    this.requests.set(reqId, request);
    asset.updatedAt = new Date().toISOString();

    return request;
  }

  public recordReviewVote(
    requestId: string,
    approver: string,
    vote: 'approve' | 'reject',
    comment?: string
  ): ApprovalRequest {
    const req = this.requests.get(requestId);
    if (!req) {
      throw new Error(`ApprovalRequest '${requestId}' not found`);
    }

    if (!req.approvers.includes(approver)) {
      throw new Error(`Approver '${approver}' is not authorized to vote on this request.`);
    }

    req.comments = req.comments || [];
    const voteText = vote === 'approve' ? 'Approved' : 'Rejected';
    req.comments.push(`[${new Date().toISOString()}] ${approver} voted: ${voteText}. Comment: ${comment || 'No comment'}`);

    if (vote === 'reject') {
      req.currentStatus = 'rejected';
    } else {
      // Simplistic threshold check: if approved, set status
      req.currentStatus = 'approved';
    }

    req.updatedAt = new Date().toISOString();
    return req;
  }

  public getApprovalRequest(id: string): ApprovalRequest | undefined {
    return this.requests.get(id);
  }

  public listApprovalRequests(): ApprovalRequest[] {
    return Array.from(this.requests.values());
  }
}

export const globalApprovalService = new ApprovalService();
