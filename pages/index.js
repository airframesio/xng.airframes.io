import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import DecoderConsole from '../components/DecoderConsole';
import Ticker from '../components/Ticker';
import CodeBlock from '../components/CodeBlock';
import { event } from '../lib/gtag';
import { useReveal } from '../lib/useFx';

const GITHUB = 'https://github.com/airframesio/xng';
const RELEASES = `${GITHUB}/releases/latest`;
const SITE_URL = 'https://xng.airframes.io';
const SOCIAL_IMAGE = `${SITE_URL}/xng-social.png`;

const STATS = [
  ['21', 'Signal modes from one binary'],
  ['1', 'SDR can watch many channels'],
  ['25', 'Rust crates, shared decode core'],
  ['MIT', 'Or Apache-2.0 — permissive'],
];

const MODES = [
  { tag: 'ACARS', status: 'live', band: '118–137 MHz · VHF', title: 'VHF ACARS', desc: 'ARINC 618 with the full application layer — ADS-C, CPDLC as readable text, OOOI, MIAM. Many channels per capture.' },
  { tag: 'VDL2', status: 'live', band: '136.6–137 MHz · D8PSK', title: 'VDL Mode 2', desc: 'ACARS-over-AVLC and full ATN-B1: protected CPDLC, CM logon, X.25/CLNP. Beats dumpvdl2 frame-for-frame.' },
  { tag: 'HFDL', status: 'live', band: '2.8–22 MHz · HF', title: 'HFDL', desc: 'ARINC 635 squitters, logons, and mapped aircraft positions with over-the-air system-table persistence.' },
  { tag: 'AERO', status: 'live', band: '1545–1547 MHz · L-band', title: 'Inmarsat Aero', desc: 'JAERO-class P-channel 600/1200 bps and 10.5 kbps OQPSK — ACARS, ADS-C, CPDLC, control SUs over satellite.' },
  { tag: 'STD-C', status: 'live', band: '1537–1542 MHz · L-band', title: 'Inmarsat STD-C / EGC', desc: 'NCS TDM frames and EGC SafetyNET/FleetNET — maritime safety text with geographic-area decode.' },
  { tag: 'IRIDIUM', status: 'live', band: '1616–1626.5 MHz · DQPSK', title: 'Iridium', desc: 'Ring alerts with live sat positions, IBC/ITL, ACARS over SBD, pager, voice classification. Out-decodes gr-iridium.' },
  { tag: 'AIS', status: 'live', band: '161.975 / 162.025 MHz', title: 'AIS', desc: 'NMEA AIVDM plus field decode for types 1–27, Inland-AIS, SART/MOB/EPIRB distress, weak-signal coherent demod.' },
  { tag: 'ADS-B', status: 'live', band: '1090 MHz · Mode S', title: 'Mode S / ADS-B', desc: 'CPR positions, Comm-B registers, ACAS RA, TIS-B/ADS-R. Beast + SBS out to tar1090, Airplanes.Live, or Plane.Watch — native 2.4 MS/s on a plain RTL-SDR.' },
  { tag: 'UAT', status: 'live', band: '978 MHz', title: 'UAT 978', desc: 'ADS-B downlink and FIS-B weather uplink with Reed-Solomon FEC. Validated live off-air.' },
  { tag: 'SONDE', status: 'live', band: '~400–406 MHz', title: 'Radiosondes', desc: 'Vaisala RS41 de-whitening, RS-FEC, and STATUS/PTU/GPS — track weather balloons as they climb.' },
  { tag: 'NAVTEX', status: 'live', band: '518 / 490 kHz', title: 'NAVTEX', desc: 'CCIR 476 / SITOR-B with 4-of-7 and FEC-B framing — maritime safety broadcasts, validated on real USCG traffic.' },
  { tag: '+10', status: 'beta', band: 'paging · rail · beacons', title: 'FLEX, POCSAG, APRS, DSC, SARSAT, EOT, ATCS, ADS-L, VDES…', desc: 'Ten more decode cores wired to --mode, spec-anchored and growing toward off-air validation.' },
];

const FEATURES = [
  { n: '01', name: 'One capture, many channels', desc: 'A single RTL-SDR can watch a dozen ACARS channels at once. Modes that share a band share the capture — no more one-dongle-per-decoder.', signal: 'polyphase channelizer' },
  { n: '02', name: 'One message model', desc: 'Every mode emits the same normalized message, so every output — console, JSON, Airframes, Prometheus, maps — works identically for all of them.', signal: 'xng-types' },
  { n: '03', name: 'Shared application layer', desc: 'ADS-C positions and CPDLC render as readable text whether the ACARS arrived over VHF, VDL2, HFDL, Aero, or Iridium SBD.', signal: 'ARINC 622 · CPDLC' },
  { n: '04', name: 'Feeds Airframes natively', desc: 'Per-decoder feeding with auto-suffixed station IDs, plus acarsdec/dumpvdl2-compatible output so your existing pipeline just works.', signal: '--feed-airframes' },
  { n: '05', name: 'Live maps, built in', desc: 'Run --http for a dark dashboard of aircraft and vessels merged across modes — and a drop-in tar1090 / AIS-catcher data API.', signal: '--http :8080' },
  { n: '06', name: 'Find signals for you', desc: 'Not sure what is receivable? xng scan and xng survey sweep the bands and print a ready-to-paste config. The TUI runs zero-config.', signal: 'scan · survey · tui' },
];

const STEPS = [
  ['Install', 'Grab a prebuilt binary, the .deb, or the Docker image. No Rust toolchain required to run it.', 'sudo apt install ./xng_0.21.0_arm64.deb'],
  ['See what is out there', 'List your radios, then let the scanner sweep the bands and tell you what is receivable.', 'xng scan --sdr driver=rtlsdr --modes acars,vdl2,ais'],
  ['Watch it live', 'Open the interactive TUI — message list, detail pane, spectrum, and waterfall, zero config.', 'xng tui --sdr driver=rtlsdr --mode acars'],
  ['Feed Airframes', 'Point a decode session at the network with your station ID and you are contributing.', 'xng listen --feed-airframes --station-id XX-KSEA-1'],
];

const DOWNLOADS = [
  { platform: 'Linux', kind: '.deb · tarball · x86_64 / arm64', detail: 'apt-installable package pulls SoapySDR + Airspy runtime deps automatically. Runs on Pi-class hardware.', href: RELEASES },
  { platform: 'macOS', kind: 'Apple Silicon tarball', detail: 'Native build for arm64. Intel Macs build from source with one cargo command.', href: RELEASES },
  { platform: 'Docker', kind: 'ghcr.io/airframesio/xng', detail: 'Multi-arch amd64 / arm64 / armv7 image, published on every release tag.', href: 'https://github.com/airframesio/xng/pkgs/container/xng' },
];

const LINKS = [
  { label: 'Read the docs', desc: 'Install, configure, and run a station — every mode, flag, and output explained.', href: '/docs', internal: true },
  { label: 'Source on GitHub', desc: 'The full Rust workspace, benchmarks, CI gates, and per-crate provenance.', href: GITHUB },
  { label: 'Airframes', desc: 'The open aviation and maritime data network xng feeds into.', href: 'https://airframes.io' },
];

export default function Home() {
  useReveal();
  const track = (action, label, category = 'cta') => () => event({ action, category, label, value: 1 });

  return (
    <>
      <Head>
        <title>xng — One native SDR decoder for the whole aviation & maritime radio stack</title>
        <meta
          name="description"
          content="xng is a next-generation, open-source SDR decoder from Airframes. One native binary decodes ACARS, VDL2, HFDL, satcom, Iridium, AIS, ADS-B and more — with live maps, native Airframes feeding, and a friendly TUI."
        />
        <link rel="icon" href="/favicon.svg" />
        <meta property="og:title" content="xng — one decoder for the whole radio stack" />
        <meta
          property="og:description"
          content="Open-source, next-generation SDR decoder. ACARS, VDL2, HFDL, satcom, Iridium, AIS, ADS-B and more from a single Rust binary — with live maps and native Airframes feeding."
        />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={SOCIAL_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="xng — one decoder for the whole radio stack" />
        <meta name="twitter:description" content="Open-source next-generation SDR decoder for ACARS, VDL2, HFDL, satcom, AIS, ADS-B and more." />
        <meta name="twitter:image" content={SOCIAL_IMAGE} />
      </Head>

      <SiteNav />

      <main id="top">
        {/* ---------- hero ---------- */}
        <section className="hero">
          <div className="hero__grid container">
            <div className="hero__copy" data-reveal>
              <p className="hero__chip mono">
                <span className="dot dot--live" /> Open-source · Airframes · v0.21
              </p>
              <h1 className="hero__title">
                One decoder for the <em>whole</em> radio stack.
              </h1>
              <p className="hero__sub">
                xng is a single native binary that decodes ACARS, VDL2, HFDL, satcom, Iridium,
                AIS, ADS-B and a dozen more modes — replacing a whole zoo of single-purpose
                tools with one capture, one message model, and one set of outputs.
              </p>
              <div className="hero__cta">
                <Link className="btn btn--primary" href="/docs/quickstart" onClick={track('quickstart_click', 'hero')}>
                  Get started <span className="btn__arrow" aria-hidden="true">&rarr;</span>
                </Link>
                <a className="btn btn--ghost" href={GITHUB} target="_blank" rel="noopener noreferrer" onClick={track('source_click', 'hero', 'outbound_link')}>
                  View source
                </a>
              </div>
              <div className="hero__platforms mono" aria-label="What it decodes">
                <span>ACARS</span>
                <span>VDL2</span>
                <span>HFDL</span>
                <span>SATCOM</span>
                <span>IRIDIUM</span>
                <span>AIS</span>
                <span>ADS-B</span>
              </div>
            </div>

            <div className="hero__stage" data-reveal style={{ '--d': '120ms' }}>
              <DecoderConsole />
            </div>
          </div>
        </section>

        <Ticker />

        {/* ---------- stats ---------- */}
        <section className="stats container" aria-label="xng at a glance">
          {STATS.map(([n, l], i) => (
            <div className="stats__item" key={l} data-reveal style={{ '--d': `${i * 70}ms` }}>
              <span className="stats__num mono">{n}</span>
              <span className="stats__label">{l}</span>
            </div>
          ))}
        </section>

        {/* ---------- what is xng ---------- */}
        <section className="section" id="about">
          <div className="container">
            <header className="section__head" data-reveal>
              <p className="section__ch mono">Why xng</p>
              <h2 className="section__title">
                Stop running a decoder <em>per mode</em>.
              </h2>
              <p className="section__lede">
                The radio-monitoring world is a patchwork of brilliant single-purpose tools —
                acarsdec, dumpvdl2, dumphfdl, JAERO, gr-iridium, AIS-catcher, dump1090 — each
                its own process, its own dongle, its own output format. xng collapses all of
                it into one tested, permissively-licensed application.
              </p>
            </header>
            <div className="feature-grid">
              <article className="feature" data-reveal>
                <span className="feature__n mono">→</span>
                <h3>Before</h3>
                <p>One SDR per decoder. Incompatible JSON. A different CLI and quirks for every mode. GPL all the way down.</p>
                <span className="feature__signal mono">a zoo of tools</span>
              </article>
              <article className="feature" data-reveal style={{ '--d': '70ms' }}>
                <span className="feature__n mono">→</span>
                <h3>After</h3>
                <p>One capture feeds many channels. One normalized message. One set of outputs that work for every mode at once.</p>
                <span className="feature__signal mono">one binary</span>
              </article>
              <article className="feature" data-reveal style={{ '--d': '140ms' }}>
                <span className="feature__n mono">→</span>
                <h3>And then some</h3>
                <p>A live web map, an interactive TUI, an auto-scanner, and native Airframes feeding the old tools never had.</p>
                <span className="feature__signal mono">next-generation</span>
              </article>
            </div>
          </div>
        </section>

        {/* ---------- modes ---------- */}
        <section className="modes section" id="modes">
          <div className="container">
            <header className="section__head" data-reveal>
              <p className="section__ch mono">Modes</p>
              <h2 className="section__title">
                Everything it can <em>hear</em>.
              </h2>
              <p className="section__lede">
                Eight flagship modes are validated off-air and fenced by CI regression gates;
                a dozen newer cores are spec-anchored and climbing the same ladder. Each is its
                own crate — and every one feeds the same outputs.
              </p>
            </header>
            <div className="modes__grid">
              {MODES.map((m, i) => (
                <article className="mode" key={m.title} data-reveal style={{ '--d': `${(i % 3) * 60}ms` }}>
                  <div className="mode__head">
                    <span className="mode__tag">{m.tag}</span>
                    <span className="mode__status mono" data-s={m.status}>
                      {m.status === 'live' ? '● off-air' : '◐ growing'}
                    </span>
                  </div>
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                  <span className="mode__band">{m.band}</span>
                </article>
              ))}
            </div>
            <div style={{ marginTop: '1.6rem' }} data-reveal>
              <Link className="btn btn--ghost" href="/docs/modes" onClick={track('modes_docs', 'modes')}>
                Full mode reference <span className="btn__arrow" aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ---------- features ---------- */}
        <section className="features section" id="features">
          <div className="container">
            <header className="section__head" data-reveal>
              <p className="section__ch mono">What you get</p>
              <h2 className="section__title">More than a pile of decoders.</h2>
              <p className="section__lede">
                Because every mode shares the same core, the conveniences apply everywhere at once.
              </p>
            </header>
            <div className="feature-grid">
              {FEATURES.map((feature, i) => (
                <article className="feature" key={feature.name} data-reveal style={{ '--d': `${(i % 3) * 70}ms` }}>
                  <span className="feature__n mono">{feature.n}</span>
                  <h3>{feature.name}</h3>
                  <p>{feature.desc}</p>
                  <span className="feature__signal mono">{feature.signal}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- quickstart / workflow ---------- */}
        <section className="workflow section" id="workflow">
          <div className="container workflow__grid">
            <div className="workflow__copy" data-reveal>
              <p className="section__ch mono">Quickstart</p>
              <h2 className="section__title">From zero to decoded in <em>minutes</em>.</h2>
              <p className="section__lede">
                It looks intimidating — 21 modes, a dozen subcommands. It is not. Plug in an
                RTL-SDR, let the scanner find traffic, and watch it stream. You can try the
                whole pipeline on a recorded IQ file with no hardware at all.
              </p>
              <Link className="btn btn--primary" href="/docs/quickstart" onClick={track('quickstart_click', 'workflow')}>
                Open the quickstart <span className="btn__arrow" aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            <ol className="workflow__steps">
              {STEPS.map(([title, desc, cmd], i) => (
                <li key={title} data-reveal style={{ '--d': `${i * 70}ms` }}>
                  <span className="workflow__num mono">Step {i + 1}</span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                  <p>
                    <code>{cmd}</code>
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- one command ---------- */}
        <section className="section" id="example">
          <div className="container">
            <header className="section__head" data-reveal>
              <p className="section__ch mono">The headline recipe</p>
              <h2 className="section__title">Two channels. One command. Live on the network.</h2>
              <p className="section__lede">
                This is the whole thing: capture two ACARS channels from one RTL-SDR, decode the
                full application layer, and feed it straight to Airframes.
              </p>
            </header>
            <div data-reveal>
              <CodeBlock
                lang="bash"
                title="decode two ACARS channels → Airframes"
                code={`xng listen --sdr driver=rtlsdr -r 2400000 -c 131.500M \\
    --channels 131.550,131.725 \\
    --feed-airframes --station-id XX-KSEA-1`}
              />
            </div>
          </div>
        </section>

        {/* ---------- download ---------- */}
        <section className="download section" id="download">
          <div className="container">
            <header className="section__head" data-reveal>
              <p className="section__ch mono">Install</p>
              <h2 className="section__title">
                Get xng for your <em>station</em>.
              </h2>
              <p className="section__lede">
                Prebuilt binaries and a Docker image are published on every release, so most
                people never touch a compiler. Want to build it anyway? One cargo command.
              </p>
            </header>

            <div className="download__grid">
              {DOWNLOADS.map((item, i) => (
                <a
                  key={item.platform}
                  className="download-card"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-reveal
                  style={{ '--d': `${i * 80}ms` }}
                  onClick={track('download_platform', item.platform.toLowerCase(), 'outbound_link')}
                >
                  <span className="download-card__platform">{item.platform}</span>
                  <span className="download-card__kind mono">{item.kind}</span>
                  <span className="download-card__detail">{item.detail}</span>
                  <span className="download-card__action mono">Latest release →</span>
                </a>
              ))}
            </div>

            <div style={{ marginTop: '1.4rem' }} data-reveal>
              <CodeBlock
                lang="bash"
                title="three ways to get it"
                code={`# Debian / Ubuntu / Raspberry Pi
sudo apt install ./xng_0.21.0_arm64.deb

# Docker (multi-arch)
docker run --rm ghcr.io/airframesio/xng:latest --version

# From source
cargo build --release`}
              />
              <p style={{ marginTop: '1rem', color: 'var(--cream-dim)' }}>
                Full instructions — runtime dependencies, native Airspy backends, building on macOS —
                are in the <Link href="/docs/install" style={{ color: 'var(--amber)' }}>installation guide</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- source / community ---------- */}
        <section className="source section" id="source">
          <div className="container source__grid">
            <div className="source__brand" data-reveal>
              <Image className="logo" src="/airframes-logo.svg" alt="Airframes" width={54} height={54} />
              <h2>Built in the open, by the Airframes community.</h2>
              <p>
                xng is dual-licensed MIT or Apache-2.0. Its decode cores are clean-room from public
                ICAO, ARINC, ITU-R and ETSI specs, or ported from permissively-licensed projects with
                attribution. Every benchmark is fenced by a CI gate, and every crate documents exactly
                where its knowledge came from.
              </p>
            </div>

            <div className="source__links">
              {LINKS.map((link, i) =>
                link.internal ? (
                  <Link key={link.label} href={link.href} className="source-link" data-reveal style={{ '--d': `${i * 80}ms` }} onClick={track('source_link_click', link.label)}>
                    <span>{link.label}</span>
                    <p>{link.desc}</p>
                    <strong className="mono">Open</strong>
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="source-link" data-reveal style={{ '--d': `${i * 80}ms` }} onClick={track('source_link_click', link.label, 'outbound_link')}>
                    <span>{link.label}</span>
                    <p>{link.desc}</p>
                    <strong className="mono">Open</strong>
                  </a>
                )
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
