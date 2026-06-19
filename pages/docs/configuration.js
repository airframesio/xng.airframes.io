import Link from 'next/link';
import DocsLayout from '../../components/DocsLayout';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';

export default function Configuration() {
  return (
    <DocsLayout
      slug="configuration"
      title="Configuration"
      lede="Everything past a one-off command lives in a station TOML file. One file describes every SDR, every mode, and every output — and xng station runs the whole site from it in a single process."
    >
      <h2>Station files</h2>
      <p>
        A station file is read by <code>xng station station.toml</code>. It has one mandatory
        top-level key, a <code>[outputs]</code> block shared by every decoder, and one
        <code>[[session]]</code> block per decode job. A full annotated example ships in the repo at{' '}
        <code>contrib/station.example.toml</code>, with a hardened systemd unit alongside it.
      </p>

      <CodeBlock
        lang="toml"
        title="station.toml"
        code={`station-id = "XX-KSEA-1"

[outputs]
feed-airframes = true
jsonl = "/var/log/xng/messages.jsonl"
metrics = "0.0.0.0:9090"          # Prometheus
http = "0.0.0.0:8080"             # live web dashboard + tar1090 data API
# mqtt = "mqtt://user:pass@broker:1883"
# sbs = "0.0.0.0:30003"
# beast = "0.0.0.0:30005"
# nmea-tcp = "0.0.0.0:10110"

# Two ACARS channels on one RTL-SDR
[[session]]
sdr = "driver=rtlsdr,serial=00000001"
gain = 48
mode = "acars"
sample-rate = 2400000
center = "131.000M"
channels = ["130.025", "131.125", "131.550", "131.725"]

# VDL2 on an Airspy — tuning derives from the mode plan when omitted
[[session]]
sdr = "driver=airspy"
mode = "vdl2"

# ADS-B; receiver position unlocks surface-position decode
[[session]]
sdr = "driver=rtlsdr,serial=00000002"
mode = "adsb"
sample-rate = 2000000
center = "1090M"
channels = ["1090"]
receiver-pos = "47.62,-122.35"`}
      />

      <Callout type="tip">
        <p>
          Don’t feel like writing tuning by hand? Run <code>xng scan</code> (see the{' '}
          <Link href="/docs/quickstart">Quickstart</Link>) and it prints a ready-to-paste session
          block. Per-mode channels and sample rates auto-derive from each mode’s built-in plan when
          you leave them out.
        </p>
      </Callout>

      <h2>Top level</h2>
      <div className="deflist">
        <div className="deflist__row">
          <code>station-id</code>
          <p>Your Airframes station identifier. Required.</p>
          <span className="deflist__meta">string · mandatory</span>
        </div>
      </div>

      <h2>[outputs]</h2>
      <p>One block, applied to every session. See <Link href="/docs/inputs-outputs">Inputs &amp; outputs</Link> for what each destination does.</p>
      <div className="deflist">
        <div className="deflist__row">
          <code>feed-airframes</code>
          <p>Feed decoded messages to <code>feed.airframes.io</code>. Classic ACARS-only behavior unless an <code>[outputs.airframes]</code> block opts more modes in.</p>
          <span className="deflist__meta">bool</span>
        </div>
        <div className="deflist__row">
          <code>jsonl</code>
          <p>Append one normalized JSON message per line to this file.</p>
          <span className="deflist__meta">path</span>
        </div>
        <div className="deflist__row">
          <code>metrics</code>
          <p>Serve Prometheus metrics (frames, CRC, levels, per-label counts, FEC corrections).</p>
          <span className="deflist__meta">host:port</span>
        </div>
        <div className="deflist__row">
          <code>http</code>
          <p>Serve the live web dashboard and the tar1090 / VRS data API.</p>
          <span className="deflist__meta">host:port</span>
        </div>
        <div className="deflist__row">
          <code>mqtt</code> · <code>sbs</code> · <code>beast</code> · <code>nmea-tcp</code>
          <p>MQTT broker URL; SBS/BaseStation TCP; Beast binary TCP; and NMEA AIVDM TCP server, respectively.</p>
          <span className="deflist__meta">url / host:port</span>
        </div>
      </div>

      <h2>Per-mode Airframes feeding</h2>
      <p>
        New in 0.21.0: an optional <code>[outputs.airframes]</code> block gives each mode its own
        station ID, can auto-suffix derived IDs, and lets you decode a mode locally without feeding it.
      </p>
      <CodeBlock
        lang="toml"
        code={`[outputs.airframes]
enabled = true
station-id = "XX-KSEA"     # base id
auto-suffix = true         # → XX-KSEA-ACARS / -VDL2 / -HFDL / -AIS

[outputs.airframes.hfdl]
enabled = false            # decode HFDL locally, but do not feed it`}
      />

      <h2>[[session]]</h2>
      <p>Repeat one block per decode job. A session reads from an SDR <em>or</em> a recorded file.</p>
      <div className="deflist">
        <div className="deflist__row">
          <code>sdr</code>
          <p>SoapySDR-style device string, e.g. <code>driver=rtlsdr,serial=00000001</code>. Use <code>file = "capture.cf32"</code> instead to replay a recording.</p>
        </div>
        <div className="deflist__row">
          <code>mode</code>
          <p>Which decoder to run — <code>acars</code>, <code>vdl2</code>, <code>hfdl</code>, <code>ais</code>, <code>adsb</code>, and so on. See <Link href="/docs/modes">Modes</Link>.</p>
        </div>
        <div className="deflist__row">
          <code>gain</code>
          <p>Front-end gain in dB. Omit for hardware AGC.</p>
        </div>
        <div className="deflist__row">
          <code>sample-rate</code> · <code>center</code> · <code>channels</code>
          <p>Capture rate (Hz), center frequency, and the channel list. Accept <code>M</code>/<code>k</code> suffixes. Auto-derived from the mode plan when omitted.</p>
        </div>
        <div className="deflist__row">
          <code>receiver-pos</code>
          <p><code>lat,lon</code> — enables ADS-B surface positions and AIS/APRS own-ship correlation.</p>
        </div>
        <div className="deflist__row">
          <code>feed</code> · <code>airframes-station-id</code>
          <p>Disable feeding for just this session, or override its station ID.</p>
        </div>
      </div>

      <Callout type="warn">
        <p>
          Config is validated strictly (<code>deny_unknown_fields</code>) — a typo’d key is an error,
          not a silent no-op. Also note: a sample rate must be an integer multiple of the mode’s
          channel rate, which is the most common cause of a session that loads but never decodes.
        </p>
      </Callout>

      <h2>Run it as a service</h2>
      <p>The repo includes <code>contrib/xng-station.service</code>. Drop in your config and enable it:</p>
      <CodeBlock
        lang="bash"
        code={`sudo cp contrib/xng-station.service /etc/systemd/system/
sudo cp station.toml /etc/xng/station.toml
sudo systemctl enable --now xng-station
xng status        # live view of every session`}
      />
    </DocsLayout>
  );
}
