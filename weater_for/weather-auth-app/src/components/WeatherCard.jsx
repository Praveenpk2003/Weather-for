import React from 'react';
import { getWeatherIconUrl } from '../services/weatherService';

export const WeatherCard = ({ weather, isLoading, error }) => {
  const errorText = typeof error === 'string'
    ? error
    : error?.message
      ? error.message
      : error
        ? JSON.stringify(error)
        : null;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (errorText) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-lg font-medium text-red-800">Weather Data Unavailable</h3>
            <p className="text-red-600">{errorText}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Weather Data</h3>
        <p className="text-gray-600">Click "Get Current Weather" to see your local weather</p>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="rounded-2xl p-6 text-white shadow-xl border border-white/20 bg-white/10 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">{weather.location}</h2>
          <p className="text-blue-100 text-sm">{weather.country}</p>
        </div>
        <img 
          src={getWeatherIconUrl(weather.icon)} 
          alt={weather.description}
          className="w-16 h-16"
        />
      </div>

      {/* Main Temperature */}
      <div className="text-center mb-6">
        <div className="text-5xl font-bold mb-2">{weather.temperature}°C</div>
        <div className="text-lg capitalize text-blue-100">{weather.description}</div>
        <div className="text-sm text-blue-200">Feels like {weather.feelsLike}°C</div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="flex items-center mb-1">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Humidity</span>
          </div>
          <div className="text-lg font-bold">{weather.humidity}%</div>
        </div>

        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="flex items-center mb-1">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Pressure</span>
          </div>
          <div className="text-lg font-bold">{weather.pressure} hPa</div>
        </div>

        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="flex items-center mb-1">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Wind</span>
          </div>
          <div className="text-lg font-bold">{weather.windSpeed} m/s</div>
        </div>

        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="flex items-center mb-1">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Visibility</span>
          </div>
          <div className="text-lg font-bold">{weather.visibility} km</div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-center text-xs text-blue-200">
        Last updated: {formatTime(weather.timestamp)}
      </div>
    </div>
  );
};
