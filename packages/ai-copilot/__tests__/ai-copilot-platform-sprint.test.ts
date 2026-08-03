import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  CopilotService,
  SemanticIndexingService,
  WorkflowTemplatesService,
  KnowledgeEngineRAGService,
  CreativeRecommendationService,
  AutomationAgentsService,
  ActionLearningService,
  EvaluationMetricsService,
} from '../src/index';

describe('RR Smart Editor Intelligence Platform integration Tests', () => {

  test('Phase 1 & 2: Project Copilot Timeline operations and Reversibility Checks', async () => {
    const copilot = new CopilotService();

    // 1. Trim clip
    const trimRes = await copilot.trimClip('proj-123', 'clip-1', 1.5, 8.2);
    assert.strictEqual(trimRes.success, true);
    assert.strictEqual(trimRes.action, 'trim');
    assert.strictEqual(trimRes.reversible, true);

    // 2. Split clip
    const splitRes = await copilot.splitClip('proj-123', 'clip-1', 5.0);
    assert.strictEqual(splitRes.success, true);
    assert.strictEqual(splitRes.resultingClips.length, 2);

    // 3. Rearrange clips
    const rearrangeRes = await copilot.rearrangeClips('proj-123', ['clip-2', 'clip-1']);
    assert.strictEqual(rearrangeRes.success, true);

    // 4. Transitions
    const transRes = await copilot.generateTransitions('proj-123', 'dissolve', 400);
    assert.strictEqual(transRes.success, true);

    // 5. Detect silence
    const silence = await copilot.detectSilence('proj-123');
    assert.strictEqual(silence.length, 2);

    // 6. Filler words removal
    const fillerRes = await copilot.removeFillerWords('proj-123', ['um']);
    assert.strictEqual(fillerRes.success, true);

    // 7. Audio normalize
    const normRes = await copilot.normalizeAudio('proj-123', -14);
    assert.strictEqual(normRes.success, true);

    // 8. Chapters
    const chapters = await copilot.generateChapterMarkers('proj-123');
    assert.strictEqual(chapters.length, 3);
  });

  test('Phase 3: Semantic Indexing and Multi-modal Search queries', () => {
    const search = new SemanticIndexingService();
    const projectId = 'proj-abc';

    // Index multimodal content records
    search.indexContent(projectId, [
      { id: 'rec-1', type: 'speech', content: 'We need to normalize the audio faders.', startTime: 10, endTime: 15 },
      { id: 'rec-2', type: 'object', content: 'Red color sports car driving fast.', startTime: 20, endTime: 25 },
      { id: 'rec-3', type: 'face', content: 'John Doe smiling face outline.', startTime: 5, endTime: 7 },
      { id: 'rec-4', type: 'ocr', content: 'Text: Broadway Promo sequence.', startTime: 0, endTime: 3 }
    ]);

    // Search object match
    const searchRes1 = search.searchSemantic(projectId, 'sports car');
    assert.strictEqual(searchRes1.length, 1);
    assert.strictEqual(searchRes1[0].type, 'object');

    // Search speech match
    const searchRes2 = search.searchSemantic(projectId, 'normalize');
    assert.strictEqual(searchRes2.length, 1);
    assert.strictEqual(searchRes2[0].type, 'speech');
  });

  test('Phase 4: Reusable AI Workflows selection and sequence verification', () => {
    const flows = new WorkflowTemplatesService();

    const templates = flows.listTemplates();
    assert.strictEqual(templates.length, 6);

    const podcastFlow = flows.getWorkflowTemplate('podcast_flow');
    assert.ok(podcastFlow);
    assert.strictEqual(podcastFlow?.targetCategory, 'podcast');
    assert.strictEqual(podcastFlow?.steps.length, 3);
  });

  test('Phase 5: Knowledge Engine RAG semantic retrieval matches', () => {
    const rag = new KnowledgeEngineRAGService();

    // Query splitting guide
    const res1 = rag.queryRAG('trimming');
    assert.ok(res1.answer.includes('NLE Timeline Trimming'));
    assert.strictEqual(res1.matchedSources.length, 1);

    // Query missing terms
    const res2 = rag.queryRAG('unknown query term');
    assert.ok(res2.answer.includes('could not locate'));
  });

  test('Phase 6: Creative Recommendation system outputs', () => {
    const recommender = new CreativeRecommendationService();

    // Low pacing recommendations
    const recs1 = recommender.generateRecommendations('proj-1', { tracks: [{ clips: [1, 2] }] });
    assert.ok(recs1.some(r => r.category === 'music' && r.suggestion.includes('acoustic')));

    // High pacing recommendations (multiple clips)
    const recs2 = recommender.generateRecommendations('proj-1', { tracks: [{ clips: [1, 2, 3, 4, 5, 6, 7] }] });
    assert.ok(recs2.some(r => r.category === 'music' && r.suggestion.includes('synthwave')));
  });

  test('Phase 7: Automation agents dispatching tasks', async () => {
    const agents = new AutomationAgentsService();

    const task = await agents.executeAgent('batch_export', { format: 'mp4', resolution: '1080p' });
    assert.strictEqual(task.status, 'completed');
    assert.strictEqual(task.result.success, true);
  });

  test('Phase 8: Action Learning privacy consent opt-in guards', () => {
    const learning = new ActionLearningService();
    const userId = 'user-jules';

    // 1. Learn action without consent -> should block and return false
    const learned1 = learning.learnFromUserAction(userId, 'transition', { type: 'slide' });
    assert.strictEqual(learned1, false);
    assert.strictEqual(learning.getUserHabits(userId), null);

    // 2. Learn action after consent opt-in -> should allow and save habits
    learning.setUserConsent(userId, true);
    const learned2 = learning.learnFromUserAction(userId, 'transition', { type: 'slide' });
    assert.strictEqual(learned2, true);

    const habits = learning.getUserHabits(userId);
    assert.ok(habits);
    assert.strictEqual(habits?.preferredTransitions[0], 'slide');
  });

  test('Phase 9: Evaluation and dashboards metrics tracking aggregates', () => {
    const evaluation = new EvaluationMetricsService();

    evaluation.trackMetric('ai_latency_ms', 400.0);
    evaluation.trackMetric('acceptance_rate', 0.92);

    const dbMetrics = evaluation.getDashboardMetrics();
    assert.ok(dbMetrics.ai_latency_ms);
    assert.strictEqual(dbMetrics.ai_latency_ms.count, 2); // 1 default seed + 1 tracked
    assert.strictEqual(dbMetrics.ai_latency_ms.average, 410.25); // (420.5 + 400) / 2
  });
});
