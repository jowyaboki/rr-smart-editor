import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@ai-video-editor/ui';
import Dashboard from './pages/Dashboard';
import Preview from './pages/Preview';
import Editor from './pages/Editor';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><Dashboard /></Layout>} />
      <Route path="/preview" element={<Layout><Preview /></Layout>} />
      <Route path="/editor/:id" element={<Editor />} />
    </Routes>
  );
};

export default App;
