import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@ai-video-editor/ui';
import Dashboard from './pages/Dashboard';
import Preview from './pages/Preview';
import Editor from './pages/Editor';
import Templates from './pages/Templates';
import Workflows from './pages/Workflows';
import Renders from './pages/Renders';
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
        <Route
          path="/workflows"
          element={
            <Layout>
              <Workflows />
            </Layout>
          }
        />
        <Route
          path="/renders"
          element={
            <Layout>
              <Renders />
            </Layout>
          }
        />
        <Route path="/editor/:id" element={<Editor />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
