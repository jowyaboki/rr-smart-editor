export class RateLimitService {
  private ipRequestsCount: Map<string, number> = new Map();

  public isRateLimited(ipAddress: string, limitPerMinute: number = 60): boolean {
    const current = this.ipRequestsCount.get(ipAddress) || 0;
    if (current >= limitPerMinute) {
      return true;
    }
    this.ipRequestsCount.set(ipAddress, current + 1);
    return false;
  }

  public resetLimits(): void {
    this.ipRequestsCount.clear();
  }
}

export const globalRateLimitService = new RateLimitService();
export default globalRateLimitService;
