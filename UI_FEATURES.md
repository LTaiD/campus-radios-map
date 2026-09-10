# College Radio Map — UI Features

A single-page app: an interactive US map of college radio stations with a
persistent player, search, favorites, and live song identification.

## Map
- Full-screen interactive US map; pan and zoom (1x-8x), clamped to map bounds.
- Each station is a clickable dot at its geographic coordinates.
- Click a dot -> tune in to that station and open its station card.
- Hover a dot -> preview the station card (no autoplay) and a tooltip with the station name.
- Hover a state -> tooltip with the state name and a subtle highlight.
- Selected dot is enlarged; hovered dot slightly enlarged.
- Keyboard: Enter on a focused dot selects it.

## Global controls & state
- Station data loads on start; an error banner shows if the directory can't be reached.
- Favorites persist across sessions (localStorage).
- Shuffle: jump to a random station.
- Locate: recenter the map on the current station.
- Spacebar toggles play/pause - but only when not typing in a search field or on a button.

## Search
- Text search across station name, state, genre, and tags.
- Cmd/Ctrl+K focuses search; Esc closes; clicking outside closes.
- Dropdown of up to 40 results, each showing the station name and its state (or genre).
- Per-result favorite (heart) toggle.
- Hovering a result pre-buffers its stream for faster start.
- Clicking a result tunes in and recenters the map on the station.

## Player (persistent bottom bar)
- Always-visible now-playing bar; empty-state prompt when nothing is selected.
- Play/pause toggle with a loading state, a LIVE indicator, and a live clock.
- Station logo/artwork (falls back to identified-song artwork when available).
- Station-name button opens the station card.
- Volume control via a popover slider.
- Favorite, Locate, and Shuffle buttons.
- Status messages: "Tuning in...", "On Air", "Stream unavailable".

### Song identification
- "Identify song" button fingerprints the live stream (Shazam-style).
- On a match: shows song title, artist, and cover artwork, plus Apple Music and Spotify links.
- Re-identify / refresh button to check again.
- Freshness label ("now" / "Xm ago"); after ~4 minutes it dims to "song may have changed".
- On no match: "Couldn't identify the song" with a "Try again" option.

## Station card
- Popup anchored near the dot (desktop) or centered (mobile).
- Shows station logo, callsign/name, location (City, State abbrev.), and college name.
- Genre/tag chips.
- Link out to the station's homepage.
- Close button; stays open when the mouse moves from the dot onto the card.

## Corner panels
- Favorites panel: list of favorited stations; click one to tune in; empty-state message.
- FAQ modal (placeholder - "Coming soon").
- Tooltips on the icon buttons.

## Cross-cutting
- Tooltips attached to icon buttons (Play/Pause, Favorite, Locate, Shuffle, Volume, Favorites, FAQ).
- Tuning-static audio masking plays while a stream buffers.
