import { useCallback, useEffect, useRef, useState } from "react";
import { getStations, getFavorites, toggleFavorite } from "./lib/api.js";
import { prime } from "./lib/audio.js";
import MapChart from "./components/MapChart.jsx";
import SearchBar from "./components/SearchBar.jsx";
import StationCard from "./components/StationCard.jsx";
import Player from "./components/Player.jsx";
import Corner from "./components/Corner.jsx";

const HOME = { coordinates: [-96.9, 38.6], zoom: 0.9 };

export default function App() {
  const [stations, setStations] = useState([]);
  const [loadError, setLoadError] = useState(false);
  const [station, setStation] = useState(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const [position, setPosition] = useState(HOME);
  const [preview, setPreview] = useState(null);
  const previewTimer = useRef(0);
  const [likes, setLikes] = useState(new Set());

  useEffect(() => {
    getStations().then(setStations).catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    getFavorites().then(setLikes).catch(() => {});
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Tab" && e.preventDefault();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const select = useCallback((s) => {
    clearTimeout(previewTimer.current);
    setPreview(null);
    setStation(s);
    setCardOpen(true);
  }, []);

  const previewStart = useCallback((s, at) => {
    clearTimeout(previewTimer.current);
    setPreview({ station: s, anchor: at });
    if (s.streamUrl && !s.hls) prime(s.streamUrl);
  }, []);

  const previewEnd = useCallback(() => {
    clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => setPreview(null), 350);
  }, []);

  function previewHold() {
    clearTimeout(previewTimer.current);
  }

  function tuneTo(s) {
    select(s);
    setPosition((p) => ({ coordinates: [s.lng, s.lat], zoom: p.zoom }));
  }

  function locate() {
    if (station) setPosition((p) => ({ coordinates: [station.lng, station.lat], zoom: p.zoom }));
  }

  function shuffle() {
    if (!stations.length) return;
    tuneTo(stations[Math.floor(Math.random() * stations.length)]);
  }

  function toggleLike(id) {
    const flip = (prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    };
    setLikes(flip);
    toggleFavorite(id).catch(() => setLikes(flip)); // revert on failure
  }

  return (
    <div className="app-shell">
      <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
        {/* ponytail: low scale (< border width) + fewer octaves + wide region kills the
            aliased tearing; keeps a soft long-wavelength wobble. linearRGB renders smoother. */}
        <filter id="brush" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="linearRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
        </filter>
        <filter id="brush-sm" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="linearRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="0.9" />
        </filter>
      </svg>

      <MapChart
        stations={stations}
        selectedId={station?.id}
        onSelect={select}
        position={position}
        onMove={setPosition}
        onAnchor={setAnchor}
        onPreview={previewStart}
        onPreviewLeave={previewEnd}
        doodle={true}
      />

      <header className="topbar">
        <h1 className="app-title">Campus Radios</h1>
        <SearchBar stations={stations} onPick={tuneTo} likes={likes} onLike={toggleLike} />
        {loadError &&<p className="load-error panel">Couldn't reach the radio directory — try a refresh.</p>}
      </header>

      {preview && preview.station.id !== station?.id ? (
        <StationCard
          station={preview.station}
          anchor={preview.anchor}
          onClose={() => setPreview(null)}
          onEnter={previewHold}
          onLeave={previewEnd}
        />
      ) : (
        cardOpen && station && (
          <>
            <div className="card-backdrop" onClick={() => setCardOpen(false)} />
            <StationCard station={station} anchor={anchor} onClose={() => setCardOpen(false)} />
          </>
        )
      )}

      <Player
        station={station}
        liked={station ? likes.has(station.id) : false}
        onLike={() => station && toggleLike(station.id)}
        onLocate={locate}
        onShuffle={shuffle}
        onOpenCard={() => setCardOpen(true)}
      />

      <Corner stations={stations} likes={likes} onPick={tuneTo} />
    </div>
  );
}
