import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, HelpCircle, X } from "lucide-react";

const FAQS = [
  {
    q: "What is this?",
    a: "A hand-drawn map of college and university radio stations across the United States. Tap any dot to tune in and listen live in your browser.",
  },
  {
    q: "How do I listen to a station?",
    a: "Click on a dot or search by name, area, or university/college. Then, toggle the audio in the media player at the bottom.",
  },
  {
    q: "How do I save my favorites?",
    a: "Tap the star on the player or a search result to favorite it. Your favorites live in the star panel in the corner, saved to a list tied to this browser.",
  },
  {
    q: "A station won't play. What's wrong?",
    a: "Streams are hosted by the stations themselves, so some go offline, change URLs, or block outside players. Try another station, or use the station website link to listen there.",
  },
];

export default function Corner({ stations, likes, onPick }) {
  const [view, setView] = useState(null);
  const favs = stations.filter((s) => likes.has(s.id));

  return (
    <>
      <div className="corner">
        <button
          className="btn-ink icon-btn corner-btn"
          aria-label="Favorited stations"
          aria-pressed={view === "favs"}
          data-tip="Favorites"
          onClick={() => setView((v) => (v === "favs" ? null : "favs"))}
        >
          <Star size={19} strokeWidth={2.6} />
        </button>
        <button
          className="btn-ink icon-btn corner-btn"
          aria-label="FAQ"
          aria-pressed={view === "faq"}
          data-tip="FAQ"
          onClick={() => setView((v) => (v === "faq" ? null : "faq"))}
        >
          <HelpCircle size={19} strokeWidth={2.6} />
        </button>
      </div>

      <AnimatePresence>
        {view === "favs" && (
          <motion.aside
            className="fav-panel panel"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            aria-label="Favorited stations"
          >
            <div className="fav-head">
              <h2>Favorites</h2>
              <button className="card-close btn-ink" onClick={() => setView(null)} aria-label="Close favorites">
                <X size={15} strokeWidth={3} />
              </button>
            </div>
            {favs.length === 0 ? (
              <p className="fav-empty">No favorited stations yet. Tap the star on a station to save it here.</p>
            ) : (
              <ul className="fav-list">
                {favs.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => {
                        onPick(s);
                        setView(null);
                      }}
                    >
                      <span className="fav-name">{s.name}</span>
                      <span className="fav-state">{s.state || ""}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {view === "faq" && (
          <motion.div
            className="faq-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setView(null)}
          >
            <motion.div
              className="faq-modal panel"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Frequently asked questions"
            >
              <button className="card-close btn-ink" onClick={() => setView(null)} aria-label="Close FAQ">
                <X size={16} strokeWidth={3} />
              </button>
              <h2 className="faq-title">FAQ</h2>
              <dl className="faq-list">
                {FAQS.map(({ q, a }) => (
                  <div className="faq-item" key={q}>
                    <dt className="faq-q">{q}</dt>
                    <dd className="faq-a">{a}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
