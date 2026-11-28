import Link from 'next/link';
import DocsLayout from '../../components/DocsLayout';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';

export default function AtcQuickstart() {
  return (
    <DocsLayout
      slug="atc-quickstart"
      title="ATC feeder quick start"
      lede="Tell xng where you are and which SDRs to use. It picks the busiest ATC channels near you, fits them onto your dongles, and feeds them to atc.airframes.io."
    >
      <p>
        This is the short path. Every option is explained on{' '}
        <Link href="/docs/atc-feeding">Feed ATC to Airframes</Link>.
      </p>

      <h2>What you need</h2>
      <ul>
        <li>One or more RTL-SDRs (a V4 is fine) with an airband or discone antenna.</li>
        <li>A Linux box, a Raspberry Pi (Pi OS Bookworm) or a Mac that stays online.</li>
        <li>A free Airframes account.</li>
        <li>
          Your antenna&apos;s latitude and longitude. Right-click it in any map app to copy them.
        </li>
      </ul>

      <h2>1. Install xng and check your SDRs</h2>
      <p>
        Get xng v0.28.0 or later from <Link href="/docs/install">Installation</Link>, then list the
        dongles it can see:
      </p>
      <CodeBlock
        lang="bash"
        code={`sudo apt install ./xng-0.30.0-arm64.deb   # 64-bit Pi OS; pick the amd64 or armhf .deb to match your machine
xng devices                                # every SDR should be listed`}
      />
      <Callout type="warn">
        <p>
          Two RTL-SDRs with the same serial can&apos;t be told apart, and most ship as{' '}
          <code>00000001</code>. Plug in only the second one and give it its own serial with{' '}
          <code>rtl_eeprom -s 00000002</code>, then re-plug it.
        </p>
      </Callout>

      <h2>2. Sign in once</h2>
      <CodeBlock
        lang="bash"
        code={`xng atc login      # prints a link and a code; approve it with your Airframes account
xng atc status     # checks the sign-in`}
      />

      <h2>3. Let xng plan the feed</h2>
      <CodeBlock
        lang="bash"
        code={`xng atc setup --lat 38.68 --lon -120.98 --station-name "Cameron Park"`}
      />
      <p>
        xng looks up the ATC channels within 30 nm in the Airframes catalog and skips ATIS, AWOS and
        VOLMET, which transmit all day. It ranks the rest by service and distance. Each SDR then
        takes the busiest slice of the band left over, so no channel is fed twice. The plan looks
        like this (an example from near Sacramento):
      </p>
      <CodeBlock
        lang="text"
        code={`position:  38.6800,-120.9800
SDRs:      driver=rtlsdr,serial=00000001  driver=rtlsdr,serial=00000002
found:     212 catalog entries within 30 nm, 1.75 MHz per SDR at 2.400 MS/s

driver=rtlsdr,serial=00000001: center 125.850 MHz, 8 channels
  125.100    41.2 km  APP   NCT APP (NorCal Approach)    tracon:NCT:APP:125100
  125.700    37.9 km  TWR   KSMF TWR                     airport:KSMF:TWR:125700
  ...
driver=rtlsdr,serial=00000002: center 120.300 MHz, 8 channels
  119.500    44.0 km  TWR   KSAC TWR                     airport:KSAC:TWR:119500
  ...

Wrote /home/pi/.config/xng/atc-station.toml.
Start feeding:  xng station /home/pi/.config/xng/atc-station.toml`}
      />
      <div className="deflist">
        <div className="deflist__row"><code>--sdr driver=rtlsdr,serial=00000002</code><p>Use only these SDRs (repeat the flag for each). By default xng uses every SDR it finds.</p></div>
        <div className="deflist__row"><code>--max-sdrs 1</code><p>Use at most this many of the SDRs it finds, for example to keep one for ACARS.</p></div>
        <div className="deflist__row"><code>-r 2048000</code><p>A lower sample rate, for dongles on a shared USB hub. See <a href="#sample-rates">Sample rates</a>.</p></div>
        <div className="deflist__row"><code>--radius-nm 50</code><p>Look further out, in rural areas or to reach a center sector.</p></div>
        <div className="deflist__row"><code>--max-per-sdr 4</code><p>Fewer channels per SDR. Each one costs some CPU, which matters on a Pi 3 or older.</p></div>
        <div className="deflist__row"><code>--services TWR,GND,APP</code><p>Only these services.</p></div>
        <div className="deflist__row"><code>--dry-run</code><p>Print the plan and the station file without writing anything.</p></div>
      </div>
      <p>
        Without <code>--lat</code> and <code>--lon</code>, xng guesses your position from your
        public IP address, which sends that address to ipinfo.io. The guess is often several
        kilometers off, so pass your antenna&apos;s real position when you can.
      </p>

      <h2>4. Start feeding</h2>
      <CodeBlock
        lang="bash"
        code={`xng station ~/.config/xng/atc-station.toml`}
      />
      <p>Within a few seconds the log shows each channel joining:</p>
      <CodeBlock
        lang="text"
        code={`atc feed: KSMF TWR (125.700) accepted as fd_01m8g10msnv1719v8tmwpmeee0 (airport:KSMF:TWR:125700)
atc feed: connected to atc-ingest.airframes.io:4433 over quic as you, feeding 16 stream(s) at 24 kbit/s`}
      />
      <p>
        Then open <a href="https://atc.airframes.io">atc.airframes.io</a>, find your airport and
        listen. Audio only goes out while someone is transmitting. The local dashboard is at{' '}
        <code>http://127.0.0.1:8080/airband</code>.
      </p>
      <p>
        The station file is plain TOML. Edit it to drop a noisy channel or rename one, or run{' '}
        <code>xng atc setup --force</code> to plan again when the catalog gains channels near you.
      </p>

      <h2>5. Keep it running</h2>
      <p>
        On Linux, save this as <code>/etc/systemd/system/xng-atc.service</code>, with your user name
        in place of <code>pi</code>. The .deb installs xng at <code>/usr/bin/xng</code>. After a
        tarball install, use the path <code>command -v xng</code> prints, usually{' '}
        <code>/usr/local/bin/xng</code>:
      </p>
      <CodeBlock
        lang="ini"
        code={`[Unit]
Description=xng ATC feed
After=network-online.target
Wants=network-online.target

[Service]
User=pi
ExecStart=/usr/bin/xng station /home/pi/.config/xng/atc-station.toml
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target`}
      />
      <CodeBlock
        lang="bash"
        code={`sudo systemctl enable --now xng-atc
journalctl -u xng-atc -f     # watch the log`}
      />

      <h2 id="one-sdr-today">One SDR without a station file</h2>
      <p>
        With a single dongle you don&apos;t need a station file. <code>--channels auto</code> makes
        the same pick for one SDR every time xng starts:
      </p>
      <CodeBlock
        lang="bash"
        code={`xng atc nearby --lat 38.68 --lon -120.98        # see what it would feed
xng listen --sdr driver=rtlsdr --mode airband -r 2400000 --channels auto \\
    --receiver-pos 38.68,-120.98 --atc-feed --atc-station-name "Cameron Park"`}
      />

      <h2 id="sample-rates">Sample rates, bandwidth and USB</h2>
      <p>
        One RTL-SDR hears a slice of the band as wide as its sample rate. xng only uses the middle
        75% of it, because the edges of an RTL-SDR&apos;s passband are weak. It also keeps the center
        frequency at least 10 kHz from every channel, clear of the dongle&apos;s DC spike.
      </p>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Sample rate</th><th>Usable slice</th><th>When to use it</th></tr></thead>
          <tbody>
            <tr><td><code>2400000</code> (default)</td><td>about 1.75 MHz</td><td>Each dongle in its own USB port or a powered hub. Fits the most channels.</td></tr>
            <tr><td><code>2048000</code></td><td>about 1.5 MHz</td><td>Several dongles on a hub or dock, or a Pi 3. Steadier, but channels at the edges may no longer fit.</td></tr>
            <tr><td>above 2.4 MS/s</td><td>more</td><td>Not recommended. RTL-SDRs start dropping samples above 2.4 MS/s.</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Each RTL-SDR at 2.4 MS/s moves about 4.8 MB/s over USB. Two or more behind a laptop dock or
        a chain of unpowered hubs tend to fail together: the log shows overflows, then a USB
        timeout, and sometimes a dongle stays stuck until it is unplugged. Plug each dongle in
        directly or into a powered hub. If that isn&apos;t possible, plan at{' '}
        <code>-r 2048000</code>.
      </p>
      <p>
        More SDRs cover more of the band. A second dongle usually adds approach and center channels
        that sit too far from the tower and ground channels to share one capture.
      </p>

      <h2>Your station on Airframes</h2>
      <p>
        The name you give with <code>--station-name</code> is what listeners see next to your feeds.
        Add <code>--hide-username</code> to keep your account name off them. The published position
        is rounded to 100 m.
      </p>
      <Callout type="note">
        <p>
          <strong>Rolling out soon:</strong> ATC feeders show up in My Stations on the web and in the
          Desktop and mobile apps, with their own leaderboard and trophies. Every day a feeder has a
          live channel counts toward Feeder Pro, like a decoder station. See{' '}
          <Link href="/docs/atc-feeding#your-station">Your station on Airframes</Link>.
        </p>
      </Callout>
    </DocsLayout>
  );
}
