import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageProvider';
import SkipLinks from './components/SkipLinks';
import CookieBanner from './components/CookieBanner';
import HomePage from './pages/HomePage';
import PreciosPage from './pages/PreciosPage';
import GraciasPage from './pages/GraciasPage';
import PrivacidadPage from './pages/PrivacidadPage';
import AvisoLegalPage from './pages/AvisoLegalPage';
import TerminosPage from './pages/TerminosPage';
import ConveniosIndexPage from './pages/ConveniosIndexPage';
import TransporteSanitarioPage from './pages/TransporteSanitarioPage';
import ConvenioPage from './pages/ConvenioPage';
import NotFoundPage from './pages/NotFoundPage';
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
            {/* Aterrizaje tras pagar en Stripe: canjea la sesion por el acceso. */}
            <Route path="/gracias" element={<GraciasPage />} />
            <Route path="/privacidad" element={<PrivacidadPage />} />
            <Route path="/aviso-legal" element={<AvisoLegalPage />} />
            <Route path="/terminos" element={<TerminosPage />} />
            <Route path="/convenios" element={<ConveniosIndexPage />} />
            <Route path="/convenios/transporte-sanitario" element={<TransporteSanitarioPage />} />
            <Route path="/convenio/:slug" element={<ConvenioPage />} />
            {/* Sin esto, cualquier URL desconocida (o /en, que no existe) quedaba en blanco con 200. */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <CookieBanner />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
