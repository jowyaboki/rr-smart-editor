"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPluginRegistry = void 0;
class RenderPluginRegistry {
    presets = new Map();
    exportFormats = new Map();
    postProcessingSteps = new Map();
    constructor() {
        this.registerPreset({
            id: 'mp4-1080p',
            name: 'MP4 1080p (Default)',
            description: 'Standard High Quality MP4 Video (H.264)',
            format: 'mp4',
            codec: 'h264',
            resolution: { width: 1920, height: 1080 },
            fps: 30,
            audioOnly: false,
        });
        this.registerPreset({
            id: 'webm-1080p',
            name: 'WebM 1080p VP8',
            description: 'High Quality WebM Video (VP8)',
            format: 'webm',
            codec: 'vp8',
            resolution: { width: 1920, height: 1080 },
            fps: 30,
            audioOnly: false,
        });
        this.registerPreset({
            id: 'gif-480p',
            name: 'GIF Animation 480p',
            description: 'Standard Animated GIF (15fps)',
            format: 'gif',
            codec: 'gif',
            resolution: { width: 854, height: 480 },
            fps: 15,
            audioOnly: false,
        });
        this.registerPreset({
            id: 'png-sequence-1080p',
            name: 'PNG Sequence 1080p',
            description: 'Folder of PNG frames',
            format: 'png',
            codec: 'png',
            resolution: { width: 1920, height: 1080 },
            fps: 30,
            audioOnly: false,
        });
        this.registerPreset({
            id: 'jpeg-sequence-1080p',
            name: 'JPEG Sequence 1080p',
            description: 'Folder of JPEG frames',
            format: 'jpeg',
            codec: 'jpeg',
            resolution: { width: 1920, height: 1080 },
            fps: 30,
            audioOnly: false,
        });
        this.registerPreset({
            id: 'audio-only-mp3',
            name: 'Audio MP3',
            description: 'Standard High Quality MP3 Audio',
            format: 'mp3',
            codec: 'mp3',
            resolution: { width: 0, height: 0 },
            fps: 0,
            audioOnly: true,
        });
        this.registerExportFormat({
            id: 'mp4',
            name: 'MPEG-4 Video',
            extension: '.mp4',
            contentType: 'video/mp4',
        });
        this.registerExportFormat({
            id: 'webm',
            name: 'WebM Video',
            extension: '.webm',
            contentType: 'video/webm',
        });
        this.registerExportFormat({
            id: 'gif',
            name: 'GIF Animation',
            extension: '.gif',
            contentType: 'image/gif',
        });
        this.registerExportFormat({
            id: 'png',
            name: 'PNG Sequence',
            extension: '.png',
            contentType: 'image/png',
        });
        this.registerExportFormat({
            id: 'jpeg',
            name: 'JPEG Sequence',
            extension: '.jpeg',
            contentType: 'image/jpeg',
        });
        this.registerExportFormat({
            id: 'mp3',
            name: 'MP3 Audio',
            extension: '.mp3',
            contentType: 'audio/mpeg',
        });
    }
    registerPreset(preset) {
        this.presets.set(preset.id, preset);
    }
    getPreset(id) {
        return this.presets.get(id);
    }
    getAllPresets() {
        return Array.from(this.presets.values());
    }
    registerExportFormat(format) {
        this.exportFormats.set(format.id, format);
    }
    getExportFormat(id) {
        return this.exportFormats.get(id);
    }
    getAllExportFormats() {
        return Array.from(this.exportFormats.values());
    }
    registerPostProcessingStep(step) {
        this.postProcessingSteps.set(step.id, step);
    }
    getPostProcessingStep(id) {
        return this.postProcessingSteps.get(id);
    }
    getAllPostProcessingSteps() {
        return Array.from(this.postProcessingSteps.values());
    }
}
exports.renderPluginRegistry = new RenderPluginRegistry();
//# sourceMappingURL=index.js.map