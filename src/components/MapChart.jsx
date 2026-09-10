import { memo, useEffect, useMemo, useRef } from "react";
import { feature, mesh } from "topojson-client";
import { geoContains } from "d3-geo";
import statesTopo from "us-atlas/states-10m.json";
import {
  BASE_W, BASE_H, PAPER, makeProjection, makeTransformBase,
  buildRings, buildMesh, renderBase, strokeMesh, popState, drawDot,
} from "../lib/mapArt.js";

const CLAMP = (z) => Math.min(8, Math.max(0.9, z));
const reducedMotion = () =>
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function MapChart({ stations, selectedId, onSelect, position, onMove, onAnchor, onPreview, onPreviewLeave, doodle }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  // ponytail: tooltip is a permanently-mounted DOM node updated imperatively — no
  // React state, so mouse-move never re-renders the component (was the move lag).
  const tipRef = useRef(null);
  const showTip = (x, y, text) => {
    const el = tipRef.current;
    if (!el) return;
    el.textContent = text;
    el.style.left = x - 8 + "px";
    el.style.top = y - 8 + "px";
    el.style.display = "block";
  };
  const moveTip = (x, y) => {
    const el = tipRef.current;
    if (el && el.style.display !== "none") { el.style.left = x - 8 + "px"; el.style.top = y - 8 + "px"; }
  };
  const hideTip = () => { const el = tipRef.current; if (el) el.style.display = "none"; };

  const features = useMemo(() => feature(statesTopo, statesTopo.objects.states).features, []);
  const projection = useMemo(() => makeProjection(features), [features]);
  const rings = useMemo(() => buildRings(features, projection), [features, projection]);
  // Split the border mesh: interior = shared state divisions (a!==b), exterior =
  // the coastline of every landmass incl. the AK/HI insets (a===b). Doodle mode
  // strokes them white/black; classic strokes both in ink (== the old full mesh).
  const meshInterior = useMemo(
    () => buildMesh(mesh(statesTopo, statesTopo.objects.states, (a, b) => a !== b), projection),
    [projection]
  );
  const meshExterior = useMemo(
    () => buildMesh(mesh(statesTopo, statesTopo.objects.states, (a, b) => a === b), projection),
    [projection]
  );
  const baseRef = useRef(null);

  // live view state in BASE px (source of truth for rendering) + target we ease
  // toward. Easing in base px (not lng/lat) keeps every intermediate frame valid
  // even when panning to the Alaska/Hawaii insets — lng/lat easing crossed the
  // projection's dead zones and flashed a bad transform for a frame.
  const b0 = projection([position.coordinates[0], position.coordinates[1]]) || [BASE_W / 2, BASE_H / 2];
  const view0 = { bx: b0[0], by: b0[1], zoom: position.zoom };
  const curRef = useRef(view0);
  const targetRef = useRef(view0);
  const sizeRef = useRef({ cssW: BASE_W, cssH: BASE_H, dpr: 1 });
  const rectRef = useRef({ left: 0, top: 0 });

  // latest props for the long-lived rAF loop
  const p = { stations, selectedId, onSelect, onMove, onAnchor, onPreview, onPreviewLeave, doodle };
  const ref = useRef(p);
  ref.current = p;

  const hoverRef = useRef(null);      // station id under cursor
  const hoverLandRef = useRef(null);  // hovered state feature id
  const dragRef = useRef(null);
  const lastAnchorRef = useRef(undefined);
  const moveTimer = useRef(0);
  const landTip = useRef(0);

  // react to prop-driven position changes (home / tuneTo / locate / shuffle)
  useEffect(() => {
    const b = projection([position.coordinates[0], position.coordinates[1]]) || [BASE_W / 2, BASE_H / 2];
    targetRef.current = { bx: b[0], by: b[1], zoom: position.zoom };
    if (reducedMotion()) curRef.current = { ...targetRef.current };
  }, [position, projection]);

  // build the offscreen fill bitmap once. Both designs share one palette, so this
  // never needs rebuilding on the doodle toggle. (The doodle drop shadow + borders
  // are drawn as vector each frame, not baked here.)
  useEffect(() => {
    baseRef.current = renderBase(features, projection, 2);
  }, [features, projection]);

  // size / DPR
  useEffect(() => {
    const wrap = wrapRef.current;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { cssW: r.width, cssH: r.height, dpr };
      rectRef.current = { left: r.left, top: r.top };
      const cv = canvasRef.current;
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    window.addEventListener("scroll", resize, true);
    return () => { ro.disconnect(); window.removeEventListener("scroll", resize, true); };
  }, []);

  const reportMove = () => {
    const t = targetRef.current;
    const c = projection.invert([t.bx, t.by]);
    if (c) ref.current.onMove({ coordinates: c, zoom: t.zoom });
  };

  // screen (css px) position of a station, or null
  const stationXY = (s, T) => {
    const b = projection([s.lng, s.lat]);
    if (!b) return null;
    return [b[0] * T.k + T.tx, b[1] * T.k + T.ty];
  };

  // the draw loop
  useEffect(() => {
    let raf = 0;
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      const cv = canvasRef.current;
      const ctx = cv && cv.getContext("2d");
      if (!ctx) return;
      const { cssW, cssH, dpr } = sizeRef.current;
      const cur = curRef.current, tgt = targetRef.current;

      // ease toward target in BASE px (snap when reduced or very close)
      const e = reducedMotion() ? 1 : 0.22;
      cur.bx += (tgt.bx - cur.bx) * e;
      cur.by += (tgt.by - cur.by) * e;
      cur.zoom += (tgt.zoom - cur.zoom) * e;
      if (Math.abs(tgt.zoom - cur.zoom) < 1e-3) cur.zoom = tgt.zoom;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      // 0) flat paper across the whole canvas (texture removed)
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, cssW, cssH);

      const T = makeTransformBase(cur, cssW, cssH);
      const dood = ref.current.doodle;

      // 0.5) doodle drop shadow: fill the landmass silhouette (union of every state
      // ring) in solid black, offset straight down a constant screen-px amount, behind
      // the fill. The colored base then covers the true footprint, so only the downward
      // extension peeks out = a crisp, 100%-opacity shadow, more along lower edges.
      if (dood) {
        const OFF = 9;
        ctx.save();
        ctx.fillStyle = "#101010";
        ctx.beginPath();
        for (const g of rings) for (const { pts } of g.rings) {
          const n = pts.length / 2;
          for (let i = 0; i < n; i++) {
            const x = pts[i * 2] * T.k + T.tx, y = pts[i * 2 + 1] * T.k + T.ty + OFF;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.closePath();
        }
        ctx.fill();
        ctx.restore();

        // 0.7) doodle coast: black perimeter + white coast outline drawn UNDER the
        // fill, so the fill masks their inner halves — black reads as a clean outer
        // rim and the white sits just inside it instead of bisecting the black.
        strokeMesh(ctx, meshExterior, T, { ink: "#141210", width: 10, salt: "exk" });
        strokeMesh(ctx, meshExterior, T, { ink: "#fffff4", width: 4, salt: "exw" });
      }

      // 1) blit watercolour base under the transform
      if (baseRef.current) {
        ctx.imageSmoothingQuality = "low"; // ponytail: base is 2x supersampled; low upscale is negligibly different but cheap per frame
        ctx.drawImage(baseRef.current, T.tx, T.ty, BASE_W * T.k, BASE_H * T.k);
      }

      // 1.5) hovered-state "pop" (translucent lighten + emphasis), under the borders
      const hl = hoverLandRef.current;
      if (hl != null) {
        const hg = rings.find((g) => g.id === hl);
        if (hg) popState(ctx, hg, T, dood ? "#fffff4" : undefined);
      }

      // 2) interior borders (on top of the fill). Doodle: white state divisions —
      // the coast outline was already drawn under the fill above. Classic: ink
      // (interior + exterior == the old full mesh).
      if (dood) {
        strokeMesh(ctx, meshInterior, T, { ink: "#fffff4", width: 3.2, salt: "inw" });
      } else {
        strokeMesh(ctx, meshInterior, T, { salt: "in" });
        strokeMesh(ctx, meshExterior, T, { salt: "ex" });
      }

      // dots
      const { stations: sts, selectedId: sel } = ref.current;
      const draw1 = drawDot;
      const reduced = reducedMotion();
      let anchor = null;
      for (const s of sts) {
        const xy = stationXY(s, T);
        if (!xy) continue;
        const [sx, sy] = xy;
        if (sx < -40 || sx > cssW + 40 || sy < -40 || sy > cssH + 40) continue;
        const selected = s.id === sel;
        draw1(ctx, s, sx, sy, { hover: s.id === hoverRef.current, selected, pulse: now, reduced });
        if (selected) anchor = { x: rectRef.current.left + sx, y: rectRef.current.top + sy };
      }

      // onAnchor (deduped so we don't spam App)
      const la = lastAnchorRef.current;
      if (anchor) {
        if (!la || Math.hypot(anchor.x - la.x, anchor.y - la.y) > 0.5) {
          lastAnchorRef.current = anchor;
          ref.current.onAnchor(anchor);
        }
      } else if (la !== null) {
        lastAnchorRef.current = null;
        ref.current.onAnchor(null);
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [rings, meshInterior, meshExterior, projection]);

  // --- pointer interaction ---------------------------------------------------
  const toCss = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    rectRef.current = { left: r.left, top: r.top };
    return [e.clientX - r.left, e.clientY - r.top];
  };

  const hitDot = (mx, my) => {
    const { cssW, cssH } = sizeRef.current;
    const T = makeTransformBase(curRef.current, cssW, cssH);
    let best = null, bd = 15 * 15;
    for (const s of ref.current.stations) {
      const xy = stationXY(s, T);
      if (!xy) continue;
      const d = (xy[0] - mx) ** 2 + (xy[1] - my) ** 2;
      if (d < bd) { bd = d; best = s; }
    }
    return best;
  };

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = {
      x: e.clientX, y: e.clientY, moved: false,
      bx: curRef.current.bx, by: curRef.current.by,
    };
  };

  const onPointerMove = (e) => {
    const [mx, my] = toCss(e);
    const d = dragRef.current;
    if (d) {
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!d.moved && dx * dx + dy * dy > 16) d.moved = true;
      if (d.moved) {
        const { cssW, cssH } = sizeRef.current;
        const k = makeTransformBase(curRef.current, cssW, cssH).k;
        const bx = Math.min(BASE_W - 20, Math.max(20, d.bx - dx / k));
        const by = Math.min(BASE_H - 20, Math.max(20, d.by - dy / k));
        targetRef.current = { bx, by, zoom: curRef.current.zoom };
        curRef.current = { ...targetRef.current };
      }
      return;
    }
    // hover: dots first, then land
    const dot = hitDot(mx, my);
    if (dot) {
      hoverLandRef.current = null; // dots take precedence over the state pop
      if (hoverRef.current !== dot.id) {
        hoverRef.current = dot.id;
        ref.current.onPreview(dot, { x: e.clientX, y: e.clientY });
      }
      showTip(e.clientX, e.clientY, dot.name);
      return;
    }
    if (hoverRef.current) { hoverRef.current = null; ref.current.onPreviewLeave(); }
    // land hover (throttled geoContains)
    const t = performance.now();
    if (t - landTip.current > 90) {
      landTip.current = t;
      const { cssW, cssH } = sizeRef.current;
      const T = makeTransformBase(curRef.current, cssW, cssH);
      const ll = projection.invert([(mx - T.tx) / T.k, (my - T.ty) / T.k]);
      const f = ll && features.find((ft) => geoContains(ft, ll));
      hoverLandRef.current = f ? f.id : null;
      if (f) showTip(e.clientX, e.clientY, f.properties.name); else hideTip();
    } else {
      moveTip(e.clientX, e.clientY); // follow cursor between throttled hit-tests, no state churn
    }
  };

  const onPointerUp = (e) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (d && d.moved) { reportMove(); return; }
    const [mx, my] = toCss(e);
    const dot = hitDot(mx, my);
    if (dot) ref.current.onSelect(dot);
  };

  const onPointerLeave = () => {
    if (hoverRef.current) { hoverRef.current = null; ref.current.onPreviewLeave(); }
    hoverLandRef.current = null;
    hideTip();
  };

  const onWheel = (e) => {
    e.preventDefault();
    const [mx, my] = toCss(e);
    const { cssW, cssH } = sizeRef.current;
    const tgt = targetRef.current;
    const T = makeTransformBase(tgt, cssW, cssH);
    const baseUnder = [(mx - T.tx) / T.k, (my - T.ty) / T.k];
    const zoom = CLAMP(tgt.zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
    const kp = T.baseFit * zoom;
    const bx = baseUnder[0] + (cssW / 2 - mx) / kp;
    const by = baseUnder[1] + (cssH / 2 - my) / kp;
    targetRef.current = { bx, by, zoom };
    clearTimeout(moveTimer.current);
    moveTimer.current = setTimeout(reportMove, 160);
  };

  return (
    <div ref={wrapRef} className="map-wrap" aria-label="Map of United States college radio stations">
      <canvas
        ref={canvasRef}
        className="usa-map"
        style={{ touchAction: "none", cursor: dragRef.current ? "grabbing" : "var(--cursor-ring), grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onWheel={onWheel}
      />
      <div
        ref={tipRef}
        className="map-tooltip"
        style={{ display: "none", transform: "translate(-100%, -100%)" }}
      />
    </div>
  );
}

export default memo(MapChart);
