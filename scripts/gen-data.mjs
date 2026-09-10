import { mkdirSync, writeFileSync } from "node:fs";

const STATIONS = [
  ["wxyc-unc", "WXYC", "WXYC 89.3 FM", "University of North Carolina at Chapel Hill", "Chapel Hill", "North Carolina", 35.9132, -79.0558, "freeform", "https://audio-mp3.ibiblio.org/wxyc.mp3"],
  ["wknc-ncsu", "WKNC", "WKNC 88.1 FM", "North Carolina State University", "Raleigh", "North Carolina", 35.7847, -78.6821, "rock", "https://streaming.wknc.org/wknc-hd1"],
  ["wuog-uga", "WUOG", "WUOG 90.5 FM", "University of Georgia", "Athens", "Georgia", 33.948, -83.3773, "indie", "https://streams.wuog.org/wuog-high.mp3"],
  ["wrek-gatech", "WREK", "WREK 91.1 FM", "Georgia Institute of Technology", "Atlanta", "Georgia", 33.7756, -84.3963, "electronic", "https://streaming.wrek.org/main/128kb.mp3"],
  ["wras-gsu", "WRAS", "WRAS 88.5 FM", "Georgia State University", "Atlanta", "Georgia", 33.753, -84.3853, "rock", "https://streaming.gsu.edu/wras.mp3"],
  ["wvum-miami", "WVUM", "WVUM 90.5 FM", "University of Miami", "Coral Gables", "Florida", 25.7215, -80.2764, "electronic", "https://stream.wvum.org/listen.mp3"],
  ["wtul-tulane", "WTUL", "WTUL 91.5 FM", "Tulane University", "New Orleans", "Louisiana", 29.9346, -90.1223, "indie", "https://streaming.wtul.fm/wtul.mp3"],
  ["ktru-rice", "KTRU", "KTRU 96.1 FM", "Rice University", "Houston", "Texas", 29.7174, -95.4018, "experimental", "https://streaming.ktru.org/ktru.mp3"],
  ["kvrx-ut", "KVRX", "KVRX 91.7 FM", "University of Texas at Austin", "Austin", "Texas", 30.2849, -97.7341, "indie", "http://tstv-stream.tsm.utexas.edu:8000/kvrx_128"],
  ["kjhk-ku", "KJHK", "KJHK 90.7 FM", "University of Kansas", "Lawrence", "Kansas", 38.9543, -95.2558, "indie", "https://streams.kjhk.org/kjhk.mp3"],
  ["krui-iowa", "KRUI", "KRUI 89.7 FM", "University of Iowa", "Iowa City", "Iowa", 41.6611, -91.5302, "rock", "https://krui-ice.streamguys1.com/live"],
  ["wcbn-umich", "WCBN", "WCBN 88.3 FM", "University of Michigan", "Ann Arbor", "Michigan", 42.278, -83.7382, "freeform", "http://floyd.wcbn.org:8000/wcbn-hd"],
  ["wnur-nu", "WNUR", "WNUR 89.3 FM", "Northwestern University", "Evanston", "Illinois", 42.058, -87.6753, "jazz", "https://streaming.wnur.org/wnur-high"],
  ["wmbr-mit", "WMBR", "WMBR 88.1 FM", "Massachusetts Institute of Technology", "Cambridge", "Massachusetts", 42.3601, -71.0942, "punk", "http://wmbr.org:8000/hi"],
  ["whrb-harvard", "WHRB", "WHRB 95.3 FM", "Harvard University", "Cambridge", "Massachusetts", 42.3736, -71.119, "classical", "https://stream.whrb.org/whrb-mp3"],
  ["wruv-uvm", "WRUV", "WRUV 90.1 FM", "University of Vermont", "Burlington", "Vermont", 44.4779, -73.1965, "folk", "http://icecast.uvm.edu:8005/wruv_fm_128"],
  ["wprb-princeton", "WPRB", "WPRB 103.3 FM", "Princeton University", "Princeton", "New Jersey", 40.3487, -74.6593, "freeform", "https://wprb.streamguys1.com/listen"],
  ["wsou-shu", "WSOU", "WSOU 89.5 FM", "Seton Hall University", "South Orange", "New Jersey", 40.7429, -74.2465, "metal", "https://crystalout.surfernetwork.com:8001/WSOU_MP3"],
  ["wmuc-umd", "WMUC", "WMUC 88.1 FM", "University of Maryland", "College Park", "Maryland", 38.9869, -76.9426, "punk", "https://stream.wmuc.umd.edu/wmuc-high"],
  ["kcsu-csu", "KCSU", "KCSU 90.5 FM", "Colorado State University", "Fort Collins", "Colorado", 40.5734, -105.0865, "indie", "https://streaming.kcsufm.com/kcsu.mp3"],
  ["kdvs-ucd", "KDVS", "KDVS 90.3 FM", "University of California, Davis", "Davis", "California", 38.5449, -121.7405, "freeform", "https://stream.kdvs.org/kdvs.mp3"],
  ["kalx-ucb", "KALX", "KALX 90.7 FM", "University of California, Berkeley", "Berkeley", "California", 37.8719, -122.2585, "freeform", "http://icecast.media.berkeley.edu:8000/kalx-128.mp3"],
  ["kfjc-foothill", "KFJC", "KFJC 89.7 FM", "Foothill College", "Los Altos Hills", "California", 37.3614, -122.1258, "experimental", "http://netcast.kfjc.org/kfjc-128k-mp3"],
  ["kcpr-calpoly", "KCPR", "KCPR 91.3 FM", "California Polytechnic State University", "San Luis Obispo", "California", 35.305, -120.6625, "indie", "https://streaming.kcpr.org/kcpr.mp3"],
  ["kxlu-lmu", "KXLU", "KXLU 88.9 FM", "Loyola Marymount University", "Los Angeles", "California", 33.97, -118.418, "punk", "https://kxlu.streamguys1.com/kxlu-hi"],
  ["kwva-uo", "KWVA", "KWVA 88.1 FM", "University of Oregon", "Eugene", "Oregon", 44.0448, -123.0726, "rock", "https://kwvaradio.uoregon.edu:8443/stream"],
  ["kups-ups", "KUPS", "KUPS 90.1 FM", "University of Puget Sound", "Tacoma", "Washington", 47.2643, -122.4817, "hiphop", "https://stream.kups.net/kups.mp3"],
  ["ksua-uaf", "KSUA", "KSUA 91.5 FM", "University of Alaska Fairbanks", "Fairbanks", "Alaska", 64.8578, -147.8267, "rock", "https://stream.ksuaradio.com/ksua.mp3"],
  ["ktuh-uh", "KTUH", "KTUH 90.1 FM", "University of Hawaii at Manoa", "Honolulu", "Hawaii", 21.2969, -157.8171, "hiphop", "http://ktuh.org:8000/stream"],
];

const root = "/Users/jtaid/VSCodeProjects/college-radio-map/public/data";
mkdirSync(`${root}/station`, { recursive: true });

const index = STATIONS.map(([id, name, callSign, , , , lat, lng, genre]) => ({
  id,
  lat,
  lng,
  label: callSign.replace(" FM", ""),
  genre,
}));
writeFileSync(`${root}/stations-index.json`, JSON.stringify(index, null, 2) + "\n");

for (const [id, stationName, callSign, university, city, state, lat, lng, genre, streamUrl] of STATIONS) {
  const detail = {
    id,
    stationName,
    callSign,
    stationLogo: "/logos/station-placeholder.svg",
    university,
    universityLogo: "/logos/university-placeholder.svg",
    city,
    state,
    lat,
    lng,
    genre,
    streamUrl,
  };
  writeFileSync(`${root}/station/${id}.json`, JSON.stringify(detail, null, 2) + "\n");
}
console.log(`wrote ${STATIONS.length} stations`);
