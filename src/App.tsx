import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { MoviePage } from './pages/MoviePage';
import { TVShowPage } from './pages/TVShowPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="movie/:id/:title" element={<MoviePage />} />
              <Route path="tv/:id/:title" element={<TVShowPage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;