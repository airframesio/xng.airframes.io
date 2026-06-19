import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SiteNav from './SiteNav';
import { DOCS_NAV, docHref, pager, searchDocs } from '../lib/docs';

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function SearchBox({ onNavigate }) {
  const [q, setQ] = useState('');
  const results = searchDocs(q);
  return (
    <div className="docs__search">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search docs…"
        aria-label="Search documentation"
        spellCheck="false"
        autoComplete="off"
      />
      {!q && <span className="docs__searchKbd mono">/</span>}
      {q && (
        <div className="docs__results">
          {results.length === 0 ? (
            <span className="empty">No matches for “{q}”.</span>
          ) : (
            results.map((r) => (
              <Link
                key={r.slug}
                href={docHref(r.slug)}
                onClick={() => {
                  setQ('');
                  onNavigate?.();
                }}
              >
                <strong>{r.title}</strong>
                <span>{r.desc}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function SidebarNav({ currentSlug, onNavigate }) {
  return (
    <nav aria-label="Documentation">
      {DOCS_NAV.map((group) => (
        <div className="docs__navGroup" key={group.group}>
          <h5>{group.group}</h5>
          {group.items.map((item) => (
            <Link
              key={item.slug}
              href={docHref(item.slug)}
              className={item.slug === currentSlug ? 'is-active' : undefined}
              onClick={onNavigate}
            >
              {item.title}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

export default function DocsLayout({ slug = '', title, lede, children }) {
  const articleRef = useRef(null);
  const [toc, setToc] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { prev, next } = pager(slug);

  // Build the table of contents from the rendered headings and give each a
  // stable id + hover anchor so sections are deep-linkable.
  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    const heads = Array.from(root.querySelectorAll('h2, h3'));
    const items = heads.map((h) => {
      if (!h.id) h.id = slugify(h.textContent || '');
      if (!h.querySelector('.anchor')) {
        const a = document.createElement('a');
        a.href = `#${h.id}`;
        a.className = 'anchor';
        a.textContent = '#';
        a.setAttribute('aria-hidden', 'true');
        h.appendChild(a);
      }
      return { id: h.id, text: (h.textContent || '').replace(/#$/, ''), level: Number(h.tagName[1]) };
    });
    setToc(items);
  }, [slug, children]);

  // Scroll spy for the TOC.
  useEffect(() => {
    if (toc.length === 0) return;
    const ids = toc.map((t) => t.id);
    let ticking = false;
    const update = () => {
      ticking = false;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= 120) current = id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [toc]);

  // `/` focuses search.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !/input|textarea|select/i.test(e.target.tagName)) {
        e.preventDefault();
        document.querySelector('.docs__search input')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [router.asPath]);

  return (
    <>
      <Head>
        <title>{`${title} — xng docs`}</title>
        <meta name="description" content={lede} />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <SiteNav />

      <div className="docs">
        <div className="docs__shell">
          <aside className="docs__sidebar">
            <SearchBox />
            <SidebarNav currentSlug={slug} />
          </aside>

          <div className="docs__main">
            <div className="docs__mobileBar">
              <button type="button" onClick={() => setMobileOpen((o) => !o)} aria-expanded={mobileOpen}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
                Docs menu
              </button>
              <span className="mono" style={{ color: 'var(--muted)', fontSize: '0.76rem' }}>
                {title}
              </span>
            </div>
            <div className={`docs__mobileNav ${mobileOpen ? 'is-open' : ''}`}>
              <SearchBox onNavigate={() => setMobileOpen(false)} />
              <SidebarNav currentSlug={slug} onNavigate={() => setMobileOpen(false)} />
            </div>

            <div className="docs__inner">
              <article className="docs__article" ref={articleRef}>
                <div className="docs__crumbs mono">
                  <Link href="/">xng</Link>
                  <span>/</span>
                  <Link href="/docs">docs</Link>
                  {slug ? (
                    <>
                      <span>/</span>
                      <span style={{ color: 'var(--cream-dim)' }}>{slug}</span>
                    </>
                  ) : null}
                </div>

                <h1 className="docs__title">{title}</h1>
                {lede ? <p className="docs__lede">{lede}</p> : null}

                <div className="prose">{children}</div>

                <nav className="docs__pager" aria-label="Pagination">
                  {prev ? (
                    <Link href={docHref(prev.slug)} className="docs__pagerLink">
                      <span>← Previous</span>
                      <strong>{prev.title}</strong>
                    </Link>
                  ) : (
                    <span />
                  )}
                  {next ? (
                    <Link href={docHref(next.slug)} className="docs__pagerLink docs__pagerLink--next">
                      <span>Next →</span>
                      <strong>{next.title}</strong>
                    </Link>
                  ) : (
                    <span />
                  )}
                </nav>
              </article>

              <aside className="docs__toc" aria-label="On this page">
                {toc.length > 0 && (
                  <>
                    <h5>On this page</h5>
                    {toc.map((t) => (
                      <a
                        key={t.id}
                        href={`#${t.id}`}
                        className={`${t.level === 3 ? 'lvl-3' : ''} ${activeId === t.id ? 'is-active' : ''}`}
                      >
                        {t.text}
                      </a>
                    ))}
                  </>
                )}
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
