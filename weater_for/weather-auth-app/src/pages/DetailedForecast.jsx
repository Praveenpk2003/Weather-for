import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  getCurrentWeatherByCity, 
  getCurrentLocationWithFallback, 
  getCurrentWeatherByCoords,
  getCoordsByCityName,
  getHourlyForecastByCoords,
  getSevenDayForecastByCoords,
  getWeatherIconUrl
} from '../services/weatherService';

const DetailedForecast = () => {
  const [cityQuery, setCityQuery] = useState('');
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('hourly');
  const [coords, setCoords] = useState(null); // { latitude, longitude }
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [sevenDayForecast, setSevenDayForecast] = useState([]);
  const location = useLocation();

  const [meteorologicalData, setMeteorologicalData] = useState({
    pressure: null,
    visibility: null,
    uvIndex: null,
    dewPoint: null,
    cloudCover: null,
    precipitation: null,
    windGust: null,
    windDirection: null
  });

  useEffect(() => {
    // Get location from state if available
    if (location.state?.weather) {
      setWeather(location.state.weather);
    }
  }, [location.state]);

  // Derive meteorological panel values from latest hourly forecast item
  useEffect(() => {
    if (hourlyForecast && hourlyForecast.length > 0) {
      const latest = hourlyForecast[0];
      setMeteorologicalData({
        pressure: latest.pressure ?? weather?.pressure ?? null,
        visibility: latest.visibility ?? weather?.visibility ?? null,
        uvIndex: latest.uvIndex ?? null,
        dewPoint: latest.dewPoint ?? null,
        cloudCover: latest.cloudCover ?? null,
        precipitation: null,
        windGust: latest.windGust ?? null,
        windDirection: typeof latest.windDirection === 'number' ? `${latest.windDirection}°` : null
      });
    } else if (weather) {
      setMeteorologicalData((prev) => ({
        ...prev,
        pressure: weather.pressure ?? prev.pressure,
        visibility: weather.visibility ?? prev.visibility
      }));
    }
  }, [hourlyForecast, weather]);

  // When we have a weather location name but not coordinates, geocode to coords
  useEffect(() => {
    const resolveCoordsAndForecasts = async () => {
      if (!weather) return;
      setIsLoading(true);
      setError(null);
      try {
        let latitude = coords?.latitude;
        let longitude = coords?.longitude;
        if (!latitude || !longitude) {
          const loc = await getCoordsByCityName(weather.location);
          latitude = loc.latitude;
          longitude = loc.longitude;
          setCoords({ latitude, longitude });
        }
        const [hourly, seven] = await Promise.all([
          getHourlyForecastByCoords(latitude, longitude),
          getSevenDayForecastByCoords(latitude, longitude)
        ]);
        setHourlyForecast(hourly);
        setSevenDayForecast(seven);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    resolveCoordsAndForecasts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weather?.location]);

  const onSubmitSearch = async (e) => {
    e.preventDefault();
    const trimmed = cityQuery.trim();
    if (!trimmed) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCurrentWeatherByCity(trimmed);
      setWeather(result);
      const loc = await getCoordsByCityName(trimmed);
      setCoords({ latitude: loc.latitude, longitude: loc.longitude });
      const [hourly, seven] = await Promise.all([
        getHourlyForecastByCoords(loc.latitude, loc.longitude),
        getSevenDayForecastByCoords(loc.latitude, loc.longitude)
      ]);
      setHourlyForecast(hourly);
      setSevenDayForecast(seven);
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
      const [hourly, seven] = await Promise.all([
        getHourlyForecastByCoords(location.latitude, location.longitude),
        getSevenDayForecastByCoords(location.latitude, location.longitude)
      ]);
      setHourlyForecast(hourly);
      setSevenDayForecast(seven);
    } catch (err) {
      setWeather(null);
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
              <Link 
                to="/features" 
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                Back to Features
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Detailed Weather Forecast</h1>
            
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

        {/* Current Weather Summary */}
        {weather && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-900">Current Weather - {weather.location}</h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{weather.temperature}°</div>
                  <div className="text-gray-600 capitalize">{weather.description}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Forecast Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('hourly')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'hourly'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Hourly Forecast
                </button>
                <button
                  onClick={() => setActiveTab('7day')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === '7day'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  7-Day Forecast
                </button>
                
                <button
                  onClick={() => setActiveTab('meteorological')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'meteorological'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Meteorological Data
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Hourly Forecast Tab */}
              {activeTab === 'hourly' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">24-Hour Forecast</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    {hourlyForecast.map((hour, index) => (
                      <div key={index} className={`bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center ${hour.isNow ? 'ring-2 ring-blue-500' : ''}`}>
                        <div className="text-sm text-gray-600 mb-1">{hour.time}</div>
                        {hour.isNow && (
                          <div className="text-[10px] inline-block px-2 py-0.5 rounded-full bg-blue-600 text-white mb-1">Now</div>
                        )}
                        <div className="mb-2 flex justify-center">
                          {hour.icon ? (
                            <img src={getWeatherIconUrl(hour.icon)} alt={hour.description} className="w-10 h-10" />
                          ) : (
                            <span className="text-2xl">⛅</span>
                          )}
                        </div>
                        <div className="text-lg font-bold text-gray-900">{hour.temperature}°</div>
                        <div className="text-xs text-gray-600 mb-2 capitalize">{hour.description}</div>
                        <div className="text-xs text-gray-500">
                          <div>💧 {hour.humidity}%</div>
                          <div>💨 {hour.windSpeed} km/h</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7-Day Forecast Tab */}
              {activeTab === '7day' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">7-Day Forecast</h3>
                  <div className="space-y-3">
                    {sevenDayForecast.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="font-semibold text-gray-900">{day.day}</div>
                            <div className="text-sm text-gray-600">{day.date}</div>
                          </div>
                          <div className="flex items-center justify-center w-10 h-10">
                            {day.icon ? (
                              <img src={getWeatherIconUrl(day.icon)} alt={day.description} className="w-10 h-10" />
                            ) : (
                              <span className="text-2xl">⛅</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 capitalize">{day.description}</div>
                            <div className="text-sm text-gray-600">💧 {day.humidity}% • 💨 {day.windSpeed} km/h</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">{day.high}°</div>
                          <div className="text-gray-600">{day.low}°</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              

              {/* Meteorological Data Tab */}
              {activeTab === 'meteorological' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Meteorological Data</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Atmospheric Pressure</h4>
                        <div className="text-2xl">📊</div>
                      </div>
                      <div className="text-3xl font-bold text-blue-600">{meteorologicalData.pressure} hPa</div>
                      <div className="text-sm text-gray-600 mt-2">Normal range: 1013 hPa</div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Visibility</h4>
                        <div className="text-2xl">👁️</div>
                      </div>
                      <div className="text-3xl font-bold text-green-600">{meteorologicalData.visibility} km</div>
                      <div className="text-sm text-gray-600 mt-2">Excellent visibility</div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">UV Index</h4>
                        <div className="text-2xl">☀️</div>
                      </div>
                      <div className="text-3xl font-bold text-yellow-600">{meteorologicalData.uvIndex}</div>
                      <div className="text-sm text-gray-600 mt-2">Moderate exposure</div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Dew Point</h4>
                        <div className="text-2xl">💧</div>
                      </div>
                      <div className="text-3xl font-bold text-purple-600">{meteorologicalData.dewPoint}°C</div>
                      <div className="text-sm text-gray-600 mt-2">Comfortable humidity</div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Cloud Cover</h4>
                        <div className="text-2xl">☁️</div>
                      </div>
                      <div className="text-3xl font-bold text-indigo-600">{meteorologicalData.cloudCover}%</div>
                      <div className="text-sm text-gray-600 mt-2">Partly cloudy</div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Wind Gust</h4>
                        <div className="text-2xl">💨</div>
                      </div>
                      <div className="text-3xl font-bold text-red-600">{meteorologicalData.windGust} km/h</div>
                      <div className="text-sm text-gray-600 mt-2">Direction: {meteorologicalData.windDirection}</div>
                    </div>
                  </div>

                  
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailedForecast;

