import { createClient } from '@supabase/supabase-js';
import type { User, FoodSelection } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL과 ANON KEY가 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// 연결 테스트 함수들
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Supabase 연결 성공!');
    return true;
  } catch (error: any) {
    console.error('❌ Supabase 연결 실패:', error.message);
    return false;
  }
}

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('⚠️ 테이블이 아직 생성되지 않았습니다.');
      return true;
    }
    
    if (error) {
      throw error;
    }
    
    console.log('✅ 데이터베이스 연결 성공!');
    return true;
  } catch (error: any) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    return false;
  }
}

// 음식 선택 저장
export async function saveSelectedFood(
  userId: string, 
  foodId: string, 
  foodName: string, 
  foodCategory: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('food_selections')
      .insert({
        user_id: userId,
        food_id: foodId,
        food_name: foodName,
        food_category: foodCategory
      });
    
    if (error) throw error;
    console.log('✅ 음식 선택 저장 성공!');
    return true;
  } catch (error: any) {
    console.error('❌ 음식 선택 저장 실패:', error.message);
    return false;
  }
}

// 사용자 음식 기록 조회
export async function getUserFoodHistory(userId: string): Promise<FoodSelection[]> {
  try {
    const { data, error } = await supabase
      .from('food_selections')
      .select('*')
      .eq('user_id', userId)
      .order('selected_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error: any) {
    console.error('❌ 음식 기록 조회 실패:', error.message);
    return [];
  }
}

// 음식 통계 조회
export async function getFoodStats(userId: string) {
  try {
    const { data, error } = await supabase
      .from('food_selections')
      .select('food_name, food_category, selected_at')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    const stats = {
      totalSelections: data.length,
      categoryCounts: {} as Record<string, number>,
      foodCounts: {} as Record<string, number>,
      recentSelections: data.slice(0, 5)
    };
    
    data.forEach(selection => {
      stats.categoryCounts[selection.food_category] = 
        (stats.categoryCounts[selection.food_category] || 0) + 1;
      
      stats.foodCounts[selection.food_name] = 
        (stats.foodCounts[selection.food_name] || 0) + 1;
    });
    
    return stats;
  } catch (error: any) {
    console.error('❌ 음식 통계 조회 실패:', error.message);
    return null;
  }
}