# College Radio Map — Style Guide (Dick Carroll hand-drawn)

Every surface in this app shares **one** illustrated identity, modeled on Dick
Carroll's ink-and-watercolor illustrations: wobbly hand-inked outlines, uneven
watercolor washes, and warm cream paper showing its tooth. This file is the
contract. All agents build to it. **Shared visual primitives live in
`src/styles/theme.css` — do not redefine them per component; if a primitive needs
to change, change it in the theme so every surface moves together.**

## Non-negotiables
- **Restyle only.** Every existing control and panel — Search, Favorites, FAQ,
  audio-player transport/volume/like/locate/shuffle, station card — stays fully
  functional. No feature is removed, stubbed, or behavior-changed.
- **One identity.** Reuse the theme tokens and primitives below. Do not invent new
  colors, fonts, or shadow recipes. New component-specific classes go in that
  component's `src/styles/<name>.css`.

## Color tokens (`:root`, in theme.css)
| Token | Value | Use |
|-------|-------|-----|
| `--ink` | `#1c1a16` | all outlines, text, hatching |
| `--ui-font` | `"NBObese", …` | toggled display font (title, hover state name, identify, LIVE, tooltips, Favorites/FAQ headings) |
| `--paper` | `#f7f2e4` | page & inset ground (cream) |
| `--card` | `#fdfaf0` | panels, buttons, chips |
| `--accent` | `#b5432f` | play button, active chip, live tag, alerts |
| `--wash-shadow` | `3px 4px 7px rgba(38,34,28,0.22)` | raised elements |
| `--font-hand` | `"Patrick Hand", cursive` | **all** text |

**Map washes** (state fills, in `mapArt.js`): vibrant & contrasting, little
beige — `WASHES` = `#8fc06a #79bcd6 #f2c94a #e08a5c #b598cf #9fc6e8 #c8c85c #e39aa0`;
darker edge-pooling tones `WASH_EDGES` =
`#579a42 #3f8fb0 #cf9a26 #bd5c38 #87699f #5a92c6 #97972f #c56e76`. Dots keep their
per-station `s.color`. Paper (`makePaperTile`) is painted full-canvas every frame,
so the offscreen wash bitmap is transparent outside states (no hard edge).

## The hand-drawn language
- **Wobbly ink outline.** Every border/edge is a jittered, slightly-doubled ink
  stroke — a heavier under-stroke (~2.2–3px) with a lighter offset over-stroke
  (~1.4px), `--ink`, round joins/caps. In CSS this is the existing
  `filter: url(#brush)` / `url(#brush-sm)` displacement on `.panel::before`,
  `.btn-ink svg`, etc. In canvas it's seeded per-vertex jitter (see below). Keep
  the wobble **deterministic** (seeded) so nothing swims between frames.
- **Irregular border-radius.** Corners are never uniform — panels/buttons use the
  lopsided radii already in the theme (e.g. `12px 7px 13px 8px / 8px 13px 7px 12px`).
  Reuse these, don't square anything off.
- **Watercolor bleed.** Fills are uneven: lighter center, darker pooling toward
  edges, soft blooms — never flat. On canvas: base wash + a few `multiply`
  radial-gradient blobs in nearby tones. In CSS, washes read through the paper.
- **Cream paper tooth.** A low-opacity procedural grain over `--paper` so texture
  shows through washes. The map canvas paints it; panels inherit the paper feel
  via `--card` on `--paper`.
- **Slight rotation / imperfection.** Titles and stamps sit a touch off-axis
  (e.g. `.app-title` at `-1.4deg`). Favor this over rigid alignment.
- **Motion** is gentle and springy: `cubic-bezier(0.23, 1, 0.32, 1)`, ~100–180ms.
  Honor `prefers-reduced-motion` (kill breathing/pulse/spin loops).

## Shared primitives (in theme.css — use, don't redefine)
`.panel` (inset card w/ brushed border), `.btn-ink` / `.icon-btn` / `.chip-arrow`
(hand-inked buttons), `.chip` / `.chip-on` (wobbly pills), `.card-close`,
`[data-tip]` hover tooltips, `.map-tooltip`, `.spin`, cursor vars, `.topbar` /
`.app-title`. Buttons press with a 1–2px translate + slight scale.

## Canvas map specifics (canvas-map agent)
- Seeded PRNG (`mulberry32`), seed = `hash(id) ^ vertexIndex`, so wobble is stable.
- Layers: (1) offscreen bitmap = paper grain + watercolor washes, blitted under
  the transform; (2) live vector pass = wobbly **doubled** ink borders + station
  dots, redrawn each frame so ink stays crisp at any zoom.
- Dots: small wobbly blob filled with `s.color`, `--ink` outline, grow on
  hover/selected; selected gets a gentle breathe (respect reduced-motion).

## Do / Don't
- ✅ Reuse tokens & primitives; new styles in your own component css file.
- ✅ Keep every control working; verify behavior after restyling.
- ❌ No new fonts, no flat fills, no perfectly straight/rounded rectangles, no new
  color hexes outside the palette, no removing controls.
