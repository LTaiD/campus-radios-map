import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/theme.css";
import "./styles/map.css";
import "./styles/searchbar.css";
import "./styles/player.css";
import "./styles/corner.css";
import "./styles/stationcard.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
