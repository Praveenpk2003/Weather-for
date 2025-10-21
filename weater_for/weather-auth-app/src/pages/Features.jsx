import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentWeatherByCity, getCurrentLocationWithFallback, getCurrentWeatherByCoords, getForecastByCoords, getCoordsByCityName, getSevenDayForecastByCoords } from '../services/weatherService';

const Features = () => {
  const [cityQuery, setCityQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [quickForecast, setQuickForecast] = useState([]);
  const [coords, setCoords] = useState(null);

  const onSubmitSearch = async (e) => {
    e.preventDefault();
    const trimmed = cityQuery.trim();
    if (!trimmed) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCurrentWeatherByCity(trimmed);
      setWeather(result);
      // Fetch forecast for the searched city
      try {
        const geo = await getCoordsByCityName(trimmed);
        setCoords({ latitude: geo.latitude, longitude: geo.longitude });
        try {
          const list = await getForecastByCoords(geo.latitude, geo.longitude);
          setQuickForecast(buildFourDaySummary(list));
        } catch (e1) {
          // Fallback to Open-Meteo 7-day forecast
          const daily = await getSevenDayForecastByCoords(geo.latitude, geo.longitude);
          setQuickForecast(daily.slice(0,4).map((d, idx) => ({
            day: idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : d.day,
            icon: d.icon,
            high: d.high,
            low: d.low,
            condition: d.description
          })));
        }
      } catch (_) {
        setQuickForecast([]);
      }
    } catch (err) {
      setWeather(null);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const onUseCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const location = await getCurrentLocationWithFallback();
      const result = await getCurrentWeatherByCoords(location.latitude, location.longitude);
      setWeather(result);
      setCoords({ latitude: location.latitude, longitude: location.longitude });
      // Fetch forecast for current coords
      try {
        try {
          const list = await getForecastByCoords(location.latitude, location.longitude);
          setQuickForecast(buildFourDaySummary(list));
        } catch (e1) {
          // Fallback to Open-Meteo 7-day forecast
          const daily = await getSevenDayForecastByCoords(location.latitude, location.longitude);
          setQuickForecast(daily.slice(0,4).map((d, idx) => ({
            day: idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : d.day,
            icon: d.icon,
            high: d.high,
            low: d.low,
            condition: d.description
          })));
        }
      } catch (_) {
        setQuickForecast([]);
      }
    } catch (err) {
      setWeather(null);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Build 4-day summary from 3-hourly forecast list
  const buildFourDaySummary = (list) => {
    if (!Array.isArray(list) || list.length === 0) return [];
    const byDate = {};
    list.forEach(item => {
      const key = new Date(item.date).toDateString();
      if (!byDate[key]) {
        byDate[key] = { temps: [], desc: [], icon: [], date: new Date(item.date) };
      }
      byDate[key].temps.push(item.temperature);
      byDate[key].desc.push(item.description);
      byDate[key].icon.push(item.icon);
    });
    const days = Object.values(byDate)
      .sort((a,b) => a.date - b.date)
      .slice(0,4)
      .map((d, idx) => ({
        day: idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : d.date.toLocaleDateString('en-US', { weekday: 'short' }),
        icon: d.icon[Math.floor(d.icon.length/2)],
        high: Math.round(Math.max(...d.temps)),
        low: Math.round(Math.min(...d.temps)),
        condition: d.desc[Math.floor(d.desc.length/2)]
      }));
    return days;
  };

  // If the page already has a weather value (e.g., from navigation state later), you could trigger forecast fetch here too
  useEffect(() => {
    // no-op for now; explicit fetch happens in handlers
  }, [weather?.location]);

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
              <Link 
                to="/news" 
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                News
              </Link>
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Weather Analytics Dashboard</h1>
            
            <form onSubmit={onSubmitSearch} className="flex flex-col sm:flex-row gap-4 mb-4">
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
                {isLoading ? 'Searching...' : 'Search'}
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

            {error && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {typeof error === 'string' ? error : error?.message || 'Unable to fetch weather'}
              </div>
            )}
          </div>
        </div>

        {/* Current Weather Section */}
        {weather && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900">Current Weather - {weather.location}</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Weather Display */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{weather.location}</h3>
                      <p className="text-gray-600">Current Weather</p>
                    </div>
                    <div className="text-4xl">
                      {weather.icon && (
                        <img 
                          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} 
                          alt={weather.description}
                          className="w-16 h-16"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-6xl font-bold text-blue-600 mb-2">{weather.temperature}°</div>
                    <div className="text-xl text-gray-700 capitalize">{weather.description}</div>
                  </div>
                </div>

                {/* Weather Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">💧</div>
                    <div className="text-sm text-gray-600">Humidity</div>
                    <div className="text-xl font-semibold text-gray-900">{weather.humidity}%</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">💨</div>
                    <div className="text-sm text-gray-600">Wind Speed</div>
                    <div className="text-xl font-semibold text-gray-900">{weather.windSpeed} km/h</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-sm text-gray-600">Pressure</div>
                    <div className="text-xl font-semibold text-gray-900">{weather.pressure} hPa</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">👁️</div>
                    <div className="text-sm text-gray-600">Visibility</div>
                    <div className="text-xl font-semibold text-gray-900">{weather.visibility} km</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">☀️</div>
                    <div className="text-sm text-gray-600">UV Index</div>
                    <div className="text-xl font-semibold text-gray-900">6</div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🌡️</div>
                    <div className="text-sm text-gray-600">Feels Like</div>
                    <div className="text-xl font-semibold text-gray-900">{weather.feelsLike}°</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3-Day Quick Forecast */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">4-Day Quick Forecast</h3>
              <button onClick={() => navigate('/forecast', { state: { weather } })} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                View More
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(quickForecast.length ? quickForecast : []).map((day, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">
                    {day.icon ? (
                      <img src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} alt={day.condition} className="w-10 h-10 inline-block" />
                    ) : '⛅'}
                  </div>
                  <div className="font-semibold text-gray-900 mb-1">{day.day}</div>
                  <div className="text-lg font-bold text-blue-600">{day.high}°</div>
                  <div className="text-sm text-gray-600">{day.low}°</div>
                  <div className="text-xs text-gray-500 mt-1">{day.condition}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Interactive Map on Features */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Interactive Weather Map</h3>
            <LiveMapFeature
              coords={coords}
              onWeatherClick={async (lat, lon) => {
                try { return await getCurrentWeatherByCoords(lat, lon); } catch { return null; }
              }}
            />
          </div>
        </div>

        {/* Detailed Forecast and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detailed Forecast */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900">Detailed Forecast</h3>
            </div>
            <p className="text-gray-600 mb-4">
              View hourly and 7-day detailed weather forecasts with interactive maps and advanced meteorological data.
            </p>
            <button 
              onClick={() => navigate('/forecast', { state: { weather } })}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Explore Forecast
            </button>
          </div>

          {/* Historical Analytics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900">Historical Analytics</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Analyze weather patterns and trends with historical data, charts, and comprehensive meteorological insights.
            </p>
            <button onClick={() => navigate('/analytics', { state: { weather } })} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              View Analytics
            </button>
          </div>
        </div>

        {/* Air Pollution Section */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900">Air Quality & Pollution</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🟢</div>
                <div className="text-sm text-gray-600">Air Quality</div>
                <div className="text-lg font-semibold text-green-700">Good</div>
                <div className="text-xs text-gray-500">AQI: 45</div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🟡</div>
                <div className="text-sm text-gray-600">PM2.5</div>
                <div className="text-lg font-semibold text-yellow-700">12 μg/m³</div>
                <div className="text-xs text-gray-500">Moderate</div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🔵</div>
                <div className="text-sm text-gray-600">PM10</div>
                <div className="text-lg font-semibold text-blue-700">18 μg/m³</div>
                <div className="text-xs text-gray-500">Good</div>
              </div>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🟣</div>
                <div className="text-sm text-gray-600">Ozone</div>
                <div className="text-lg font-semibold text-purple-700">0.08 ppm</div>
                <div className="text-xs text-gray-500">Good</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Features;

function LiveMapFeature({ coords, onWeatherClick }) {
  const mapRef = useRef(null);
  const mapDivRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedWeather, setSelectedWeather] = useState(null);

  useEffect(() => {
    if (!mapDivRef.current) return;
    if (!mapRef.current && window.L) {
      const center = coords?.latitude && coords?.longitude ? [coords.latitude, coords.longitude] : [20, 0];
      mapRef.current = window.L.map(mapDivRef.current).setView(center, coords ? 8 : 2);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(mapRef.current);
      mapRef.current.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        const data = await onWeatherClick(lat, lng);
        if (!data) return;
        placeMarker(lat, lng, data);
        setSelectedWeather({ lat, lon: lng, ...data });
      });
    }
  }, [coords, onWeatherClick]);

  useEffect(() => {
    const syncCenterAndMarker = async () => {
      if (mapRef.current && coords?.latitude && coords?.longitude) {
        const lat = coords.latitude;
        const lon = coords.longitude;
        mapRef.current.setView([lat, lon], 10);
        try {
          const data = await onWeatherClick(lat, lon);
          if (data) {
            placeMarker(lat, lon, data);
            setSelectedWeather({ lat, lon, ...data });
          }
        } catch {}
      }
    };
    syncCenterAndMarker();
  }, [coords, onWeatherClick]);

  const placeMarker = (lat, lon, data) => {
    if (!mapRef.current || !window.L) return;
    const color = tempToColorFeature(data.temperature);
    const marker = window.L.circleMarker([lat, lon], { radius: 8, color, fillColor: color, fillOpacity: 0.8 }).addTo(mapRef.current);
    markersRef.current.push(marker);
    const html = popupHtmlFeature(data);
    marker.bindPopup(html).openPopup();
  };

  return (
    <div>
      <div className="w-full h-96 rounded-lg" ref={mapDivRef} />
      {selectedWeather && (
        <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-start gap-3 mb-2">
            {selectedWeather.icon && (
              <img src={`https://openweathermap.org/img/wn/${selectedWeather.icon}@2x.png`} alt={selectedWeather.description} className="w-10 h-10" />
            )}
            <div>
              <div className="text-sm text-gray-500">{selectedWeather.location || `${selectedWeather.lat?.toFixed(2)}, ${selectedWeather.lon?.toFixed(2)}`}</div>
              <div className="font-semibold text-gray-900 capitalize">{selectedWeather.description}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-800">
            <div>Temp: <span className="font-semibold">{selectedWeather.temperature ?? '-'}°C</span> {typeof selectedWeather.feelsLike === 'number' && <span className="text-gray-600">(Feels {selectedWeather.feelsLike}°C)</span>}</div>
            <div>Humidity: <span className="font-semibold">{selectedWeather.humidity ?? '-'}%</span></div>
            <div>Wind: <span className="font-semibold">{selectedWeather.windSpeed ?? '-'} km/h</span></div>
            <div>Pressure: <span className="font-semibold">{selectedWeather.pressure ?? '-'} hPa</span></div>
            <div>Visibility: <span className="font-semibold">{selectedWeather.visibility ?? '-'} km</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

function tempToColorFeature(t) {
  if (typeof t !== 'number') return '#3b82f6';
  if (t <= 0) return '#60a5fa';
  if (t <= 10) return '#34d399';
  if (t <= 20) return '#a3e635';
  if (t <= 30) return '#f59e0b';
  return '#ef4444';
}

function popupHtmlFeature(w) {
  const iconUrl = w?.icon ? `https://openweathermap.org/img/wn/${w.icon}@2x.png` : '';
  return `
    <div style="min-width:180px">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        ${iconUrl ? `<img src="${iconUrl}" alt="${w.description}" width="36" height="36" />` : ''}
        <div style="font-weight:600; text-transform:capitalize;">${w.description || 'Weather'}</div>
      </div>
      <div style="font-size:13px; line-height:1.4;">
        <div><strong>Temp:</strong> ${w.temperature ?? '-'}°C (Feels ${w.feelsLike ?? '-'}°C)</div>
        <div><strong>Humidity:</strong> ${w.humidity ?? '-'}%</div>
        <div><strong>Wind:</strong> ${w.windSpeed ?? '-'} km/h</div>
        <div><strong>Pressure:</strong> ${w.pressure ?? '-'} hPa</div>
        <div><strong>Visibility:</strong> ${w.visibility ?? '-'} km</div>
      </div>
    </div>
  `;
}
