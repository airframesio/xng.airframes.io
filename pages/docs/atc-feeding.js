import Link from 'next/link';
import DocsLayout from '../../components/DocsLayout';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';

export default function AtcFeeding() {
  return (
    <DocsLayout
      slug="atc-feeding"
      title="Feed ATC to Airframes"
      lede="Put the tower, ground and approach channels near you on atc.airframes.io with one RTL-SDR and one command."
    >
      <p>
        xng can feed live air traffic control audio to the{' '}
        <a href="https://atc.airframes.io">Airframes ATC network</a>. It finds the channels near
        your station in the Airframes ATC catalog, listens to all of them at once, and sends each
        transmission as it happens. Listeners hear it labeled with the airport and service. Audio
        only goes out while someone is talking.
      </p>
      <Callout type="tip">
        <p>
          Want the short version? The <Link href="/docs/atc-quickstart">ATC feeder quick start</Link>{' '}
          takes your position and your SDRs and sets up the whole feed.
        </p>
      </Callout>

      <h2>What you need</h2>
      <ul>
        <li>An RTL-SDR (a V4 is fine) or another SoapySDR device, with an airband or discone antenna.</li>
        <li>A Linux box, a Raspberry Pi (Pi OS Bookworm) or a Mac, online all the time.</li>
        <li>
          An Airframes account (free) and xng v0.27.0 or later. See{' '}
          <Link href="/docs/install">Installation</Link>.
        </li>
        <li>Your station&apos;s position. Listeners only see it rounded to about 100 m.</li>
      </ul>

      <h2>1. Install and check the SDR</h2>
      <CodeBlock
        lang="bash"
        code={`# Debian / Ubuntu / Pi OS (pick the .deb for your machine from the releases page)
sudo apt install ./xng-0.27.0-arm64.deb
xng devices        # the RTL-SDR should be listed`}
      />

      <h2>2. Sign in once</h2>
      <CodeBlock
        lang="bash"
        code={`xng atc login      # prints a link and a code; approve it with your Airframes account
xng atc status     # checks the sign-in`}
      />
      <p>
        The sign-in is kept in <code>~/.config/xng/atc.json</code> for the user who ran it. Run it as
        the same user that will run the feed.
      </p>

      <h2>3. See what xng would feed</h2>
      <CodeBlock
        lang="bash"
        code={`xng atc nearby --lat 37.62 --lon -122.38`}
      />
      <p>
        This lists the channels xng picks near you and the center frequency it tunes, then prints
        the command that feeds them. It looks within 30 nm (<code>--radius-nm</code>). It keeps
        tower, approach, departure, ground, delivery, center and other voice channels, and leaves
        out ATIS, AWOS and VOLMET, which transmit all day. Closer and busier services count for
        more. It then picks up to 8 channels from the slice of the band one capture covers (about 75% of
        the sample rate, so 1.75 MHz at 2.4 MS/s).
      </p>

      <h2>4. Start feeding</h2>
      <CodeBlock
        lang="bash"
        code={`xng listen --sdr driver=rtlsdr --mode airband -r 2400000 --channels auto \\
    --receiver-pos 37.62,-122.38 --atc-feed --atc-station-name "My station"`}
      />
      <p>Within a few seconds the log shows each channel joining:</p>
      <CodeBlock
        lang="text"
        code={`atc feed: KSFO TWR (120.500) accepted as fd_01m8g10msnv1719v8tmwpmeee0 (airport:KSFO:TWR:120500)
atc feed: connected to atc-ingest.airframes.io:4433 over quic as you, feeding 3 stream(s) at 24 kbit/s`}
      />
      <p>
        Then open <a href="https://atc.airframes.io">atc.airframes.io</a>, find your airport and
        listen.
      </p>

      <h2>Adjusting the pick</h2>
      <div className="deflist">
        <div className="deflist__row"><code>--atc-nearby-radius-nm 50</code><p>Look further out. Use it in rural areas, or to reach a center sector.</p></div>
        <div className="deflist__row"><code>--atc-nearby-max 4</code><p>Feed fewer channels. Each one costs some CPU, which matters on a Pi 3 or older.</p></div>
        <div className="deflist__row"><code>--atc-nearby-services TWR,GND,APP</code><p>Only these services.</p></div>
        <div className="deflist__row"><code>-c 121.15</code><p>Keep this center frequency, and only pick channels inside that capture.</p></div>
        <div className="deflist__row"><code>--labels &quot;121.8=SFO Ground&quot;</code><p>Rename a channel. Its catalog entry stays the same.</p></div>
        <div className="deflist__row"><code>--atc-frequency 121.8=airport:KSFO:GND:121800</code><p>Feed a channel under a different catalog entry.</p></div>
      </div>
      <p>
        The pick is made when xng starts. Restart it to pick again, for example after the catalog
        gains new channels near you.
      </p>

      <h2>More than one SDR</h2>
      <p>
        One RTL-SDR covers about 1.75 MHz of the band, so a second dongle usually adds the approach
        and center channels that sit too far from tower and ground to share a capture.{' '}
        <code>xng atc setup</code> plans every dongle at once: each one takes the busiest slice of
        the band the ones before it left, so no channel is fed twice. It writes a station file for{' '}
        <code>xng station</code>:
      </p>
      <CodeBlock
        lang="bash"
        code={`xng atc setup --lat 37.62 --lon -122.38 --station-name "My station"
xng station ~/.config/xng/atc-station.toml`}
      />
      <Callout type="note">
        <p>
          <strong>Coming in the next xng release.</strong> On v0.27.0, write the station file
          yourself: one <code>[[session]]</code> per SDR, each with its own <code>center</code> and
          channels. <code>xng atc nearby -c &lt;center&gt;</code> shows what fits around a center. The{' '}
          <Link href="/docs/airband">airband page</Link> has a two-SDR example.
        </p>
      </Callout>
      <p>
        The <Link href="/docs/atc-quickstart">quick start</Link> lists the setup options, and has the
        sample rate and USB advice that matters once several dongles share a computer. In short:
        2.4 MS/s fits the most channels, 2.048 MS/s (about 1.5 MHz) is steadier when dongles share
        a hub or a dock, and RTL-SDRs drop samples above 2.4 MS/s.
      </p>

      <h2>Choosing channels yourself</h2>
      <p>
        List them with <code>--channels</code> and set the center with <code>-c</code>, between the
        outer channels but not on one of them:
      </p>
      <CodeBlock
        lang="bash"
        code={`xng listen --sdr driver=rtlsdr --mode airband -r 2400000 -c 121.15 \\
    --channels 120.5,121.8 --labels "121.8=SFO Ground" \\
    --receiver-pos 37.62,-122.38 --atc-feed`}
      />
      <p>
        With <code>--receiver-pos</code> set, xng looks each channel up in the catalog by frequency
        and position. When two airports nearby share a frequency, the label decides between them
        (&quot;SFO Ground&quot;, &quot;OAK Tower&quot;). If it is still unclear, the log lists the
        candidates and that channel is not fed until you label it or set{' '}
        <code>--atc-frequency</code>. Check first with{' '}
        <code>xng atc match --lat 37.62 --lon -122.38 120.5 &quot;121.8=SFO Ground&quot;</code>.
      </p>

      <h2>Keep it running</h2>
      <p>
        On Linux, a systemd unit restarts the feed after a reboot or a crash. Save it as{' '}
        <code>/etc/systemd/system/xng-atc.service</code>:
      </p>
      <CodeBlock
        lang="ini"
        code={`[Unit]
Description=xng ATC feed
After=network-online.target
Wants=network-online.target

[Service]
User=pi
ExecStart=/usr/bin/xng listen --sdr driver=rtlsdr --mode airband -r 2400000 --channels auto --receiver-pos 37.62,-122.38 --atc-feed --atc-station-name "My station"
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
      <Callout type="note">
        Run <code>xng atc login</code> as the unit&apos;s <code>User</code> first. The feed reads the
        sign-in from that user&apos;s home folder.
      </Callout>

      <h2 id="your-station">Your station on Airframes</h2>
      <p>
        <code>--atc-station-name &quot;My station&quot;</code> (or <code>station-name</code> under{' '}
        <code>[outputs.airband.atc]</code> in a station file) is the name listeners see next to your
        feeds. Without it, the feeds show your account name and receiver only.
      </p>
      <Callout type="note">
        <p>
          <strong>Rolling out soon:</strong> each ATC feeder becomes a station on your Airframes
          account, named after its station name:
        </p>
        <ul>
          <li>It shows up in My Stations on the web and in the Desktop and mobile apps. It is active while a channel is live, and you can rename it there.</li>
          <li>Every day it has a live channel counts toward Feeder Pro, the same as a decoder station.</li>
          <li>Its transmissions, airtime and channels count on a new ATC leaderboard, with their own trophies, and in the overall ranking.</li>
        </ul>
      </Callout>
      <h3>Keeping the same station</h3>
      <p>
        The station is tied to this feeder&apos;s sign-in, saved in{' '}
        <code>~/.config/xng/atc.json</code>. Keep that file when you move to a new SD card or
        computer, and the feeds stay on the same station.
      </p>
      <Callout type="note">
        <p>
          <strong>Coming in the next xng release:</strong> xng also sends a station UUID, so the
          station stays linked even after a reinstall gives the feeder a new sign-in. It is saved for
          you on first use, and it starts as the UUID Airframes already uses for your station, so
          nothing changes for existing feeders. To pin it yourself, set{' '}
          <code>--atc-station-uuid &lt;uuid&gt;</code>, <code>XNG_ATC_STATION_UUID</code>, or{' '}
          <code>station-uuid</code> under <code>[outputs.airband.atc]</code>. Decoder feeds get the
          same, with <code>station-uuid</code> at the top of the station file or{' '}
          <code>XNG_STATION_UUID</code>.
        </p>
      </Callout>

      <h2>Privacy</h2>
      <ul>
        <li>The station position is rounded to 100 m before it leaves your machine.</li>
        <li>Add <code>--atc-hide-username</code> so your account name is not shown next to the feeds.</li>
        <li>
          Some channels may not be streamed in some countries. The catalog marks them and xng never
          feeds them.
        </li>
      </ul>

      <h2>If something is wrong</h2>
      <div className="deflist">
        <div className="deflist__row"><code>no ATC channels to feed</code><p>The catalog has nothing within the radius. Raise <code>--atc-nearby-radius-nm</code>, or list channels yourself.</p></div>
        <div className="deflist__row"><code>not signed in</code><p>Run <code>xng atc login</code> as the user that runs xng, then check with <code>xng atc status</code>.</p></div>
        <div className="deflist__row"><code>ambiguous</code><p>Two catalog entries share a frequency you listed. Label the channel with the airport and service, or set <code>--atc-frequency</code>.</p></div>
        <div className="deflist__row"><code>overflow, then a USB timeout</code><p>The USB bus can&apos;t keep up, usually several dongles behind a dock or unpowered hubs. Plug each one in directly or into a powered hub, or use <code>-r 2048000</code>. A dongle that stays stuck needs unplugging.</p></div>
        <div className="deflist__row"><code>two SDRs share the selector</code><p>Both RTL-SDRs have the same serial. Plug in only one and run <code>rtl_eeprom -s 00000002</code>.</p></div>
        <div className="deflist__row"><code>Nothing on atc.airframes.io</code><p>Audio only flows while someone transmits. Check the antenna, the gain (<code>--gain</code>), and the squelch on the browser page (<code>--http 0.0.0.0:8080</code>, then open <code>/airband</code>).</p></div>
      </div>
      <p>
        Everything else about airband (squelch, recordings, scanner, transcripts) is on{' '}
        <Link href="/docs/airband">Airband voice &amp; ATC</Link>.
      </p>
    </DocsLayout>
  );
}
