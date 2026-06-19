import Link from 'next/link';
import DocsLayout from '../../components/DocsLayout';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';

export default function Modes() {
  return (
    <DocsLayout
      slug="modes"
      title="Modes & decoders"
      lede="Around 21 modes, every one of them a crate, every one feeding the same outputs. This page is honest about exactly how mature each decoder is — from production-validated to spec-anchored."
    >
      <p>
        You select a decoder with <code>--mode &lt;name&gt;</code> on the CLI, or <code>mode = "…"</code>
        in a <Link href="/docs/configuration">station file</Link>. Every multi-channel mode can decode
        any number of channels from a single capture.
      </p>

      <h2>Maturity, plainly</h2>
      <p>Decode cores are anchored to public specs or ported from reference implementations. What varies is how far the demodulator has been validated against real-world signals:</p>
      <div className="deflist">
        <div className="deflist__row">
          <code>● live</code>
          <p><strong>Validated off-air.</strong> Decoded from real recordings or live radio and fenced by a CI regression gate. Safe to rely on.</p>
        </div>
        <div className="deflist__row">
          <code>◐ growing</code>
          <p><strong>Decode core validated, demod maturing.</strong> The frame/application decode is anchored to spec or oracle vectors; the demodulator may still be synthetic. Useful, but expect rough edges.</p>
        </div>
      </div>

      <h2>Flagship modes</h2>
      <p>The safe starting set. All are validated against real off-air captures and benchmarked against the established tools — frequently beating them.</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>--mode</th><th>Signal</th><th>Band</th><th>What you get</th><th></th></tr>
          </thead>
          <tbody>
            <tr><td><code>acars</code></td><td>VHF ACARS (ARINC 618)</td><td>118–137 MHz</td><td>Full application layer: ADS-C, CPDLC text, OOOI, MIAM, FEC bit-repair, many channels per capture</td><td>● live</td></tr>
            <tr><td><code>vdl2</code></td><td>VDL Mode 2</td><td>136.6–137 MHz</td><td>ACARS-over-AVLC, full ATN-B1 (protected CPDLC, CM logon, X.25/CLNP)</td><td>● live</td></tr>
            <tr><td><code>hfdl</code></td><td>HFDL (ARINC 635)</td><td>2.8–22 MHz</td><td>Squitters, logons, mapped positions, OTA system-table persistence</td><td>● live</td></tr>
            <tr><td><code>aero</code></td><td>Inmarsat Aero L</td><td>1545–1547 MHz</td><td>P-channel 600/1200 bps + 10.5 kbps OQPSK; ACARS/ADS-C/CPDLC; C-channel voice</td><td>● live</td></tr>
            <tr><td><code>std-c</code></td><td>Inmarsat STD-C / EGC</td><td>1537–1542 MHz</td><td>NCS TDM, EGC SafetyNET/FleetNET, geographic-area decode to coordinates</td><td>● live</td></tr>
            <tr><td><code>iridium</code></td><td>Iridium</td><td>1616–1626.5 MHz</td><td>Ring alerts with sat positions, IBC/ITL, ACARS over SBD, pager, voice classification, IP frames</td><td>● live</td></tr>
            <tr><td><code>ais</code></td><td>AIS (ITU-R M.1371)</td><td>161.975 / 162.025 MHz</td><td>NMEA AIVDM + field decode types 1–27, Inland-AIS, SART/MOB/EPIRB distress</td><td>● live</td></tr>
            <tr><td><code>adsb</code></td><td>Mode S / ADS-B</td><td>1090 MHz</td><td>CPR positions, Comm-B, ACAS RA, TIS-B/ADS-R; SBS + Beast out; native 2.4 MS/s</td><td>● live</td></tr>
          </tbody>
        </table>
      </div>

      <Callout type="note">
        <p>
          <code>aero-c</code> (Inmarsat Aero C bursts) is also available and RF-loopback validated.
          On the benchmarks: VDL2 reads more frames than dumpvdl2, HFDL hits 97% of dumphfdl, AIS 91%
          of AIS-catcher with zero false decodes, ADS-B 98–99% of readsb/dump1090-fa, and Iridium
          decodes 132% of gr-iridium’s frame count on a shared capture.
        </p>
      </Callout>

      <h2>Newer modes</h2>
      <p>All wired to <code>--mode</code> and exercising the same runtime, outputs, and feeding. Demod validation ranges from live off-air to synthetic — each has a note in the repo’s <code>docs/notes/</code>.</p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>--mode</th><th>Signal</th><th>Band</th><th>Decodes</th><th></th></tr>
          </thead>
          <tbody>
            <tr><td><code>uat</code></td><td>UAT 978 (DO-282B)</td><td>978 MHz</td><td>ADS-B downlink + FIS-B weather uplink, RS-FEC</td><td>● live</td></tr>
            <tr><td><code>sonde</code></td><td>Radiosonde (Vaisala RS41)</td><td>~400–406 MHz</td><td>De-whiten + RS-FEC + STATUS/PTU/GPS</td><td>● live</td></tr>
            <tr><td><code>navtex</code></td><td>NAVTEX (SITOR-B)</td><td>518 / 490 kHz</td><td>4-of-7 + FEC-B + ZCZC framing</td><td>● live</td></tr>
            <tr><td><code>flex</code></td><td>FLEX paging</td><td>900 MHz</td><td>Auto rate-detect, BCH, alpha/numeric/tone</td><td>● live</td></tr>
            <tr><td><code>sarsat</code></td><td>COSPAS-SARSAT 406</td><td>406 MHz</td><td>First-gen beacon ID + position (ELT/EPIRB/PLB)</td><td>◐ growing</td></tr>
            <tr><td><code>dsc</code></td><td>DSC (GMDSS)</td><td>MF/HF/VHF</td><td>Distress / all-ships / individual / area</td><td>◐ growing</td></tr>
            <tr><td><code>ads-l</code></td><td>ADS-L (EASA SRD860)</td><td>868 MHz</td><td>i-Conspicuity (CRC-24 + XXTEA)</td><td>◐ growing</td></tr>
            <tr><td><code>aprs</code></td><td>APRS / AX.25</td><td>144.39 / 144.80 / 145.825 MHz</td><td>AFSK1200 + AX.25 UI; position/Mic-E/weather/telemetry; satellite tagging</td><td>◐ growing</td></tr>
            <tr><td><code>pocsag</code></td><td>POCSAG paging</td><td>paging bands</td><td>2-FSK 512/1200/2400 + BCH; numeric/alpha/tone</td><td>◐ growing</td></tr>
            <tr><td><code>atcs</code></td><td>ATCS (rail)</td><td>896 / 900 MHz</td><td>HDLC/LAPB + AAR Spec-200 header</td><td>◐ growing</td></tr>
            <tr><td><code>eot</code></td><td>EOT/HOT (rail telemetry)</td><td>457.94 / 452.94 MHz</td><td>Manchester-FSK + AAR S-9152</td><td>◐ growing</td></tr>
            <tr><td><code>vdes</code></td><td>VDES ASM</td><td>161.95 / 162.00 MHz</td><td>GMSK 9600 + ASM transport + spec payloads</td><td>◐ growing</td></tr>
          </tbody>
        </table>
      </div>

      <h2>The shared application layer</h2>
      <p>
        The reason a normalized message matters: ARINC 622 ADS-C positions and CPDLC render as
        readable text — like <code>REQUEST CLIMB TO FL360</code> — the same way no matter whether the
        ACARS arrived over VHF, VDL2, HFDL, Aero, or Iridium SBD. Decode it once, get it everywhere.
      </p>

      <h2>Picking channels</h2>
      <p>Each mode ships a built-in frequency plan, so the simplest invocation is just a mode name:</p>
      <CodeBlock
        lang="bash"
        code={`xng tui --sdr driver=rtlsdr --mode vdl2        # uses the VDL2 plan
xng listen --sdr driver=rtlsdr --mode ais \\     # both AIS channels, one capture
    -r 2400000 -c 162.000M --channels 161.975,162.025`}
      />
      <p>
        For hardware and antenna requirements per band, see <Link href="/docs/inputs-outputs">Inputs &amp; outputs</Link>;
        for full command lines per mode, see <Link href="/docs/recipes">Recipes</Link>.
      </p>
    </DocsLayout>
  );
}
