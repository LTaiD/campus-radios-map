import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Star } from "lucide-react";
import { prime } from "../lib/audio.js";

export default function SearchBar({ stations, onPick, likes, onLike }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return stations
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.state || "").toLowerCase().includes(q) ||
          (s.genre || "").toLowerCase().includes(q) ||
          (s.tags || "").toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [stations, query]);

  return (
    <div className="search-wrap" ref={wrapRef}>
      <div className="search-pill">
        <Search size={17} strokeWidth={2.6} />
        <input
          ref={inputRef}
          value={query}
          placeholder="Search stations"
          aria-label="Search stations"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        <kbd>⌘K</kbd>
      </div>
      {open && results.length > 0 && (
        <div className="search-results panel">
          <ul className="search-results-list" role="listbox">
            {results.map((s) => {
              const liked = likes.has(s.id);
              return (
                <li key={s.id} onMouseEnter={() => s.streamUrl && !s.hls && prime(s.streamUrl)}>
                  <button
                    onClick={() => {
                      onPick(s);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <span className="result-label">{s.name}</span>
                    <span className="result-genre">{s.state || s.genre}</span>
                  </button>
                  <button
                    className={`result-like ${liked ? "liked" : ""}`}
                    onClick={() => onLike(s.id)}
                    aria-label={liked ? `Unfavorite ${s.name}` : `Favorite ${s.name}`}
                    aria-pressed={liked}
                  >
                    <Star size={14} strokeWidth={2.6} fill={liked ? "#b5432f" : "none"} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
