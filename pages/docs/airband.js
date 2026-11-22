import Link from 'next/link';
import DocsLayout from '../../components/DocsLayout';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';

export default function Airband() {
  return (
    <DocsLayout
      slug="airband"
      title="Airband voice & ATC"
      lede="Listen to tower, ground and approach (or any AM/NFM voice channel) with as many channels as your SDR can see, record them, stream them, scan them, and feed them to the Airframes ATC network."
    >
      <p>
        <code>--mode airband</code> turns a capture into voice channels. Each channel is cut into
        transmissions by a squelch. The audio goes to recordings, the browser, Icecast, UDP, and the
        Airframes ATC network, while each transmission&apos;s start and end also reach the usual
        message outputs (console, JSONL, MQTT, ZMQ, asf-2.0).
      </p>

      <h2>Quick start</h2>
      <CodeBlock
        lang="bash"
        code={`# Three channels from one RTL-SDR, with a scanner and the browser page
xng listen --sdr driver=rtlsdr --mode airband -r 2400000 -c 121.15 \\
    --channels 120.5,120.9,121.8 \\
    --labels "120.5=SFO Tower,120.9=SFO Ground West,121.8=SFO Ground" \\
    --scan --scan-priority 120.5 \\
    --record-dir ~/airband --http 0.0.0.0:8080
# open http://localhost:8080/airband and press listen`}
      />
      <p>
        Pick <code>-c</code> so every channel sits inside the capture and none lands right on the center (the SDR&apos;s DC spike). One
        RTL-SDR at 2.4 MS/s covers about 2 MHz of airband; channels can sit 8.33 kHz or 25 kHz apart.
      </p>

      <h2>What you get</h2>
      <div className="deflist">
        <div className="deflist__row"><code>Many channels, one SDR</code><p>Every channel in the capture is demodulated at once through xng&apos;s channelizer, with adjacent-channel rejection good enough for 8.33 kHz spacing.</p></div>
        <div className="deflist__row"><code>AM and NFM</code><p><code>--modulation am</code> (airband) or <code>nfm</code> (marine, land mobile). AM is carrier-normalised so weak and strong stations play at the same loudness.</p></div>
        <div className="deflist__row"><code>Squelch</code><p><code>auto[:snr_db]</code> tracks each channel&apos;s noise floor (default 9 dB above it), <code>manual:&lt;dBFS&gt;</code> uses a fixed level, <code>off</code> streams continuously. Hang time, open delay, and a short pre-roll so the first syllable is kept.</p></div>
        <div className="deflist__row"><code>Clean-up</code><p>AFC for drifting carriers (<code>--afc</code>), CTCSS tone gating (<code>--ctcss</code>), a notch for a heterodyne (<code>--notch</code>), audio gain.</p></div>
        <div className="deflist__row"><code>Transcripts</code><p>Whisper speech-to-text for every transmission, locally or through a Whisper server. Text shows up in the console, JSON outputs, dashboard, recordings and the ATC feed. See <a href="#transcripts">Transcripts</a>.</p></div>
        <div className="deflist__row"><code>Mix and scan</code><p><code>--mix</code> adds one stream with every channel summed. <code>--scan</code> adds a scanner stream that follows the active channel, with priority channels, a hold time for the reply, lockouts, and a pin, across every SDR in the station.</p></div>
      </div>

      <h2>Squelch and audio flags</h2>
      <div className="deflist">
        <div className="deflist__row"><code>--squelch auto[:snr] | manual:dbfs | off</code><p>How a channel opens. Start with <code>auto</code>; use <code>manual:-45</code> on a channel with bursty noise.</p></div>
        <div className="deflist__row"><code>--hang-ms 250</code><p>Keep the squelch open this long after the signal drops.</p></div>
        <div className="deflist__row"><code>--bandwidth &lt;Hz&gt;</code><p>Channel filter width (default 8000 for AM, 12500 for NFM).</p></div>
        <div className="deflist__row"><code>--afc &lt;Hz&gt;</code><p>Follow carriers up to this far off frequency (off by default).</p></div>
        <div className="deflist__row"><code>--ctcss · --notch · --audio-gain &lt;Hz|dB&gt;</code><p>Tone gate (NFM), fixed-tone notch, output gain.</p></div>
        <div className="deflist__row"><code>--labels 118.3=Tower,…</code><p>Channel names shown on the dashboard, in file names and on the ATC network.</p></div>
      </div>

      <h2>Scanner</h2>
      <div className="deflist">
        <div className="deflist__row"><code>--scan</code><p>Build the <code>scan</code> stream.</p></div>
        <div className="deflist__row"><code>--scan-priority 120.5,121.5</code><p>Priority channels, highest first. They interrupt lower channels mid-transmission.</p></div>
        <div className="deflist__row"><code>--scan-hold-ms 2000</code><p>Stay on a channel this long after it goes quiet, so you hear the reply.</p></div>
        <div className="deflist__row"><code>--scan-lockout 128.25</code><p>Channels the scanner skips. Lock out, unlock and pin live from the dashboard too.</p></div>
      </div>

      <h2>Recording</h2>
      <CodeBlock
        lang="bash"
        code={`--record-dir ~/airband --record-format ogg --record-min-ms 400
# ~/airband/SFO_Tower_120.500/2026-11-22/183012_120.500.ogg  (+ .json sidecar)`}
      />
      <div className="deflist">
        <div className="deflist__row"><code>--record-format wav | ogg</code><p>16 kHz mono WAV, or Ogg/Opus at a fraction of the size.</p></div>
        <div className="deflist__row"><code>--record-min-ms · --record-max-s</code><p>Drop key-clicks shorter than this; split very long transmissions.</p></div>
        <div className="deflist__row"><code>--record-continuous</code><p>One file per channel per hour, with silence between transmissions, instead of one file per transmission.</p></div>
        <div className="deflist__row"><code>--record-streams 120.5,scan</code><p>Record only these streams (channel frequencies, <code>mix</code>, <code>scan</code>). Default: every channel.</p></div>
      </div>

      <h2>Listening in the browser</h2>
      <p>
        With <code>--http</code>, the dashboard gains an <code>/airband</code> page: every channel&apos;s
        level against its noise floor and squelch threshold, who is on the air, the scanner (pin, lock
        out, resume), recent transmissions, and a listen button on every stream. The map dashboard links
        to it.
      </p>
      <p>
        <img
          src="/img/airband-dashboard.png"
          alt="The xng airband page: scanner and mix streams, four channel cards with level meters, and recent transmissions"
          style={{ width: '100%', borderRadius: 10, border: '1px solid var(--line, #2a2f41)' }}
        />
      </p>

      <h2>Streaming</h2>
      <div className="deflist">
        <div className="deflist__row"><code>--icecast icecast://source:pass@host:8000/mount?stream=scan</code><p>Continuous Ogg/Opus to an Icecast server (also <code>bitrate=</code>, <code>name=</code>). Defaults to the scan stream when the scanner is on, else the mix.</p></div>
        <div className="deflist__row"><code>--audio-udp host:7355[,stream=120.5][,raw]</code><p>16 kHz s16le PCM datagrams with a small header naming the channel; <code>raw</code> sends bare PCM for one stream (<code>nc -lu 7355 | aplay -r 16000 -f S16_LE</code>).</p></div>
        <div className="deflist__row"><code>--metrics</code><p>Prometheus gets <code>xng_airband_level_dbfs</code>, <code>noise_dbfs</code>, <code>squelch_dbfs</code>, <code>open</code>, <code>afc_hz</code>, <code>transmissions_total</code> and <code>airtime_seconds_total</code> per channel.</p></div>
      </div>

      <h2>Feeding the Airframes ATC network</h2>
      <p>Sign in once, then add <code>--atc-feed</code>:</p>
      <CodeBlock
        lang="bash"
        code={`xng atc login            # shows a code; approve it in any browser
xng atc login --email you@example.com    # or with a password
xng atc status           # who this feeder is signed in as

xng listen --sdr driver=rtlsdr --mode airband -r 2400000 -c 121.15 --channels 120.5,121.8 \\
    --receiver-pos 37.62,-122.38 --atc-feed`}
      />
      <ul>
        <li>
          Each channel becomes a feed. Give it the network&apos;s frequency key with{' '}
          <code>--atc-frequency 120.5=airport:KSFO:TWR:120500</code>, or set{' '}
          <code>--receiver-pos</code> and the network matches the frequency to the nearest facility.
          If it can&apos;t, the log lists the candidate keys.
        </li>
        <li>
          Audio is squelch-gated Opus (16 kHz, 24 kbit/s by default, <code>--atc-bitrate</code>), so
          a quiet channel sends nothing. <code>--atc-streams 120.5,scan</code> picks what to feed; the
          scanner feeds as one scan feed covering up to 16 frequencies.
        </li>
        <li>
          xng connects over QUIC and falls back to TLS over TCP where UDP is blocked
          (<code>--atc-transport auto|quic|tcp</code>), and reconnects on its own.
        </li>
        <li>
          Only a refresh token and this feeder&apos;s id are stored, in{' '}
          <code>~/.config/xng/atc.json</code>, readable by you alone. <code>xng atc logout</code>{' '}
          forgets the sign-in. The published station position is rounded (500 m in the example below).
        </li>
        <li>
          Add <code>--atc-hide-username</code> (or <code>hide-username = true</code> in the station
          file) so the network doesn&apos;t show your account&apos;s username next to this
          feeder&apos;s feeds. You can also hide it for all your feeders in your airframes.io account.
        </li>
      </ul>
      <Callout type="note">
        <p>
          Some countries do not allow rebroadcasting ATC audio. The network refuses those frequencies
          (<code>frequency_not_allowed</code>) and xng keeps recording and serving them locally.
        </p>
      </Callout>

      <h2 id="transcripts">Transcripts with Whisper</h2>
      <p>
        Add <code>--transcribe</code> and xng sends each finished transmission to Whisper. The text
        goes to the console and JSON outputs (an airband message with <code>kind</code>{' '}
        <code>transcript</code>), the dashboard&apos;s history, the recording&apos;s sidecar, and the
        Airframes ATC feed, where listeners see it next to the audio.
      </p>
      <CodeBlock
        lang="bash"
        code={`# Local model (xng built with --features whisper); base.en is downloaded once
xng listen --sdr driver=rtlsdr --mode airband -r 2400000 -c 121.15 --channels 120.5,121.8 \\
    --whisper-model base.en --receiver-pos 37.62,-122.38 --atc-feed

# Or a Whisper server elsewhere (OpenAI-compatible, faster-whisper, whisper.cpp server)
XNG_WHISPER_API_KEY=... xng listen ... --whisper-url http://gpu-box:8000`}
      />
      <ul>
        <li>
          <strong>Local:</strong> <code>--whisper-model</code> takes a ggml file or a name
          (<code>tiny.en</code>, <code>base.en</code>, <code>small.en</code>, <code>large-v3-turbo</code>),
          fetched once into <code>~/.cache/xng/whisper</code>. As a rough guide: <code>tiny.en</code> or{' '}
          <code>base.en</code> on a Raspberry Pi, <code>small.en</code> on a desktop CPU, larger models
          with a GPU build (<code>--features whisper-cuda</code>, <code>whisper-metal</code> or{' '}
          <code>whisper-vulkan</code>). Release binaries don&apos;t include local Whisper; build with the
          feature or use a server.
        </li>
        <li>
          <strong>Server:</strong> <code>--whisper-url http://host:port</code> posts WAV audio to{' '}
          <code>/v1/audio/transcriptions</code>; give a full URL for another path, such as whisper.cpp&apos;s{' '}
          <code>/inference</code>.
        </li>
        <li>
          Whisper is primed with the channel label and ATC phrasing (<code>--whisper-prompt</code> to
          change it). Its usual inventions on static, such as &ldquo;Thank you.&rdquo;, are thrown
          away.
        </li>
        <li>
          <code>--whisper-streams 120.5</code> limits it to some channels. If Whisper can&apos;t keep
          up, the oldest waiting transmissions are skipped so transcripts stay close to live, and the
          log suggests a smaller model.
        </li>
      </ul>

      <h2>In a station file</h2>
      <p>
        Airband sessions take a <code>[session.airband]</code> block (defaults, per-channel tables,
        mix), and the audio outputs live under <code>[outputs.airband]</code>. A session may list its
        channels only as tables. See <Link href="/docs/configuration">Configuration</Link> for the rest
        of the file.
      </p>
      <CodeBlock
        lang="toml"
        code={`[outputs]
http = "0.0.0.0:8080"

[outputs.airband]
record-dir = "/var/lib/xng/airband"
record-format = "ogg"
icecast = ["icecast://source:hackme@icecast.local:8000/ksfo?stream=scan"]

[outputs.airband.scan]
priority = ["120.5"]
hold-ms = 2000

[outputs.airband.atc]
station-name = "SFO west ridge"
location-precision-m = 500
hide-username = true

[outputs.airband.transcribe]
model = "base.en"             # or url = "http://gpu-box:8000"
language = "en"

[[session]]
sdr = "driver=rtlsdr,serial=00000001"
mode = "airband"
sample-rate = 2400000
receiver-pos = "37.62,-122.38"

[session.airband]
mix = true

[session.airband.defaults]
squelch = "auto:9"
hang-ms = 300

[[session.airband.channel]]
freq = "120.500"
label = "SFO Tower"
atc-frequency = "airport:KSFO:TWR:120500"

[[session.airband.channel]]
freq = "120.900"
label = "SFO Ground (west)"
squelch = "manual:-48"        # any squelch/audio setting can be set per channel`}
      />
      <p>
        Per-channel keys: <code>freq</code>, <code>label</code>, <code>atc-frequency</code>,{' '}
        <code>key</code> (stable feed id), <code>modulation</code>, <code>bandwidth-hz</code>,{' '}
        <code>squelch</code>, <code>open-ms</code>, <code>hang-ms</code>, <code>ctcss-hz</code>,{' '}
        <code>notch-hz</code>, <code>highpass-hz</code>, <code>lowpass-hz</code>, <code>gain-db</code>,{' '}
        <code>afc-max-hz</code>, <code>agc</code>. A complete example ships as{' '}
        <code>contrib/station.airband.example.toml</code>.
      </p>

      <h2>Limits today</h2>
      <ul>
        <li>All channels of a session must fit in one capture. Hopping a narrow SDR between far-apart frequencies (classic scanner retuning) is not supported yet; use a wider capture or a second SDR.</li>
        <li>Validated on synthetic signals and against the ATC network&apos;s ingest; no off-air airband recording is in the test corpus yet.</li>
      </ul>
    </DocsLayout>
  );
}
