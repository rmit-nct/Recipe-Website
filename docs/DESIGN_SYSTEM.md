# Neo Recipe Design System

Status: v0 — companion to `docs/API_CONTRACT.md` and `docs/DATA_SHAPES.md`, same source-of-truth standing. Check this file before choosing colors, fonts, or shape language in any UI work — do not eyeball values from the logo or a screenshot.

## Source

All tokens below are measured directly from the "Neo Culture Tart" logo mark (a folded-ribbon "N" in navy/steel-blue, sitting in an illustrated tart with caramel crust and golden-mustard filling, on a warm cream checkerboard background; two-tone wordmark "NEO CULTURE" in navy, "TART" in gold). Values are exact pixel reads — do not round or substitute similar-looking hex codes.

## Color Palette

| Token | Hex | Tailwind utility | Where it appears in the source | Usage |
|---|---|---|---|---|
| `cream-base` | `#FDF6DC` | `bg-cream-base` / `text-cream-base` | Background, lighter checker tile | Primary page/section background |
| `cream-alt` | `#FCF1D5` | `bg-cream-alt` / `text-cream-alt` | Background, darker checker tile | Secondary checker tile; alternating rows/stripes |
| `gold-light` | `#FADA81` | `bg-gold-light` / `text-gold-light` | Filling highlight | Soft highlight fills, hover backgrounds |
| `gold` | `#EEAC52` | `bg-gold` / `text-gold` | Crust mid-tone, "TART" wordmark | Secondary brand accent, badges, "TART"-style wordmark treatment |
| `amber` | `#EC982A` | `bg-amber` / `text-amber` | Crust shadow | Warm mid accent — depth/shadow tone, hover states on gold |
| `burnt-orange` | `#C46207` | `bg-burnt-orange` / `text-burnt-orange` | Crust deep shadow, seed dots | Strongest warm accent — small decorative details, active/pressed states |
| `navy` | `#1F2A43` | `bg-navy` / `text-navy` | Ribbon dark fold, "NEO CULTURE" wordmark | Primary text color, headers, primary buttons |
| `steel-blue` | `#5491A4` | `bg-steel-blue` / `text-steel-blue` | Ribbon mid fold | Secondary/cool accent — links, secondary icons, ribbon-motif details |

No additional colors are introduced beyond these 8 — every UI color must trace back to one of these tokens (or a documented opacity/tint of one).

## Contrast Checks (WCAG AA)

Computed via the standard relative-luminance formula on the exact hex values above. AA requires **4.5:1** for normal text, **3:1** for large text (≥18pt, or ≥14pt bold).

| Foreground | Background | Ratio | Verdict | Recommended use |
|---|---|---|---|---|
| `navy` | `cream-base` | 13.19:1 | ✅ Pass (AAA) | Default body text on page background |
| `navy` | `cream-alt` | 12.70:1 | ✅ Pass (AAA) | Body text on the alternate checker tile |
| `navy` | `gold` | 7.25:1 | ✅ Pass (AAA) | Navy text on gold badges/buttons |
| `navy` | `gold-light` | 10.48:1 | ✅ Pass (AAA) | Navy text on soft highlight fills |
| `cream-base` | `navy` | 13.19:1 | ✅ Pass (AAA) | Light text on a navy header/nav/footer |
| `gold` | `navy` | 7.25:1 | ✅ Pass (AAA) | Gold accent text/labels on a navy surface |
| `steel-blue` | `cream-base` | 3.25:1 | ⚠️ Large text only | OK for large/bold headings or icons; **not for body copy** |
| `burnt-orange` | `cream-base` | 3.80:1 | ⚠️ Large text only | OK for large/bold headings, decorative labels; **not for body copy** |
| `gold` | `cream-base` | 1.82:1 | ❌ Fail | The logo's own "TART" gold-on-cream wordmark is a static decorative mark, not interactive UI text — do not reuse this pairing for real interface copy at any size |
| `amber` | `cream-base` | 2.13:1 | ❌ Fail | Same as above — `amber` needs a dark (navy) or light (cream) background under **it**, not the reverse; never use as text on cream |

**Rule of thumb:** `navy` is the only color reliable as text on any light background (`cream-base`, `cream-alt`, `gold`, `gold-light`). `gold`, `amber`, and `burnt-orange` read well as *surfaces* (badges, buttons, illustration fills) with navy or cream text on top, but fail or barely scrape by as text colors themselves — reserve them for backgrounds, icons, borders, and large/bold decorative headings, never small body text.

## Typography

| Role | Typeface | Weight(s) | Source | Rationale |
|---|---|---|---|---|
| Display / headings | **Fredoka** | 500, 600, 700 | Google Fonts (OFL, free) | Rounded geometric sans with soft, bulbous terminals — echoes the tart's rounded illustration style and the bold, friendly letterforms of the "NEO CULTURE TART" wordmark itself. Used at heading weights only, not body, so it stays a personality accent rather than the whole voice. |
| Body | **Nunito Sans** | 400, 500, 600, 700 | Google Fonts (OFL, free) | Shares Fredoka's rounded-terminal DNA (so the pairing feels like one family, not two clashing voices) but is cut for long-form legibility at small sizes — keeps body copy readable instead of cartoonish. |
| Utility / labels, tags, timestamps | **JetBrains Mono** | 500 | Google Fonts (OFL, free) | A monospace texture for small caps labels (categories, prep-time tags, eyebrows) — reads as "app-like" structure against the warm illustrated palette, giving the UI a grounded, functional counterpoint to the playful display face. |

All three are free Google Fonts under the SIL Open Font License — no paid license required.

## Shape & Style Language

- **Soft rounded illustration style.** The tart itself is all soft curves — no hard edges. UI surfaces (cards, buttons, badges, inputs) should default to generous corner radii (`rounded-xl`/`rounded-2xl`+) rather than sharp corners.
- **Folded-ribbon motif.** The logo's "N" is built from two overlapping ribbon strips (navy over steel-blue) with a visible fold/crease. This two-tone folded-strip shape is the brand's most distinctive geometric idea — worth reusing deliberately (see Signature Element below), not just as a static logo lockup.
- **Checkerboard texture (optional, use sparingly).** The cream-base/cream-alt checker pattern from the background can be used as a subtle, low-contrast texture on large empty surfaces (hero sections, empty states) — never behind body text, since it competes with the AA contrast pairings above.
- **Warm-surface, cool-accent balance.** Cream/gold/amber/burnt-orange carry the "food" warmth; navy/steel-blue carry structure and legibility. Every screen should read as warm overall, with navy/steel-blue used deliberately for text, structure, and the one cool accent moment — not blended 50/50.
- **Seed-dot detailing.** The small burnt-orange dots in the tart filling are a usable micro-decoration (e.g. a dot divider, a loading indicator, a texture on empty-state illustrations) — small, sparing, never load-bearing for information.

## Signature Visual Element

The folded-ribbon "N" — a two-tone strip fold in `navy` over `steel-blue` — is this UI's one recurring, memorable shape. Used sparingly (a corner flourish, an active-tab indicator, a section divider, a loading glyph) it should let any screen be recognized as Neo Recipe at a glance, without literally reprinting the logo everywhere.

## Change Process

Changes to this file require the Lead's sign-off, same as `docs/API_CONTRACT.md` and `docs/DATA_SHAPES.md`. Any new color or typeface must be justified against the source logo, not added by convenience.
