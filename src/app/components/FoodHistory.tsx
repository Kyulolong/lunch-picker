'use client';

import { useFoodHistory } from '@/hooks/useFoodHistory';
import { useUser } from '@/hooks/useUser';
import { foodCategories } from '@/lib/foodData';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function FoodHistory() {
  const { user } = useUser();
  const { history, stats, isLoading, error, refreshHistory } = useFoodHistory(user?.id || null);

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
        <p className="text-center text-gray-500">사용자 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
        <p className="text-center text-gray-500">음식 기록을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
        <p className="text-center text-red-500">오류: {error}</p>
        <button 
          onClick={refreshHistory}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'M월 d일 HH:mm', { locale: ko });
    } catch {
      return '날짜 오류';
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">음식 기록</h2>
        <button 
          onClick={refreshHistory}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          새로고침
        </button>
      </div>

      {/* 통계 섹션 */}
      {stats && stats.totalSelections > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-3">통계</h3>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSelections}</div>
              <div className="text-sm text-gray-600">총 선택 횟수</div>
            </div>
            
            {/* 카테고리별 통계 */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">카테고리별 선택</h4>
              <div className="space-y-1">
                {Object.entries(stats.categoryCounts)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">
                        {foodCategories[category as keyof typeof foodCategories] || category}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{count}회</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* 자주 먹는 음식 Top 3 */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">자주 먹는 음식</h4>
              <div className="space-y-1">
                {Object.entries(stats.foodCounts)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([food, count], index) => (
                    <div key={food} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {food}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{count}회</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 최근 기록 */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">최근 기록</h3>
        
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🍽️</div>
            <p>아직 선택한 음식이 없습니다.</p>
            <p className="text-sm">메뉴를 추천받아 선택해보세요!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.map((selection) => (
              <div 
                key={selection.id} 
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-800">{selection.food_name}</div>
                  <div className="text-sm text-gray-600">
                    {foodCategories[selection.food_category as keyof typeof foodCategories] || selection.food_category}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {formatDate(selection.selected_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 디버그용 버튼 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="w-full px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800 rounded text-sm border border-red-300 hover:border-red-400 transition-all duration-200 hover:cursor-pointer"
        >
          🗑️ 데이터 초기화
        </button>
      </div>
    </div>
  );
}