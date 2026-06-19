import Link from 'next/link';
import DocsLayout from '../../components/DocsLayout';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';

export default function Architecture() {
  return (
    <DocsLayout
      slug="architecture"
      title="Architecture"
      lede="xng is a Rust workspace of 25 crates behind one binary. The whole design follows from one decision: capture once, then fan one normalized message out to everything."
    >
      <h2>The pipeline</h2>
      <p>Every mode runs the same stages. The capture is shared; the message at the end is identical regardless of which mode produced it.</p>
      <CodeBlock
        lang="text"
        code={`SDR (Soapy / native) · IQ file · stdin
  │
  ▼  Capture ──► Channelizer (polyphase, one DDC per channel)
  ▼  DemodCore   (MSK · D8PSK · PSK · GMSK · BPSK · PPM · DQPSK)
  ▼  FrameCore   (AVLC · MPDU/LPDU · SU · HDLC · Mode S · …)
  ▼  AppLayer    (ACARS · ADS-C · CPDLC · MIAM)
  ▼  Normalized Message
  │
  ▼  message bus ──► broadcast fan-out
       ├─ asf-2.0 (gRPC / QUIC)      ├─ Prometheus
       ├─ Airframes feed             ├─ SBS / Beast / NMEA / MQTT
       ├─ console / JSON / JSONL     └─ web dashboard + data API`}
      />

      <h2>Why capture sharing is the whole game</h2>
      <p>
        A single SDR capture feeds many channels, and modes whose bands overlap can share one capture
        entirely — ACARS and VDL2 both live in 136–137 MHz; Aero and STD-C both sit in 1537–1547 MHz.
        Where the old tools needed one dongle per decoder, xng needs one dongle per band.
      </p>
      <Callout type="note">
        <p>
          Most fixed-channel modes run a digital down-converter per channel. <strong>Iridium is the
          exception</strong>: it runs a wideband FFT burst detector across the entire capture,
          parallelized across cores — which is why <code>--decode-threads</code> matters most there.
        </p>
      </Callout>

      <h2>The per-mode decode contract</h2>
      <p>
        Each mode is a crate. Adding a mode means adding a crate that satisfies a decode contract —
        and the runtime, outputs, stats, TUI, and feeding all keep working with zero changes. There is
        no runtime plugin system; modes are compiled in. The closest extension point for outside code
        is <code>xng extern</code>, which wraps an external decoder’s output onto the same bus.
      </p>

      <h2>Workspace layout</h2>
      <p>25 crates: five shared cores plus one crate per mode, with the CLI, runtime, outputs, TUI, and web dashboard in the binary.</p>
      <h3>Core infrastructure</h3>
      <div className="deflist">
        <div className="deflist__row"><code>xng-types</code><p>The normalized message model shared by everything.</p></div>
        <div className="deflist__row"><code>xng-dsp</code><p>Channelizer, DDC, FIR/NCO, Viterbi, Reed-Solomon, CRCs, scramblers, interleavers, sync/AGC.</p></div>
        <div className="deflist__row"><code>xng-sdr</code><p>SoapySDR + native Airspy backends + IQ-file sources, with sample-rate negotiation.</p></div>
        <div className="deflist__row"><code>xng-acars</code><p>The ACARS application layer (ARINC 618/620/622, ADS-C, CPDLC, MIAM) — ported from MIT libacars.</p></div>
        <div className="deflist__row"><code>xng-proto</code><p>The asf-2.0 protobuf schema (prost/tonic) and conversions.</p></div>
      </div>
      <h3>Decode cores</h3>
      <p>
        One <code>xng-mode-*</code> crate per signal — <code>acars</code>, <code>vdl2</code>,
        <code>hfdl</code>, <code>aero</code>, <code>stdc</code>, <code>iridium</code>, <code>ais</code>,
        <code>adsb</code>, <code>uat</code>, <code>sonde</code>, <code>navtex</code>, <code>flex</code>,
        and the rest. Each ships a spec-faithful modulator for loopback tests, vendored validation
        fixtures, and a <code>PROVENANCE.md</code> documenting exactly where its knowledge came from.
      </p>

      <h2>Tech &amp; provenance</h2>
      <p>
        Rust (edition 2021) on tokio, with clap (CLI), ratatui (TUI), prost + tonic (gRPC), quinn
        (QUIC), rustls (TLS), rustfft, and rayon. Decode cores are clean-room from public ICAO, ARINC,
        ITU-R and ETSI specs, or ported from permissively-licensed projects (libacars, JAERO,
        iridium-toolkit) with attribution; GPL projects are used as fact references only. Sourcing is
        documented in <code>docs/REFERENCES.md</code> and each crate’s <code>PROVENANCE.md</code>.
      </p>

      <h2>Performance</h2>
      <p>
        Every mode runs real-time on Pi-class hardware with <code>--demod-effort live</code>. On Apple
        M-series, measured throughput runs many times real-time — VDL2 around 85×, HFDL 283×, AIS 8.6×;
        Mode S 16.6× live. Every count-gated benchmark is enforced by a CI regression gate on each PR,
        so a change that drops frames does not merge.
      </p>
      <p>For the practical side of all this, see <Link href="/docs/recipes">Recipes</Link>.</p>
    </DocsLayout>
  );
}
