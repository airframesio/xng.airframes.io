import Link from 'next/link';
import { event } from '../lib/gtag';
import XngMark from './XngMark';

const GITHUB = 'https://github.com/airframesio/xng';

export default function SiteFooter() {
  const track = (label, category = 'navigation') => () =>
    event({ action: 'footer_click', category, label, value: 1 });

  return (
    <footer className="footer">
      <div className="footer__grid container">
        <div className="footer__brand">
          <div className="footer__logo">
            <XngMark className="logo" size={30} />
            <span className="nav__wordmark">
              x<b>ng</b>
            </span>
          </div>
          <p className="mono">One decoder. Every signal.</p>
          <p className="footer__fineMono mono">AIRFRAMES · NEXT-GENERATION SDR DECODER</p>
        </div>

        <nav className="footer__col" aria-label="Documentation">
          <h4 className="mono">Docs</h4>
          <Link href="/docs/install" onClick={track('install')}>Install</Link>
          <Link href="/docs/quickstart" onClick={track('quickstart')}>Quickstart</Link>
          <Link href="/docs/modes" onClick={track('modes')}>Modes</Link>
          <Link href="/docs/cli" onClick={track('cli')}>CLI reference</Link>
          <Link href="/docs/recipes" onClick={track('recipes')}>Recipes</Link>
        </nav>

        <nav className="footer__col" aria-label="Project">
          <h4 className="mono">Project</h4>
          <a href={GITHUB} target="_blank" rel="noopener noreferrer" onClick={track('source', 'outbound_link')}>Source</a>
          <a href={`${GITHUB}/releases/latest`} target="_blank" rel="noopener noreferrer" onClick={track('releases', 'outbound_link')}>Releases</a>
          <a href={`${GITHUB}/issues`} target="_blank" rel="noopener noreferrer" onClick={track('issues', 'outbound_link')}>Issues</a>
          <a href="https://ghcr.io/airframesio/xng" target="_blank" rel="noopener noreferrer" onClick={track('docker', 'outbound_link')}>Container image</a>
        </nav>

        <nav className="footer__col" aria-label="Airframes">
          <h4 className="mono">Airframes</h4>
          <a href="https://airframes.io" target="_blank" rel="noopener noreferrer" onClick={track('airframes', 'outbound_link')}>airframes.io</a>
          <a href="https://www.airwavesos.com" target="_blank" rel="noopener noreferrer" onClick={track('airwaves_os', 'outbound_link')}>Airwaves OS</a>
          <a href="https://flasher.airwavesos.com" target="_blank" rel="noopener noreferrer" onClick={track('flasher', 'outbound_link')}>Airwaves Flasher</a>
          <a href="https://github.com/airframesio" target="_blank" rel="noopener noreferrer" onClick={track('github_org', 'outbound_link')}>GitHub org</a>
        </nav>
      </div>

      <div className="footer__bottom container mono">
        <span>&copy; 2023–{new Date().getFullYear()} Kevin Elliott &amp; the xng contributors · MIT OR Apache-2.0</span>
        <span>Built for the open Airframes network</span>
      </div>
    </footer>
  );
}
