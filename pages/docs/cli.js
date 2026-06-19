import Link from 'next/link';
import DocsLayout from '../../components/DocsLayout';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';

export default function Cli() {
  return (
    <DocsLayout
      slug="cli"
      title="CLI reference"
      lede="One binary, a dozen subcommands. listen and tui are where you live day to day; scan and survey do the legwork of finding signals; station runs a whole site."
    >
      <h2>Subcommands</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Command</th><th>Purpose</th></tr></thead>
          <tbody>
            <tr><td><code>listen</code></td><td>Decode live from an SDR (multi-channel; mode via <code>--mode</code>).</td></tr>
            <tr><td><code>decode</code></td><td>Decode from a recorded IQ file.</td></tr>
            <tr><td><code>tui</code></td><td>Interactive terminal UI — live, or replay a file with <code>--file</code>.</td></tr>
            <tr><td><code>scan</code></td><td>Auto-scan known frequency plans and propose a ready-to-run config.</td></tr>
            <tr><td><code>survey</code></td><td>Soak-test one mode across all channels; report per-channel stats and advice.</td></tr>
            <tr><td><code>station</code></td><td>Run a whole station from a TOML config (many modes/SDRs in one process).</td></tr>
            <tr><td><code>status</code></td><td>Show a running station’s sessions and live decode status.</td></tr>
            <tr><td><code>devices</code></td><td>List available SDR devices (native Airspy + SoapySDR).</td></tr>
            <tr><td><code>iq-info</code></td><td>Inspect a recorded IQ file: duration, power, spectral peaks.</td></tr>
            <tr><td><code>ingest</code></td><td>Run the reference asf-2.0 ingest server (gRPC and/or QUIC).</td></tr>
            <tr><td><code>extern</code></td><td>Wrap an external decoder (dumphfdl / dumpvdl2 / acarsdec) onto the xng bus.</td></tr>
            <tr><td><code>selftest</code></td><td>Built-in end-to-end pipeline sanity check.</td></tr>
          </tbody>
        </table>
      </div>

      <h2>Global flags</h2>
      <div className="deflist">
        <div className="deflist__row"><code>-v / -vv / -vvv</code><p>Increasing verbosity.</p></div>
        <div className="deflist__row"><code>--decode-threads &lt;n&gt;</code><p>Worker threads for decoding. Defaults to all cores — matters most for the Iridium burst hunter.</p></div>
      </div>

      <h2>Tuning flags</h2>
      <div className="deflist">
        <div className="deflist__row"><code>-m, --mode</code><p>Which decoder to run. See <Link href="/docs/modes">Modes</Link>.</p></div>
        <div className="deflist__row"><code>-r, --sample-rate</code><p>Capture rate in Hz. Must be an integer multiple of the mode’s channel rate.</p></div>
        <div className="deflist__row"><code>-c, --center-freq</code><p>Center frequency. Accepts <code>M</code> / <code>k</code> suffixes (e.g. <code>131.500M</code>).</p></div>
        <div className="deflist__row"><code>--channels</code><p>Comma-separated channel list, suffix-aware (e.g. <code>131.550,131.725</code>).</p></div>
        <div className="deflist__row"><code>--receiver-pos lat,lon</code><p>Required for ADS-B surface positions and AIS/APRS own-ship correlation.</p></div>
        <div className="deflist__row"><code>--demod-effort max|live</code><p><code>live</code> keeps every mode real-time on Pi-class hardware; <code>max</code> squeezes out the last few frames.</p></div>
        <div className="deflist__row"><code>--sdr "driver=…"</code> · <code>-g, --gain</code><p>Device string and front-end gain in dB (AGC if omitted).</p></div>
      </div>

      <h2>Output &amp; filtering flags</h2>
      <p>All the destination flags from <Link href="/docs/inputs-outputs">Inputs &amp; outputs</Link>, plus:</p>
      <div className="deflist">
        <div className="deflist__row"><code>--filter-labels H1,Q0</code> · <code>--exclude-labels SQ</code><p>Keep or drop ACARS messages by label.</p></div>
        <div className="deflist__row"><code>--gs-file stations.json</code><p>VDL2 ground-station name lookup (hex AVLC address → name).</p></div>
        <div className="deflist__row"><code>--aircraft-db &lt;csv&gt;</code><p>tar1090 / Mictronics database for registration and type tagging.</p></div>
        <div className="deflist__row"><code>--iridium-satmap</code><p>SGP4 satellite labeling for Iridium.</p></div>
      </div>

      <h2>What it looks like running</h2>
      <p><code>xng status</code> against a running station:</p>
      <CodeBlock
        lang="text"
        code={`  KE-KSEA-1   up 3h12m   41 aircraft · 7 vessels
  ┌────────┬────────┬─────────┬─────────────────────┬───────────────────────────────────┐
  │ SDR    │ Serial │ Mode    │ Tuning              │ Status                            │
  ├────────┼────────┼─────────┼─────────────────────┼───────────────────────────────────┤
  │ rtlsdr │ 001    │ ACARS   │ 11 ch @ 130.940 MHz │ decoding · 4218 msgs · last now   │
  │ airspy │ —      │ IRIDIUM │ 1 ch @ 1624.000 MHz │ decoding · 240 msgs · last 4s ago │
  └────────┴────────┴─────────┴─────────────────────┴───────────────────────────────────┘`}
      />

      <Callout type="tip">
        <p>
          Every subcommand supports <code>--help</code>. <code>survey</code> has its own set
          (<code>--tune-gain</code>, <code>--scan</code>, <code>--duration</code>, <code>--interim</code>,
          <code>--show-messages</code>, <code>--out</code>) for dialing in a new site.
        </p>
      </Callout>
    </DocsLayout>
  );
}
