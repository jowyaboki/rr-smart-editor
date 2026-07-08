import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import projectRoutes from './routes/projects';
import mediaRoutes from './routes/media';
import renderRoutes from './routes/renders';

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
