// The folded-ribbon "N" — the signature mark from docs/DESIGN_SYSTEM.md.
// Two overlapping strips: solid posts over a steel-blue diagonal fold.
// Used sparingly (brand lockup, image placeholder), never as page decoration.
//
// The posts inherit the parent's text color so the mark stays legible on both
// light (text-navy) and navy (text-cream-base) surfaces; the steel-blue fold
// reads against either.

export default function NeoRibbon({ className = '' }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="presentation" aria-hidden="true">
      <path d="M16 8 L25 8 L32 40 L23 40 Z" className="fill-steel-blue" />
      <path d="M7 8 h9 v32 h-9 z" fill="currentColor" />
      <path d="M32 8 h9 v32 h-9 z" fill="currentColor" />
    </svg>
  );
}
