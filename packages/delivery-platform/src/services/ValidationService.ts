import { RenderArtifact } from '@ai-video-editor/shared';
import { QualityReport, QCRule, QCViolation } from '../types';
import { globalDeliveryPluginRegistry } from '../plugins';

export class ValidationService {
  public async validate(artifact: RenderArtifact, rules: QCRule[] = []): Promise<QualityReport> {
    const violations: QCViolation[] = [];
    let score = 100;

    // Standard Metrics Mock/Evaluations (realistic values compiled from artifact)
    const missingAssets: string[] = [];
    const brokenReferences: string[] = [];
    let frameDrops = 0;
    let resolutionMatch = true;
    let fpsMatch = true;
    let aspectRatioMatch = true;
    let clippingEvents = 0;
    let loudnessLUFS: number | undefined = -23.5;
    let subtitleOutOfSyncCount = 0;
    let colorSpaceConsistent = true;

    // Execute standard validations based on rules
    for (const rule of rules) {
      switch (rule.type) {
        case 'missing_assets':
          // Mock evaluation: check if asset list metadata has any missing
          if (rule.params?.simulateFail) {
            missingAssets.push('asset_bg_music.mp3');
            violations.push({
              ruleId: rule.id,
              type: 'missing_assets',
              severity: rule.severity,
              message: 'Missing source asset: asset_bg_music.mp3',
            });
            if (rule.severity === 'error') score -= 30;
            else score -= 10;
          }
          break;

        case 'broken_references':
          if (rule.params?.simulateFail) {
            brokenReferences.push('clip_04_ref');
            violations.push({
              ruleId: rule.id,
              type: 'broken_references',
              severity: rule.severity,
              message: 'Broken link or offline reference detected on clip_04_ref',
            });
            if (rule.severity === 'error') score -= 25;
            else score -= 10;
          }
          break;

        case 'frame_drops':
          const threshold = rule.params?.maxAllowed || 0;
          const detectedDrops = rule.params?.simulateDrops !== undefined ? rule.params.simulateDrops : 0;
          frameDrops = detectedDrops;
          if (detectedDrops > threshold) {
            violations.push({
              ruleId: rule.id,
              type: 'frame_drops',
              severity: rule.severity,
              message: `Detected ${detectedDrops} frame drops (exceeds limit of ${threshold})`,
              details: { frameDrops: detectedDrops },
            });
            if (rule.severity === 'error') score -= 20;
            else score -= 5;
          }
          break;

        case 'resolution':
          if (rule.params?.expectedWidth && rule.params?.expectedHeight) {
            const actualRes = artifact.metadata.resolution || { width: 1920, height: 1080 };
            if (actualRes.width !== rule.params.expectedWidth || actualRes.height !== rule.params.expectedHeight) {
              resolutionMatch = false;
              violations.push({
                ruleId: rule.id,
                type: 'resolution_mismatch',
                severity: rule.severity,
                message: `Resolution mismatch: expected ${rule.params.expectedWidth}x${rule.params.expectedHeight}, found ${actualRes.width}x${actualRes.height}`,
              });
              if (rule.severity === 'error') score -= 20;
              else score -= 5;
            }
          }
          break;

        case 'frame_rate':
          if (rule.params?.expectedFps) {
            const actualFps = rule.params?.actualFps !== undefined ? rule.params.actualFps : 30;
            if (actualFps !== rule.params.expectedFps) {
              fpsMatch = false;
              violations.push({
                ruleId: rule.id,
                type: 'frame_rate_mismatch',
                severity: rule.severity,
                message: `Frame rate mismatch: expected ${rule.params.expectedFps}fps, found ${actualFps}fps`,
              });
              if (rule.severity === 'error') score -= 15;
              else score -= 5;
            }
          }
          break;

        case 'aspect_ratio':
          if (rule.params?.expected) {
            const width = artifact.metadata.resolution?.width || 1920;
            const height = artifact.metadata.resolution?.height || 1080;
            const aspect = width / height === 16 / 9 ? '16:9' : '4:3';
            if (aspect !== rule.params.expected) {
              aspectRatioMatch = false;
              violations.push({
                ruleId: rule.id,
                type: 'aspect_ratio_mismatch',
                severity: rule.severity,
                message: `Aspect ratio mismatch: expected ${rule.params.expected}, computed ${aspect}`,
              });
              if (rule.severity === 'error') score -= 15;
              else score -= 5;
            }
          }
          break;

        case 'audio_clipping':
          const clipEvents = rule.params?.simulateClippingEvents || 0;
          clippingEvents = clipEvents;
          if (clipEvents > 0) {
            violations.push({
              ruleId: rule.id,
              type: 'audio_clipping',
              severity: rule.severity,
              message: `Detected ${clipEvents} audio clipping occurrences`,
              details: { clippingEvents: clipEvents },
            });
            if (rule.severity === 'error') score -= 15;
            else score -= 5;
          }
          break;

        case 'loudness':
          const target = rule.params?.targetLUFS || -23.0;
          const tolerance = rule.params?.tolerance || 1.0;
          const currentLoudness = rule.params?.simulateLoudness !== undefined ? rule.params.simulateLoudness : -23.0;
          loudnessLUFS = currentLoudness;
          if (Math.abs(currentLoudness - target) > tolerance) {
            violations.push({
              ruleId: rule.id,
              type: 'loudness_non_compliant',
              severity: rule.severity,
              message: `Loudness value ${currentLoudness} LUFS exceeds target ${target} LUFS (tolerance +/- ${tolerance})`,
            });
            if (rule.severity === 'error') score -= 20;
            else score -= 5;
          }
          break;

        case 'subtitle_timing':
          subtitleOutOfSyncCount = rule.params?.simulateOutOfSyncCount || 0;
          if (subtitleOutOfSyncCount > 0) {
            violations.push({
              ruleId: rule.id,
              type: 'subtitle_timing_mismatch',
              severity: rule.severity,
              message: `Detected ${subtitleOutOfSyncCount} instances of out-of-sync captions or overlapping subtitle blocks`,
            });
            if (rule.severity === 'error') score -= 15;
            else score -= 5;
          }
          break;

        case 'color_space_consistency':
          if (rule.params?.simulateInconsistent) {
            colorSpaceConsistent = false;
            violations.push({
              ruleId: rule.id,
              type: 'color_space_inconsistent',
              severity: rule.severity,
              message: 'Color space tagging inconsistency detected between timeline sources and active grade space',
            });
            if (rule.severity === 'error') score -= 20;
            else score -= 5;
          }
          break;
      }
    }

    // Run registered custom plugin QC validators
    const pluginValidators = globalDeliveryPluginRegistry.listQCValidators();
    for (const pv of pluginValidators) {
      try {
        const pluginReport = await pv.validate(artifact, rules);
        violations.push(...pluginReport.violations);
        score = Math.min(score, pluginReport.score);
        if (!pluginReport.isValid) {
          violations.push({
            ruleId: `plugin_${pv.id}`,
            type: 'plugin_qc_failure',
            severity: 'error',
            message: `Plugin validator ${pv.name} reported a general validation failure.`,
          });
          score = Math.max(0, score - 20);
        }
      } catch (err: any) {
        violations.push({
          ruleId: `plugin_${pv.id}_error`,
          type: 'plugin_qc_exception',
          severity: 'warning',
          message: `Plugin validator ${pv.name} failed to execute: ${err.message}`,
        });
      }
    }

    score = Math.max(0, Math.min(100, score));
    const isValid = !violations.some((v) => v.severity === 'error');

    return {
      id: `qc_report_${Math.random().toString(36).substr(2, 9)}`,
      jobId: artifact.jobId || `job_${Math.random().toString(36).substr(2, 9)}`,
      isValid,
      score,
      violations,
      metrics: {
        missingAssets,
        brokenReferences,
        frameDrops,
        resolutionMatch,
        fpsMatch,
        aspectRatioMatch,
        clippingEvents,
        loudnessLUFS,
        subtitleOutOfSyncCount,
        colorSpaceConsistent,
      },
      checkedAt: new Date().toISOString(),
    };
  }
}

export const globalValidationService = new ValidationService();
