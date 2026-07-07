import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@ai-video-editor/ui';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Layout>
  );
};

export default App;
