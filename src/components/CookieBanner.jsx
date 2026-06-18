import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try { if (!localStorage.getItem('nominia_cookies_ok')) setVisible(true); } catch (e) { setVisible(true); }
  }, []);
  if (!visible) return null;
  const accept = () => { try { localStorage.setItem('nominia_cookies_ok', '1'); } catch (e) {} setVisible(false); };
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-300 flex-1">
          🍪 Usamos cookies técnicas necesarias para que la web funcione. No usamos cookies de publicidad ni vendemos tus datos. <Link to="/privacidad" className="text-blue-600 hover:underline">Más info</Link>.
        </p>
        <button onClick={accept} className="flex-none px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors">Aceptar</button>
      </div>
    </div>
  );
}
