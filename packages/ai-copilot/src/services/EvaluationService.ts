export interface MetricRecord {
  id: string;
  metricName: 'ai_latency_ms' | 'acceptance_rate' | 'recommendation_quality_score' | 'workflow_completion_rate' | 'time_saved_seconds' | 'false_positives_count';
  value: number;
  timestamp: number;
}

export class EvaluationMetricsService {
  private metrics: MetricRecord[] = [];

  constructor() {
    this.seedDefaultMetrics();
  }

  private seedDefaultMetrics() {
    this.metrics.push(
      { id: 'm-1', metricName: 'ai_latency_ms', value: 420.5, timestamp: Date.now() },
      { id: 'm-2', metricName: 'acceptance_rate', value: 0.88, timestamp: Date.now() },
      { id: 'm-3', metricName: 'recommendation_quality_score', value: 4.6, timestamp: Date.now() },
      { id: 'm-4', metricName: 'workflow_completion_rate', value: 0.94, timestamp: Date.now() },
      { id: 'm-5', metricName: 'time_saved_seconds', value: 1800, timestamp: Date.now() },
      { id: 'm-6', metricName: 'false_positives_count', value: 1, timestamp: Date.now() }
    );
  }

  public trackMetric(metricName: MetricRecord['metricName'], value: number): void {
    this.metrics.push({
      id: `m-${Math.random().toString(36).substr(2, 9)}`,
      metricName,
      value,
      timestamp: Date.now(),
    });
  }

  public getDashboardMetrics(): Record<string, { average: number; count: number; total?: number }> {
    const summary: Record<string, { total: number; count: number; average: number }> = {};

    for (const record of this.metrics) {
      if (!summary[record.metricName]) {
        summary[record.metricName] = { total: 0, count: 0, average: 0 };
      }
      summary[record.metricName].total += record.value;
      summary[record.metricName].count += 1;
    }

    // Calculate averages
    const dashboard: Record<string, { average: number; count: number; total?: number }> = {};
    for (const key of Object.keys(summary)) {
      dashboard[key] = {
        average: parseFloat((summary[key].total / summary[key].count).toFixed(4)),
        count: summary[key].count,
        total: summary[key].total,
      };
    }

    return dashboard;
  }
}
