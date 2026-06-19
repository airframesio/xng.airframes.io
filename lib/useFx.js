import { useEffect, useState } from 'react';

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Reveal-on-scroll: elements tagged [data-reveal] fade/translate in once. */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-reveal]'));
    const show = (el) => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    };

    if (prefersReducedMotion()) {
      els.forEach(show);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** Dark/light theme bound to <html data-theme> + localStorage('xng-theme'). */
export function useTheme() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || 'dark');
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onSystem = (e) => {
      let stored = null;
      try {
        stored = localStorage.getItem('xng-theme');
      } catch {}
      if (stored !== 'light' && stored !== 'dark') {
        const t = e.matches ? 'light' : 'dark';
        document.documentElement.dataset.theme = t;
        setTheme(t);
      }
    };

    mq.addEventListener('change', onSystem);
    return () => mq.removeEventListener('change', onSystem);
  }, []);

  useEffect(() => {
    if (!theme) return;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f8fafc' : '#090d13');
  }, [theme]);

  const toggle = () => {
    const t = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem('xng-theme', t);
    } catch {}
    setTheme(t);
  };

  return [theme, toggle];
}

/** Live UTC clock (HH:MM:SSZ) for the nav — radio work runs on Zulu time. */
export function useUtcClock() {
  const [utc, setUtc] = useState('--:--:--Z');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const p = (n) => String(n).padStart(2, '0');
      setUtc(`${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}Z`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return utc;
}
