import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/useFx';

// SDR-style spectrum waterfall colormaps. Lifted from the Airwaves OS site —
// a fitting centerpiece for a decoder client. New spectrum rows scroll up;
// carriers drift, data bursts flare, retuning flashes a sweep.
const STOPS = {
  dark: {
    bg: '#070a10',
    stops: [
      [0.0, [7, 10, 16]],
      [0.45, [22, 32, 56]],
      [0.68, [96, 70, 60]],
      [0.85, [255, 158, 70]],
      [1.0, [255, 232, 200]],
    ],
  },
  light: {
    bg: '#f4f0e6',
    stops: [
      [0.0, [244, 240, 230]],
      [0.45, [205, 211, 219]],
      [0.68, [228, 166, 100]],
      [0.85, [207, 99, 19]],
      [1.0, [102, 47, 8]],
    ],
  },
};

function buildPalette(mode) {
  const { stops } = STOPS[mode] || STOPS.dark;
  const pal = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let a = stops[0];
    let b = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (t >= stops[s][0] && t <= stops[s + 1][0]) {
        a = stops[s];
        b = stops[s + 1];
        break;
      }
    }
    const f = (t - a[0]) / (b[0] - a[0] || 1);
    pal[i * 3] = a[1][0] + (b[1][0] - a[1][0]) * f;
    pal[i * 3 + 1] = a[1][1] + (b[1][1] - a[1][1]) * f;
    pal[i * 3 + 2] = a[1][2] + (b[1][2] - a[1][2]) * f;
  }
  return pal;
}

const docTheme = () =>
  typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light'
    ? 'light'
    : 'dark';

export default function Waterfall({ seed = 1, density = 6, className = '', speed = 1, themed = false }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ carriers: [], bursts: [], sweep: 0 });
  const paletteRef = useRef(null);
  const bgRef = useRef(STOPS.dark.bg);
  if (!paletteRef.current) {
    const mode = themed ? docTheme() : 'dark';
    paletteRef.current = buildPalette(mode);
    bgRef.current = (STOPS[mode] || STOPS.dark).bg;
  }

  useEffect(() => {
    if (!themed) return;
    const apply = () => {
      const mode = docTheme();
      paletteRef.current = buildPalette(mode);
      bgRef.current = (STOPS[mode] || STOPS.dark).bg;
      stateRef.current.sweep = 1;
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, [themed]);

  useEffect(() => {
    const st = stateRef.current;
    st.carriers = [];
    const n = density + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      st.carriers.push({
        x: Math.random(),
        w: 0.002 + Math.random() * 0.006,
        power: 0.35 + Math.random() * 0.5,
        drift: (Math.random() - 0.5) * 0.00012,
        burstiness: Math.random(),
      });
    }
    st.bursts = [];
    st.sweep = 1;
  }, [seed, density]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    let raf = 0;
    let running = true;
    let last = 0;
    const reduced = prefersReducedMotion();

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      const w = Math.max(2, Math.floor(r.width * Math.min(dpr, 1.5)));
      const h = Math.max(2, Math.floor(r.height * Math.min(dpr, 1.5)));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        ctx.fillStyle = bgRef.current;
        ctx.fillRect(0, 0, w, h);
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);

    const drawRow = () => {
      const st = stateRef.current;
      const w = canvas.width;
      const row = ctx.createImageData(w, 1);
      const px = row.data;
      const pal = paletteRef.current;

      if (Math.random() < 0.08 && st.carriers.length) {
        const c = st.carriers[Math.floor(Math.random() * st.carriers.length)];
        if (Math.random() < c.burstiness) {
          st.bursts.push({ c, life: 6 + Math.floor(Math.random() * 26) });
        }
      }
      st.bursts = st.bursts.filter((b) => b.life-- > 0);

      for (let x = 0; x < w; x++) {
        const fx = x / w;
        let v = 0.1 + Math.random() * 0.16;
        for (const c of st.carriers) {
          const d = Math.abs(fx - c.x);
          if (d < c.w * 4) {
            const g = Math.exp(-(d * d) / (2 * c.w * c.w));
            v += g * c.power * (0.55 + Math.random() * 0.45);
          }
        }
        for (const b of st.bursts) {
          const d = Math.abs(fx - b.c.x);
          if (d < b.c.w * 7) {
            const g = Math.exp(-(d * d) / (2 * (b.c.w * 2.2) ** 2));
            v += g * 0.65;
          }
        }
        if (st.sweep > 0.01) v += st.sweep * 0.5 * Math.random();

        const idx = Math.min(255, Math.max(0, Math.floor(v * 255)));
        px[x * 4] = pal[idx * 3];
        px[x * 4 + 1] = pal[idx * 3 + 1];
        px[x * 4 + 2] = pal[idx * 3 + 2];
        px[x * 4 + 3] = 255;
      }
      st.sweep *= 0.82;
      for (const c of st.carriers) {
        c.x += c.drift;
        if (c.x < 0.02 || c.x > 0.98) c.drift *= -1;
      }
      return row;
    };

    const frame = (t) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      const interval = 1000 / (30 * speed);
      if (t - last < interval) return;
      last = t;
      const w = canvas.width;
      const h = canvas.height;
      ctx.drawImage(canvas, 0, 1, w, h - 1, 0, 0, w, h - 1);
      ctx.putImageData(drawRow(), 0, h - 1);
    };

    if (reduced) {
      fit();
      const h = canvas.height;
      for (let y = 0; y < h; y++) {
        ctx.putImageData(drawRow(), 0, y);
      }
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [speed]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
