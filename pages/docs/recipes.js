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

      <h2>Find your receiver from Iridium ring alerts</h2>
      <p>
        No GPS? With <code>--iridium-satmap</code>, xng fits your location from the Doppler shift of
        ring alerts against SGP4 satellite positions. The first fix usually lands within 30 minutes
        and is marked settled once it uses two or more satellites and two fits in a row agree within
        20 km. It shows on the dashboard map and goes out as a <code>receiver-position</code> message.
      </p>
      <CodeBlock lang="bash" code={`xng listen --sdr driver=airspy --mode iridium -r 10000000 -c 1622.000M \\
    --channels 1622.000 --iridium-satmap --http 0.0.0.0:8080`} />

      <h2>ACARS positions on SBS</h2>
      <p>
        ADS-C reports and free-text position reports over VDL2, HFDL, Aero or Iridium go out on the
        SBS stream when the aircraft's ICAO address is known: from the ADS-C airframe ID, or by
        looking the registration up in <code>--aircraft-db</code>. They stay off Beast, which is for
        Mode S only.
      </p>
      <CodeBlock lang="bash" code={`xng listen --sdr driver=airspyhf --mode hfdl -r 768000 -c 10060.000k \\
    --channels 10027k,10060k,10063k,10081k --aircraft-db aircraft.csv --sbs 0.0.0.0:30003`} />

      <h2>Meshtastic and MeshCore nodes on a map</h2>
      <p>
        Meshtastic LongFast in the US sits at 906.875 MHz, MeshCore's US settings at 910.525 MHz.
        Open the dashboard's Mesh tab for the node list (name, hardware, battery, SNR, hops, last
        text) and the Mesh nodes map layer. Mesh traffic is not fed to Airframes.
      </p>
      <CodeBlock lang="bash" code={`xng listen --sdr driver=rtlsdr --mode meshtastic -r 1000000 -c 906.875M \\
    --channels 906.875 --http 0.0.0.0:8080

xng listen --sdr driver=rtlsdr --mode meshcore -r 1000000 -c 910.525M \\
    --channels 910.525`} />

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

      <h2>Airband: tower and ground with a scanner, fed to the ATC network</h2>
      <CodeBlock lang="bash" code={`xng atc login   # once
xng listen --sdr driver=rtlsdr --mode airband -r 2400000 -c 121.15 \\
    --channels 120.5,120.9,121.8 \\
    --labels "120.5=SFO Tower,120.9=SFO Ground West,121.8=SFO Ground" \\
    --scan --scan-priority 120.5 --record-dir ~/airband --record-format ogg \\
    --http 0.0.0.0:8080 --receiver-pos 37.62,-122.38 --atc-feed`} />
      <p>Open <code>http://localhost:8080/airband</code> to listen. More in <Link href="/docs/airband">Airband voice &amp; ATC</Link>.</p>

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
