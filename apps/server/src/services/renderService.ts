import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
import { query } from '../db';

export const renderProject = async (projectId: string, renderId: string, timeline: any) => {
  const entry = path.join(__dirname, '../../../web/src/remotion/index.ts');
  const outputDir = path.join(__dirname, '../../uploads/renders');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, `${renderId}.mp4`);

  try {
    await query('UPDATE renders SET status = $1 WHERE id = $2', ['rendering', renderId]);

    const bundled = await bundle(entry);
    const composition = await selectComposition({
      serveUrl: bundled,
      id: 'HelloWorld',
      inputProps: { timeline },
    });

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: { timeline },
      onProgress: async ({ progress }) => {
        await query('UPDATE renders SET progress = $1 WHERE id = $2', [progress * 100, renderId]);
      },
    });

    await query('UPDATE renders SET status = $1, progress = 100, "outputUrl" = $2 WHERE id = $3', [
      'completed',
      `/uploads/renders/${renderId}.mp4`,
      renderId,
    ]);
  } catch (err: any) {
    console.error('Render failed:', err);
    await query('UPDATE renders SET status = $1, error = $2 WHERE id = $3', [
      'failed',
      err.message,
      renderId,
    ]);
  }
};
