export const STATIC_CONFIG = {
  volume: 0.7,    // share of the player volume for the interstitial track
  fadeInMs: 180,  // quick fade-in so the track doesn't pop on
  fadeMs: 320,    // small fade-out into the radio once the stream starts
};

const NOISE_URL = "/static-noise.mp3"; // interstitial audio (downloaded), loops while a stream loads

const PRIME_LIMIT = 3;
const PRIME_TTL = 15_000;

let ctx = null;
let noiseBuffer = null;   // decoded AudioBuffer, loaded once
let noiseLoading = null;  // in-flight decode promise
let staticNodes = null;
let staticGen = 0;        // cancels an async start whose static was already stopped
let current = null;
const primed = new Map();

function audioCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

// ponytail: if the asset is ever missing, the fetch rejects -> static is just silent.
function loadNoiseBuffer() {
  if (noiseBuffer) return Promise.resolve(noiseBuffer);
  if (noiseLoading) return noiseLoading;
  const c = audioCtx();
  noiseLoading = fetch(NOISE_URL)
    .then((r) => r.arrayBuffer())
    .then((ab) => c.decodeAudioData(ab))
    .then((buf) => (noiseBuffer = buf))
    .catch(() => null);
  return noiseLoading;
}

function startStaticWith(buf, volume) {
  const c = audioCtx();
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const gain = c.createGain();
  const target = Math.min(1, volume * STATIC_CONFIG.volume);
  gain.gain.setValueAtTime(0.0001, c.currentTime);
  gain.gain.linearRampToValueAtTime(target, c.currentTime + STATIC_CONFIG.fadeInMs / 1000);
  src.connect(gain).connect(c.destination);
  src.start();
  staticNodes = { src, gain };
}

function startStatic(volume) {
  stopStatic(0);
  const c = audioCtx();
  if (c.state === "suspended") c.resume();
  const gen = ++staticGen;
  if (noiseBuffer) { startStaticWith(noiseBuffer, volume); return; }
  loadNoiseBuffer().then((buf) => {
    if (buf && gen === staticGen && !staticNodes) startStaticWith(buf, volume);
  });
}

function stopStatic(fadeMs = STATIC_CONFIG.fadeMs) {
  staticGen++; // cancel any pending async start
  if (!staticNodes) return;
  const { src, gain } = staticNodes;
  staticNodes = null;
  const c = audioCtx();
  gain.gain.setValueAtTime(gain.gain.value, c.currentTime);
  gain.gain.linearRampToValueAtTime(0, c.currentTime + fadeMs / 1000);
  setTimeout(() => {
    try { src.stop(); } catch { /* already stopped */ }
  }, fadeMs + 30);
}

function setStaticVolume(volume) {
  if (staticNodes) staticNodes.gain.gain.value = Math.min(1, volume * STATIC_CONFIG.volume);
}

function teardown(el) {
  el.onplaying = null;
  el.onerror = null;
  el.onended = null;
  el.onstalled = null;
  el.pause();
  el.removeAttribute("src");
  el.load();
}

function dropPrimed(url) {
  const p = primed.get(url);
  if (!p) return;
  clearTimeout(p.timer);
  teardown(p.el);
  primed.delete(url);
}

export function prime(url) {
  if (!url || current?.url === url) return;
  const hit = primed.get(url);
  if (hit) {
    clearTimeout(hit.timer);
    hit.timer = setTimeout(() => dropPrimed(url), PRIME_TTL);
    return;
  }
  while (primed.size >= PRIME_LIMIT) {
    dropPrimed(primed.keys().next().value);
  }
  const el = new Audio();
  el.preload = "auto";
  el.muted = true;
  el.crossOrigin = null;
  el.src = url;
  el.load();
  primed.set(url, { el, timer: setTimeout(() => dropPrimed(url), PRIME_TTL) });
}

export function playStream(url, volume, { onplaying, onerror }) {
  if (current) {
    teardown(current.el);
    current = null;
  }
  let el;
  const hit = primed.get(url);
  if (hit) {
    clearTimeout(hit.timer);
    primed.delete(url);
    el = hit.el;
  } else {
    el = new Audio();
    el.preload = "auto";
    el.src = url;
  }
  el.muted = false;
  el.volume = volume;

  let dead = false;
  const settle = (fn) => () => {
    if (dead) return;
    stopStatic();
    fn();
  };
  el.onplaying = settle(onplaying);
  el.onerror = settle(onerror);
  el.onended = settle(onerror);

  if (el.readyState < 3) startStatic(volume);
  el.play().catch(() => {
    if (!dead) {
      stopStatic();
      onerror();
    }
  });

  current = { el, url };
  return {
    pause() {
      el.pause();
      stopStatic(0);
    },
    resume() {
      el.play().catch(() => !dead && onerror());
    },
    setVolume(v) {
      el.volume = v;
      setStaticVolume(v);
    },
    stop() {
      dead = true;
      stopStatic(0);
      teardown(el);
      if (current?.el === el) current = null;
    },
  };
}
