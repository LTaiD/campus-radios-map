import json
import os
import urllib.request

DATA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

BASE = "https://de1.api.radio-browser.info"
TAGS = ["college", "university", "student", "campus"]

seen = {}
for tag in TAGS:
    url = f"{BASE}/json/stations/search?countrycode=US&tag={tag}&hidebroken=true&limit=3000"
    req = urllib.request.Request(url, headers={"User-Agent": "college-radio-map-audit/1"})
    with urllib.request.urlopen(req, timeout=30) as r:
        for s in json.load(r):
            seen[s["stationuuid"]] = s

out = os.path.join(DATA, "radiobrowser-snapshot.json")
with open(out, "w") as f:
    json.dump(list(seen.values()), f)
print(len(seen), "stations")
