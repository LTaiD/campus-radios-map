# Campus Radio Map

A single-page map of US college & university radio stations, drawn in the spirit
of Bill Watterson's Calvin and Hobbes: brushy India-ink lines (nothing
ruler-straight), soft watercolor state washes over a newsprint ground, and
hand lettering. Click a dot, hear the stream. USA only (Albers projection,
Alaska and Hawaii as insets), viewport locked to US bounds.

**Live:** https://campusradiomap.vercel.app

![Campus Radio Map — a hand-drawn map of the United States with colored state washes and scattered station dots, a search bar up top and a now-playing player at the bottom.](docs/screenshot.jpg)

## Local dev

```sh
npm install
npm run dev      # http://localhost:5173  (static app; /api/* NOT served here)
```

`npm run build` produces a static bundle in `dist/`. The one server-side piece
is the favorites function at `api/favorites.js`, which `vite dev` does **not**
run — to exercise favorites locally, use the Vercel runtime:

```sh
npx vercel env pull .env.local   # pulls TURSO_* for local use
npx vercel dev                   # serves the Vite app + /api/favorites
```

## Where stations come from

Stations are **local-first**: `public/stations.json` (built offline by
`scripts/update_stations.py` from the community
[radio-browser.info](https://www.radio-browser.info/) directory) is fetched on
load. If that file is unreachable, the app falls back to querying radio-browser
mirrors live (`de1` → `nl1` → `at1`).

- Stations with coordinates are plotted exactly; those with only a `state` are
  placed near that state's center with a small deterministic jitter.
- Playback is a plain managed `<audio>` element (`src/lib/audio.js`), with a
  Web-Audio tuning-static bed that masks buffering while a stream connects.
- Refresh the local list with the `update-stations` skill / `scripts/update_stations.py`.

## Favorites & privacy

Starring a station saves it server-side so it persists across reloads, **with no
login**. Identity is an anonymous, random UUID generated in the browser
(`crm-anon` in `localStorage`) and sent as an `x-anon-id` header.

Data isolation (the "row-level security" here):

- Favorites live in a hosted SQLite database ([Turso](https://turso.tech) /
  libSQL). **Every** query in `api/favorites.js` is scoped
  `WHERE anon_id = ?`, so a caller can only ever read or toggle *its own* rows —
  there is no endpoint that lists or returns anyone else's data.
- The Turso URL + auth token live only in server-side env vars
  (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`); the browser never holds a DB
  credential and never talks to Turso directly, only to `/api/favorites`.
- The anon id must be a well-formed UUID, so the id-space is unguessable — you
  can't enumerate other users by passing `admin`, `1`, etc.
- No personal data is stored: just a random id, a station id, and a timestamp —
  no name, email, IP, or account. Clearing browser storage orphans (not exposes)
  a browser's favorites.

## Style notes

- Ink `#26221c`, newsprint `#f7f2e4`, muted wagon-red accent `#b5432f`.
- State fills rotate through pale watercolor washes; dots use a Watterson-toned
  palette hashed from the station id (a 13-point wobbly ink blob).
- Brush wobble comes from SVG `feTurbulence` + `feDisplacementMap` filters; the
  map hover cursor is an inline-SVG hand-drawn hollow dot.
- One hand-lettered font everywhere (Patrick Hand).

## Deploying

Hosted on [Vercel](https://vercel.com): the Vite build is served as static files
and `api/favorites.js` runs as a Node serverless function alongside it (same
origin, no CORS). Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in the project's
environment variables (Production + Preview + Development). Deploy a preview with
`npx vercel`, promote with `npx vercel --prod`.
