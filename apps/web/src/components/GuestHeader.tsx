'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, LogIn, Download, Sparkles } from 'lucide-react';
import { Button } from '@prompalette/ui';

export function GuestHeader() {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PromPalette</h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  プロンプト管理・共有プラットフォーム
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => handleNavigation('/search')}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>検索</span>
            </button>
            
            <Link
              href="/docs"
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Desktop版</span>
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigation('/login')}
              className="flex items-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>ログイン</span>
            </Button>
            
            <Button
              size="sm"
              onClick={() => handleNavigation('/login')}
              className="bg-indigo-600 hover:bg-indigo-700 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>無料で始める</span>
            </Button>
          </div>

        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t py-3">
          <nav className="flex items-center justify-around">
            <button
              onClick={() => handleNavigation('/search')}
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="text-xs">検索</span>
            </button>
            
            <Link
              href="/docs"
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-xs">Desktop版</span>
            </Link>
            
            <button
              onClick={() => handleNavigation('/login')}
              className="flex flex-col items-center space-y-1 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="text-xs">ログイン</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}