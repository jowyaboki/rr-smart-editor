import { describe, test } from 'node:test';
import assert from 'node:assert';

import {
  RRClient,
} from '../src/index';

describe('Public Client SDK Complete Certification (Phase 2)', () => {

  test('TS Client compiles and executes basic API calls matching specifications', async () => {
    const client = new RRClient({
      apiKey: 'rr_live_validKey_101',
      baseUrl: 'https://api.onrender.com',
    });

    // 1. PROJECT API
    const projects = await client.getProjects();
    assert.strictEqual(projects.success, true);
    assert.strictEqual(projects.projects[0].id, 'proj_01');

    const created = await client.createProject('Holiday Promo Reel');
    assert.strictEqual(created.success, true);
    assert.ok(created.projectId.startsWith('proj_'));

    const updated = await client.updateProject('proj_01', { fps: 60 });
    assert.strictEqual(updated.success, true);

    // 2. TIMELINE API
    const timeline = await client.getTimeline('proj_01');
    assert.strictEqual(timeline.success, true);
    assert.strictEqual(timeline.timeline.tracks[0].clips[0].name, 'Intro Blueprint');

    const timelineUpdate = await client.updateTimeline('proj_01', timeline.timeline);
    assert.strictEqual(timelineUpdate.success, true);

    const inserted = await client.insertClips('proj_01', 'track_v1', [
      { id: 'clip_02', name: 'Overlay B-Roll', start: 150, duration: 60, trackId: 'track_v1' }
    ]);
    assert.strictEqual(inserted.success, true);
    assert.deepStrictEqual(inserted.insertedIds, ['clip_02']);

    const deleted = await client.deleteClips('proj_01', ['clip_02']);
    assert.strictEqual(deleted.success, true);

    // 3. PLAYBACK API
    const playing = await client.play('proj_01');
    assert.strictEqual(playing.success, true);
    assert.strictEqual(playing.state, 'playing');

    const paused = await client.pause('proj_01');
    assert.strictEqual(paused.success, true);
    assert.strictEqual(paused.state, 'paused');

    const seeked = await client.seek('proj_01', 300);
    assert.strictEqual(seeked.success, true);
    assert.strictEqual(seeked.currentFrame, 300);

    const speedSet = await client.setSpeed('proj_01', 2.0);
    assert.strictEqual(speedSet.success, true);
    assert.strictEqual(speedSet.speed, 2.0);

    // 4. RENDER API
    const renderResult = await client.triggerRender({ tracks: [] });
    assert.strictEqual(renderResult.success, true);
    assert.ok(renderResult.jobId.startsWith('job_'));

    const renderStatus = await client.getRenderStatus(renderResult.jobId);
    assert.strictEqual(renderStatus.success, true);
    assert.strictEqual(renderStatus.status, 'completed');
    assert.strictEqual(renderStatus.progress, 100);

    const cancelRender = await client.cancelRender(renderResult.jobId);
    assert.strictEqual(cancelRender.success, true);

    // 5. EFFECTS API
    const effects = await client.listEffects();
    assert.strictEqual(effects.success, true);
    assert.strictEqual(effects.effects[0].id, 'eff_blur');

    const appliedEffect = await client.applyEffect('proj_01', 'clip_01', 'eff_blur', { radius: 10 });
    assert.strictEqual(appliedEffect.success, true);
    assert.ok(appliedEffect.effectInstanceId.startsWith('eff_inst_'));

    const removedEffect = await client.removeEffect('proj_01', 'clip_01', appliedEffect.effectInstanceId);
    assert.strictEqual(removedEffect.success, true);

    // 6. WORKFLOW API
    const workflowTrigger = await client.triggerWorkflow('wf_cleanup', { autoTrim: true });
    assert.strictEqual(workflowTrigger.success, true);
    assert.ok(workflowTrigger.executionId.startsWith('exec_'));

    const workflowStatus = await client.getWorkflowStatus(workflowTrigger.executionId);
    assert.strictEqual(workflowStatus.success, true);
    assert.strictEqual(workflowStatus.status, 'completed');

    // 7. PUBLISHING API
    const targets = await client.getPublishingTargets();
    assert.strictEqual(targets.success, true);
    assert.strictEqual(targets.targets[0].id, 'target_youtube');

    const published = await client.publishToTarget('target_youtube', 'job_v1', {});
    assert.strictEqual(published.success, true);
    assert.strictEqual(published.publishUrl, 'https://target_youtube.com/watch/video_job_v1');

    // 8. TEMPLATE API
    const templates = await client.listTemplates('Shorts');
    assert.strictEqual(templates.success, true);
    assert.strictEqual(templates.templates[0].id, 'tpl_shorts');

    const executedTemplate = await client.executeTemplate('tpl_shorts', { text_title: 'Welcome!' });
    assert.strictEqual(executedTemplate.success, true);
    assert.ok(executedTemplate.projectId.startsWith('proj_'));

    // 9. AI API
    const scriptResult = await client.generateScript('Cinematic aerial flyover', 'corporate');
    assert.strictEqual(scriptResult.success, true);
    assert.ok(scriptResult.script.includes('Cinematic aerial flyover'));

    const captionResult = await client.generateAudioCaptions('https://assets/audio_track.mp3');
    assert.strictEqual(captionResult.success, true);
    assert.strictEqual(captionResult.captions[0].text, 'Welcome to the future of editing');

    const conceptResult = await client.generateVisualConcept('asset_01');
    assert.strictEqual(conceptResult.success, true);
    assert.ok(conceptResult.concepts.includes('cinematic'));

    // 10. PLUGIN API
    const permissionResult = await client.checkPluginPermission('plugin_vfx_01', 'rendering');
    assert.strictEqual(permissionResult.success, true);
    assert.strictEqual(permissionResult.granted, true);

    const dynamicEndpoint = await client.registerPluginEndpoint({ path: '/v1/custom', method: 'GET', scopes: [] });
    assert.strictEqual(dynamicEndpoint.success, true);
  });
});
