CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'image', 'video', 'audio'
  url TEXT NOT NULL,
  size BIGINT NOT NULL,
  duration FLOAT,
  width INTEGER,
  height INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
