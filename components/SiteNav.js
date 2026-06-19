import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { event } from '../lib/gtag';
import { useTheme, useUtcClock } from '../lib/useFx';
import XngMark from './XngMark';

const GITHUB = 'https://github.com/airframesio/xng';

const LINKS = [
  { href: '#modes', label: 'Modes', section: 'modes' },
  { href: '#features', label: 'Features', section: 'features' },
  { href: '#workflow', label: 'Quickstart', section: 'workflow' },
  { href: '/docs', label: 'Docs' },
];

const SPY_IDS = ['modes', 'features', 'workflow', 'download'];

function ThemeIcon() {
  return (
    <>
      <svg className="icon-moon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      <svg className="icon-sun" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    </>
  );
}

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const [theme, toggleTheme] = useTheme();
  const utc = useUtcClock();
  const router = useRouter();
  const onHome = router.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!onHome) return;
    let raf = 0;
    let ticking = false;
    const update = () => {
      ticking = false;
      let current = '';
      for (const id of SPY_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= 180 && r.bottom >= 180) {
          current = id;
          break;
        }
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [onHome]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  // In-page anchors work on the homepage, but must route home (with hash) elsewhere.
  const linkHref = (item) => {
    if (!item.href.startsWith('#')) return item.href;
    return onHome ? item.href : `/${item.href}`;
  };
  const isActive = (item) =>
    (item.section && item.href === `#${active}` && onHome) ||
    (item.href === '/docs' && router.pathname.startsWith('/docs'));

  const nav = (label) => {
    setOpen(false);
    event({ action: 'nav_click', category: 'navigation', label, value: 1 });
  };

  const onTheme = () => {
    toggleTheme();
    event({ action: 'theme_toggle', category: 'engagement', label: theme === 'light' ? 'dark' : 'light', value: 1 });
  };

  const renderLink = (item, cls, extra) =>
    item.href.startsWith('#') && onHome ? (
      <a key={item.href} href={item.href} className={cls(item)} style={extra} onClick={() => nav(item.label.toLowerCase())}>
        {item.label}
      </a>
    ) : (
      <Link key={item.href} href={linkHref(item)} className={cls(item)} style={extra} onClick={() => nav(item.label.toLowerCase())}>
        {item.label}
      </Link>
    );

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <Link href="/" className="nav__brand" onClick={() => nav('home')}>
          <XngMark className="logo" size={28} />
          <span className="nav__wordmark">
            x<b>ng</b>
          </span>
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((item) => renderLink(item, (i) => (isActive(i) ? 'is-active' : undefined)))}
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" onClick={() => nav('github')}>
            GitHub
          </a>
        </nav>

        <div className="nav__meta">
          <span className="nav__utc" suppressHydrationWarning>
            {utc}
          </span>
          <a className="nav__star" href={GITHUB} target="_blank" rel="noopener noreferrer" onClick={() => nav('github_star')}>
            <GithubIcon /> Star
          </a>
          <button type="button" className="nav__theme" onClick={onTheme} aria-label="Toggle light or dark theme" title="Toggle theme">
            <ThemeIcon />
          </button>
          <Link className="btn btn--small btn--primary" href={onHome ? '#download' : '/docs/install'} onClick={() => nav('get_xng')}>
            Get xng
          </Link>
        </div>

        <button className={`nav__burger ${open ? 'is-open' : ''}`} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
          <span />
          <span />
        </button>
      </header>

      <div className={`menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="menu__inner">
          <p className="menu__eyebrow mono">// xng — channel select</p>
          {LINKS.map((item, i) =>
            renderLink(item, () => 'menu__link', { '--d': `${i * 60}ms` })
          )}
          <a href={GITHUB} className="menu__link" style={{ '--d': `${LINKS.length * 60}ms` }} target="_blank" rel="noopener noreferrer" onClick={() => nav('github')}>
            <span className="mono">0{LINKS.length + 1}</span>
            GitHub
          </a>
          <div className="menu__foot mono">
            <span suppressHydrationWarning>{utc}</span>
            <button type="button" className="menu__theme" onClick={onTheme}>
              day / night
            </button>
            <span>MIT / Apache-2.0</span>
          </div>
        </div>
      </div>
    </>
  );
}
