import { motion } from "framer-motion";
import { X, ExternalLink } from "lucide-react";
import { STATE_ABBR } from "../lib/api.js";

export default function StationCard({ station, anchor, onClose, onEnter, onLeave }) {
  const desktop = window.innerWidth >= 768;
  const CARD_W = 360, GAP = 24;
  // Open to the LEFT of the dot so the right / up-right stays clear for the next
  // station; fall back to the right only when the dot is too close to the left edge.
  const placeLeft = anchor && anchor.x - GAP - CARD_W >= 12;
  const style =
    desktop && anchor
      ? {
          left: placeLeft
            ? anchor.x - GAP - CARD_W
            : Math.min(anchor.x + GAP, window.innerWidth - CARD_W - 12),
          top: Math.min(Math.max(anchor.y - 120, 76), window.innerHeight - 380),
        }
      : undefined;

  const abbr = STATE_ABBR[station.state] || station.state;
  const location = [station.city, abbr].filter(Boolean).join(", ") || "United States";

  return (
    <motion.aside
      className="station-card panel"
      style={style}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
      aria-label={`${station.name} details`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <button className="card-close btn-ink" onClick={onClose} aria-label="Close station card">
        <X size={16} strokeWidth={3} />
      </button>

      <div className="card-head">
        <img
          src={station.favicon || "/logos/station-placeholder.svg"}
          alt={`${station.name} logo`}
          loading="lazy"
          onError={(e) => (e.currentTarget.src = "/logos/station-placeholder.svg")}
        />
        <div>
          <h2 className="card-callsign">{station.name}</h2>
          <p className="card-city">{location}</p>
          <p className="card-college">{station.college}</p>
        </div>
      </div>

      {station.displayTags.length > 0 && (
        <div className="card-section">
          <div className="tag-row">
            {station.displayTags.map((t) => (
              <span key={t} className="genre-tag">{t}</span>
            ))}
          </div>
        </div>
      )}

      {station.homepage && (
        <div className="card-section">
          <a className="svc-chip home-link" href={station.homepage} target="_blank" rel="noreferrer">
            Station site <ExternalLink size={12} strokeWidth={2.6} />
          </a>
        </div>
      )}
    </motion.aside>
  );
}
