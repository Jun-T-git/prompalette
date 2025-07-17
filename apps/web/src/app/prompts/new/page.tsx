'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { STUB_USER_SESSION, isLocalDevelopment } from '@/lib/auth-stub';
import { WebAppLayout } from '@/components/WebAppLayout';
import { PromptForm } from '@/components/forms/PromptForm';
import { ErrorDisplay } from '@/components/ErrorDisplay';

export default function NewPromptPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [globalError, setGlobalError] = useState<string | null>(null);

  // ローカル開発用の認証スタブ
  const currentSession = isLocalDevelopment ? STUB_USER_SESSION : session;

  // 認証チェック - プロダクション環境でセッションがない場合
  if (!isLocalDevelopment && !session) {
    return (
      <WebAppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <h2 className="text-lg font-medium text-yellow-800 mb-2">
                ログインが必要です
              </h2>
              <p className="text-yellow-700 mb-4">
                プロンプトを作成するにはログインしてください。
              </p>
              <button
                onClick={() => router.push('/login')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md"
              >
                ログイン
              </button>
            </div>
          </div>
        </div>
      </WebAppLayout>
    );
  }

  return (
    <WebAppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              新しいプロンプトを作成
            </h1>
            <p className="text-gray-600">
              AIとのやり取りを効率化するプロンプトを作成しましょう
            </p>
          </div>

          {/* Global Error Display */}
          {globalError && (
            <div className="mb-6">
              <ErrorDisplay
                error={{
                  code: 'CREATION_ERROR',
                  message: globalError,
                  timestamp: new Date().toISOString(),
                }}
                onDismiss={() => setGlobalError(null)}
              />
            </div>
          )}

          {/* Form Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">プロンプト情報</h2>
                
                {currentSession && (
                  <PromptForm
                    userId={currentSession.user.id}
                    isLocalDevelopment={isLocalDevelopment}
                    onError={setGlobalError}
                  />
                )}
              </div>
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border shadow-sm p-6 sticky top-6">
                <h3 className="font-semibold text-sm mb-4">プレビュー</h3>
                <div className="text-sm text-gray-500">
                  フォームに入力すると、ここにプレビューが表示されます
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WebAppLayout>
  );
}