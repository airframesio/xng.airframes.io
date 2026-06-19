import Link from 'next/link';
import DocsLayout from '../../components/DocsLayout';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';

export default function Recipes() {
  return (
    <DocsLayout
      slug="recipes"
      title="Recipes"
      lede="Copy-paste starting points for the most common setups. Swap in your own station ID, device serials, and receiver position."
    >
      <Callout type="tip">
        <p>
          Don’t know which frequencies are active near you? Run <code>xng scan</code> first (see the{' '}
          <Link href="/docs/quickstart">Quickstart</Link>) — it prints a session block you can paste
          straight into a <Link href="/docs/configuration">station file</Link>.
        </p>
      </Callout>

      <h2>Two ACARS channels → Airframes</h2>
      <p>The headline recipe: capture two channels from one RTL-SDR, decode the full application layer, feed the network.</p>
      <CodeBlock lang="bash" code={`xng listen --sdr driver=rtlsdr -r 2400000 -c 131.500M \\
    --channels 131.550,131.725 \\
    --feed-airframes --station-id XX-KSEA-ACARS1`} />

      <h2>VDL2, four channels including the worldwide CSC</h2>
      <CodeBlock lang="bash" code={`xng listen --sdr driver=rtlsdr --mode vdl2 -r 2400000 -c 136.800M \\
    --channels 136.650,136.800,136.925,136.975`} />

      <h2>HFDL on an Airspy HF+ Discovery</h2>
      <CodeBlock lang="bash" code={`xng listen --sdr driver=airspyhf --mode hfdl -r 768000 -c 10060.000k \\
    --channels 10027k,10060k,10063k,10081k,10084k,10087k`} />

      <h2>Full-band Iridium on an Airspy R2</h2>
      <p>The wideband burst hunter wants threads — give it cores.</p>
      <CodeBlock lang="bash" code={`xng listen --sdr driver=airspy --mode iridium -r 10000000 -c 1622.000M \\
    --channels 1622.000 --decode-threads 8`} />

      <h2>AIS, both channels from one capture</h2>
      <CodeBlock lang="bash" code={`xng listen --sdr driver=rtlsdr --mode ais -r 2400000 -c 162.000M \\
    --channels 161.975,162.025 --nmea-tcp 0.0.0.0:10110`} />

      <h2>ADS-B with a live map, feeding the community</h2>
      <p>
        Native 2.4 MS/s on a plain RTL-SDR, with your own tar1090-style dashboard plus Beast and SBS
        streams for other tools.
      </p>
      <CodeBlock lang="bash" code={`xng listen --sdr driver=rtlsdr --mode adsb -r 2400000 -c 1090.000M \\
    --channels 1090 --receiver-pos 47.62,-122.35 \\
    --http 0.0.0.0:8080 --beast 0.0.0.0:30005 --sbs 0.0.0.0:30003`} />
      <Callout type="tip">
        <p>
          That <code>--beast</code> stream is what community ADS-B aggregators ingest — point a Beast
          feeder at <a href="https://airplanes.live" target="_blank" rel="noopener noreferrer">Airplanes.Live</a>{' '}
          or <a href="https://plane.watch" target="_blank" rel="noopener noreferrer">Plane.Watch</a> to
          contribute your coverage while xng keeps feeding ACARS, VDL2, and the rest to Airframes.
        </p>
      </Callout>

      <h2>Replay a recording — no hardware</h2>
      <CodeBlock lang="bash" code={`xng iq-info capture.cf32 -r 2000000 -c 131500000
xng decode capture.cf32 -r 2400000 -c 131.500M --channels 131.550,131.425 --json`} />

      <h2>Wrap an existing decoder onto the xng bus</h2>
      <p>Keep your current decoder, but gain the shared application layer, asf-2.0, and Airframes feeding.</p>
      <CodeBlock lang="bash" code={`dumpvdl2 --output decoded:json:file:path=- 136975000 \\
    | xng extern --format dumpvdl2 --asf2-grpc http://ingest:6001`} />

      <h2>A whole station, one process</h2>
      <p>
        Once you run more than one mode, move to a <Link href="/docs/configuration">station file</Link> and
        let <code>xng station</code> manage every SDR, mode, and output together:
      </p>
      <CodeBlock lang="bash" code={`xng station station.toml
xng status`} />

      <Callout type="note">
        <p>
          Feeding multiple modes? Give each its own suffixed station ID with the per-mode
          <code> [outputs.airframes]</code> block, so your ACARS, VDL2, and HFDL contributions show up
          separately on the network.
        </p>
      </Callout>
    </DocsLayout>
  );
}
