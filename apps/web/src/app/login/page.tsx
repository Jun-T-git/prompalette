'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@prompalette/ui';
import { AlertCircle, Sparkles, Download, User, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { GuestLayout } from '@/components/GuestLayout';
import { isLocalDevelopment } from '@/lib/auth-stub';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const errorParam = searchParams.get('error');

  // For now, in local development, always show stub auth
  // This can be refined later when OAuth is properly configured
  const showStubAuth = isLocalDevelopment;
  
  // Check if we should show Supabase email/password form
  const useSupabaseAuth = process.env.NEXT_PUBLIC_USE_SUPABASE_AUTH === 'true';

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Login Page Configuration:', {
        isLocalDevelopment,
        showStubAuth,
        useSupabaseAuth,
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_USE_LOCAL_SUPABASE: process.env.NEXT_PUBLIC_USE_LOCAL_SUPABASE,
      });
    }
  }, [showStubAuth, useSupabaseAuth]);

  // エラーパラメータの処理
  useEffect(() => {
    if (errorParam) {
      setError('認証エラーが発生しました。もう一度お試しください。');
    }
  }, [errorParam]);

  // 既にログインしている場合はダッシュボードにリダイレクト
  useEffect(() => {
    if (session?.user?.username) {
      router.push(`/${session.user.username}`);
    }
  }, [session, router]);

  const handleStubSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // For stub auth, we can directly redirect to the user page
      // The auth system will automatically create a stub session
      router.push('/stub-user');
    } catch (error) {
      setError('ログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupabaseSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください。');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('ログインに失敗しました。メールアドレスとパスワードを確認してください。');
        return;
      }

      // Successful login will be handled by the session effect
    } catch (error) {
      setError('ログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // ローディング中の場合
  if (status === 'loading') {
    return (
      <GuestLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </GuestLayout>
    );
  }

  // 既にログインしている場合は何も表示しない
  if (session) {
    return null;
  }

  return (
    <GuestLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex items-center justify-center py-12">
        <div className="max-w-md w-full mx-4">
          {/* Main Login Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 mb-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                PromPalette
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Webでも、Desktopと同じ体験を
              </p>
              <p className="text-sm text-gray-500">
                プロンプトをクラウドで同期して、どこからでもアクセス
              </p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              {showStubAuth ? (
                <>
                  <button 
                    onClick={handleStubSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <User className="w-5 h-5" />
                    {isLoading ? 'ログイン中...' : '開発用アカウントでログイン'}
                  </button>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>開発モード:</strong> OAuth設定なしでテスト用ユーザーとしてログインします
                    </p>
                  </div>
                </>
              ) : useSupabaseAuth ? (
                <>
                  <form onSubmit={handleSupabaseSignIn} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        メールアドレス
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="stub@example.com"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        パスワード
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="password123"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <User className="w-5 h-5" />
                      {isLoading ? 'ログイン中...' : 'ログイン'}
                    </button>
                  </form>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>ローカルSupabase認証:</strong> テストアカウント stub@example.com / password123 でログインできます
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 mb-2">
                    <strong>OAuth設定が必要です</strong>
                  </p>
                  <p className="text-sm text-red-600">
                    GitHub または Google の OAuth 設定を行ってください。詳細は SUPABASE_SETUP.md をご覧ください。
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-4">
                初回ログイン時にアカウントが自動的に作成されます
              </p>
              <div className="flex items-center justify-center gap-4 text-sm">
                <Link href="/privacy" className="text-gray-500 hover:text-indigo-600 transition-colors">
                  プライバシーポリシー
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/terms" className="text-gray-500 hover:text-indigo-600 transition-colors">
                  利用規約
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop App Promotion */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Download className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">デスクトップアプリも利用可能</h3>
                <p className="text-sm text-gray-600">ローカルファーストでより高速な体験</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/docs">
                <Button variant="outline" size="sm" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                  <Sparkles className="w-4 h-4 mr-2" />
                  ダウンロード
                </Button>
              </Link>
              <Link href="/search" className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors">
                まずは公開プロンプトを検索してみる →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}