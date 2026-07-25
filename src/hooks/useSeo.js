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

// Las 3 rutas son una SPA sobre un unico index.html, asi que sin esto /precios y
// /privacidad heredan el title y el canonical de la home: Google las trata como
// duplicados de la portada y no las indexa.
export default function useSeo({ title, description, path }) {
  useEffect(() => {
    const url = BASE + path;
    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
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
  }, [title, description, path]);
}
