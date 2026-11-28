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
        <div className="deflist__row"><code>Transcripts</code><p>Speech-to-text for every transmission: an ATC-tuned Parakeet, Moonshine (sherpa-onnx) or Whisper locally, or a Whisper server. Text shows up in the console, JSON outputs, dashboard, recordings and the ATC feed. See <a href="#transcripts">Transcripts</a>.</p></div>
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
      <p>
        Setting up a feed step by step is covered in{' '}
        <Link href="/docs/atc-feeding">Feed ATC to Airframes</Link>. In short: sign in once, then add{' '}
        <code>--atc-feed</code>:
      </p>
      <CodeBlock
        lang="bash"
        code={`xng atc login            # shows a code; approve it in any browser
xng atc login --email you@example.com    # or with a password
xng atc status           # who this feeder is signed in as

xng atc nearby --lat 37.62 --lon -122.38   # the ATC channels near you that fit one dongle

xng listen --sdr driver=rtlsdr --mode airband -r 2400000 --channels auto \\
    --receiver-pos 37.62,-122.38 --atc-feed

# or choose the channels yourself
xng listen --sdr driver=rtlsdr --mode airband -r 2400000 -c 121.15 --channels 120.5,121.8 \\
    --receiver-pos 37.62,-122.38 --atc-feed`}
      />
      <ul>
        <li>
          <code>--channels auto</code> picks the channels for you. xng asks the Airframes ATC
          catalog what is within 30 nm of <code>--receiver-pos</code> (
          <code>--atc-nearby-radius-nm</code>), keeps tower, approach, departure, ground, delivery,
          center and other voice channels (never ATIS, AWOS or VOLMET, which talk all day), and
          tunes the slice of the band (75% of the sample rate, so 1.8 MHz at{' '}
          <code>-r 2400000</code>) that holds the most useful ones, up to 8 (
          <code>--atc-nearby-max</code>). Closer and busier services count for more. Each channel
          gets its catalog name as its label, and the picks are printed at start.{' '}
          <code>--atc-nearby-services TWR,GND,APP</code> limits the services, <code>-c</code> keeps
          your center frequency. Each pick already carries its catalog entry: <code>--labels</code>{' '}
          only renames a channel, and <code>--atc-frequency</code> replaces the entry.{' '}
          <code>xng atc nearby</code> shows the pick without tuning (from the same API as your sign-in,
          or <code>--api</code>), plus the same setup as fixed <code>--channels</code>.
        </li>
        <li>
          Each channel becomes a feed, linked to its entry in the Airframes ATC catalog. For channels
          you list yourself, with{' '}
          <code>--receiver-pos</code> set, xng looks every channel up by frequency and position
          before connecting and feeds it under the entry it finds, with the entry&apos;s name as the
          label when the channel has none. When several entries share a frequency nearby, the
          channel label settles it (<code>SJC Ground</code> picks the San Jose ground entry); if
          nothing does, the log lists the candidates and that channel is not fed. Fix one by hand
          with <code>--atc-frequency 120.5=airport:KSFO:TWR:120500</code>, or check first with{' '}
          <code>xng atc match --lat 37.62 --lon -122.38 120.5 "121.8=SFO Ground"</code>.
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

      <h2 id="transcripts">Transcripts</h2>
      <p>
        Add <code>--transcribe</code> and xng turns each finished transmission into text. The text
        goes to the console and JSON outputs (an airband message with <code>kind</code>{' '}
        <code>transcript</code>), the dashboard&apos;s history, the recording&apos;s sidecar, and the
        Airframes ATC feed, where listeners see it next to the audio along with the engine and model
        that produced it.
      </p>
      <CodeBlock
        lang="bash"
        code={`# The ATC-tuned Parakeet model through sherpa-onnx (xng built with --features sherpa);
# the default, downloaded once
xng listen --sdr driver=rtlsdr --mode airband -r 2400000 -c 121.15 --channels 120.5,121.8 \\
    --transcribe-model skycontrol-atc-110m --receiver-pos 37.62,-122.38 --atc-feed

# Whisper through whisper.cpp (xng built with --features whisper)
xng listen ... --transcribe-model base.en

# Or a Whisper server elsewhere (OpenAI-compatible, faster-whisper, whisper.cpp server)
XNG_WHISPER_API_KEY=... xng listen ... --whisper-url http://gpu-box:8000 --transcribe-engine faster-whisper`}
      />
      <p>Which engine to use:</p>
      <ul>
        <li>
          <strong>sherpa-onnx</strong> (<code>--features sherpa</code>) runs NVIDIA Parakeet,
          Moonshine and SenseVoice. They cost CPU in proportion to the audio, while Whisper pads every
          transmission to 30 seconds, so a short call is much cheaper. The default,{' '}
          <code>skycontrol-atc-110m</code>, is Parakeet-110m fine-tuned on ATC speech. On real
          controller and pilot audio it made a quarter to a third of the errors of stock Whisper and
          Parakeet, at about 1/20 of a CPU core. It was trained on European audio and now and then
          guesses a European word on a US callsign. Also <code>parakeet-110m</code>,{' '}
          <code>parakeet-tdt-0.6b-v2</code>, <code>moonshine-tiny</code> (the lightest, for a
          Raspberry Pi 3 or 4), <code>moonshine-base</code>, <code>parakeet-tdt-0.6b-v3</code> (25
          European languages) and <code>sense-voice</code> (Chinese, English, Japanese, Korean,
          Cantonese). The numbers are in{' '}
          <a href="https://github.com/airframesio/xng/blob/master/docs/notes/AIRBAND.md#choosing-a-model">
            AIRBAND.md
          </a>
          .
        </li>
        <li>
          <strong>whisper.cpp</strong> (<code>--features whisper</code>) takes a ggml file or a name
          (<code>tiny.en</code>, <code>base.en</code>, <code>small.en</code>, <code>large-v3-turbo</code>).
          GPU builds: <code>--features whisper-cuda</code>, <code>whisper-metal</code> or{' '}
          <code>whisper-vulkan</code>. Whisper is primed with the channel label and ATC phrasing
          (<code>--whisper-prompt</code> to change it), and its usual inventions on static, such as
          &ldquo;Thank you.&rdquo;, are thrown away.
        </li>
        <li>
          <strong>A Whisper server</strong>: <code>--whisper-url http://host:port</code> posts WAV
          audio to <code>/v1/audio/transcriptions</code>; give a full URL for another path, such as
          whisper.cpp&apos;s <code>/inference</code>. <code>--transcribe-engine</code> names what the
          server runs so Airframes ATC can show it. This is the way to run an ATC-tuned Whisper, such
          as <code>jacktol/whisper-medium.en-fine-tuned-for-ATC</code> on faster-whisper, on a GPU box
          for several receivers.
        </li>
      </ul>
      <p>
        Release binaries include no local engine; build with a feature or use a server. Models are
        fetched once into <code>~/.cache/xng/whisper</code>. <code>--whisper-streams 120.5</code>{' '}
        limits transcription to some channels. If the engine can&apos;t keep up, the oldest waiting
        transmissions are skipped so transcripts stay close to live, and the log suggests a smaller
        model.
      </p>

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
model = "skycontrol-atc-110m" # or "base.en", or url = "http://gpu-box:8000"
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
label = "SFO Tower"           # found in the ATC catalog by frequency and receiver-pos
# atc-frequency = "airport:KSFO:TWR:120500"   # or name the entry yourself

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
