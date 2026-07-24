import { BrandScore } from '../types';

export class BrandAnalyticsService {
  private validationLogs: Array<{ jobId: string; score: BrandScore; timestamp: string }> = [];

  public logAudit(jobId: string, score: BrandScore): void {
    this.validationLogs.push({
      jobId,
      score,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Generates average aggregate consistency logs
   */
  public getAverageBrandScore(): number {
    if (this.validationLogs.length === 0) return 100;
    const sum = this.validationLogs.reduce((acc, log) => acc + log.score.consistencyScore, 0);
    return sum / this.validationLogs.length;
  }

  public getLogsCount(): number {
    return this.validationLogs.length;
  }
}
