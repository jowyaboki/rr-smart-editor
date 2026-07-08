ALTER TABLE projects ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '{"tracks": [], "playhead": 0, "zoom": 1}'::jsonb;

CREATE TABLE IF NOT EXISTS renders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" UUID REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'rendering', 'completed', 'failed', 'cancelled'
  progress FLOAT NOT NULL DEFAULT 0,
  "outputUrl" TEXT,
  error TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
