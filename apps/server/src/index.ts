import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import projectRoutes from './routes/projects';
import mediaRoutes from './routes/media';
import renderRoutes from './routes/renders';
import templateRoutes from './routes/templates';
import aiRoutes from './routes/ai';
import assetIntelligenceRoutes from './routes/asset-intelligence';
import renderClusterRoutes from './routes/render-cluster';
import deploymentRoutes from './routes/deployment';

import { localWorker } from './render/workers/LocalWorker';
import { renderScheduler } from './render/scheduler/RenderScheduler';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/projects', projectRoutes);
app.use('/projects/:projectId/media', mediaRoutes);
app.use('/renders', renderRoutes);
app.use('/templates', templateRoutes);
app.use('/ai', aiRoutes);
app.use('/asset-intelligence', assetIntelligenceRoutes);
app.use('/render-cluster', renderClusterRoutes);
app.use('/deployment', deploymentRoutes);

// Boot up local distributed render worker and scheduler
localWorker.start().catch((err) => {
  console.error('Failed to start local worker:', err);
});
renderScheduler.start();

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
