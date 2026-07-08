import { Router } from 'express';
import { aiService } from '../services/aiService';
import { AIRequestSchema } from '@ai-video-editor/shared';
import { logger } from '../utils/logger';
import { handleError, ApiError } from '../utils/errors';

const router = Router();

router.post('/generate-script', async (req, res) => {
  try {
    const validated = AIRequestSchema.parse(req.body);
    if (!validated.prompt) throw new ApiError(400, 'Prompt is required');

    logger.info(`Generating script for prompt: ${validated.prompt}`);
    const script = await aiService.generateScript(validated.prompt);
    res.json(script);
  } catch (err) {
    handleError(err, res);
  }
});

router.post('/generate-image', async (req, res) => {
  try {
    const validated = AIRequestSchema.parse(req.body);
    if (!validated.prompt) throw new ApiError(400, 'Prompt is required');

    logger.info(`Generating image for prompt: ${validated.prompt}`);
    const image = await aiService.generateImage(validated.prompt);
    res.json(image);
  } catch (err) {
    handleError(err, res);
  }
});

router.post('/generate-voiceover', async (req, res) => {
  try {
    const validated = AIRequestSchema.parse(req.body);
    if (!validated.text) throw new ApiError(400, 'Text is required');

    logger.info(`Generating voiceover for text length: ${validated.text.length}`);
    const voiceover = await aiService.generateVoiceover(validated.text);
    res.json(voiceover);
  } catch (err) {
    handleError(err, res);
  }
});

export default router;
