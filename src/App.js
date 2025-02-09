import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import HomePage from './pages/HomePage';
import MergePage from './pages/merge/MergePage';
import StampPage from './pages/stamp/StampPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/merge" element={<MergePage />} />
          <Route path="/stamp" element={<StampPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
