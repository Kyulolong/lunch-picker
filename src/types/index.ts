// 음식 관련 타입들
export interface Food {
  id: string;
  name: string;
  category: string;
  tags: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const foodCategories = {
  korean: '한식',
  chinese: '중식',
  japanese: '일식',
  western: '양식',
  snack: '분식',
  etc: '기타'
} as const;

export type FoodCategory = keyof typeof foodCategories;

// 사용자 관련 타입들
export interface User {
  id: string;
  created_at: string;
  last_active: string;
}

export interface FoodSelection {
  id: string;
  user_id: string;
  food_id: string;
  food_name: string;
  food_category: string;
  selected_at: string;
}

// UI 관련 타입들
export interface FoodPickerState {
  selectedFood: Food | null;
  isSpinning: boolean;
  selectedCategory: string;
}