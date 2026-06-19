import { useEffect, useRef, useState } from 'react';
import Waterfall from './Waterfall';
import { prefersReducedMotion } from '../lib/useFx';

// A pool of plausible decoded transmissions, one per xng mode, written to match
// the real console one-liner format. Purely illustrative — no live radio here,
// just a feel for what `xng listen` looks like when traffic is flowing.
const POOL = [
  ['ACARS', '131.550', [['N401UA UA1989 ', 'lbl=H1'], [' OOOI OUT KSFO 0312Z']]],
  ['VDL2', '136.975', [['DLH456 D-AIXP ', 'CPDLC'], [' LOGON ACCEPTED']]],
  ['HFDL', '8.927', [['QFA8 VH-ZNJ ', 'POS'], [' 37°42S 144°50E FL380']]],
  ['ADSB', '1090', [['SWA1881 A2C4F1 ', 'FL360'], [' 448kt GS · +1024fpm']]],
  ['AIS', '162.025', [['MSC ARIA IMO9619452 ', 'T1'], [' 18.4kn 094°T']]],
  ['ADSC', '1545.0', [['UAL58 N2748U ', 'ADS-C'], [' 51.39 -30.42 FL370 M.84']]],
  ['IRIDIUM', '1626.104', [['IRA sv112 beam27 ', 'RING'], [' alt 782km']]],
  ['ACARS', '130.025', [['BAW287 G-XWBA ', 'lbl=Q0'], [' WX REQ EGLL ATIS']]],
  ['HFDL', '13.276', [['GS RIVERHEAD-04 ', 'SQ'], [' squitter · 12 slots']]],
  ['VDL2', '136.650', [['AFR447 F-GZCP ', 'XID'], [' CSC handoff GL']]],
  ['SATCOM', '1537.70', [['EGC SafetyNET ', 'MSI'], [' NAVAREA XII gale warning']]],
  ['ACARS', '131.725', [['N831UA UA0233 ', 'lbl=B6'], [' ADS-C 47.5512 -122.3052 34000ft']]],
  ['ADSB', '1090', [['DAL2043 AB1042 ', 'BDS6,0'], [' hdg 271° IAS 290kt']]],
  ['AIS', '161.975', [['MAERSK SELETAR ', 'T5'], [' dest SGSIN ETA 04-12 06:00']]],
  ['IRIDIUM', '1625.50', [['IBC frame ', 'ITL'], [' sat 117 · GSM signalling']]],
  ['HFDL', '10.081', [['UAE231 A6-EUF ', 'POS'], [' 24°11N 055°48E FL400']]],
  ['VDL2', '136.925', [['ACA118 C-FGDT ', 'ACARS'], [' M16A free text — gate B22']]],
  ['ACARS', '136.700', [['FDX1234 N103FE ', 'lbl=5Z'], [' OObbbf fuel 84.2']]],
];

function stamp(d) {
  const p = (n, l = 2) => String(n).padStart(l, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
}

export default function DecoderConsole() {
  const [lines, setLines] = useState([]);
  const [count, setCount] = useState(0);
  const idRef = useRef(0);
  const poolRef = useRef(0);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const MAX = 11;

    const make = () => {
      // step through the pool so every mode shows, with a little jitter
      poolRef.current = (poolRef.current + 1 + Math.floor(Math.random() * 2)) % POOL.length;
      const [mode, freq, parts] = POOL[poolRef.current];
      idRef.current += 1;
      return { id: idRef.current, t: stamp(new Date()), mode, freq, parts };
    };

    // seed a full screen immediately
    const seed = [];
    for (let i = 0; i < MAX; i++) seed.push(make());
    setLines(seed);
    setCount(4200 + Math.floor(Math.random() * 900));

    if (reduced) return;

    let timer;
    const tick = () => {
      setLines((prev) => [...prev.slice(-(MAX - 1)), make()]);
      setCount((c) => c + 1 + Math.floor(Math.random() * 3));
      timer = setTimeout(tick, 850 + Math.random() * 1100);
    };
    timer = setTimeout(tick, 1100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="console" role="img" aria-label="Illustration of the xng decoder streaming live aviation and maritime traffic">
      <Waterfall className="console__waterfall" seed={3} density={9} speed={1.1} />

      <div className="console__bar">
        <span className="console__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="console__name mono">xng listen — station XX-KSEA-1</span>
        <span className="console__live mono">
          <span className="dot dot--green dot--live" /> live
        </span>
      </div>

      <div className="console__body">
        {lines.map((l) => (
          <div className="console__line" key={l.id}>
            <span className="console__t">{l.t}</span>
            <span className="console__mode" data-m={l.mode}>
              {l.mode}
            </span>
            <span className="console__txt">
              <span style={{ color: 'var(--muted)' }}>{l.freq}&nbsp;</span>
              <b>{l.parts[0][0]}</b>
              <span style={{ color: 'var(--amber-bright)' }}>{l.parts[0][1]}</span>
              {l.parts[1][0]}
            </span>
          </div>
        ))}
        <div className="console__line" aria-hidden="true">
          <span className="console__t">&nbsp;</span>
          <span />
          <span className="console__txt">
            <span className="console__caret" />
          </span>
        </div>
      </div>

      <div className="console__foot mono">
        <span>
          <b>{count.toLocaleString()}</b> msgs
        </span>
        <span>
          <b>11</b> channels
        </span>
        <span>
          CRC <b>99.2%</b>
        </span>
        <span>
          → <b>feed.airframes.io</b>
        </span>
      </div>
    </div>
  );
}
