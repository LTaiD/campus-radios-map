// Hand-drawn Canvas 2D map helpers (Dick Carroll style).
// Pure: no DOM or JSON imports at module load, so this file is node-importable
// for the self-check at the bottom. Callers pass in ctx / projection / features.

import { geoAlbersUsa } from "d3-geo";

export const BASE_W = 960;
export const BASE_H = 560;

export const PAPER = "#fffff4";
const INK = "#1c1a16";

// Flat, friendly illustration palette (Mailchimp / Dropbox / Anthropic doodle
// style): mid-saturation solids assigned by id hash. Shared by both designs — the
// classic and doodle maps differ only in borders/shadow, not fill color.
export const DOODLE_WASHES = [
  "#E8734A", "#F2C14E", "#5AA9E6", "#57C4AD",
  "#B57BBA", "#7BC86C", "#F49AC2", "#8C9EDE",
];
const idx = (id, arr) => arr[Math.abs(parseInt(id, 10) || hash(String(id))) % arr.length];
export const doodleFill = (id) => idx(id, DOODLE_WASHES);

// --- seeded randomness ------------------------------------------------------
export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(s) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0;
  return h;
}

// --- projection / transform -------------------------------------------------
export function makeProjection(features) {
  return geoAlbersUsa().fitSize([BASE_W, BASE_H], { type: "FeatureCollection", features });
}

// Affine mapping base-px -> screen (CSS) px for a given view + canvas size.
// view = { cx, cy, zoom }. zoom 1 => whole US fits (contain).
export function makeTransform(view, cssW, cssH, projection) {
  const baseFit = Math.min(cssW / BASE_W, cssH / BASE_H);
  const bc = projection([view.cx, view.cy]) || [BASE_W / 2, BASE_H / 2];
  const k = baseFit * view.zoom;
  return { k, baseFit, tx: cssW / 2 - bc[0] * k, ty: cssH / 2 - bc[1] * k };
}

// Same affine mapping but taking the view center already in BASE px ({bx,by,zoom}).
// The live loop eases in base px so pan/zoom never round-trips through lng/lat,
// which has projection dead zones between the AK/HI insets and the continent (a
// mid-ease lng/lat there projected to null -> a one-frame transform glitch).
export function makeTransformBase(view, cssW, cssH) {
  const baseFit = Math.min(cssW / BASE_W, cssH / BASE_H);
  const k = baseFit * view.zoom;
  return { k, baseFit, tx: cssW / 2 - view.bx * k, ty: cssH / 2 - view.by * k };
}

// Recover the view center (lng,lat) sitting under the canvas centre.
export function centerOf(T, cssW, cssH, projection) {
  return projection.invert([(cssW / 2 - T.tx) / T.k, (cssH / 2 - T.ty) / T.k]);
}

// --- ring prep (project feature outlines to base px once) -------------------
// No positional jitter: adjacent states share the exact same border coords, so a
// jittered/heavily-decimated trace made each side draw a *different* jagged line
// (the crossing zigzag when zoomed in). We keep the true geometry (only dropping
// near-duplicate points) and let the hand-drawn feel come from variable WIDTH.
const MIN_SEG = 0.35;  // base-px: drop only near-duplicate vertices
const ROUND = 3.0;         // base-px: how far back to shave a sharp corner
const ROUND_MAXFRAC = 0.35; // never shave more than this fraction of an edge

// Soften sharp bends (state rectangle corners) with a tiny 3-point arc — a bit
// rounded, not super round. Symmetric per vertex, so both sides of a shared
// border round identically and the two traces still coincide. Near-straight
// vertices (fine river detail) are left alone.
function roundCorners(P) {
  const n = P.length / 2;
  if (n < 4) return P;
  const out = [];
  for (let i = 0; i < n; i++) {
    const a2 = ((i - 1 + n) % n) * 2, b2 = ((i + 1) % n) * 2, v2 = i * 2;
    const vx = P[v2], vy = P[v2 + 1];
    const ax = P[a2] - vx, ay = P[a2 + 1] - vy; // toward prev
    const bx = P[b2] - vx, by = P[b2 + 1] - vy; // toward next
    const la = Math.hypot(ax, ay) || 1e-6, lb = Math.hypot(bx, by) || 1e-6;
    const dot = (ax * bx + ay * by) / (la * lb); // -1 straight, 0 right-angle, >0 acute
    if (dot < -0.86) { out.push(vx, vy); continue; } // <~31° turn: keep sharp point
    const ca = Math.min(ROUND, la * ROUND_MAXFRAC);
    const cb = Math.min(ROUND, lb * ROUND_MAXFRAC);
    const inx = vx + (ax / la) * ca, iny = vy + (ay / la) * ca;
    const oux = vx + (bx / lb) * cb, ouy = vy + (by / lb) * cb;
    const mx = 0.25 * inx + 0.5 * vx + 0.25 * oux; // quadratic midpoint through v
    const my = 0.25 * iny + 0.5 * vy + 0.25 * ouy;
    out.push(inx, iny, mx, my, oux, ouy);
  }
  return out;
}

// Project a ring to base px, drop near-duplicate vertices, round its corners.
// Rings are used for FILLS + hover-pop geometry only; borders come from the mesh.
function pushRing(out, coords, projection) {
  const raw = [];
  let lx = 0, ly = 0, have = false;
  for (let i = 0; i < coords.length; i++) {
    const p = projection(coords[i]);
    if (!p) continue;
    if (have) {
      const dx = p[0] - lx, dy = p[1] - ly;
      if (dx * dx + dy * dy < MIN_SEG * MIN_SEG) continue; // drop near-duplicates
    }
    lx = p[0]; ly = p[1]; have = true;
    raw.push(p[0], p[1]);
  }
  if (raw.length < 6) return;
  const pts = raw.length >= 12 ? roundCorners(raw) : raw;
  out.push({ pts });
}

// -> [{ id, rings: [{ pts }] }]  (fills + hover-pop geometry)
export function buildRings(features, projection) {
  return features.map((f) => {
    const rings = [];
    const g = f.geometry;
    if (!g) return { id: f.id, rings };
    if (g.type === "Polygon") {
      for (const ring of g.coordinates) pushRing(rings, ring, projection);
    } else if (g.type === "MultiPolygon") {
      for (const poly of g.coordinates) for (const ring of poly) pushRing(rings, ring, projection);
    }
    return { id: f.id, rings };
  });
}

// Project a topojson mesh (MultiLineString of shared borders, each arc drawn once)
// to flat base-px polylines. -> [[x,y,x,y,...], ...]
export function buildMesh(meshGeom, projection) {
  const arcs = [];
  for (const line of meshGeom.coordinates) {
    const pts = [];
    for (const c of line) {
      const p = projection(c);
      if (p) pts.push(p[0], p[1]);
    }
    if (pts.length >= 4) arcs.push(pts);
  }
  return arcs;
}

// (paper texture removed — the canvas is now filled with a flat PAPER color)

// --- offscreen base bitmap (render once) ------------------------------------
// Flat dusty state fills, transparent outside states. Paper is drawn separately,
// full-canvas, so this bitmap's edge is never visible. `design` picks the palette.
export function renderBase(features, projection, ss = 2) {
  const W = BASE_W * ss;
  const H = BASE_H * ss;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  for (const f of features) {
    const bbox = ringPath(ctx, f, projection, ss);
    if (!bbox) continue;
    ctx.save();
    ctx.clip();
    ctx.fillStyle = doodleFill(f.id);
    ctx.fillRect(bbox.x0, bbox.y0, bbox.x1 - bbox.x0, bbox.y1 - bbox.y0);
    ctx.restore();
  }
  return canvas;
}

// build feature path into ctx (base*ss coords); returns bbox or null
function ringPath(ctx, f, projection, ss) {
  const g = f.geometry;
  if (!g) return null;
  ctx.beginPath();
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const ring = (coords) => {
    let started = false;
    for (const c of coords) {
      const p = projection(c);
      if (!p) continue;
      const x = p[0] * ss;
      const y = p[1] * ss;
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    if (started) ctx.closePath();
  };
  if (g.type === "Polygon") g.coordinates.forEach(ring);
  else if (g.type === "MultiPolygon") g.coordinates.forEach((poly) => poly.forEach(ring));
  if (x0 === Infinity) return null;
  return { x0, y0, x1, y1 };
}

// --- live border pass (zoom-consistent) -------------------------------------
// Shared borders come in as open polylines (topojson mesh, each arc once, so no
// double-stroke). Per frame we decimate each arc in SCREEN space — keep a vertex
// only when it's >= TOL px from the last kept one — so on-screen detail density is
// the same at every zoom (a river wiggle simplifies when zoomed out, returns when
// zoomed in). Near-constant width with a gentle screen-length swell = Carroll pen.
// ponytail: O(total vertices)/frame for one mesh; transform-bucket cache below.
const BORDER_W = 3.6;    // px: mean on-screen ink width (wider, brush-loaded)
const BORDER_TOL = 2.2;  // px: min on-screen spacing between kept vertices
// Width wanders like a hand-loaded brush: two incommensurate sine swells (so the
// thick/thin never repeats on a tidy period) + mild per-segment seeded jitter.
const BW_AMP = 0.9;      // px: primary swell
const BW_FREQ = 0.045;   // primary wave per screen-px (~140px period)
const BW_AMP2 = 0.55;    // px: secondary swell
const BW_FREQ2 = 0.017;  // secondary wave (~370px period) -> beats against primary
const BW_JIT = 0.7;      // px: per-segment random wobble
const BW_STEP = 0.3;     // px: width bucketing (Path2D per rounded width)

// Cache built Path2D sets keyed by a quantized transform. strokeMesh bakes screen
// coords, so a truly static frame (same k, same integer tx/ty) reuses the identical
// set instead of rebuilding every vertex. Pan/zoom changes the key -> rebuild.
// ponytail: tiny Map, cleared past a few entries; assumes `arcs` identity is stable.
const _meshCache = new Map();

export function strokeMesh(ctx, arcs, T, opts = {}) {
  const { ink = INK, width = BORDER_W, salt = "" } = opts;
  // salt + width keep distinct passes (interior white vs exterior black) from
  // colliding in the transform-keyed cache.
  const key = `${salt}|${width}|${T.k.toFixed(3)}|${Math.round(T.tx)}|${Math.round(T.ty)}`;
  let bmap = _meshCache.get(key);
  if (!bmap) {
    bmap = buildMeshPaths(arcs, T, width);
    if (_meshCache.size > 12) _meshCache.clear();
    _meshCache.set(key, bmap);
  }
  ctx.strokeStyle = ink;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.globalAlpha = 1;
  for (const [w, path] of bmap) { ctx.lineWidth = w; ctx.stroke(path); }
}

// widthKey -> Path2D, screen-space, decimated to current zoom.
function buildMeshPaths(arcs, T, baseW = BORDER_W) {
  const TOL2 = BORDER_TOL * BORDER_TOL;
  const bmap = new Map();
  let ai = 0;
  for (const pts of arcs) {
    const n = pts.length / 2;
    ai++;
    if (n < 2) continue;
    const rng = mulberry32(0x9e3779b9 ^ (ai * 2654435761));  // per-arc, deterministic
    let lx = pts[0] * T.k + T.tx;      // last kept, screen px
    let ly = pts[1] * T.k + T.ty;
    let len = 0;                        // cumulative screen length for the swells
    for (let i = 1; i < n; i++) {
      const x = pts[i * 2] * T.k + T.tx;
      const y = pts[i * 2 + 1] * T.k + T.ty;
      const dx = x - lx, dy = y - ly;
      // always keep the arc endpoint; else decimate to current zoom
      if (i !== n - 1 && dx * dx + dy * dy < TOL2) continue;
      len += Math.hypot(dx, dy);
      const swell = Math.sin(len * BW_FREQ) * BW_AMP
                  + Math.sin(len * BW_FREQ2 + 1.7) * BW_AMP2
                  + (rng() - 0.5) * BW_JIT;
      const w = Math.round((baseW + swell) / BW_STEP) * BW_STEP;
      let path = bmap.get(w);
      if (!path) { path = new Path2D(); bmap.set(w, path); }
      path.moveTo(lx, ly);
      path.lineTo(x, y);
      lx = x; ly = y;
    }
  }
  return bmap;
}

// Subtle static hover "pop": translucent lighten of the hovered state's rings +
// a slightly heavier, brighter border. `group` is one buildRings entry.
export function popState(ctx, group, T, ink = INK) {
  if (!group || !group.rings.length) return;
  ctx.save();
  ctx.beginPath();
  for (const { pts } of group.rings) {
    const n = pts.length / 2;
    for (let i = 0; i < n; i++) {
      const x = pts[i * 2] * T.k + T.tx, y = pts[i * 2 + 1] * T.k + T.ty;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  ctx.fill();
  ctx.strokeStyle = ink;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();
}

// Station marker: wobbly filled blob with an ink outline.
export function drawDot(ctx, station, sx, sy, opts) {
  const { hover, selected, pulse, reduced } = opts;
  let r = selected ? 12.5 : hover ? 10.5 : 8;
  if (selected && !reduced) r *= 1 + 0.07 * Math.sin(pulse / 1000 * Math.PI);
  const seed = hash(String(station.id));
  const rng = mulberry32(seed);
  const rot = (seed % 360) * (Math.PI / 180);
  const N = 13;

  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(rot);
  // uneven hand-drawn outline (shared by both designs)
  ctx.beginPath();
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const rr = r * (0.86 + rng() * 0.24);
    const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.globalAlpha = 1;
  ctx.fillStyle = station.color || "#b5432f";
  ctx.fill();

  ctx.strokeStyle = INK;
  ctx.lineWidth = selected || hover ? 3.2 : 2.4;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
  ctx.restore();
}

// --- self-check (node-runnable, not called by the app) ----------------------
// Assert projection/transform round-trips and US state count. Pass in the
// feature list built by the caller (topojson-client) so this stays JSON-free.
export function selfCheck(features) {
  const out = [];
  const ok = (cond, msg) => {
    if (!cond) throw new Error("selfCheck FAIL: " + msg);
    out.push("ok: " + msg);
  };
  ok(features.length >= 50, `state count ${features.length} >= 50`);

  const projection = makeProjection(features);
  // projection round-trip
  for (const c of [[-96.9, 38.6], [-118.2, 34.05], [-73.9, 40.75]]) {
    const back = projection.invert(projection(c));
    ok(Math.hypot(back[0] - c[0], back[1] - c[1]) < 1e-6, `invert(project([${c}])) ~= center`);
  }
  // transform round-trip: center recovered from transform == input center
  const cssW = 1200, cssH = 700;
  for (const view of [{ cx: -96.9, cy: 38.6, zoom: 1 }, { cx: -87.6, cy: 41.9, zoom: 3.4 }]) {
    const T = makeTransform(view, cssW, cssH, projection);
    const c = centerOf(T, cssW, cssH, projection);
    ok(Math.hypot(c[0] - view.cx, c[1] - view.cy) < 1e-6, `centerOf(transform) ~= [${view.cx},${view.cy}] @z${view.zoom}`);
  }
  // the palette assigns a valid hex fill for every state id (no undefined slot).
  for (const f of features) {
    ok(/^#[0-9a-f]{6}$/i.test(doodleFill(f.id)), `doodleFill(${f.id}) is a hex`);
  }
  return out;
}
