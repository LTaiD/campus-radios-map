import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let ready;
function init() {
  ready ??= db.execute(
    `CREATE TABLE IF NOT EXISTS station_favorites (
       anon_id    TEXT    NOT NULL,
       station_id TEXT    NOT NULL,
       created_at INTEGER NOT NULL,
       PRIMARY KEY (anon_id, station_id)
     )`
  );
  return ready;
}

async function listFavorites(anon) {
  const rs = await db.execute({
    sql: "SELECT station_id FROM station_favorites WHERE anon_id = ?",
    args: [anon],
  });
  return rs.rows.map((r) => r.station_id);
}

// Toggle by delete-then-insert: the delete's rowsAffected tells us the prior state,
// so no separate SELECT. Returns the new liked state.
async function toggleFavorite(anon, stationId) {
  const del = await db.execute({
    sql: "DELETE FROM station_favorites WHERE anon_id = ? AND station_id = ?",
    args: [anon, stationId],
  });
  if (del.rowsAffected > 0) return false;
  await db.execute({
    sql: "INSERT INTO station_favorites (anon_id, station_id, created_at) VALUES (?, ?, ?)",
    args: [anon, stationId, Date.now()],
  });
  return true;
}

// Every query is scoped to this exact id, so a caller can only ever see or change
// its own rows. Requiring a well-formed v4-style UUID keeps the id-space unguessable
// (no "0", "admin", etc.) — the tenant boundary is the id itself.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  await init();
  const anon = req.headers["x-anon-id"];
  if (typeof anon !== "string" || !UUID_RE.test(anon)) {
    return res.status(400).json({ error: "invalid anon id" });
  }

  if (req.method === "GET") {
    return res.status(200).json({ ids: await listFavorites(anon) });
  }

  if (req.method === "POST") {
    const stationId = req.body?.station_id;
    if (!stationId || typeof stationId !== "string") {
      return res.status(400).json({ error: "missing station_id" });
    }
    return res.status(200).json({ liked: await toggleFavorite(anon, stationId) });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "method not allowed" });
}

// ponytail: round-trip self-check. `node api/favorites.js` with TURSO_* env set.
if (process.argv[1]?.endsWith("favorites.js")) {
  const assert = (await import("node:assert")).default;
  const anon = "selfcheck-" + Date.now();
  const sid = "selfcheck-station";
  await init();
  assert.deepEqual(await listFavorites(anon), []);
  assert.equal(await toggleFavorite(anon, sid), true);
  assert.deepEqual(await listFavorites(anon), [sid]);
  assert.equal(await toggleFavorite(anon, sid), false);
  assert.deepEqual(await listFavorites(anon), []);
  console.log("favorites round-trip OK");
}
