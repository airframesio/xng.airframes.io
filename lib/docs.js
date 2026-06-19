// Single source of truth for the docs IA: sidebar groups, linear pager order,
// and the client-side search index. Keep `slug` in sync with the file in
// pages/docs/<slug>.js (the index page uses slug '').

export const DOCS_NAV = [
  {
    group: 'Start here',
    items: [
      { slug: '', title: 'Introduction', desc: 'What xng is and why it exists.' },
      { slug: 'install', title: 'Installation', desc: 'Prebuilt binaries, Docker, .deb, and building from source.' },
      { slug: 'quickstart', title: 'Quickstart', desc: 'From zero to decoded traffic in five minutes.' },
      { slug: 'configuration', title: 'Configuration', desc: 'The station TOML file, sessions, and outputs.' },
    ],
  },
  {
    group: 'Reference',
    items: [
      { slug: 'modes', title: 'Modes & decoders', desc: 'Every signal xng can decode, band by band.' },
      { slug: 'inputs-outputs', title: 'Inputs & outputs', desc: 'SDRs and files in; Airframes, JSON, maps, and more out.' },
      { slug: 'cli', title: 'CLI reference', desc: 'Every subcommand and the flags that matter.' },
      { slug: 'architecture', title: 'Architecture', desc: 'The capture → decode → fan-out pipeline and the crate layout.' },
    ],
  },
  {
    group: 'Going further',
    items: [
      { slug: 'recipes', title: 'Recipes', desc: 'Copy-paste setups for common stations.' },
      { slug: 'troubleshooting', title: 'Troubleshooting', desc: 'When nothing decodes — and how to find out why.' },
    ],
  },
];

// Flattened, in reading order — used for the prev/next pager.
export const DOCS_ORDER = DOCS_NAV.flatMap((g) => g.items);

export const docHref = (slug) => (slug ? `/docs/${slug}` : '/docs');

export function pager(slug) {
  const i = DOCS_ORDER.findIndex((d) => d.slug === slug);
  return {
    prev: i > 0 ? DOCS_ORDER[i - 1] : null,
    next: i >= 0 && i < DOCS_ORDER.length - 1 ? DOCS_ORDER[i + 1] : null,
  };
}

// Lightweight search index: page title/desc plus notable terms & headings so a
// query like "iridium", "mqtt", or "deb" jumps straight to the right page.
export const SEARCH_INDEX = [
  {
    slug: '',
    title: 'Introduction',
    desc: 'What xng is and why it exists.',
    terms: 'overview about one decoder aviation maritime radio stack next-generation rust open source mit apache',
  },
  {
    slug: 'install',
    title: 'Installation',
    desc: 'Prebuilt binaries, Docker, .deb, and building from source.',
    terms: 'install download release tarball deb debian ubuntu apt docker ghcr cargo build source soapysdr libairspy protobuf macos linux arm64',
  },
  {
    slug: 'quickstart',
    title: 'Quickstart',
    desc: 'From zero to decoded traffic in five minutes.',
    terms: 'quickstart getting started devices selftest scan survey tui listen first run rtl-sdr acars',
  },
  {
    slug: 'configuration',
    title: 'Configuration',
    desc: 'The station TOML file, sessions, and outputs.',
    terms: 'config configuration toml station station-id session outputs feed-airframes jsonl metrics http mqtt sbs beast nmea systemd service per-mode auto-suffix',
  },
  {
    slug: 'modes',
    title: 'Modes & decoders',
    desc: 'Every signal xng can decode, band by band.',
    terms: 'modes decoders acars vdl2 vdl mode 2 hfdl aero inmarsat satcom std-c egc iridium ais adsb mode s uat sonde radiosonde navtex flex sarsat dsc ads-l atcs aprs pocsag eot vdes cpdlc ads-c',
  },
  {
    slug: 'inputs-outputs',
    title: 'Inputs & outputs',
    desc: 'SDRs and files in; Airframes, JSON, maps, and more out.',
    terms: 'inputs outputs sdr rtl-sdr airspy hf+ sdrplay hackrf soapysdr iq file extern json jsonl udp airframes prometheus metrics sbs beast nmea mqtt asf2 grpc quic gsmtap web dashboard tar1090',
  },
  {
    slug: 'cli',
    title: 'CLI reference',
    desc: 'Every subcommand and the flags that matter.',
    terms: 'cli command line listen decode tui scan survey station status devices iq-info ingest extern selftest flags gain mode channels center sample-rate',
  },
  {
    slug: 'architecture',
    title: 'Architecture',
    desc: 'The capture → decode → fan-out pipeline and the crate layout.',
    terms: 'architecture pipeline channelizer demod frame application layer message bus crates workspace rust capture sharing asf-2.0 protobuf',
  },
  {
    slug: 'recipes',
    title: 'Recipes',
    desc: 'Copy-paste setups for common stations.',
    terms: 'recipes examples acars vdl2 hfdl iridium ais adsb feed airframes whole station multi mode replay iq file',
  },
  {
    slug: 'troubleshooting',
    title: 'Troubleshooting',
    desc: 'When nothing decodes — and how to find out why.',
    terms: 'troubleshooting faq nothing decodes no devices gain sample rate channel rate antenna lna l-band soapysdr module permission usb error',
  },
];

export function searchDocs(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/);
  return SEARCH_INDEX.map((rec) => {
    const hay = `${rec.title} ${rec.desc} ${rec.terms}`.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (rec.title.toLowerCase().includes(t)) score += 5;
      else if (hay.includes(t)) score += 1;
    }
    return { rec, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.rec)
    .slice(0, 7);
}
