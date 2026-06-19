const MESSAGES = [
  ['ACARS', '131.550 MHz', 'UAL1422 · N27957 · OOOI OUT KSFO 0312Z'],
  ['VDL2', '136.975 MHz', 'DLH456 · D-AIXP · CPDLC LOGON ACCEPTED'],
  ['HFDL', '8.927 MHz', 'QFA8 · VH-ZNJ · POS 37°42S 144°50E FL380'],
  ['ADS-B', '1090 MHz', 'SWA1881 · A2C4F1 · FL360 · 448 kt GS'],
  ['AIS', '162.025 MHz', 'MSC ARIA · IMO 9619452 · 18.4 kn · 094°T'],
  ['ADS-C', 'L-band', 'WAYPOINT REPORT · FL370 · M.84 · ETA 0455Z'],
  ['IRIDIUM', '1626.104 MHz', 'IRA · SV112 · BEAM 27 · RING ALERT'],
  ['STD-C', '1537.70 MHz', 'EGC SafetyNET · NAVAREA XII · GALE WARNING'],
  ['UAT', '978 MHz', 'N512GA · FIS-B METAR KAPA · FL085'],
  ['NAVTEX', '518 kHz', 'ZCZC · USCG · MARINE SAFETY BROADCAST'],
  ['ACARS', '130.025 MHz', 'BAW287 · G-XWBA · WX REQ EGLL ATIS'],
  ['SONDE', '404.5 MHz', 'RS41 · S4920871 · 47.5N 122.3W · 18,420 m'],
];

/** Endless marquee of plausible decoded traffic — every mode xng speaks. */
export default function Ticker() {
  const row = (hidden) => (
    <div className="ticker__row" aria-hidden={hidden || undefined}>
      {MESSAGES.map((m, i) => (
        <span className="ticker__item" key={i}>
          <b>{m[0]}</b>
          <i>{m[1]}</i>
          <span>{m[2]}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="ticker" role="marquee" aria-label="Recently decoded transmissions across xng modes">
      {row(false)}
      {row(true)}
    </div>
  );
}
