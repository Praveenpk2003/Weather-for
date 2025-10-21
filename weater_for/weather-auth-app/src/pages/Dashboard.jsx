import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { WeatherCard } from '../components/WeatherCard';
import { getCurrentLocationWithFallback, getCurrentWeatherByCoords, checkLocationPermission } from '../services/weatherService';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);

  const handleLogout = () => {
    logout();
  };

  const requestLocationAndWeather = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Request user's current location with fallback
      const location = await getCurrentLocationWithFallback();
      
      if (location.method === 'browser') {
        setLocationPermission('granted');
      } else {
        setLocationPermission('ip-fallback');
      }
      
      // Fetch weather data using coordinates
      const weatherData = await getCurrentWeatherByCoords(location.latitude, location.longitude);
      setWeather(weatherData);
    } catch (err) {
      setError(err);
      setLocationPermission('denied');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationPermission = async () => {
    const permission = await checkLocationPermission();
    setLocationPermission(permission);
    
    if (permission === 'granted') {
      requestLocationAndWeather();
    } else {
      // Try anyway, as the fallback will handle permission issues
      requestLocationAndWeather();
    }
  };

  useEffect(() => {
    // Check if location permission was previously granted
    const checkPermission = async () => {
      const permission = await checkLocationPermission();
      setLocationPermission(permission);
      if (permission === 'granted') {
        requestLocationAndWeather();
      }
    };
    
    checkPermission();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                SkyNow Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to your Weather Dashboard!
              </h2>
              <p className="text-gray-600 mb-6">
                Get real-time weather information for your current location.
              </p>
              
              {/* Location Permission Status */}
              {locationPermission === 'denied' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Location Access Denied</h3>
                      <p className="text-sm text-red-700">
                        {error?.suggestion || 'Please enable location access in your browser to get weather data for your current location.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {locationPermission === 'ip-fallback' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">Using Approximate Location</h3>
                      <p className="text-sm text-blue-700">
                        Browser location access was denied, so we're using your approximate location based on your IP address.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && locationPermission === 'denied' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Location Error</h3>
                      <p className="text-sm text-red-700">
                        {typeof error === 'string' ? error : error?.message || 'Unable to get your location'}
                      </p>
                      {error?.suggestion && (
                        <p className="text-sm text-red-600 mt-1">
                          <strong>Suggestion:</strong> {error.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Get Weather Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleLocationPermission}
                  loading={isLoading}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? 'Getting Weather...' : 'Get Current Weather'}
                </Button>
                
                {weather && (
                  <Button
                    onClick={requestLocationAndWeather}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Refresh Weather
                  </Button>
                )}
              </div>
            </div>

            {/* Weather Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Weather</h3>
                <WeatherCard 
                  weather={weather} 
                  isLoading={isLoading} 
                  error={error} 
                />
              </div>
              
              {/* Additional Info Panel */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weather Tips</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-gray-900">Stay Updated</h4>
                      <p className="text-sm text-gray-600">Weather data is updated every time you refresh</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-gray-900">Accurate Data</h4>
                      <p className="text-sm text-gray-600">Powered by OpenWeatherMap for reliable forecasts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-purple-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-gray-900">Your Location</h4>
                      <p className="text-sm text-gray-600">Weather data is specific to your current location</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
