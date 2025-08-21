'use client';

import { useState } from 'react';
import ConnectionTest from './components/ConnectionTest';
import FoodPicker from './components/FoodPicker';
import FoodHistory from './components/FoodHistory';
import RestaurantFinder from './components/RestaurantFinder';
import WeatherWidget from './components/WeatherWidget';
import type { Food } from '@/types';
import type { WeatherData } from '@/lib/weatherService';

export default function Home() {
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            점심 메뉴 고민 끝!
          </h1>
          <p className="text-gray-600">
            날씨를 고려한 맞춤 점심 추천 서비스
          </p>
        </div>
        
        {/* 개발 모드에서만 연결 테스트 표시
        {process.env.NEXT_PUBLIC_DEV_MODE === 'true' && (
          <div className="mb-8">
            <ConnectionTest />
          </div>
        )} */}

        {/* 날씨 위젯 */}
        <div className="mb-6">
          <WeatherWidget onWeatherChange={setWeather} />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
          <FoodPicker onFoodSelected={setSelectedFood} weather={weather} />
          <RestaurantFinder selectedFood={selectedFood} />
          <FoodHistory />
        </div>
        
        {/* <div className="max-w-md mx-auto mt-8 text-center">
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="font-semibold text-gray-800 mb-2">개발 로드맵</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>✅ 랜덤 음식 추천</p>
              <p>✅ 사용자 기록 시스템</p>
              <p>✅ 먹은 음식 통계</p>
              <p>✅ 지역별 맛집 추천</p>
              <p>✅ 날씨 기반 추천</p>
              <p>🔄 서비스 배포 (최종 단계)</p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}