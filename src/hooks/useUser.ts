import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import type { User } from '@/types';

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  createNewUser: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 로컬스토리지에서 사용자 ID 가져오기
  const getUserIdFromStorage = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('lunch_picker_user_id');
  };

  // 로컬스토리지에 사용자 ID 저장
  const saveUserIdToStorage = (userId: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lunch_picker_user_id', userId);
  };

  // 데이터베이스에서 사용자 정보 가져오기
  const fetchUser = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 사용자가 없으면 null 반환
          return null;
        }
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('사용자 조회 실패:', error.message);
      return null;
    }
  };

  // 새 사용자 생성
  const createUser = async (userId?: string): Promise<User | null> => {
    try {
      const newUserId = userId || uuidv4();
      
      const { data, error } = await supabase
        .from('users')
        .insert({ id: newUserId })
        .select()
        .single();

      if (error) throw error;

      saveUserIdToStorage(newUserId);
      return data;
    } catch (error: any) {
      console.error('사용자 생성 실패:', error.message);
      throw error;
    }
  };

  // 사용자 마지막 활동 시간 업데이트
  const updateLastActive = async (userId: string): Promise<void> => {
    try {
      await supabase
        .from('users')
        .update({ last_active: new Date().toISOString() })
        .eq('id', userId);
    } catch (error: any) {
      console.error('마지막 활동 시간 업데이트 실패:', error.message);
    }
  };

  // 새 사용자 생성 (외부에서 호출 가능)
  const createNewUser = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newUser = await createUser();
      if (newUser) {
        setUser(newUser);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 사용자 로드
  useEffect(() => {
    const initializeUser = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // 저장된 사용자 ID 확인
        const savedUserId = getUserIdFromStorage();
        
        if (savedUserId) {
          // 기존 사용자 조회
          const existingUser = await fetchUser(savedUserId);
          
          if (existingUser) {
            setUser(existingUser);
            await updateLastActive(savedUserId);
          } else {
            // 저장된 ID로 사용자를 찾을 수 없으면 새로 생성
            const newUser = await createUser(savedUserId);
            setUser(newUser);
          }
        } else {
          // 첫 방문 - 새 사용자 생성
          const newUser = await createUser();
          setUser(newUser);
        }
      } catch (error: any) {
        setError(error.message);
        console.error('사용자 초기화 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  return {
    user,
    isLoading,
    error,
    createNewUser
  };
}