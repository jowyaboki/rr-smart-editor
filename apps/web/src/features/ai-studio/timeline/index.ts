export const constructAITimeline = (clips: any[]) => ({
  id: 'timeline-main',
  tracks: [
    { id: 't-1', type: 'video', clips }
  ],
});
