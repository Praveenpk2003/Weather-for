import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  getCoordsByCityName,
  getCurrentLocationWithFallback,
  getHistoricalYearByCoords
} from '../services/weatherService';

const HistoricalAnalytics = () => {
  const location = useLocation();
  const initialCity = location.state?.weather?.location || '';
  const [cityQuery, setCityQuery] = useState(initialCity);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [historical, setHistorical] = useState([]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setIsLoading(true);
        if (initialCity) {
          const gc = await getCoordsByCityName(initialCity);
          const data = await getHistoricalYearByCoords(gc.latitude, gc.longitude);
          setHistorical(data);
        } else {
          const cur = await getCurrentLocationWithFallback();
          const data = await getHistoricalYearByCoords(cur.latitude, cur.longitude);
          setHistorical(data);
        }
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitSearch = async (e) => {
    e.preventDefault();
    const trimmed = (cityQuery || '').trim();
    if (!trimmed) return;
    setIsLoading(true);
    setError(null);
    try {
      const gc = await getCoordsByCityName(trimmed);
      const data = await getHistoricalYearByCoords(gc.latitude, gc.longitude);
      setHistorical(data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onUseCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const cur = await getCurrentLocationWithFallback();
      const data = await getHistoricalYearByCoords(cur.latitude, cur.longitude);
      setHistorical(data);
      if (!cityQuery) {
        // best-effort display; we don't reverse geocode here to keep it simple
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-900 text-xl font-bold">SkyNow</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/features" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">Back to Features</Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Historical Analytics</h1>
          <p className="text-gray-600 mb-4">Past year daily data with easy-to-read charts and summaries.</p>
          <form onSubmit={onSubmitSearch} className="flex flex-col sm:flex-row gap-4 mb-3">
            <input
              type="text"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="Enter city name (e.g., New York, London, Tokyo)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              aria-label="City name"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? 'Loading…' : 'Search'}
            </button>
          </form>
          <button
            type="button"
            onClick={onUseCurrentLocation}
            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v2.05A3.5 3.5 0 1013.95 11H16a1 1 0 100-2h-2.05A3.501 3.501 0 0011 7.05V5z" clipRule="evenodd" />
            </svg>
            {isLoading ? 'Locating…' : 'Use Current Location'}
          </button>
        </div>

        {/* Summary cards */}
        {historical.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard title="Avg Max Temp" value={`${avg(historical.map(h => h.tempMax)).toFixed(1)}°C`} subtitle="Past 12 months" icon="🌡️" />
            <SummaryCard title="Avg Min Temp" value={`${avg(historical.map(h => h.tempMin)).toFixed(1)}°C`} subtitle="Past 12 months" icon="❄️" />
            <SummaryCard title="Total Precip" value={`${sum(historical.map(h => h.precip)).toFixed(1)} mm`} subtitle="Past 12 months" icon="🌧️" />
            <SummaryCard title="Avg Max Wind" value={`${avg(historical.map(h => h.windMax)).toFixed(0)} km/h`} subtitle="Past 12 months" icon="💨" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-6 text-sm">
            {typeof error === 'string' ? error : error?.message || 'Unable to load analytics'}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Max - simple SVG line */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <ChartLine title="Max Temperature (°C)" data={historical.map(d => ({ x: d.date, y: d.tempMax }))} color="#ef4444" units="°C" />
          </div>
          {/* Precipitation Sum */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <ChartLine title="Precipitation (mm)" data={historical.map(d => ({ x: d.date, y: d.precip }))} color="#10b981" units="mm" />
          </div>
          {/* Wind Speed Max */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <ChartLine title="Max Wind Speed (km/h)" data={historical.map(d => ({ x: d.date, y: d.windMax }))} color="#6366f1" units="km/h" />
          </div>
          {/* Temperature Min */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <ChartLine title="Min Temperature (°C)" data={historical.map(d => ({ x: d.date, y: d.tempMin }))} color="#0ea5e9" units="°C" />
          </div>
        </div>
      </main>
    </div>
  );
};

// Helpers
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const sum = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) : 0);
const formatMonth = (dateStr) => {
  try { return new Date(dateStr).toLocaleDateString('en-US', { month: 'short' }); } catch { return ''; }
};

// Very lightweight, more friendly SVG line chart with labels and tooltip
const ChartLine = ({ title = '', data, color = '#3b82f6', units = '' }) => {
  const width = 600;
  const height = 200;
  const padding = 24;
  const contentW = width - padding * 2;
  const contentH = height - padding * 2;
  const [hover, setHover] = useState(null); // {i,x,y,value,date}

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No data
      </div>
    );
  }

  const ys = data.map(d => d.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeY = maxY - minY || 1;

  const stepX = contentW / Math.max(1, data.length - 1);
  const points = data.map((d, i) => {
    const x = padding + i * stepX;
    const y = padding + contentH - ((d.y - minY) / rangeY) * contentH;
    return `${x},${y}`;
  }).join(' ');

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left - padding;
    const idx = Math.max(0, Math.min(data.length - 1, Math.round(relX / stepX)));
    const x = padding + idx * stepX;
    const y = padding + contentH - ((data[idx].y - minY) / rangeY) * contentH;
    setHover({ i: idx, x, y, value: data[idx].y, date: data[idx].x });
  };
  const handleLeave = () => setHover(null);

  return (
    <div>
      {title && <div className="text-sm font-medium text-gray-800 mb-2">{title}</div>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48" onMouseMove={handleMove} onMouseLeave={handleLeave}>
        <rect x="0" y="0" width={width} height={height} rx="8" fill="#f8fafc" />
        {/* Y axis labels */}
        <text x={4} y={padding + 10} className="fill-gray-400" fontSize="10">{`${maxY} ${units}`}</text>
        <text x={4} y={padding + contentH} className="fill-gray-400" fontSize="10">{`${minY} ${units}`}</text>
        {/* X axis month ticks: start, mid, end */}
        <text x={padding} y={height - 6} className="fill-gray-400" fontSize="10">{formatMonth(data[0].x)}</text>
        <text x={padding + contentW / 2} y={height - 6} className="fill-gray-400" fontSize="10">{formatMonth(data[Math.floor(data.length / 2)].x)}</text>
        <text x={padding + contentW} y={height - 6} className="fill-gray-400" fontSize="10" textAnchor="end">{formatMonth(data[data.length - 1].x)}</text>

        {/* Line */}
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />

        {/* Hover marker */}
        {hover && (
          <g>
            <line x1={hover.x} x2={hover.x} y1={padding} y2={padding + contentH} stroke="#e5e7eb" />
            <circle cx={hover.x} cy={hover.y} r="3" fill={color} />
          </g>
        )}
      </svg>
      {hover && (
        <div className="mt-2 text-xs text-gray-700">
          {new Date(hover.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: <span className="font-medium">{hover.value} {units}</span>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, subtitle, icon }) => (
  <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center gap-3">
    <div className="text-2xl">{icon}</div>
    <div>
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
      <div className="text-[11px] text-gray-400">{subtitle}</div>
    </div>
  </div>
);

export default HistoricalAnalytics;


