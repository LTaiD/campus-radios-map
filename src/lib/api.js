import { feature } from "topojson-client";
import { geoContains } from "d3-geo";
import statesTopo from "us-atlas/states-10m.json";
import { BLOCK, PIN, RENAME, CITY, COLLEGE } from "./curated.js";
// callsign -> institution, precomputed from data/wikipedia-college-stations.json
// (regen: parse the wikitable's Call sign + Institution columns). ~490 entries.
import CALLSIGN_COLLEGE from "./callsignColleges.json";

const MIRRORS = [
  "https://de1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
];

const TAGS = ["college", "university", "student", "campus"];

export const STATE_ABBR = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", "District of Columbia": "DC",
  Florida: "FL", Georgia: "GA", Hawaii: "HI", Idaho: "ID", Illinois: "IL",
  Indiana: "IN", Iowa: "IA", Kansas: "KS", Kentucky: "KY", Louisiana: "LA",
  Maine: "ME", Maryland: "MD", Massachusetts: "MA", Michigan: "MI", Minnesota: "MN",
  Mississippi: "MS", Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI", Wyoming: "WY",
};

const ABBR_STATE = Object.fromEntries(
  Object.entries(STATE_ABBR).map(([name, ab]) => [ab, name])
);

const STATE_CENTER = {
  Alabama: [32.8, -86.8], Alaska: [64.0, -152.2], Arizona: [34.3, -111.7],
  Arkansas: [34.9, -92.4], California: [37.2, -119.3], Colorado: [39.0, -105.5],
  Connecticut: [41.6, -72.7], Delaware: [39.0, -75.5], "District of Columbia": [38.9, -77.0],
  Florida: [28.6, -82.4], Georgia: [32.6, -83.4], Hawaii: [20.3, -156.4],
  Idaho: [44.4, -114.6], Illinois: [40.0, -89.2], Indiana: [39.9, -86.3],
  Iowa: [42.1, -93.5], Kansas: [38.5, -98.4], Kentucky: [37.5, -85.3],
  Louisiana: [31.0, -92.0], Maine: [45.4, -69.2], Maryland: [39.0, -76.8],
  Massachusetts: [42.3, -71.8], Michigan: [44.3, -85.4], Minnesota: [46.3, -94.3],
  Mississippi: [32.7, -89.7], Missouri: [38.4, -92.5], Montana: [47.0, -109.6],
  Nebraska: [41.5, -99.8], Nevada: [39.3, -116.6], "New Hampshire": [43.7, -71.6],
  "New Jersey": [40.2, -74.7], "New Mexico": [34.4, -106.1], "New York": [42.9, -75.5],
  "North Carolina": [35.5, -79.4], "North Dakota": [47.4, -100.5], Ohio: [40.3, -82.8],
  Oklahoma: [35.6, -97.5], Oregon: [43.9, -120.6], Pennsylvania: [40.9, -77.8],
  "Rhode Island": [41.7, -71.6], "South Carolina": [33.9, -80.9], "South Dakota": [44.4, -100.2],
  Tennessee: [35.8, -86.3], Texas: [31.5, -99.4], Utah: [39.3, -111.7],
  Vermont: [44.1, -72.7], Virginia: [37.5, -78.9], Washington: [47.4, -120.5],
  "West Virginia": [38.6, -80.6], Wisconsin: [44.6, -89.7], Wyoming: [43.0, -107.6],
};

const STATE_FEATURES = feature(statesTopo, statesTopo.objects.states).features;
const FEATURE_BY_NAME = new Map(STATE_FEATURES.map((f) => [f.properties.name, f]));

const PALETTE = [
  "#b5432f", "#d98e3a", "#5b7d5a", "#5a7f9c", "#8a5f7a",
  "#7a6a8f", "#b8912f", "#4f7d78", "#a05a6e", "#65744b",
];

const GENRE_WORDS = [
  ["rock", "rock"], ["metal", "metal"], ["punk", "punk"], ["jazz", "jazz"],
  ["classical", "classical"], ["electronic", "electronic"], ["folk", "folk"],
  ["indie", "indie"], ["alternative", "indie"], ["hip hop", "hiphop"], ["hiphop", "hiphop"],
  ["experimental", "experimental"], ["freeform", "freeform"], ["variety", "freeform"],
  ["eclectic", "freeform"], ["news", "news"], ["sports", "sports"],
  ["country", "country"], ["pop", "pop"],
];

const GENERIC_TAGS = new Set([
  "college radio", "college", "university radio", "university", "student radio",
  "student", "campus radio", "campus", "community radio", "radio", "non-commercial",
  "noncommercial", "public radio", "fm",
]);

const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

const titleCase = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

function stateAt(lat, lng) {
  for (const f of STATE_FEATURES) {
    if (geoContains(f, [lng, lat])) return f.properties.name;
  }
  return null;
}

function normalizeState(raw) {
  const s = (raw || "").trim();
  if (!s) return null;
  if (STATE_CENTER[s]) return s;
  const title = titleCase(s);
  if (STATE_CENTER[title]) return title;
  const abbr = s.toUpperCase().match(/\b(A[KLRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY])\b/);
  if (abbr && ABBR_STATE[abbr[1]]) return ABBR_STATE[abbr[1]];
  for (const name of Object.keys(STATE_CENTER)) {
    if (title.includes(name)) return name;
  }
  return null;
}

function jitterInState(uuid, state) {
  const f = FEATURE_BY_NAME.get(state);
  const [clat, clng] = STATE_CENTER[state];
  for (let k = 0; k < 24; k++) {
    const shrink = 1 - k / 24;
    const h = hash(uuid + k);
    const lat = clat + (((h % 100) - 50) / 100) * 1.4 * shrink;
    const lng = clng + ((((h >> 7) % 100) - 50) / 100) * 1.8 * shrink;
    if (!f || geoContains(f, [lng, lat])) return [lat, lng];
  }
  return [clat, clng];
}

const CALLSIGN = /^[KW][A-Za-z]{2,3}(?:[-\s]?(?:FM|AM|LP|HD\d))?$/i;
const PLACE_SUFFIX = /\b(heights|station|park|village|springs|falls|beach|grove|hills)\b/i;
// a school phrase ending in University/College/Institute, ignoring callsign/frequency noise
const SCHOOL = /([A-Z][A-Za-z.'&]+(?:\s+[A-Za-z.'&]+){0,3}\s(?:University|College|Institute))/;

function parsePlace(s, state, name) {
  const tags = (s.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
  const abbr = state ? STATE_ABBR[state] : null;
  let college = null;
  let city = null;
  const display = [];

  for (const tag of tags) {
    const lo = tag.toLowerCase();
    if (state && (lo === state.toLowerCase() || (abbr && lo === abbr.toLowerCase()))) continue;
    if (STATE_CENTER[titleCase(tag)]) continue;
    const isEdu =
      !GENERIC_TAGS.has(lo) && /\b(university|college|institute|polytechnic)\b/i.test(tag);
    if (isEdu && !PLACE_SUFFIX.test(tag)) {
      if (!college) college = titleCase(tag);
      continue;
    }
    const isGenre = GENRE_WORDS.some(([w]) => lo.includes(w));
    const isCallsign = CALLSIGN.test(tag) || /^[A-Z0-9]{2,5}$/.test(tag);
    if (!city && !isGenre && !isCallsign && !GENERIC_TAGS.has(lo) && name.toLowerCase().includes(lo)) {
      city = titleCase(tag);
      continue;
    }
    display.push(tag);
  }

  if (!city) {
    const m = name.match(/([A-Z][A-Za-z .']+),\s*([A-Z]{2})\b/);
    if (m && ABBR_STATE[m[2]] && !CALLSIGN.test(m[1].trim())) city = m[1].trim();
  }
  if (!college) {
    const m = name.match(SCHOOL);
    if (m) college = m[1].trim().replace(/^(FM|AM|HD\d|LP)\s+/i, "");
  }
  return { city, college, displayTags: display.slice(0, 6) };
}

// Leading K/W callsign in the station name -> its school, via the wiki table.
function collegeFromCallsign(name) {
  const m = name.toUpperCase().match(/\b([KW][A-Z]{2,3})\b/);
  return m ? CALLSIGN_COLLEGE[m[1]] || null : null;
}

function faviconFor(homepage) {
  if (!homepage) return null;
  try {
    return `https://www.google.com/s2/favicons?sz=128&domain=${new URL(homepage).hostname}`;
  } catch {
    return null;
  }
}

function toStation(s) {
  if (BLOCK.has(s.stationuuid)) return null;
  const name = RENAME[s.stationuuid] || s.name.trim();
  const pin = PIN[s.stationuuid];
  let lat = pin ? pin[0] : s.geo_lat;
  let lng = pin ? pin[1] : s.geo_long;
  let approx = false;

  let state = lat != null && lng != null ? stateAt(lat, lng) : null;
  if (!state) state = normalizeState(s.state);

  if (lat == null || lng == null) {
    if (!state) return null;
    [lat, lng] = jitterInState(s.stationuuid, state);
    approx = true;
  }
  if (lat < 17 || lat > 72 || lng < -180 || lng > -64) return null;

  const tags = (s.tags || "").toLowerCase();
  let genre = "college";
  for (const [word, g] of GENRE_WORDS) {
    if (tags.includes(word)) {
      genre = g;
      break;
    }
  }
  const place = parsePlace(s, state, name);
  return {
    id: s.stationuuid,
    name,
    lat,
    lng,
    approx,
    state,
    city: CITY[s.stationuuid] || place.city,
    // curated override > name regex > callsign lookup > honest generic.
    // ponytail: unidentifiable stations show "College radio" rather than a
    // fabricated school; upgrade = hand-map their callsign in curated.COLLEGE.
    college:
      COLLEGE[s.stationuuid] || place.college || collegeFromCallsign(name) || "College radio",
    displayTags: place.displayTags,
    streamUrl: s.url_resolved,
    hls: !!s.hls || /\.m3u8($|\?)/.test(s.url_resolved || ""),
    favicon: s.favicon || faviconFor(s.homepage),
    homepage: s.homepage || null,
    tags: s.tags || "",
    genre,
    color: PALETTE[hash(s.stationuuid) % PALETTE.length],
    votes: s.votes || 0,
  };
}

async function query(base, tag) {
  const res = await fetch(
    `${base}/json/stations/search?countrycode=US&tag=${tag}&hidebroken=true&limit=3000`
  );
  if (!res.ok) throw new Error(`${res.status} from ${base}`);
  return res.json();
}

function spreadOverlaps(stations) {
  const buckets = new Map();
  for (const s of stations) {
    const key = `${Math.round(s.lat / 0.012)}:${Math.round(s.lng / 0.012)}`;
    (buckets.get(key) || buckets.set(key, []).get(key)).push(s);
  }
  for (const group of buckets.values()) {
    if (group.length < 2) continue;
    const clat = group.reduce((a, s) => a + s.lat, 0) / group.length;
    const clng = group.reduce((a, s) => a + s.lng, 0) / group.length;
    const feat = FEATURE_BY_NAME.get(group[0].state);
    group.forEach((s, k) => {
      const angle = (k / group.length) * 2 * Math.PI + (hash(s.id) % 100) / 100;
      for (let r = 1; r <= 4; r++) {
        const scale = 1 / 2 ** (r - 1);
        const lat = clat + Math.sin(angle) * 0.03 * scale;
        const lng = clng + Math.cos(angle) * 0.045 * scale;
        if (!feat || geoContains(feat, [lng, lat])) {
          s.lat = lat;
          s.lng = lng;
          return;
        }
      }
    });
  }
  return stations;
}

const materialize = (records) =>
  spreadOverlaps(records.map(toStation).filter(Boolean)).sort((a, b) => b.votes - a.votes);

export async function getStations() {
  try {
    const res = await fetch("/stations.json");
    if (res.ok) {
      const stations = materialize(await res.json());
      if (stations.length) return stations;
    }
  } catch { /* fall through to the live directory */ }

  let lastErr;
  for (const base of MIRRORS) {
    try {
      const results = await Promise.all(TAGS.map((t) => query(base, t)));
      const seen = new Map();
      for (const s of results.flat()) seen.set(s.stationuuid, s);
      return materialize([...seen.values()]);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

export function anonId() {
  let id = localStorage.getItem("crm-anon");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("crm-anon", id);
  }
  return id;
}

export async function getFavorites() {
  const res = await fetch("/api/favorites", { headers: { "x-anon-id": anonId() } });
  if (!res.ok) throw new Error(`favorites ${res.status}`);
  const { ids } = await res.json();
  return new Set(ids);
}

export async function toggleFavorite(stationId) {
  const res = await fetch("/api/favorites", {
    method: "POST",
    headers: { "content-type": "application/json", "x-anon-id": anonId() },
    body: JSON.stringify({ station_id: stationId }),
  });
  if (!res.ok) throw new Error(`favorites ${res.status}`);
  const { liked } = await res.json();
  return liked;
}

export function countClick(id) {
  if (id.startsWith("manual-")) return;
  for (const base of MIRRORS) {
    fetch(`${base}/json/url/${id}`).catch(() => {});
    break;
  }
}
