import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Volume2, Star, LocateFixed, Shuffle, Loader2, Radio, ExternalLink,
} from "lucide-react";
import { countClick } from "../lib/api.js";
import { playStream } from "../lib/audio.js";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Player({ station, liked, onLike, onLocate, onShuffle, onOpenCard }) {
  const [status, setStatus] = useState("idle");
  const [volume, setVolume] = useState(0.9);
  const [volOpen, setVolOpen] = useState(false);
  const handleRef = useRef(null);
  const pausedRef = useRef(false);
  const volRef = useRef(null);
  const clock = useClock();

  useEffect(() => {
    if (!station) return;
    pausedRef.current = false;
    setStatus("loading");

    if (!station.streamUrl) {
      setStatus("error");
      return;
    }
    countClick(station.id);
    const handle = playStream(station.streamUrl, volume, {
      onplaying: () => !pausedRef.current && setStatus("playing"),
      onerror: () => setStatus("error"),
    });
    handleRef.current = handle;

    return () => {
      handle.stop();
      handleRef.current = null;
    };
  }, [station?.id]);

  useEffect(() => {
    handleRef.current?.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (!volOpen) return;
    const onDown = (e) => {
      if (volRef.current && !volRef.current.contains(e.target)) setVolOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [volOpen]);

  function toggle() {
    const handle = handleRef.current;
    if (!handle || !station) return;
    if (status === "playing") {
      pausedRef.current = true;
      handle.pause();
      setStatus("paused");
    } else {
      pausedRef.current = false;
      setStatus("loading");
      handle.resume();
    }
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== "Space") return;
      const el = e.target;
      if (
        el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.tagName === "SELECT" ||
        el.tagName === "BUTTON" ||
        el.isContentEditable
      )
        return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!station) {
    return (
      <div className="player panel player-empty">
        <Radio size={20} strokeWidth={2.5} />
        <span>Pick a dot on the map to tune in</span>
        <span className="player-clock">{clock}</span>
      </div>
    );
  }

  const artwork = station.favicon || "/logos/station-placeholder.svg";

  const nameBtn = (cls) => (
    <button className={`np-name ${cls}`} onClick={onOpenCard}>
      {station.name}
    </button>
  );

  function nowPlaying() {
    if (status === "error") {
      return (
        <>
          <strong className="np-title">Stream unavailable</strong>
          {nameBtn("np-station")}
        </>
      );
    }
    const line = status === "loading" ? "Tuning in…" : "On Air";
    return (
      <>
        {nameBtn("np-title")}
        <span className="np-artist np-status">{line}</span>
        {station.homepage && (
          <a
            className="svc-chip np-chip np-goto"
            href={station.homepage}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={12} strokeWidth={2.6} />
            Station website
          </a>
        )}
      </>
    );
  }

  return (
    <div className="player panel">
      <div className="player-left">
        <button className="player-logo" onClick={onOpenCard} aria-label="Open station card">
          <img
            src={artwork}
            alt=""
            loading="lazy"
            onError={(e) => (e.currentTarget.src = "/logos/station-placeholder.svg")}
          />
        </button>
        <div className="player-station">{nowPlaying()}</div>
      </div>

      <button
        className="play-btn"
        onClick={toggle}
        aria-label={status === "playing" ? "Pause" : "Play"}
        data-tip={status === "playing" ? "Pause" : "Play"}
      >
        {status === "loading" ? (
          <Loader2 className="spin" size={26} strokeWidth={3} />
        ) : status === "playing" ? (
          <Pause size={26} strokeWidth={3} fill="currentColor" />
        ) : (
          <Play size={26} strokeWidth={3} fill="currentColor" style={{ marginLeft: 3 }} />
        )}
      </button>

      <div className="player-right">
        <span className={`live-tag ${status === "playing" ? "live-on" : ""}`}>LIVE</span>
        <span className="player-clock">{clock}</span>
        <button
          className={`btn-ink icon-btn ${liked ? "liked" : ""}`}
          onClick={onLike}
          aria-label={liked ? "Unlike station" : "Like station"}
          aria-pressed={liked}
          data-tip={liked ? "Unfavorite" : "Favorite"}
        >
          <Star size={17} strokeWidth={2.6} fill={liked ? "#b5432f" : "none"} />
        </button>
        <button className="btn-ink icon-btn" onClick={onLocate} aria-label="Locate on map" data-tip="Locate">
          <LocateFixed size={17} strokeWidth={2.6} />
        </button>
        <button className="btn-ink icon-btn" onClick={onShuffle} aria-label="Shuffle station" data-tip="Shuffle">
          <Shuffle size={17} strokeWidth={2.6} />
        </button>
        <div className="vol-wrap" ref={volRef}>
          <button
            className="btn-ink icon-btn"
            onClick={() => setVolOpen((v) => !v)}
            aria-label="Volume"
            aria-expanded={volOpen}
            data-tip="Volume"
          >
            <Volume2 size={17} strokeWidth={2.6} />
          </button>
          <AnimatePresence>
            {volOpen && (
              <motion.div
                className="vol-pop panel"
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={volume}
                  aria-label="Volume level"
                  style={{ "--vol": `${volume * 100}%` }}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
