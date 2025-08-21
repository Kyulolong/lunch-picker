'use client';

import { useState } from 'react';
import { foodList, foodCategories, getFoodsByCategory } from '@/lib/foodData';
import { saveSelectedFood } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { calculateWeatherScore } from '@/lib/weatherService';
import type { Food } from '@/types';
import type { WeatherData } from '@/lib/weatherService';

interface FoodPickerProps {
  onFoodSelected?: (food: Food) => void;
  weather?: WeatherData | null;
}

export default function FoodPicker({ onFoodSelected, weather }: FoodPickerProps) {
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [useWeatherRecommendation, setUseWeatherRecommendation] = useState(true);
  
  const { user, isLoading: userLoading } = useUser();

  // 날씨 기반 가중치가 적용된 음식 선택
  const getWeightedRandomFood = () => {
    const filteredFoods = getFoodsByCategory(selectedCategory);
    
    if (!weather || !useWeatherRecommendation) {
      // 날씨 정보가 없거나 사용하지 않을 때는 기본 랜덤
      const randomIndex = Math.floor(Math.random() * filteredFoods.length);
      return filteredFoods[randomIndex];
    }

    // 날씨 기반 가중치 계산
    const weightedFoods = filteredFoods.map(food => ({
      food,
      weight: calculateWeatherScore(food.tags, weather)
    }));

    // 가중치 총합 계산
    const totalWeight = weightedFoods.reduce((sum, item) => sum + item.weight, 0);
    
    // 가중치를 고려한 랜덤 선택
    let random = Math.random() * totalWeight;
    for (const item of weightedFoods) {
      random -= item.weight;
      if (random <= 0) {
        return item.food;
      }
    }

    // 폴백: 마지막 음식 반환
    return weightedFoods[weightedFoods.length - 1].food;
  };

  // 음식 선택 저장
  const handleFoodConfirm = async () => {
    if (!selectedFood || !user) {
      alert('오류가 발생했습니다. 페이지를 새로고침해보세요.');
      return;
    }
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const success = await saveSelectedFood(
        user.id,
        selectedFood.id,
        selectedFood.name,
        selectedFood.category
      );
      
      if (success) {
        setSaveMessage(`"${selectedFood.name}" 기록 완료!`);
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('저장에 실패했습니다.');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      setSaveMessage('저장 중 오류가 발생했습니다.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const pickRandomFood = () => {
    setIsSpinning(true);
    setSaveMessage('');
    
    setTimeout(() => {
      const pickedFood = getWeightedRandomFood();
      
      setSelectedFood(pickedFood);
      setIsSpinning(false);
      
      if (onFoodSelected) {
        onFoodSelected(pickedFood);
      }
    }, 1500);
  };

  const getFoodEmoji = (food: Food): string => {
    const emojiMap: { [key: string]: string } = {
      // 한식
      '김치찌개': '🍲', '불고기': '🥩', '비빔밥': '🍚', '냉면': '🍜', '삼겹살': '🥓',
      '김치볶음밥': '🍚', '된장찌개': '🍲', '갈비탕': '🍲',
      // 중식  
      '짜장면': '🍜', '짬뽕': '🍜', '탕수육': '🍖', '마파두부': '🌶️', '볶음밥': '🍚',
      '깐풍기': '🍗', '유린기': '🍗',
      // 일식
      '초밥': '🍣', '라멘': '🍜', '돈까스': '🍛', '우동': '🍜', '규동': '🍱',
      '연어덮밥': '🍣', '치킨가라아게': '🍗',
      // 양식
      '까르보나라': '🍝', '마르게리타피자': '🍕', '햄버거': '🍔', '스테이크': '🥩', 
      '리조또': '🍚', '토마토파스타': '🍝', '시저샐러드': '🥗',
      // 분식
      '떡볶이': '🍢', '김밥': '🍙', '순대': '🌭', '튀김': '🍤', '라면': '🍜',
      '핫도그': '🌭', '토스트': '🍞',
      // 기타
      '쌀국수': '🍜', '팟타이': '🍜', '인도커리': '🍛', '멕시칸타코': '🌮', '케밥': '🥙'
    };
    return emojiMap[food.name] || '🍽️';
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
        🍽️ 점심 메뉴 추천
      </h1>

      {/* 사용자 상태 표시 */}
      {userLoading ? (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-center text-sm text-blue-700">
          사용자 정보 로딩 중...
        </div>
      ) : user ? (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded text-center text-sm text-green-700">
          사용자 ID: {user.id.slice(0, 8)}...
        </div>
      ) : (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-center text-sm text-red-700">
          사용자 생성 중 오류 발생
        </div>
      )}

      {/* 카테고리 선택 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          카테고리 선택
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSpinning}
        >
          <option value="all">전체</option>
          {Object.entries(foodCategories).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* 날씨 기반 추천 토글 */}
      {weather && (
        <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-sm font-medium text-blue-800">날씨 기반 추천</span>
            <span className="ml-2 text-xs text-blue-600">
              ({weather.temperature}°C, {weather.description})
            </span>
          </div>
          <button
            onClick={() => setUseWeatherRecommendation(!useWeatherRecommendation)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              useWeatherRecommendation ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                useWeatherRecommendation ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      )}

      {/* 결과 표시 영역 */}
      <div className="mb-6 h-32 flex items-center justify-center bg-gray-50 rounded-lg">
        {isSpinning ? (
          <div className="text-center">
            <div className="animate-spin text-4xl mb-2">🎲</div>
            <p className="text-gray-600">메뉴를 고르는 중...</p>
          </div>
        ) : selectedFood ? (
          <div className="text-center">
            <div className="text-5xl mb-2">{getFoodEmoji(selectedFood)}</div>
            <h2 className="text-xl font-bold text-gray-800">{selectedFood.name}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {foodCategories[selectedFood.category as keyof typeof foodCategories]}
            </p>
            <div className="flex flex-wrap gap-1 mt-2 justify-center">
              {selectedFood.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <div className="text-4xl mb-2">❓</div>
            <p>버튼을 눌러서 메뉴를 추천받아보세요!</p>
          </div>
        )}
      </div>

      {/* 저장 메시지 */}
      {saveMessage && (
        <div className={`mb-4 p-3 rounded text-center text-sm ${
          saveMessage.includes('완료') 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* 추천 버튼 */}
      <button
        onClick={pickRandomFood}
        disabled={isSpinning || !user}
        className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 ${
          isSpinning || !user
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 active:transform active:scale-95'
        }`}
      >
        {isSpinning ? '고르는 중...' : '🎲 메뉴 추천받기'}
      </button>

      {/* 통계 정보 */}
      <div className="mt-6 text-center text-sm text-gray-500">
        총 {getFoodsByCategory(selectedCategory).length}개의 메뉴 중에서 추천
      </div>

      {/* 선택 확정 버튼 */}
      {selectedFood && !isSpinning && user && (
        <button
          onClick={handleFoodConfirm}
          disabled={isSaving}
          className={`w-full mt-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            isSaving
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isSaving ? '저장 중...' : '✅ 이걸로 결정!'}
        </button>
      )}
    </div>
  );
}