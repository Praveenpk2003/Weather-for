import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentWeatherByCity, getCurrentLocationWithFallback, getCurrentWeatherByCoords } from '../services/weatherService';
import { WeatherCard } from '../components/WeatherCard';

const Home = () => {
  const [weatherTheme, setWeatherTheme] = useState('default');
  const [cityQuery, setCityQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [weather, setWeather] = useState(null);

  const onSubmitSearch = async (e) => {
    e.preventDefault();
    const trimmed = cityQuery.trim();
    if (!trimmed) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCurrentWeatherByCity(trimmed);
      setWeather(result);
      // Update background theme based on weather description/icon and location
      const desc = (result?.description || '').toLowerCase();
      const icon = (result?.icon || '').toLowerCase();
      const location = (result?.location || '').toLowerCase();
      const temp = result?.temperature || 0;
      
      // Check for cold locations or snow conditions
      const isColdLocation = location.includes('antarctica') || location.includes('arctic') || 
                           location.includes('siberia') || location.includes('greenland') ||
                           location.includes('alaska') || location.includes('iceland') ||
                           location.includes('nunavut') || location.includes('yukon');
      
      const isSnowCondition = desc.includes('snow') || desc.includes('blizzard') || 
                            desc.includes('sleet') || icon.includes('13') || 
                            icon.includes('50') || temp < -10;
      
      if (isColdLocation || isSnowCondition) {
        setWeatherTheme('snowy');
      } else if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('thunder') || icon.startsWith('09') || icon.startsWith('10') || icon.startsWith('11')) {
        setWeatherTheme('rainy');
      } else if (desc.includes('cloud') || desc.includes('overcast') || icon.startsWith('03') || icon.startsWith('04')) {
        setWeatherTheme('cloudy');
      } else if (desc.includes('clear') || icon.startsWith('01')) {
        setWeatherTheme('sunny');
      } else {
        setWeatherTheme('default');
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
      const desc = (result?.description || '').toLowerCase();
      const icon = (result?.icon || '').toLowerCase();
      const locationName = (result?.location || '').toLowerCase();
      const temp = result?.temperature || 0;
      
      // Check for cold locations or snow conditions
      const isColdLocation = locationName.includes('antarctica') || locationName.includes('arctic') || 
                           locationName.includes('siberia') || locationName.includes('greenland') ||
                           locationName.includes('alaska') || locationName.includes('iceland') ||
                           locationName.includes('nunavut') || locationName.includes('yukon');
      
      const isSnowCondition = desc.includes('snow') || desc.includes('blizzard') || 
                            desc.includes('sleet') || icon.includes('13') || 
                            icon.includes('50') || temp < -10;
      
      if (isColdLocation || isSnowCondition) {
        setWeatherTheme('snowy');
      } else if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('thunder') || icon.startsWith('09') || icon.startsWith('10') || icon.startsWith('11')) {
        setWeatherTheme('rainy');
      } else if (desc.includes('cloud') || desc.includes('overcast') || icon.startsWith('03') || icon.startsWith('04')) {
        setWeatherTheme('cloudy');
      } else if (desc.includes('clear') || icon.startsWith('01')) {
        setWeatherTheme('sunny');
      } else {
        setWeatherTheme('default');
      }
    } catch (err) {
      setWeather(null);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getBackgroundClass = () => {
    switch (weatherTheme) {
      case 'sunny':
        return 'bg-gradient-to-b from-orange-400 via-yellow-300 to-yellow-100';
      case 'cloudy':
        return 'bg-gradient-to-b from-gray-600 via-gray-500 to-gray-400';
      case 'rainy':
        return 'bg-gradient-to-b from-slate-800 via-slate-700 to-slate-600';
      case 'snowy':
        return 'bg-gradient-to-b from-slate-200 via-blue-100 to-white';
      default:
        return 'bg-gradient-to-b from-blue-900 via-blue-700 to-blue-500';
    }
  };

  const renderRainDrops = () => {
    if (weatherTheme !== 'rainy') return null;
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-6 bg-blue-300 opacity-70 rain-drop"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${0.8 + Math.random() * 1.2}s`,
            }}
          />
        ))}
        {[...Array(40)].map((_, i) => (
          <div
            key={`medium-${i}`}
            className="absolute w-0.5 h-10 bg-blue-400 opacity-80 rain-drop"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2.5}s`,
              animationDuration: `${0.6 + Math.random() * 1}s`,
            }}
          />
        ))}
        {[...Array(20)].map((_, i) => (
          <div
            key={`heavy-${i}`}
            className="absolute w-1 h-12 bg-blue-500 opacity-90 rain-drop"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${0.4 + Math.random() * 0.8}s`,
            }}
          />
        ))}
      </div>
    );
  };

  const renderSnowFlakes = () => {
    if (weatherTheme !== 'snowy') return null;
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white opacity-80 snow-flake"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              fontSize: `${8 + Math.random() * 12}px`,
            }}
          >
            ❄
          </div>
        ))}
        {[...Array(40)].map((_, i) => (
          <div
            key={`large-${i}`}
            className="absolute text-white opacity-60 snow-flake"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 3}s`,
              fontSize: `${16 + Math.random() * 8}px`,
            }}
          >
            ❅
          </div>
        ))}
        {[...Array(20)].map((_, i) => (
          <div
            key={`huge-${i}`}
            className="absolute text-white opacity-40 snow-flake"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${5 + Math.random() * 2}s`,
              fontSize: `${20 + Math.random() * 10}px`,
            }}
          >
            ❆
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 ease-in-out relative ${getBackgroundClass()}`}>
      {renderRainDrops()}
      {renderSnowFlakes()}
      
      <header className="flex justify-between items-center px-8 py-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-white text-2xl font-bold">SkyNow</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link 
            to="/login" 
            className="text-white hover:text-blue-200 transition-colors duration-200"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex flex-col items-center justify-center px-8 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            <span className="block">Professional Weather</span>
            <span className="block text-7xl md:text-8xl">Intelligence</span>
          </h1>

          <form onSubmit={onSubmitSearch} className="w-full max-w-2xl mx-auto mb-8">
            <div className="flex items-stretch bg-white rounded-lg shadow overflow-hidden">
              <input
                type="text"
                value={cityQuery}
                onChange={(e) => setCityQuery(e.target.value)}
                placeholder="Enter city name (e.g., London)"
                className="flex-1 px-4 py-3 text-gray-900 outline-none"
                aria-label="City name"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                disabled={isLoading}
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
            {error && (
              <div className="mt-3 text-sm text-red-200">{typeof error === 'string' ? error : error?.message || 'Unable to fetch weather'}</div>
            )}
          </form>

          <div className="mb-6">
            <button
              type="button"
              onClick={onUseCurrentLocation}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/15 text-white border border-white/20 hover:bg-white/25 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v2.05A3.5 3.5 0 1013.95 11H16a1 1 0 100-2h-2.05A3.501 3.501 0 0011 7.05V5z" clipRule="evenodd" />
              </svg>
              {isLoading ? 'Locating…' : 'My current location'}
            </button>
          </div>

          {weather && !error && (
            <div className="mb-6 text-white">
              <div className="text-xl font-semibold">
                {weather.location}, {weather.country}
              </div>
              <div className="text-lg opacity-90">
                {weather.temperature}°C • <span className="capitalize">{weather.description}</span>
              </div>
            </div>
          )}

          {(isLoading || weather) && (
            <div className="mb-8 max-w-xl mx-auto">
              <WeatherCard weather={weather} isLoading={isLoading} error={error} />
            </div>
          )}
          
          <p className="text-xl text-white mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience the most accurate and comprehensive weather forecasting platform. 
            Track real-time conditions, air quality, and get personalized alerts for locations worldwide.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors duration-200 shadow-lg"
            >
              Start Free Today
            </Link>
            <Link 
              to="/login" 
              className="text-white border-2 border-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              Already have an account?
            </Link>
          </div>
          
          

          <div className="mb-8">
            <Link 
              to="/features" 
              className="text-white text-lg underline hover:text-blue-200 transition-colors duration-200"
            >
              Know about our future →
            </Link>
          </div>
        </div>
      </main>

      <div className="flex justify-center items-center space-x-8 pb-16">
        <div 
          className="w-16 h-16 flex items-center justify-center cursor-pointer transform hover:scale-110 transition-all duration-300"
          onMouseEnter={() => setWeatherTheme('sunny')}
          onMouseLeave={() => setWeatherTheme('default')}
        >
          <svg className="w-12 h-12 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div 
          className="w-16 h-16 flex items-center justify-center cursor-pointer transform hover:scale-110 transition-all duration-300"
          onMouseEnter={() => setWeatherTheme('cloudy')}
          onMouseLeave={() => setWeatherTheme('default')}
        >
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
        </div>
        
        <div 
          className="w-16 h-16 flex items-center justify-center cursor-pointer transform hover:scale-110 transition-all duration-300"
          onMouseEnter={() => setWeatherTheme('rainy')}
          onMouseLeave={() => setWeatherTheme('default')}
        >
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            <path d="M8 18a1 1 0 100-2 1 1 0 000 2zm2-2a1 1 0 100-2 1 1 0 000 2zm2 2a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        </div>
        
        <div 
          className="w-16 h-16 flex items-center justify-center cursor-pointer transform hover:scale-110 transition-all duration-300"
          onMouseEnter={() => setWeatherTheme('snowy')}
          onMouseLeave={() => setWeatherTheme('default')}
        >
          <div className="text-4xl text-white">❄</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
