'use client';

import { Button } from '@prompalette/ui';
import { Search, Plus, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

import { STUB_USER_SESSION, isLocalDevelopment } from '@/lib/auth-stub';

export function AppHeader() {
  const { data: session } = useSession();
  
  // ローカル開発用の認証スタブ
  const currentSession = isLocalDevelopment ? STUB_USER_SESSION : session;

  const handleSignOut = () => {
    if (isLocalDevelopment) {
      // ローカル開発では単純にリダイレクト
      window.location.href = '/docs';
    } else {
      signOut({ callbackUrl: '/docs' });
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/prompalette_logo_1080_1080.png"
              alt="PromPalette"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-gray-900">PromPalette</span>
          </Link>

          {/* Navigation */}
          {currentSession && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ダッシュボード
              </Link>
              <Link
                href="/prompts"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                マイプロンプト
              </Link>
              <Link
                href="/explore"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                探索
              </Link>
              <Link
                href="/search"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                検索
              </Link>
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            {currentSession ? (
              <>
                <Link href="/prompts/new">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    新規作成
                  </Button>
                </Link>
                <Link href="/search">
                  <Button size="sm" variant="outline">
                    <Search className="w-4 h-4" />
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2">
                    <Image
                      src={currentSession.user.image || '/prompalette_logo_1080_1080.png'}
                      alt={currentSession.user.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {currentSession.user.name}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button size="sm">ログイン</Button>
                </Link>
                <Link href="/docs">
                  <Button size="sm" variant="outline">
                    ドキュメント
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}