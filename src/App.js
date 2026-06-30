import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageProvider';
import SkipLinks from './components/SkipLinks';
import HomePage from './pages/HomePage';
import PreciosPage from './pages/PreciosPage';
import PrivacidadPage from './pages/PrivacidadPage';
import './index.css';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen">
          <SkipLinks />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/precios" element={<PreciosPage />} />
            <Route path="/privacidad" element={<PrivacidadPage />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
