'use client';

import { ReactNode } from 'react';
import { GuestHeader } from './GuestHeader';
import Link from 'next/link';

interface GuestLayoutProps {
  children: ReactNode;
  className?: string;
}

export function GuestLayout({ children, className = '' }: GuestLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${className}`}>
      <GuestHeader />
      
      <main className="flex-1" role="main">
        {children}
      </main>
      
      <footer className="bg-white border-t py-8" role="contentinfo">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">PromPalette</h3>
              <p className="text-sm text-gray-600">
                プロンプト管理・共有プラットフォーム
              </p>
              <p className="text-sm text-gray-600">
                デスクトップとWebで、どこからでも
              </p>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">製品</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/search" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    検索
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Desktop版
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">リソース</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/docs" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    ドキュメント
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    ヘルプ
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    サポート
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">法的事項</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                    Cookie ポリシー
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-500">
                © 2024 PromPalette. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <Link href="/login" className="text-sm text-indigo-600 hover:text-indigo-700">
                  ログイン
                </Link>
                <Link href="/login" className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                  無料で始める
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}