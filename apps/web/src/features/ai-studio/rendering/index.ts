export const requestAIRender = (timelineId: string) => ({
  jobId: `render-job-${Math.random().toString(36).substr(2, 9)}`,
  status: 'queued',
  estimatedSeconds: 30,
});
