# xng.airframes.io

Documentation and marketing site for **[xng](https://github.com/airframesio/xng)** —
the next-generation, open-source SDR decoder from Airframes. One native binary that
decodes ACARS, VDL2, HFDL, satcom, Iridium, AIS, ADS-B and more.

The site is built to make an intimidating tool approachable: a live decoder-console
hero, a friendly quickstart, and a deep multi-page docs area.

## Stack

- **Next.js 16** (Pages Router) with `output: 'export'` — fully static, no server runtime.
- **React 18.**
- Design system lifted from [Airwaves Flasher](https://flasher.airwavesos.com) (amber-on-navy,
  Archivo / Instrument Serif / JetBrains Mono, dark + light themes).
- Animated `Waterfall` spectrum and `Ticker` lifted from [Airwaves OS](https://www.airwavesos.com).
- Zero UI dependencies beyond React/Next — all CSS is hand-authored in `styles/globals.css`.

## Structure

```
pages/
  index.js              landing page (hero, modes, features, quickstart, install)
  docs/                 multi-page docs (sidebar + search + per-page TOC)
    index.js            introduction
    install.js  quickstart.js  configuration.js
    modes.js  inputs-outputs.js  cli.js  architecture.js
    recipes.js  troubleshooting.js
components/
  SiteNav · SiteFooter · DocsLayout · DecoderConsole · Waterfall
  Ticker · CodeBlock · Callout · XngMark
lib/
  fonts.js · gtag.js · useFx.js · docs.js   (docs IA + search index)
```

All site content is sourced from the xng repository (README, docs/, crates, CLI).

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export to ./out
```

## Deploy

Deploys as a static site. Configured for **Vercel** (`vercel.json`) and **Netlify**
(`netlify.toml`); the build output is the `out/` directory.

```bash
vercel deploy            # preview
vercel deploy --prod     # production
```

## License

Site content © Airframes. xng itself is dual-licensed MIT OR Apache-2.0.
