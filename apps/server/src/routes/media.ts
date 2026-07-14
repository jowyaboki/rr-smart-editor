import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffprobeStatic from 'ffprobe-static';
import { query } from '../db';

ffmpeg.setFfprobePath(ffprobeStatic.path);

const router = Router({ mergeParams: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { projectId } = req.params;
    const dir = path.join(__dirname, '../../uploads', projectId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const getMetadata = (filePath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return resolve({});
      const stream = metadata.streams[0];
      resolve({
        duration: metadata.format.duration,
        width: stream?.width,
        height: stream?.height,
      });
    });
  });
};

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileType = file.mimetype.split('/')[0];
  const url = `/uploads/${projectId}/${file.filename}`;

  const metadata = await getMetadata(file.path);

  try {
    const result = await query(
      `INSERT INTO media ("projectId", name, type, url, size, duration, width, height)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        projectId,
        file.originalname,
        fileType,
        url,
        file.size,
        metadata.duration || null,
        metadata.width || null,
        metadata.height || null,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  const { projectId } = req.params;
  try {
    const result = await query(
      'SELECT * FROM media WHERE "projectId" = $1 ORDER BY "createdAt" DESC',
      [projectId],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
