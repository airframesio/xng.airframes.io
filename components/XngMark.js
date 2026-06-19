// Original xng mark — the repo ships no logo. A channelized spectrum read out
// of a rounded "tuner" square: a noise floor with carrier peaks rising through
// it, the brightest one centered. Amber-on-navy to match the Airwaves family.
export default function XngMark({ size = 28, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="xng"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="xngGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffc372" />
          <stop offset="0.58" stopColor="#ffa14f" />
          <stop offset="1" stopColor="#ff6a3d" />
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="29" height="29" rx="7" fill="#0b1018" stroke="url(#xngGrad)" strokeWidth="1.6" />
      {/* noise floor */}
      <line x1="6" y1="23" x2="26" y2="23" stroke="#3a4658" strokeWidth="1.2" strokeLinecap="round" />
      {/* spectrum carriers rising through the floor */}
      <path
        d="M6 23 L9 23 L10.5 18 L12 23 L14.5 23 L16 9 L17.5 23 L20 23 L21.5 15 L23 23 L26 23"
        stroke="url(#xngGrad)"
        strokeWidth="1.7"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {/* peak marker on the center carrier */}
      <circle cx="16" cy="9" r="1.7" fill="#ffe8c8" />
    </svg>
  );
}
