import { useEffect } from 'react';

const BASE = 'https://nominia.app';

function setMeta(selector, attr, value) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const [, name, key] = selector.match(/\[(name|property)="([^"]+)"\]/) || [];
    if (!name) return;
    el.setAttribute(name, key);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

// Las rutas son una SPA sobre un unico index.html, asi que sin esto /precios y
// /privacidad heredan el title y el canonical de la home: Google las trata como
// duplicados de la portada y no las indexa.
//
// - robots: 'noindex' en la pagina 404; el resto hereda 'index, follow'.
// - jsonLd: array de bloques schema.org (src/data/seoSchema.js). Se escribe en el
//   <script id="seo-jsonld"> que ya trae public/index.html, para que en el DOM no
//   convivan el bloque generico de la portada y el de la ruta.
export default function useSeo({ title, description, path, robots = 'index, follow', jsonLd }) {
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    const url = BASE + path;
    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="robots"]', 'content', robots);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    if (jsonLdText) {
      let script = document.getElementById('seo-jsonld');
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'seo-jsonld';
        document.head.appendChild(script);
      }
      script.textContent = jsonLdText;
    }
  }, [title, description, path, robots, jsonLdText]);
}
