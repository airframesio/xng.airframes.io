import Link from 'next/link';
import DocsLayout from '../../components/DocsLayout';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';
import { useReveal } from '../../lib/useFx';

export default function DocsIntro() {
  useReveal();
  return (
    <DocsLayout
      slug=""
      title="xng documentation"
      lede="xng is one native SDR decoder for the whole aviation and maritime radio stack — a single Rust binary that decodes ACARS, VDL2, HFDL, satcom, Iridium, AIS, ADS-B and more, and feeds it all to Airframes."
    >
      <h2>What xng is</h2>
      <p>
        Historically, monitoring the airwaves meant stitching together a dozen single-purpose
        decoders — <code>acarsdec</code>, <code>dumpvdl2</code>, <code>dumphfdl</code>, JAERO,
        <code>gr-iridium</code>, AIS-catcher, <code>dump1090</code> — each running as its own
        process, consuming its own SDR dongle, and emitting its own incompatible output format.
      </p>
      <p>
        xng collapses that whole zoo into <strong>one application</strong>. A single capture can
        feed many channels at once; every mode produces the same normalized message; and every
        output — console, JSON, Airframes, Prometheus, live maps — works identically across all of
        them. It is dual-licensed MIT or Apache-2.0, where most of the tools it replaces are GPL.
      </p>

      <Callout type="tip">
        <p>
          New here? Jump straight to the <Link href="/docs/quickstart">Quickstart</Link> — you can
          go from a plugged-in RTL-SDR to streaming decoded traffic in about five minutes, or try
          the whole pipeline on a recorded IQ file with no hardware at all.
        </p>
      </Callout>

      <h2>The shape of it</h2>
      <p>One binary, <code>xng</code>, with a handful of subcommands and a clear pipeline:</p>
      <CodeBlock
        lang="text"
        code={`SDR / file / stdin
  → channelizer (one capture, many channels)
  → demod  →  frame  →  application layer
  → normalized message  →  message bus
  → outputs: Airframes · JSON · maps · Prometheus · SBS/Beast · NMEA · MQTT · gRPC/QUIC`}
      />
      <p>
        Because the message model is shared, adding a mode does not mean learning a new tool — the
        runtime, outputs, stats, TUI, and feeding all keep working unchanged.
      </p>

      <h2>Where to go next</h2>
      <p>The docs follow the path most people take:</p>
      <div className="deflist">
        <div className="deflist__row">
          <Link href="/docs/install"><code>Installation</code></Link>
          <p>Prebuilt binaries, the Debian package, the Docker image, and building from source.</p>
        </div>
        <div className="deflist__row">
          <Link href="/docs/quickstart"><code>Quickstart</code></Link>
          <p>Discover your radio, find receivable signals, and watch them decode live.</p>
        </div>
        <div className="deflist__row">
          <Link href="/docs/configuration"><code>Configuration</code></Link>
          <p>The station TOML file: sessions, outputs, and per-mode Airframes feeding.</p>
        </div>
        <div className="deflist__row">
          <Link href="/docs/modes"><code>Modes &amp; decoders</code></Link>
          <p>Every signal xng speaks, with bands, hardware, and maturity.</p>
        </div>
        <div className="deflist__row">
          <Link href="/docs/cli"><code>CLI reference</code></Link>
          <p>Every subcommand and the flags that matter.</p>
        </div>
        <div className="deflist__row">
          <Link href="/docs/recipes"><code>Recipes</code></Link>
          <p>Copy-paste setups for common stations and modes.</p>
        </div>
      </div>

      <h2>Project status</h2>
      <p>
        xng is at <strong>v0.21.0</strong> — pre-1.0 but actively developed and already feeding
        production Airframes from live stations. The VHF ACARS chain is validated end-to-end;
        VDL2, HFDL, AIS, Mode S/ADS-B, STD-C, Aero, Iridium and several others are validated
        against real off-air recordings and fenced by CI regression gates. A handful of newer
        cores are spec-anchored with synthetic demod and climbing the same ladder — the
        <Link href="/docs/modes"> modes page</Link> is honest about exactly where each one stands.
      </p>
    </DocsLayout>
  );
}
