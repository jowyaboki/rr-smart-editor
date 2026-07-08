import { Router } from 'express';
import { getAIServiceProvider } from '../providers/ai/factory';

const router = Router();

router.post('/generate-script', async (req, res) => {
  const { prompt } = req.body;
  try {
    const ai = getAIServiceProvider();
    const script = await ai.generateScript(prompt);
    res.json({ script });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI Service Error' });
  }
});

router.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;
  try {
    const ai = getAIServiceProvider();
    const imageUrl = await ai.generateImage(prompt);
    res.json({ imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI Service Error' });
  }
});

router.post('/generate-voiceover', async (req, res) => {
  const { text } = req.body;
  try {
    const ai = getAIServiceProvider();
    const audioUrl = await ai.generateVoiceover(text);
    res.json({ audioUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI Service Error' });
  }
});

export default router;
