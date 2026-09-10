import json
import os
import sqlite3
import time
import urllib.parse
import urllib.request

BASE = "https://de1.api.radio-browser.info"
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(REPO, "data")

# (school, search terms, campus lat, campus lng)
SCHOOLS = [
    ("Princeton", ["WPRB"], 40.3487, -74.6593),
    ("MIT", ["WMBR"], 42.3592, -71.0935),
    ("Harvard", ["WHRB"], 42.3736, -71.1190),
    ("Stanford", ["KZSU"], 37.4275, -122.1697),
    ("Yale", ["WYBC", "Yale"], 41.3163, -72.9223),
    ("UChicago", ["WHPK"], 41.7886, -87.5987),
    ("Johns Hopkins", ["WJHU", "Hopkins"], 39.3299, -76.6205),
    ("UPenn", ["WQHS", "WXPN 88.5"], 39.9522, -75.1932),
    ("Duke", ["WXDU"], 36.0014, -78.9382),
    ("Northwestern", ["WNUR"], 42.0565, -87.6753),
    ("Dartmouth", ["WFRD", "WDCR", "Dartmouth"], 43.7044, -72.2887),
    ("Brown", ["WBRU", "Brown Student Radio"], 41.8268, -71.4025),
    ("Vanderbilt", ["WRVU", "Vanderbilt"], 36.1447, -86.8027),
    ("Rice", ["Rice University Radio", "KTRU"], 29.7174, -95.4018),
    ("WashU StL", ["KWUR"], 38.6488, -90.3108),
    ("Cornell", ["WVBR"], 42.4534, -76.4735),
    ("Columbia", ["WKCR"], 40.8075, -73.9626),
    ("Notre Dame", ["WVFI", "WSND"], 41.7002, -86.2379),
    ("UCLA", ["UCLA Radio"], 34.0689, -118.4452),
    ("Georgetown", ["WGTB"], 38.9076, -77.0723),
    ("CMU", ["WRCT"], 40.4433, -79.9436),
    ("Emory", ["WMRE", "Emory"], 33.7925, -84.3240),
    ("UVA", ["WXTJ", "WTJU"], 38.0336, -78.5080),
    ("USC", ["KXSC", "Trojan radio"], 34.0224, -118.2851),
    ("Michigan", ["WCBN"], 42.2780, -83.7382),
    ("NYU", ["WNYU"], 40.7295, -73.9965),
    ("UNC", ["WXYC"], 35.9049, -79.0469),
    ("Wake Forest", ["WAKE Radio", "Wake"], 36.1354, -80.2765),
    ("Tufts", ["WMFO"], 42.4075, -71.1190),
    ("UCSB", ["KCSB"], 34.4140, -119.8489),
    ("Rochester", ["WRUR"], 43.1284, -77.6285),
    ("Boston College", ["WZBC"], 42.3355, -71.1685),
    ("UCSD", ["KSDT"], 32.8794, -117.2310),
    ("UC Irvine", ["KUCI"], 33.6405, -117.8443),
    ("UC Davis", ["KDVS"], 38.5382, -121.7617),
    ("Georgia Tech", ["WREK"], 33.7756, -84.3963),
    ("UT Austin", ["KVRX"], 30.2849, -97.7341),
    ("Wisconsin", ["WSUM"], 43.0766, -89.4125),
    ("UIUC", ["WPGU"], 40.1020, -88.2272),
    ("Boston University", ["WTBU"], 42.3505, -71.1054),
    ("Ohio State", ["scarlet radio", "OHIO.FM", "Ohio State"], 40.0067, -83.0305),
    ("Purdue", ["WCCR Purdue", "Purdue"], 40.4237, -86.9212),
    ("Maryland", ["WMUC"], 38.9869, -76.9426),
    ("Georgia", ["WUOG"], 33.9480, -83.3773),
    ("Florida", ["WRUF"], 29.6516, -82.3248),
    ("Florida State", ["WVFS", "V89"], 30.4419, -84.2985),
    ("Washington", ["Rainy Dawg", "Rainydawg"], 47.6553, -122.3035),
    ("Texas A&M", ["KANM"], 30.6188, -96.3365),
    ("Arizona", ["KAMP"], 32.2319, -110.9501),
    ("Arizona State", ["Blaze Radio", "The Blaze radio"], 33.4242, -111.9281),
    ("Howard", ["WHBC", "WHUR-HD3"], 38.9227, -77.0194),
    ("Caltech", ["Caltech"], 34.1377, -118.1253),
    ("Michigan State", ["WDBM", "Impact 89"], 42.7018, -84.4822),
    ("Penn State", ["The Lion 90.7", "WKPS"], 40.7982, -77.8599),
    ("Pittsburgh", ["WPTS"], 40.4444, -79.9608),
    ("Rutgers", ["WRSU"], 40.5008, -74.4474),
    ("Indiana", ["WIUX"], 39.1682, -86.5230),
    ("UMass Amherst", ["WMUA"], 42.3868, -72.5301),
    ("UConn", ["WHUS"], 41.8077, -72.2540),
    ("George Washington", ["WRGW"], 38.8997, -77.0486),
    ("Syracuse", ["WERW", "WJPZ"], 43.0392, -76.1351),
    ("Miami FL", ["WVUM"], 25.7215, -80.2764),
    ("Clemson", ["WSBF"], 34.6834, -82.8374),
    ("Auburn", ["WEGL"], 32.6030, -85.4873),
    ("Alabama", ["WVUA", "Capstone"], 33.2140, -87.5391),
    ("Tennessee", ["WUTK"], 35.9544, -83.9295),
    ("Kentucky", ["WRFL"], 38.0382, -84.5054),
    ("South Carolina", ["WUSC"], 33.9937, -81.0299),
    ("Missouri", ["KCOU"], 38.9404, -92.3277),
    ("Kansas", ["KJHK"], 38.9543, -95.2558),
    ("Iowa", ["KRUI"], 41.6611, -91.5302),
    ("Oregon", ["KWVA"], 44.0448, -123.0726),
    ("Oregon State", ["KBVR"], 44.5638, -123.2794),
    ("Colorado", ["KVCU", "Radio 1190"], 40.0076, -105.2659),
    ("Colorado State", ["KCSU"], 40.5734, -105.0865),
    ("Utah", ["KUTE", "K-UTE"], 40.7649, -111.8421),
    ("BYU", ["BYU Radio", "BYU"], 40.2518, -111.6493),
    ("TCU", ["KTCU"], 32.7096, -97.3629),
    ("SMU", ["SMU radio"], 32.8412, -96.7845),
    ("Baylor", ["Baylor radio"], 31.5489, -97.1143),
    ("Tulane", ["WTUL"], 29.9346, -90.1223),
    ("LSU", ["KLSU"], 30.4133, -91.1800),
    ("Fordham", ["WFUV"], 40.8614, -73.8855),
    ("Villanova", ["WXVU"], 40.0357, -75.3413),
    ("Lehigh", ["WLVR"], 40.6069, -75.3783),
    ("RPI", ["WRPI"], 42.7298, -73.6789),
    ("Stevens", ["WCPR"], 40.7448, -74.0256),
    ("Northeastern", ["WRBB"], 42.3398, -71.0892),
    ("Brandeis", ["WBRS"], 42.3655, -71.2597),
    ("Marquette", ["Marquette radio", "WMUR Marquette"], 43.0389, -87.9284),
    ("Drexel", ["WKDU"], 39.9566, -75.1899),
    ("Temple", ["WHIP Temple", "WHIP radio"], 39.9812, -75.1554),
    ("Delaware", ["WVUD"], 39.6837, -75.7497),
    ("American", ["WVAU"], 38.9375, -77.0866),
    ("Case Western", ["WRUW"], 41.5043, -81.6084),
    ("Cincinnati", ["Bearcast", "Cincinnati radio"], 39.1329, -84.5150),
    ("Buffalo", ["WRUB"], 43.0008, -78.7890),
    ("Stony Brook", ["WUSB"], 40.9126, -73.1234),
    ("Binghamton", ["WHRW"], 42.0888, -75.9686),
    ("Vermont", ["WRUV"], 44.4779, -73.1965),
    ("New Hampshire", ["WUNH"], 43.1389, -70.9370),
    ("Rhode Island", ["WRIU"], 41.4807, -71.5258),
    ("Santa Clara", ["KSCU"], 37.3496, -121.9390),
    ("San Diego State", ["KCR College Radio", "KCR"], 32.7757, -117.0719),
    ("UC Santa Cruz", ["KZSC"], 36.9916, -122.0583),
    ("UC Riverside", ["KUCR"], 33.9737, -117.3281),
    ("Virginia Tech", ["WUVT"], 37.2296, -80.4139),
    ("Minnesota", ["Radio K"], 44.9723, -93.2408),
    ("UC Berkeley", ["KALX"], 37.8719, -122.2585),
]


def have_names():
    conn = sqlite3.connect(os.path.join(DATA, "stations.db"))
    rows = conn.execute("SELECT uuid, name FROM stations").fetchall()
    conn.close()
    return {r[0] for r in rows}, " | ".join(r[1].lower() for r in rows)


def search(term):
    q = urllib.parse.quote(term)
    url = f"{BASE}/json/stations/search?countrycode=US&name={q}&hidebroken=true&limit=8"
    req = urllib.request.Request(url, headers={"User-Agent": "college-radio-map-audit/1"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def main():
    have_uuids, have_blob = have_names()
    found = []
    missing = []
    for school, terms, lat, lng in SCHOOLS:
        covered = any(t.lower() in have_blob for t in terms)
        hits = []
        for t in terms:
            try:
                hits = [h for h in search(t) if h.get("lastcheckok")]
            except Exception as e:
                print(school, t, "ERR", e)
            if hits:
                break
            time.sleep(0.25)
        if hits:
            h = hits[0]
            mark = "HAVE" if (h["stationuuid"] in have_uuids or covered) else "NEW "
            found.append((school, h, lat, lng, mark))
            print(f"{mark} {school:20} {h['name'][:46]:46} {h['stationuuid'][:8]} {h['url_resolved'][:50]}")
        elif covered:
            print(f"HAVE {school:20} (already in db)")
        else:
            missing.append(school)
            print(f"MISS {school}")
        time.sleep(0.25)

    print()
    print("missing:", missing)
    json.dump(
        [
            {"school": sc, "uuid": h["stationuuid"], "name": h["name"], "lat": lat, "lng": lng,
             "geo": [h["geo_lat"], h["geo_long"]], "have": mk == "HAVE", "url": h["url_resolved"]}
            for sc, h, lat, lng, mk in found
        ],
        open(os.path.join(DATA, "t100-schools.json"), "w"), indent=1,
    )


if __name__ == "__main__":
    main()
