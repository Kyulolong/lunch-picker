'use client';

import { useEffect, useState } from 'react';
import { testConnection, testDatabaseConnection } from '@/lib/supabase';

interface ConnectionStatus {
  url: string;
  hasKeys: boolean;
  basicConnection: boolean | null;
  databaseConnection: boolean | null;
  error?: string;
}

export default function ConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
    hasKeys: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    basicConnection: null,
    databaseConnection: null
  });

  useEffect(() => {
    const runTests = async () => {
      if (!status.hasKeys) {
        setStatus(prev => ({
          ...prev,
          error: 'SUPABASE_ANON_KEY가 설정되지 않았습니다.'
        }));
        return;
      }

      try {
        // 기본 연결 테스트
        const basicResult = await testConnection();
        setStatus(prev => ({ ...prev, basicConnection: basicResult }));

        // 데이터베이스 연결 테스트
        const dbResult = await testDatabaseConnection();
        setStatus(prev => ({ ...prev, databaseConnection: dbResult }));

      } catch (error: any) {
        setStatus(prev => ({
          ...prev,
          error: error.message
        }));
      }
    };

    runTests();
  }, [status.hasKeys]);

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return '⏳';
    return status ? '✅' : '❌';
  };

  const getStatusText = (status: boolean | null) => {
    if (status === null) return '테스트 중...';
    return status ? '성공' : '실패';
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border">
      <h3 className="text-lg font-bold mb-4 text-gray-800">🔧 Supabase 연결 상태</h3>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="font-medium">서버 URL:</span>
          <span className="text-blue-600 font-mono text-xs">{status.url}</span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="font-medium">API Key 설정:</span>
          <span className={status.hasKeys ? 'text-green-600' : 'text-red-600'}>
            {status.hasKeys ? '✅ 설정됨' : '❌ 누락'}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="font-medium">기본 연결:</span>
          <span className={status.basicConnection ? 'text-green-600' : 'text-red-600'}>
            {getStatusIcon(status.basicConnection)} {getStatusText(status.basicConnection)}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
          <span className="font-medium">DB 연결:</span>
          <span className={status.databaseConnection ? 'text-green-600' : 'text-red-600'}>
            {getStatusIcon(status.databaseConnection)} {getStatusText(status.databaseConnection)}
          </span>
        </div>
        
        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700 text-sm">
              <strong>오류:</strong> {status.error}
            </p>
          </div>
        )}
        
        {status.basicConnection && status.databaseConnection && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-green-700 text-sm">
              🎉 <strong>연결 완료!</strong> 2단계로 진행할 준비가 되었습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}