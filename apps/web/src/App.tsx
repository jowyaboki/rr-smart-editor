import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@ai-video-editor/ui';
import Dashboard from './pages/Dashboard';
import Preview from './pages/Preview';
import Editor from './pages/Editor';
import Templates from './pages/Templates';
import ProjectsPage from './features/projects/pages/ProjectsPage';
import MediaPage from './features/media/pages/MediaPage';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/projects" element={<Layout><ProjectsPage /></Layout>} />
      <Route path="/media" element={<Layout><MediaPage /></Layout>} />
      <Route path="/preview" element={<Layout><Preview /></Layout>} />
      <Route path="/templates" element={<Layout><Templates /></Layout>} />
      <Route path="/editor/:id" element={<Editor />} />
    </Routes>
import { ErrorBoundary } from './features/release/components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/preview"
          element={
            <Layout>
              <Preview />
            </Layout>
          }
        />
        <Route
          path="/templates"
          element={
            <Layout>
              <Templates />
            </Layout>
          }
        />
        <Route path="/editor/:id" element={<Editor />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
