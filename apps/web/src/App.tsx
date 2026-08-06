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
import { useWorkflowStore } from './store/useWorkflowStore';

const App: React.FC = () => {
  const { workspaceLocked, toggleWorkspaceLock } = useWorkflowStore();

  return (
    <ErrorBoundary>
      <Routes>
        <Route
          path="/"
          element={
            <Layout workspaceLocked={workspaceLocked} onToggleWorkspaceLock={toggleWorkspaceLock}>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/preview"
          element={
            <Layout workspaceLocked={workspaceLocked} onToggleWorkspaceLock={toggleWorkspaceLock}>
              <Preview />
            </Layout>
          }
        />
        <Route
          path="/templates"
          element={
            <Layout workspaceLocked={workspaceLocked} onToggleWorkspaceLock={toggleWorkspaceLock}>
              <Templates />
            </Layout>
          }
        />
        <Route
          path="/workflows"
          element={
            <Layout workspaceLocked={workspaceLocked} onToggleWorkspaceLock={toggleWorkspaceLock}>
              <Workflows />
            </Layout>
          }
        />
        <Route
          path="/renders"
          element={
            <Layout workspaceLocked={workspaceLocked} onToggleWorkspaceLock={toggleWorkspaceLock}>
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
