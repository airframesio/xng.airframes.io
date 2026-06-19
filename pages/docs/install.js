import Link from 'next/link';
import DocsLayout from '../../components/DocsLayout';
import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';

export default function Install() {
  return (
    <DocsLayout
      slug="install"
      title="Installation"
      lede="Most people never touch a compiler — grab a prebuilt binary, the Debian package, or the Docker image. Building from source is one cargo command when you want it."
    >
      <Callout type="tip">
        <p>
          Not sure which to pick? On a Raspberry Pi or Ubuntu box, use the <strong>.deb</strong> —
          it pulls in the radio runtime libraries for you. On macOS, use the <strong>tarball</strong>.
          To run it in containers, use the <strong>Docker image</strong>.
        </p>
      </Callout>

      <h2>Prebuilt releases</h2>
      <p>
        Every release publishes signed assets on{' '}
        <a href="https://github.com/airframesio/xng/releases/latest" target="_blank" rel="noopener noreferrer">
          GitHub Releases
        </a>
        : Linux <code>x86_64</code> and <code>arm64</code> tarballs, a macOS Apple-Silicon tarball,
        Debian/Ubuntu <code>.deb</code> packages, and a <code>SHA256SUMS</code> file.
      </p>

      <h3>Debian, Ubuntu, Raspberry Pi</h3>
      <p>The package declares its runtime dependencies, so <code>apt</code> installs SoapySDR and the Airspy libraries automatically:</p>
      <CodeBlock
        lang="bash"
        code={`# download the .deb for your architecture from the releases page, then:
sudo apt install ./xng_0.21.0_arm64.deb

xng --version`}
      />

      <h3>Linux / macOS tarball</h3>
      <CodeBlock
        lang="bash"
        code={`tar xzf xng-v0.21.0-x86_64-unknown-linux-gnu.tar.gz
sudo cp xng /usr/local/bin/
xng --version`}
      />
      <p>
        The tarball ships just the binary, so you supply the runtime libraries yourself —
        <code>libsoapysdr</code> at minimum, plus <code>libairspy</code> / <code>libairspyhf</code>
        if you use the native Airspy backends:
      </p>
      <CodeBlock
        lang="bash"
        code={`# Debian / Ubuntu
sudo apt install libsoapysdr0.8 soapysdr-module-all libairspy0 libairspyhf1

# macOS
brew install soapysdr airspy airspyhf`}
      />

      <h2>Docker</h2>
      <p>A multi-arch image (amd64 / arm64 / armv7) is published for every release tag:</p>
      <CodeBlock
        lang="bash"
        code={`docker run --rm ghcr.io/airframesio/xng:latest --version

# pass through a USB SDR and a config
docker run --rm -it --device /dev/bus/usb \\
    -v "$PWD/station.toml:/etc/xng/station.toml" \\
    ghcr.io/airframesio/xng:latest station /etc/xng/station.toml`}
      />
      <Callout type="note">
        <p>
          Containers need access to your USB SDR — pass <code>--device /dev/bus/usb</code> (or the
          specific device node), and expose any output ports you serve, like <code>-p 8080:8080</code>
          for the web dashboard.
        </p>
      </Callout>

      <h2>Build from source</h2>
      <p>You need a Rust toolchain, the protobuf compiler, and the SoapySDR development headers.</p>
      <CodeBlock
        lang="bash"
        code={`# Debian / Ubuntu build deps
sudo apt install protobuf-compiler libsoapysdr-dev soapysdr-module-all

# macOS build deps
brew install protobuf soapysdr

git clone https://github.com/airframesio/xng
cd xng
cargo build --release          # binary at ./target/release/xng
cargo test --workspace         # runs the vendored off-air capture tests`}
      />

      <h3>Native Airspy backends</h3>
      <p>
        By default Airspy radios go through the SoapySDR shim. For a lower-overhead path, compile in
        the native <code>libairspy</code> / <code>libairspyhf</code> backends:
      </p>
      <CodeBlock
        lang="bash"
        code={`sudo apt install libairspy-dev libairspyhf-dev   # or: brew install airspy airspyhf
cargo build --release --features airspy,airspyhf`}
      />

      <h3>No hardware?</h3>
      <p>You can build without any SDR libraries at all and still decode recorded IQ files:</p>
      <CodeBlock lang="bash" code={`cargo build --no-default-features`} />

      <Callout type="warn">
        <p>
          There is no <code>cargo install</code> from crates.io, and no Homebrew/AUR package yet.
          Intel Macs build from source (the free Intel CI runners were retired). The supported
          install paths are: release tarball, <code>.deb</code>, Docker image, or <code>cargo build</code>.
        </p>
      </Callout>

      <h2>Next step</h2>
      <p>
        With <code>xng --version</code> working, head to the{' '}
        <Link href="/docs/quickstart">Quickstart</Link> to find some signals and watch them decode.
      </p>
    </DocsLayout>
  );
}
