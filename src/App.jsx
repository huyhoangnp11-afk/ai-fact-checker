import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import { VocabularyProvider } from './context/VocabularyContext';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Study = lazy(() => import('./pages/Study'));
const Stats = lazy(() => import('./pages/Stats'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const MemeGamePage = lazy(() => import('./pages/MemeGamePage'));

function App() {
  return (
    <Router>
      <VocabularyProvider>
        <Layout>
          <Suspense fallback={<LoadingSpinner message="Đang tải..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/study" element={<Study />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/meme-game" element={<MemeGamePage />} />
              <Route path="/stats" element={<Stats />} />
            </Routes>
          </Suspense>
        </Layout>
      </VocabularyProvider>
    </Router>
  );
}

export default App;
