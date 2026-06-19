import Link from 'next/link';
import DocsLayout from '../../components/DocsLayout';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';

export default function InputsOutputs() {
  return (
    <DocsLayout
      slug="inputs-outputs"
      title="Inputs & outputs"
      lede="Radios and files go in; Airframes, JSON, live maps, metrics, and a dozen wire formats come out. Because every mode shares one message model, the same output flags work for all of them."
    >
      <h2>Inputs</h2>
      <p>xng presents a single sample-source interface over several backends. You pick one with <code>--sdr "driver=…"</code> (or <code>sdr =</code> in a station file).</p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Source</th><th>Driver</th><th>Notes</th></tr></thead>
          <tbody>
            <tr><td>RTL-SDR</td><td><code>driver=rtlsdr</code></td><td>The budget workhorse for VHF (ACARS/VDL2/AIS); with an L-band antenna + LNA, also Aero/STD-C/Iridium/ADS-B.</td></tr>
            <tr><td>Airspy R2 / Mini</td><td><code>driver=airspy</code></td><td>Native libairspy backend (<code>--features airspy</code>). 24 MHz–1.75 GHz. <code>serial=</code> selects a unit, <code>bias=1</code> powers an LNA.</td></tr>
            <tr><td>Airspy HF+ / Discovery</td><td><code>driver=airspyhf</code></td><td>Native libairspyhf (<code>--features airspyhf</code>). The classic HFDL receiver.</td></tr>
            <tr><td>SDRplay RSP</td><td><code>driver=sdrplay</code></td><td>Via SoapySDR.</td></tr>
            <tr><td>HackRF, LimeSDR, USRP, BladeRF…</td><td>SoapySDR module</td><td>Anything with a SoapySDR driver works.</td></tr>
            <tr><td>IQ files</td><td><code>xng decode &lt;file&gt;</code></td><td><code>cf32</code> / <code>cs16</code> / <code>cs8</code> / <code>cu8</code>, guessed from the extension. No hardware needed.</td></tr>
            <tr><td>External decoders</td><td><code>xng extern</code></td><td>Wrap <code>dumphfdl</code> / <code>dumpvdl2</code> / <code>acarsdec</code> output onto the xng bus.</td></tr>
          </tbody>
        </table>
      </div>
      <Callout type="note">
        <p>
          <code>--gain</code> is always in dB; omit it for hardware AGC. With a native backend compiled
          in, the driver name auto-routes to it — add <code>backend=soapy</code> to force the SoapySDR
          path instead.
        </p>
      </Callout>

      <h3>Hardware &amp; antennas by band</h3>
      <div className="deflist">
        <div className="deflist__row"><code>VHF — ACARS, VDL2, AIS</code><p>Any RTL-SDR and a vertical antenna. The easy place to start.</p></div>
        <div className="deflist__row"><code>HF — HFDL</code><p>An HF-capable SDR (Airspy HF+ / Discovery, SDRplay) and an HF antenna.</p></div>
        <div className="deflist__row"><code>L-band — Aero, STD-C, Iridium</code><p>A patch/L-band antenna with an LNA. Iridium does best on an Airspy R2 sampling wide.</p></div>
        <div className="deflist__row"><code>1090 MHz — ADS-B</code><p>A passive 1090 antenna. <code>--receiver-pos lat,lon</code> unlocks surface positions.</p></div>
      </div>

      <h2>Outputs</h2>
      <p>Every flag below can be combined; a single decode can fan out to all of them at once.</p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Flag</th><th>Destination</th></tr></thead>
          <tbody>
            <tr><td><em>(default)</em></td><td>Human-readable console one-liners</td></tr>
            <tr><td><code>--json</code> / <code>--jsonl &lt;file&gt;</code></td><td>Raw JSON to stdout / one normalized message per line to a file</td></tr>
            <tr><td><code>--udp host:5550</code></td><td>acarsdec-compatible JSON datagrams (repeatable)</td></tr>
            <tr><td><code>--feed-airframes --station-id &lt;id&gt;</code></td><td>Feed to <code>feed.airframes.io</code></td></tr>
            <tr><td><code>--metrics 0.0.0.0:9090</code></td><td>Prometheus metrics</td></tr>
            <tr><td><code>--sbs 0.0.0.0:30003</code></td><td>SBS / BaseStation TCP (Mode S + UAT/HFDL positions)</td></tr>
            <tr><td><code>--beast 0.0.0.0:30005</code></td><td>Beast binary TCP (carries the 12 MHz MLAT clock)</td></tr>
            <tr><td><code>--nmea-tcp</code> / <code>--nmea-udp</code></td><td>NMEA AIVDM server / push (AIS)</td></tr>
            <tr><td><code>--mqtt mqtt://…</code></td><td>JSON to <code>&lt;prefix&gt;/&lt;mode&gt;</code> on an MQTT broker</td></tr>
            <tr><td><code>--asf2-grpc</code> / <code>--asf2-quic</code></td><td>asf-2.0 multiplexed feeding over gRPC / QUIC</td></tr>
            <tr><td><code>--gsmtap [addr]</code></td><td>Iridium GSM frames to Wireshark via GSMTAP</td></tr>
            <tr><td><code>--http 0.0.0.0:8080</code></td><td>Live web dashboard + data API + geo export</td></tr>
          </tbody>
        </table>
      </div>

      <Callout type="tip">
        <p>
          The <code>--beast</code> and <code>--sbs</code> streams are exactly what community ADS-B
          networks consume, so xng can feed them alongside Airframes. Point a Beast feeder at{' '}
          <a href="https://airplanes.live" target="_blank" rel="noopener noreferrer">Airplanes.Live</a>{' '}
          or <a href="https://plane.watch" target="_blank" rel="noopener noreferrer">Plane.Watch</a>,
          and run <code>--http</code> for your own tar1090 map at the same time.
        </p>
      </Callout>

      <h2>The web dashboard</h2>
      <p>
        <code>--http</code> serves a dark, live map and a tabbed entity table — aircraft (Mode S / UAT
        / HFDL / ACARS merged by ICAO), ships (AIS), beacons, trains, pagers, and satellites — plus a
        streaming message panel with per-mode filter chips, position trails, and Iridium beam overlays.
      </p>
      <CodeBlock lang="bash" code={`xng listen --sdr driver=rtlsdr --mode adsb --channels 1090 \\
    --receiver-pos 47.62,-122.35 --http 0.0.0.0:8080
# then open http://localhost:8080`} />
      <p>It also exposes drop-in data APIs and exports:</p>
      <div className="deflist">
        <div className="deflist__row"><code>/data/aircraft.json</code><p>tar1090 / graphs1090 / VRS compatible — point those tools straight at it.</p></div>
        <div className="deflist__row"><code>/data/export.geojson · .gpx · .kml</code><p>RFC 7946 GeoJSON, GPX 1.1, and OGC KML 2.2 exports.</p></div>
        <div className="deflist__row"><code>/api/state</code><p>Cross-mode distress surface — ADS-B 7500/7600/7700, AIS SART/MOB/EPIRB, STD-C/DSC distress, SARSAT 406.</p></div>
      </div>

      <h2>asf-2.0: one connection, every channel</h2>
      <p>
        Airframes Standard Format v2 is xng’s multiplexed feeding protocol. A single protobuf
        <code>Envelope</code> schema carries every channel, SDR, and mode over one gRPC or QUIC
        connection — with reconnect and backpressure handling, nanosecond timestamps, signal-quality
        metadata, and the <strong>raw payload always preserved</strong> for server-side re-decode.
      </p>
      <CodeBlock lang="bash" code={`# feed a remote ingest server over gRPC
xng listen --sdr driver=rtlsdr --mode acars --asf2-grpc http://ingest:6001

# run the reference ingest server
xng ingest --grpc 0.0.0.0:6001 --quic 0.0.0.0:6011`} />
      <p>See <Link href="/docs/architecture">Architecture</Link> for how the pipeline produces these envelopes.</p>
    </DocsLayout>
  );
}
