import Link from 'next/link';
import DocsLayout from '../../components/DocsLayout';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';

export default function Troubleshooting() {
  return (
    <DocsLayout
      slug="troubleshooting"
      title="Troubleshooting"
      lede="When nothing decodes, it is almost always one of a handful of things — the radio, the sample rate, the gain, or the antenna. Here is how to find out which."
    >
      <h2>Start with the built-ins</h2>
      <p>Before changing anything, let xng tell you what it sees:</p>
      <CodeBlock lang="bash" code={`xng devices      # is the radio detected at all?
xng selftest     # is the decode pipeline itself healthy?
xng iq-info capture.cf32 -r 2000000 -c 131500000   # is there signal in a recording?`} />

      <h2>“xng devices shows nothing”</h2>
      <p>The SDR driver is missing or the device is not reachable.</p>
      <div className="deflist">
        <div className="deflist__row"><code>SoapySDR module</code><p>Install the vendor module — e.g. <code>soapysdr-module-all</code>, or the RTL-SDR / Airspy / SDRplay package for your distro.</p></div>
        <div className="deflist__row"><code>USB permissions</code><p>On Linux, add the udev rules for your dongle and re-plug it, or test as root to confirm it is a permissions issue.</p></div>
        <div className="deflist__row"><code>Native vs Soapy</code><p>If a native Airspy build does not see the device, try <code>backend=soapy</code> in the driver string, or vice-versa.</p></div>
      </div>

      <h2>“It runs but never decodes”</h2>
      <Callout type="warn">
        <p>
          The single most common cause: <strong>the sample rate is not an integer multiple of the
          mode’s channel rate.</strong> If a session loads cleanly but produces nothing, this is the
          first thing to check. The easiest fix is to omit <code>--sample-rate</code> /
          <code>--channels</code> entirely and let the mode’s built-in plan choose them.
        </p>
      </Callout>
      <div className="deflist">
        <div className="deflist__row"><code>Gain</code><p>Too low and there is nothing to decode; too high and the front end overloads. Run <code>xng survey --tune-gain</code> to find the sweet spot, or drop <code>--gain</code> for AGC.</p></div>
        <div className="deflist__row"><code>Center frequency</code><p>Make sure your channels actually fall within the captured bandwidth around <code>--center-freq</code>.</p></div>
        <div className="deflist__row"><code>Antenna / band</code><p>L-band modes (Aero, STD-C, Iridium) need a patch antenna and an LNA — a VHF whip will hear nothing there. See <Link href="/docs/inputs-outputs">Inputs &amp; outputs</Link>.</p></div>
        <div className="deflist__row"><code>Is anything on the air?</code><p>HF and satellite traffic is intermittent. Use <code>xng survey</code> to soak a band and confirm there is something to hear before blaming the setup.</p></div>
      </div>

      <h2>“A config key is rejected”</h2>
      <p>
        Station files are validated strictly — an unknown key is a hard error, not a silent no-op.
        Check the spelling against the <Link href="/docs/configuration">configuration reference</Link>;
        a rejected key usually means a typo or a value in the wrong block.
      </p>

      <h2>Decoding less than the old tool</h2>
      <p>
        If you are comparing against dumphfdl, dumpvdl2, or AIS-catcher, first switch effort up:
      </p>
      <CodeBlock lang="bash" code={`xng listen --sdr driver=rtlsdr --mode hfdl --demod-effort max ...`} />
      <p>
        <code>live</code> is tuned to stay real-time on a Raspberry Pi; <code>max</code> trades CPU for
        the last few percent of frames. On the published benchmarks xng is competitive with or ahead
        of the reference tools, so a large gap usually points at gain, antenna, or rate.
      </p>

      <h2>Still stuck?</h2>
      <p>
        Reproduce it with <code>-vv</code> for more detail, capture a short IQ file so the problem is
        replayable, and open an issue on{' '}
        <a href="https://github.com/airframesio/xng/issues" target="_blank" rel="noopener noreferrer">GitHub</a>.
        A recording plus the exact command line is the fastest path to a fix.
      </p>
    </DocsLayout>
  );
}
