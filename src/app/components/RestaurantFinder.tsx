'use client';

import { useState, useEffect } from 'react';
import { getRestaurantsForFood, areas, filterByPriceRange } from '@/lib/restaurantData';
import type { Restaurant } from '@/lib/restaurantData';
import type { Food } from '@/types';

interface RestaurantFinderProps {
  selectedFood: Food | null;
}

export default function RestaurantFinder({ selectedFood }: RestaurantFinderProps) {
  const [selectedArea, setSelectedArea] = useState<string>('gangnam');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchRestaurants = () => {
    if (!selectedFood) {
      setRestaurants([]);
      return;
    }

    setIsLoading(true);
    
    // 실제 API 호출을 시뮬레이션하는 딜레이
    setTimeout(() => {
      let results = getRestaurantsForFood(
        selectedFood.name, 
        selectedFood.category, 
        selectedArea
      );
      
      results = filterByPriceRange(results, priceRange);
      setRestaurants(results);
      setIsLoading(false);
    }, 800);
  };

  useEffect(() => {
    searchRestaurants();
  }, [selectedFood, selectedArea, priceRange]);

  const getPriceRangeColor = (price: string) => {
    switch (price) {
      case '저렴': return 'text-green-600 bg-green-100';
      case '보통': return 'text-blue-600 bg-blue-100';
      case '비쌈': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {'★'.repeat(fullStars)}
        {hasHalfStar && '☆'}
        {'☆'.repeat(emptyStars)}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">식당 찾기</h2>
      
      {!selectedFood ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🍽️</div>
          <p>먼저 음식을 선택해주세요!</p>
        </div>
      ) : (
        <>
          {/* 선택된 음식 표시 */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center">
              <span className="text-lg font-medium text-blue-800">
                "{selectedFood.name}" 맛집을 찾는 중...
              </span>
            </div>
          </div>

          {/* 지역 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              지역 선택
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(areas).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 가격대 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              가격대
            </label>
            <div className="flex gap-2">
              {['all', '저렴', '보통', '비쌈'].map((price) => (
                <button
                  key={price}
                  onClick={() => setPriceRange(price)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    priceRange === price
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {price === 'all' ? '전체' : price}
                </button>
              ))}
            </div>
          </div>

          {/* 검색 결과 */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">
              {areas[selectedArea as keyof typeof areas]} 맛집 ({restaurants.length}곳)
            </h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin text-2xl mb-2">🔍</div>
                <p className="text-gray-600">식당을 찾는 중...</p>
              </div>
            ) : restaurants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">😭</div>
                <p>해당 조건의 식당을 찾을 수 없습니다.</p>
                <p className="text-sm">다른 지역이나 가격대를 선택해보세요.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {restaurants.map((restaurant) => (
                  <div key={restaurant.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-800">{restaurant.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceRangeColor(restaurant.priceRange)}`}>
                        {restaurant.priceRange}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      {getRatingStars(restaurant.rating)}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>대표메뉴:</strong> {restaurant.specialties.join(', ')}
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-1">
                      📍 {restaurant.address}
                    </div>
                    
                    {restaurant.openHours && (
                      <div className="text-sm text-gray-500 mb-2">
                        🕒 {restaurant.openHours}
                      </div>
                    )}
                    
                    {restaurant.phone && (
                      <div className="text-sm text-gray-500">
                        📞 {restaurant.phone}
                      </div>
                    )}
                    
                    {/* 특정 음식이 대표메뉴에 있으면 표시 */}
                    {restaurant.specialties.includes(selectedFood.name) && (
                      <div className="mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full inline-block">
                        ✨ {selectedFood.name} 전문점
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}