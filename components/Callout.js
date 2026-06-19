const ICONS = { note: 'i', tip: '✓', warn: '!' };

// Inline aside for docs — note / tip / warn. Children render as prose.
export default function Callout({ type = 'note', children }) {
  return (
    <div className={`callout callout--${type}`}>
      <span className="callout__icon mono" aria-hidden="true">
        {ICONS[type] || 'i'}
      </span>
      <div>{children}</div>
    </div>
  );
}
