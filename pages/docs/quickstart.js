import Link from 'next/link';
import DocsLayout from '../../components/DocsLayout';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';

export default function Quickstart() {
  return (
    <DocsLayout
      slug="quickstart"
      title="Quickstart"
      lede="Plug in an RTL-SDR, let xng find what is receivable, and watch it stream. No config files, no frequency tables to memorize — and you can rehearse the whole thing on a recorded file first."
    >
      <Callout type="tip">
        <p>
          The fastest possible start: <code>xng tui --sdr driver=rtlsdr --mode acars</code>. It picks
          sensible channels for you and opens a live message browser. Everything below just explains
          what is happening and how to go further.
        </p>
      </Callout>

      <h2>1 · Confirm your setup</h2>
      <p>List the radios xng can see, then run the built-in pipeline self-check:</p>
      <CodeBlock
        lang="bash"
        code={`xng devices      # list attached SDRs (native Airspy + SoapySDR)
xng selftest     # end-to-end sanity check of the decode pipeline`}
      />
      <p>
        If <code>xng devices</code> shows nothing, your SDR driver is not installed or the device is
        not connected — see <Link href="/docs/troubleshooting">Troubleshooting</Link>.
      </p>

      <h2>2 · Find out what is on the air</h2>
      <p>
        You do not need to know which frequencies are active in your area. The scanner sweeps the
        bands for the modes you ask about and writes a ready-to-run plan:
      </p>
      <CodeBlock
        lang="bash"
        code={`xng scan --sdr driver=rtlsdr --gain 28 \\
    --modes acars,vdl2,ais --dwell 120 --out scan.json`}
      />
      <p>
        To soak-test a single mode and get per-channel reception advice (signal levels, suggested
        gain, which channels are worth keeping):
      </p>
      <CodeBlock
        lang="bash"
        code={`xng survey --sdr driver=rtlsdr --mode acars --tune-gain --out survey.json`}
      />

      <h2>3 · Watch it live in the TUI</h2>
      <p>
        The interactive terminal UI is the friendliest way to see what xng is doing — a scrollable
        message list, a detail pane, per-channel stats, a spectrum, and a waterfall:
      </p>
      <CodeBlock
        lang="bash"
        code={`xng tui --sdr driver=rtlsdr --mode acars`}
      />
      <div className="deflist">
        <div className="deflist__row">
          <code>↑ / ↓</code>
          <p>Move through the message list (up to 2000 messages are retained).</p>
        </div>
        <div className="deflist__row">
          <code>v</code>
          <p>Toggle the detail pane between human-readable and raw JSON.</p>
        </div>
        <div className="deflist__row">
          <code>--file capture.cf32</code>
          <p>Replay a recorded IQ file instead of a live radio — great for learning with no hardware.</p>
        </div>
      </div>

      <h2>4 · Print decoded traffic to the console</h2>
      <p>When you just want one-liners on stdout, use <code>listen</code>:</p>
      <CodeBlock
        lang="bash"
        code={`xng listen --sdr driver=rtlsdr -r 2400000 -c 131.500M \\
    --channels 131.550,131.725`}
      />
      <CodeBlock
        lang="text"
        code={`12:01:13.402 [acars] 131.550 MHz ACARS N401UA UA1989 lbl=H1 ok
12:01:14.118 [acars] 131.725 MHz ACARS N831UA UA0233 lbl=B6 ok [ADS-C 47.5512 -122.3052 34000 ft]`}
      />

      <h2>5 · Feed Airframes</h2>
      <p>
        Add your station ID and a feed flag, and your decodes contribute to the open network:
      </p>
      <CodeBlock
        lang="bash"
        code={`xng listen --sdr driver=rtlsdr -r 2400000 -c 131.500M \\
    --channels 131.550,131.725 \\
    --feed-airframes --station-id XX-KSEA-1`}
      />

      <Callout type="note">
        <p>
          Running more than one mode, or want it to survive reboots? That is what{' '}
          <Link href="/docs/configuration">station mode</Link> is for — one TOML file describes every
          SDR, mode, and output, and the <Link href="/docs/recipes">recipes</Link> page has
          copy-paste starting points.
        </p>
      </Callout>

      <h2>Try it with no hardware</h2>
      <p>Have a recorded IQ file? Inspect it, then decode it — no radio required:</p>
      <CodeBlock
        lang="bash"
        code={`xng iq-info capture.cf32 -r 2000000 -c 131500000
xng decode capture.cf32 -r 2400000 -c 131.500M --channels 131.550,131.425`}
      />
    </DocsLayout>
  );
}
