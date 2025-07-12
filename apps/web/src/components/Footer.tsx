'use client';

import { Github, Heart, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/prompalette_logo_1080_1080.png"
                alt="PromPalette Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="font-bold text-xl">PromPalette</span>
            </div>
            <p className="text-slate-300 mb-6 max-w-md">
              AIプロンプト管理の新しいスタンダード。ウェブとデスクトップで使える、
              プロンプト管理のためのオールインワンプラットフォーム。
            </p>
            <div className="flex items-center gap-4">
              <Link 
                href="https://github.com/Jun-T-git/prompalette" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">プロダクト</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/desktop" className="text-slate-300 hover:text-white transition-colors text-sm">
                  Desktop版
                </Link>
              </li>
              <li>
                <Link href="/desktop/guide" className="text-slate-300 hover:text-white transition-colors text-sm">
                  ユーザーガイド
                </Link>
              </li>
              <li>
                <Link href="/download-guide" className="text-slate-300 hover:text-white transition-colors text-sm">
                  ダウンロードガイド
                </Link>
              </li>
              <li>
                <Link 
                  href="https://github.com/Jun-T-git/prompalette/releases" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-1"
                >
                  リリースノート
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">サポート</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="https://github.com/Jun-T-git/prompalette/issues" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-1"
                >
                  問題を報告
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <p>&copy; 2025 PromPalette. All rights reserved.</p>
              <span className="hidden sm:inline">•</span>
              <Link 
                href="https://opensource.org/licenses/MIT" 
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                MIT License
              </Link>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>for the AI community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}