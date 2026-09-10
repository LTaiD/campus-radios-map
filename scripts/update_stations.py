import argparse
import json
import os
import re
import sqlite3
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(REPO, "data", "stations.db")
EXPORT_PATH = os.path.join(REPO, "public", "stations.json")

MIRRORS = [
    "https://de1.api.radio-browser.info",
    "https://nl1.api.radio-browser.info",
    "https://at1.api.radio-browser.info",
]
TAGS = ["college", "university", "student", "campus"]

# stations outside the tag searches, fetched by uuid on every update
ADD_UUIDS = [
    "a707f84a-9ae4-40bf-a176-fcb4cdbc9fbe",  # WMBR (MIT)
    "7bac7da1-3be9-4688-b610-f02041c82aa8",  # WNUR (Northwestern)
    "7f685478-c47f-49d8-861c-1e72c2689f25",  # WVBR (Cornell)
    "cd17491d-80a2-484f-9e33-75039fa9c617",  # UCLA Radio
    "7ed0d055-8856-40da-b747-5b830523083d",  # WGTB (Georgetown)
    "5fd7b40c-cc33-479b-8295-4c79ba76cf08",  # WRCT (Carnegie Mellon)
    "93e94bff-493e-48e3-809d-9a4c9ce6a19b",  # WXTJ (UVA)
    "9ff16372-f398-4ae6-93fd-d0d614ebbc18",  # WCBN (Michigan)
    "a44129d2-def2-4d18-89c5-03f10db95043",  # WNYU
    "9710cbbd-e9d5-4e79-8021-1d9bbb18d665",  # WXYC (UNC)
    "e9f8678d-5d4b-47f8-90e7-0e7b7e560346",  # WRUR (Rochester)
    "2768b05d-96a2-4b74-9f92-c0fa7e979eb5",  # WZBC (Boston College)
    "51f82c18-dc04-44f2-8437-6d734468a257",  # KVRX (UT Austin)
    "71d246d6-cc3b-451f-b1b9-4e421ccc259a",  # WSUM (Wisconsin)
    "32811bda-1a78-40b5-a572-d3e17c055da3",  # Blaze Radio (Arizona State)
    "4741842f-1607-11e9-a80b-52543be04c81",  # KRFH (Cal Poly Humboldt)
    "53d9ee31-2e4f-42b3-b607-fc87be4dc7b4",  # KTRU (Rice)
    "960dd7a5-0601-11e8-ae97-52543be04c81",  # WXPN (Penn)
    "a0b90513-c49a-4f48-884f-0a5d3c452d76",  # WDBM Impact 89FM (Michigan State)
    "0a169853-79c2-4ed5-8d31-0419a8404c5c",  # WPTS (Pittsburgh)
    "695e88fb-6e00-4966-98e9-47752f5be5f3",  # WRSU (Rutgers)
    "87a3cba4-c427-11e9-8502-52543be04c81",  # WHUS (UConn)
    "961dad7d-0601-11e8-ae97-52543be04c81",  # WEGL (Auburn)
    "0c10efeb-eb13-4e2c-af00-c12c43fc9927",  # WUTK (Tennessee)
    "e0982ba5-3a1a-41a0-99a4-38d6cb18cbfa",  # WRFL (Kentucky)
    "03e4e220-dda1-464f-8bba-42e25e144696",  # WUSC (South Carolina)
    "0a320c58-82f7-4fe3-b4c3-0b1dff8d8351",  # KCOU (Missouri)
    "53ef2f0e-5b96-4790-a547-1b57b9d53174",  # KJHK (Kansas)
    "7375ae23-b1f9-45aa-8bbe-f6a26946bacd",  # KRUI (Iowa)
    "9616501c-0601-11e8-ae97-52543be04c81",  # KWVA (Oregon)
    "00cf489b-bdc1-4ff3-8ecb-4cd2a5288820",  # KBVR (Oregon State)
    "0f7467f0-e855-4260-aa59-eb2f695983d5",  # KCSU (Colorado State)
    "503415f7-d850-4b94-879b-4a02ceb735a2",  # KBYU Classical 89 (BYU)
    "e0669706-c87b-468b-9e16-0a344ca63ecf",  # WTUL (Tulane)
    "1d2e078b-63bb-4fa6-a91a-8fbed6e8d69f",  # KLSU (LSU)
    "dedd26db-3215-4de4-8941-64d473ebaa5e",  # WFUV (Fordham)
    "b129a55b-257a-47df-bd1c-3889c43aaec7",  # WLVR (Lehigh)
    "6696ce2b-b4b3-4ec3-9824-2a9a8b783360",  # WRPI (RPI)
    "eac151a6-9d8c-4432-a800-c2580f739ac2",  # WRBB (Northeastern)
    "96441004-0601-11e8-ae97-52543be04c81",  # WKDU (Drexel)
    "ddca360a-00e1-4dc5-88d8-9abd86e77118",  # WRUW (Case Western)
    "ffdb9482-bb13-11e9-acb2-52543be04c81",  # WUSB (Stony Brook)
    "2e151b7e-5b8d-4a12-b901-c21890113e99",  # WHRW (Binghamton)
    "9603908f-75cf-4518-9a14-be0a3e0edc0e",  # WRUV (Vermont)
    "9630450a-0601-11e8-ae97-52543be04c81",  # WUNH (New Hampshire)
    "395b4665-0898-49c5-9898-c6fbc75c5502",  # KSCU (Santa Clara)
    "bb15d622-7137-4269-8f33-71cccb208732",  # KZSC (UC Santa Cruz)
]

SCHEMA = """
CREATE TABLE IF NOT EXISTS stations (
    uuid TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    homepage TEXT,
    favicon TEXT,
    tags TEXT,
    state TEXT,
    lat REAL,
    lng REAL,
    hls INTEGER DEFAULT 0,
    votes INTEGER DEFAULT 0,
    source TEXT NOT NULL,
    updated_at TEXT NOT NULL
)
"""


def db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute(SCHEMA)
    return conn


def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "college-radio-map/1"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def upsert(conn, record, source):
    conn.execute(
        """INSERT INTO stations (uuid, name, url, homepage, favicon, tags, state, lat, lng, hls, votes, source, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(uuid) DO UPDATE SET
             name=excluded.name, url=excluded.url, homepage=excluded.homepage,
             favicon=excluded.favicon, tags=excluded.tags, state=excluded.state,
             lat=excluded.lat, lng=excluded.lng, hls=excluded.hls,
             votes=excluded.votes, updated_at=excluded.updated_at""",
        (
            record["stationuuid"],
            (record.get("name") or "").strip(),
            record.get("url_resolved") or record.get("url") or "",
            record.get("homepage"),
            record.get("favicon"),
            record.get("tags"),
            record.get("state"),
            record.get("geo_lat"),
            record.get("geo_long"),
            1 if record.get("hls") else 0,
            record.get("votes") or 0,
            source,
            time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        ),
    )


def export(conn):
    rows = conn.execute(
        """SELECT uuid, name, url, homepage, favicon, tags, state, lat, lng, hls, votes
           FROM stations WHERE url != '' ORDER BY votes DESC"""
    ).fetchall()
    out = [
        {
            "stationuuid": r[0], "name": r[1], "url_resolved": r[2], "homepage": r[3],
            "favicon": r[4], "tags": r[5], "state": r[6], "geo_lat": r[7],
            "geo_long": r[8], "hls": r[9], "votes": r[10],
        }
        for r in rows
    ]
    with open(EXPORT_PATH, "w") as f:
        json.dump(out, f)
    print(f"exported {len(out)} stations -> {os.path.relpath(EXPORT_PATH, REPO)}")


def cmd_update(conn):
    records = {}
    last_err = None
    for base in MIRRORS:
        try:
            for tag in TAGS:
                url = f"{base}/json/stations/search?countrycode=US&tag={tag}&hidebroken=true&limit=3000"
                for s in fetch_json(url):
                    records[s["stationuuid"]] = s
            adds = f"{base}/json/stations/byuuid?uuids={','.join(ADD_UUIDS)}"
            for s in fetch_json(adds):
                records[s["stationuuid"]] = s
            break
        except Exception as e:
            last_err = e
            records = {}
    if not records:
        raise SystemExit(f"all mirrors failed: {last_err}")
    for s in records.values():
        upsert(conn, s, "radio-browser")
    conn.commit()
    print(f"upserted {len(records)} stations from radio-browser")
    cmd_upgrade(conn)


def _https_works(url):
    candidate = "https://" + url[len("http://"):]
    req = urllib.request.Request(
        candidate, headers={"User-Agent": "college-radio-map/1", "Icy-MetaData": "0"}
    )
    try:
        with urllib.request.urlopen(req, timeout=6) as r:
            ct = (r.headers.get("Content-Type") or "").lower()
            icy = any(k.lower().startswith("icy-") for k in r.headers.keys())
            if not (ct.startswith("audio/") or "mpegurl" in ct or "ogg" in ct or icy):
                return None
            if not r.read(4096):
                return None
        return candidate
    except Exception:
        return None


def cmd_upgrade(conn):
    rows = conn.execute("SELECT uuid, url FROM stations WHERE url LIKE 'http://%'").fetchall()
    if not rows:
        print("no http:// urls to probe")
        return
    with ThreadPoolExecutor(max_workers=16) as pool:
        results = list(pool.map(lambda r: (r[0], _https_works(r[1])), rows))
    upgraded = 0
    for uuid, https_url in results:
        if https_url:
            conn.execute("UPDATE stations SET url = ? WHERE uuid = ?", (https_url, uuid))
            upgraded += 1
    conn.commit()
    print(f"https upgrade: {upgraded}/{len(rows)} http streams verified and upgraded")


def cmd_add(conn, args):
    slug = re.sub(r"[^a-z0-9]+", "-", args.name.lower()).strip("-")
    record = {
        "stationuuid": f"manual-{slug}",
        "name": args.name,
        "url_resolved": args.url,
        "homepage": args.homepage,
        "favicon": args.favicon,
        "tags": args.tags,
        "state": args.state,
        "geo_lat": args.lat,
        "geo_long": args.lng,
        "hls": 0,
        "votes": 0,
    }
    upsert(conn, record, "manual")
    conn.commit()
    print(f"added manual-{slug}")


def cmd_import(conn, path):
    for s in json.load(open(path)):
        upsert(conn, s, "radio-browser")
    conn.commit()
    print(f"imported snapshot {os.path.basename(path)}")


def main():
    p = argparse.ArgumentParser(description="Manage the local station database")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("update", help="fetch from radio-browser and re-export")
    sub.add_parser("upgrade", help="probe https variants of http stream urls")
    sub.add_parser("export", help="re-export public/stations.json from the db")
    imp = sub.add_parser("import-snapshot", help="seed from a raw snapshot json")
    imp.add_argument("path")
    add = sub.add_parser("add", help="add a station manually")
    add.add_argument("--name", required=True)
    add.add_argument("--url", required=True)
    add.add_argument("--homepage")
    add.add_argument("--favicon")
    add.add_argument("--tags", default="college radio")
    add.add_argument("--state")
    add.add_argument("--lat", type=float)
    add.add_argument("--lng", type=float)
    args = p.parse_args()

    conn = db()
    if args.cmd == "update":
        cmd_update(conn)
    elif args.cmd == "upgrade":
        cmd_upgrade(conn)
    elif args.cmd == "import-snapshot":
        cmd_import(conn, args.path)
    elif args.cmd == "add":
        cmd_add(conn, args)
    export(conn)
    counts = dict(conn.execute("SELECT source, COUNT(*) FROM stations GROUP BY source"))
    print("db:", counts)


if __name__ == "__main__":
    main()
