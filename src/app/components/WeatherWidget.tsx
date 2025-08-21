'use client';

import { useState, useEffect } from 'react';
import { getSeoulWeather, getUserLocationWeather, weatherRecommendations } from '@/lib/weatherService';
import type { WeatherData } from '@/lib/weatherService';

interface WeatherWidgetProps {
  onWeatherChange?: (weather: WeatherData | null) => void;
}

export default function WeatherWidget({ onWeatherChange }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useUserLocation, setUseUserLocation] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchWeather = async (useLocation: boolean = false) => {
    setIsLoading(true);
    setError('');

    try {
      let weatherData: WeatherData | null;
      
      if (useLocation) {
        weatherData = await getUserLocationWeather();
        if (!weatherData) {
          setError('위치 권한을 허용해주세요');
          weatherData = await getSeoulWeather();
        }
      } else {
        weatherData = await getSeoulWeather();
      }

      setWeather(weatherData);
      if (onWeatherChange) {
        onWeatherChange(weatherData);
      }
    } catch (error) {
      setError('날씨 정보를 가져올 수 없습니다');
      console.error('날씨 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleLocationToggle = () => {
    const newUseLocation = !useUserLocation;
    setUseUserLocation(newUseLocation);
    fetchWeather(newUseLocation);
  };

  const getWeatherEmoji = (condition: string, icon?: string) => {
    const emojiMap: Record<string, string> = {
      'clear': '☀️',
      'rain': '🌧️',
      'snow': '❄️',
      'clouds': '☁️',
      'thunderstorm': '⛈️',
      'drizzle': '🌦️',
      'extreme': '🌪️'
    };
    return emojiMap[condition] || '🌤️';
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 5) return 'text-blue-600';
    if (temp < 15) return 'text-blue-400';
    if (temp < 25) return 'text-green-600';
    if (temp < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-4 bg-white rounded-xl shadow-lg">
        <div className="flex items-center justify-center">
          <div className="animate-spin text-2xl mr-2">🌀</div>
          <span className="text-gray-600">날씨 정보 로딩 중...</span>
        </div>
      </div>
    );
  }

  if (error && !weather) {
    return (
      <div className="max-w-md mx-auto p-4 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={() => fetchWeather()}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const recommendation = weatherRecommendations[weather.condition];

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">현재 날씨</h3>
        <button
          onClick={handleLocationToggle}
          className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          {useUserLocation ? '📍 내 위치' : '🏢 서울'}
        </button>
      </div>

      {/* 현재 날씨 정보 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-4xl mr-3">{getWeatherEmoji(weather.condition, weather.icon)}</span>
          <div>
            <div className={`text-2xl font-bold ${getTemperatureColor(weather.temperature)}`}>
              {weather.temperature}°C
            </div>
            <div className="text-sm text-gray-600">{weather.description}</div>
          </div>
        </div>
        
        <div className="text-right text-xs text-gray-500">
          <div>습도: {weather.humidity}%</div>
          <div>풍속: {weather.windSpeed}m/s</div>
        </div>
      </div>

      {/* 날씨 기반 추천 */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">오늘의 음식 추천</h4>
        <p className="text-sm text-blue-700 mb-2">{recommendation.reason}</p>
        
        {recommendation.recommendedTags.length > 0 && (
          <div className="mb-2">
            <span className="text-xs text-blue-600 font-medium">추천: </span>
            {recommendation.recommendedTags.map(tag => (
              <span key={tag} className="inline-block px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full mr-1 mb-1">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {recommendation.avoidTags.length > 0 && (
          <div>
            <span className="text-xs text-gray-600 font-medium">피하기: </span>
            {recommendation.avoidTags.map(tag => (
              <span key={tag} className="inline-block px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full mr-1 mb-1">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 text-xs text-yellow-600">
          ⚠️ {error} (기본 위치 사용 중)
        </div>
      )}
    </div>
  );
}