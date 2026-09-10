---
name: update-stations
description: Refresh the local station database from the radio-browser API and re-export public/stations.json. Use when the user asks to update, refresh, or sync stations.
---

# Update stations

The station directory lives in `data/stations.db` (SQLite). The app never calls
the radio-browser API at runtime — it loads `public/stations.json`, which is
exported from the database.

## Steps

1. Run from the project root:

   ```bash
   python3 scripts/update_stations.py update
   ```

   This fetches all US stations tagged college/university/student/campus from
   radio-browser (with mirror failover), plus the pinned `ADD_UUIDS` list at the
   top of the script, upserts them into the database (manual rows are never
   touched), and re-exports `public/stations.json`.

2. Report the printed counts (upserted, exported, per-source totals) to the user.

3. If `dist/` exists and the user is serving the built app, remind them the
   export lands in `public/`, so a `npm run build` is needed before the built
   copy picks it up. The Vite dev server serves `public/` directly — no rebuild.

## Manual station entry

```bash
python3 scripts/update_stations.py add --name "WXYZ 90.1 - Example University" \
  --url "https://example.edu/stream" --homepage "https://example.edu" \
  --state "Ohio" --lat 40.0 --lng -83.0 --tags "college radio,columbus,ohio"
```

Verify the stream plays before adding (curl it and check for an audio
Content-Type). Curation of what the app shows (blocklist, campus pins, renames)
stays in `src/lib/curated.js`, keyed by station uuid.

## Never

- Never delete rows without the user asking; blocking a bad station belongs in
  `BLOCK` in `src/lib/curated.js`, not in the database.
- Never commit or push anything.
