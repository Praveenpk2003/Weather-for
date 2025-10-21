# SkyNow - Architecture, Data Flow, and Feature Guide

This document explains how the app works end-to-end, which APIs are used and why, how each feature fetches and displays data (including the interactive map and historical charts), how location is determined, and how styles respond to data.

---

## 1) High-Level App Flow

- Landing and Features pages (`Home`, `Features`):
  - Search a city OR use current location → fetch current weather → show metrics and quick forecasts.
  - Buttons route to detailed forecast (`/forecast`) and analytics (`/analytics`).
- Detailed Forecast (`/forecast`):
  - Shows current summary, Hourly (24h), 7-Day forecast, Interactive Map, and Meteorological Data.
  - The map supports click-to-view weather anywhere and city search above the map.
- Historical Analytics (`/analytics`):
  - Shows past year daily charts (temperature, precipitation, wind) with summaries.
  - Supports city search and current location.

Routing is in `src/App.jsx` using `react-router-dom`.

---

## 2) Services and APIs

All network logic lives in `src/services/weatherService.js`. The app uses two public providers:

- OpenWeatherMap (OWM) – requires API key (current + 5-day/3-hourly forecast):
  - `GET /data/2.5/weather` → current conditions (temp, humidity, pressure, wind, visibility, description, icon)
  - `GET /data/2.5/forecast` → 5-day forecast in 3-hour intervals (used for hourly summary and to build daily summaries)

- Open‑Meteo – no key required (fallback and archives):
  - Geocoding: `https://geocoding-api.open-meteo.com/v1/search` – city → lat/lon
  - Forecast: `https://api.open-meteo.com/v1/forecast` – current/hourly/daily weather (used when OWM key is missing or as fallback)
  - Archive (ERA5): `https://archive-api.open-meteo.com/v1/era5` – historical daily data (past year) for charts

### Why both?
- OWM: convenient current/forecast with weather icons and familiar fields.
- Open‑Meteo: reliable no‑key fallback and historical archive. Ensures the app works even without an OWM key.

### Key service functions
- Current weather
  - `getCurrentWeatherByCity(city)`
  - `getCurrentWeatherByCoords(lat, lon)`
  - Fallbacks to Open‑Meteo when OWM key is missing/unavailable.
- Forecasts
  - `getForecastByCoords(lat, lon)` (OWM 3-hourly)
  - `getHourlyForecastByCoords(lat, lon)` (24h; OWM or Open‑Meteo fallback)
  - `getSevenDayForecastByCoords(lat, lon)` (daily; OWM build-up or Open‑Meteo fallback)
- Geocoding
  - `getCoordsByCityName(city)` via Open‑Meteo geocoding
- Location
  - `getCurrentLocation()` via browser geolocation
  - `getLocationByIP()` for IP fallback
  - `getCurrentLocationWithFallback()` tries geolocation → IP
- Historical
  - `getHistoricalYearByCoords(lat, lon)` via Open‑Meteo ERA5 archive

---

## 3) Detailed Forecast Page (`/forecast`)

File: `src/pages/DetailedForecast.jsx`

- Loads weather from navigation state (if present) or from new searches/current location.
- Resolves `coords` via `getCoordsByCityName()` when starting from city name.
- Fetches:
  - `getHourlyForecastByCoords` → hourly tiles with temp, humidity, wind, pressure, vis (AM/PM time, ‘Now’ highlight)
  - `getSevenDayForecastByCoords` → day cards with high/low, description, icon, humidity and wind
- Meteorological Data panel derives from the latest hourly item or current weather fallback (pressure, visibility, UV, dew point, cloud cover, wind gust/direction).

### Interactive Map
- Implemented with Leaflet + OpenStreetMap tiles.
- Added via CDN in `public/index.html` (no additional npm install needed).
- Component `LiveMap` (in `DetailedForecast.jsx`):
  - Centers on current coords if available.
  - Search bar above the map uses `getCoordsByCityName()` to recenter and fetch weather for the searched city.
  - Click anywhere on the map → `getCurrentWeatherByCoords(lat, lon)` → add a color‑coded circle marker (blue for cold → red for hot).
  - Popup shows temperature, feels like, humidity, wind, pressure, visibility.

---

## 4) Features Page (`/features`)

File: `src/pages/Features.jsx`

- Search flow: `getCurrentWeatherByCity()` → set `weather` and populate metrics.
- Current location flow: `getCurrentLocationWithFallback()` → `getCurrentWeatherByCoords()`.
- 4‑Day Quick Forecast:
  - Tries OWM `getForecastByCoords()` (3‑hourly) → summarize to next 4 days (high/low, mid description, icon).
  - Fallback to `getSevenDayForecastByCoords()` (Open‑Meteo daily) when OWM fails/missing key.
- Navigation buttons:
  - View More → `/forecast` (passes `weather` state)
  - Explore Forecast → `/forecast`
  - View Analytics → `/analytics`

---

## 5) Historical Analytics Page (`/analytics`)

File: `src/pages/HistoricalAnalytics.jsx`

- Data: `getHistoricalYearByCoords(lat, lon)` (Open‑Meteo ERA5).
- Location: starts with searched city (if provided via route) or uses current location.
- Search bar + Use Current Location button update the charts.
- Charts: ultra‑light SVG line charts (no external chart lib) with labels, month ticks, and hover tooltips.
  - Max Temperature (°C)
  - Min Temperature (°C)
  - Precipitation (mm)
  - Max Wind (km/h)
- Summary cards: Avg Max Temp, Avg Min Temp, Total Precip, Avg Max Wind (12‑month window).

---

## 6) Location Detection and Fallbacks

- Primary: Browser Geolocation API (`navigator.geolocation`).
- Fallback: IP geolocation via `https://ipapi.co/json/` when permission denied or unavailable.
- Reverse geocoding is not required for the app’s flow (we show fetched weather location and the map is centered by coords). Optional reverse lookup is handled in service in limited cases.

---

## 7) Styling and UI Patterns

- TailwindCSS utility classes (configured via `tailwind.config.js` and PostCSS).
- Responsive cards, grids, and buttons.
- Data‑driven styles:
  - Hourly tiles show ‘Now’ badge and 12‑hour AM/PM format.
  - Map markers colored by temperature (`tempToColor` helper).
  - Panels display precise units and capitalize descriptions.

---

## 8) Error Handling and UX

- All async flows set `isLoading` and clear on completion.
- Errors are surfaced to the user with friendly messages and suggestions.
- Service layer prints warnings and uses fallbacks (Open‑Meteo) to keep the app usable without keys.

---

## 9) Environment and Configuration

- OWM API key: set `REACT_APP_WEATHER_API_KEY` in `.env` (see `env.example`).
- Without the key, the app gracefully falls back to Open‑Meteo for current/forecast and uses Open‑Meteo for historical.

---

## 10) How to Export this Document to PDF

- Open this file in your IDE preview or view it in the app repo.
- Or open in a markdown viewer and use your browser’s Print → Save as PDF.
- Alternatively, copy to Google Docs or Word and export as PDF.

---

## 11) Quick Reference – Key Files

- Routing: `src/App.jsx`
- Features page: `src/pages/Features.jsx`
- Detailed forecast: `src/pages/DetailedForecast.jsx`
- Historical analytics: `src/pages/HistoricalAnalytics.jsx`
- Weather services: `src/services/weatherService.js`
- Leaflet CDN: `public/index.html`

---

## 12) Extensibility Ideas

- Swap to npm `leaflet` + `react-leaflet` for richer map layers.
- Add bar charts for precipitation, smoothing for temperature lines, and range selectors.
- Cache recent searches and last viewed city.
- Add air quality (Open‑Meteo/OWM AQ endpoints) to charts and panels.
