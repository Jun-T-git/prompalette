'use client';

import { Button } from '@prompalette/ui';
import { Menu, X, Github, BookOpen, Download } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Image
            src="/prompalette_logo_1080_1080.png"
            alt="PromPalette Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="font-bold text-lg text-slate-900">PromPalette</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/" 
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            ホーム
          </Link>
          <Link 
            href="/desktop" 
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Desktop
          </Link>
          <Link 
            href="/desktop/guide" 
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            ガイド
          </Link>
          <Link 
            href="https://github.com/Jun-T-git/prompalette" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
          >
            <Github className="w-4 h-4" />
            GitHub
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/desktop/guide">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
              <BookOpen className="w-4 h-4 mr-2" />
              ドキュメント
            </Button>
          </Link>
          <Link href="/desktop">
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Download className="w-4 h-4 mr-2" />
              ダウンロード
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="メニューを開く"
        >
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200/50 bg-white/95 backdrop-blur">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <Link 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              className="block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              ホーム
            </Link>
            <Link 
              href="/desktop" 
              onClick={() => setIsMenuOpen(false)}
              className="block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Desktop
            </Link>
            <Link 
              href="/desktop/guide" 
              onClick={() => setIsMenuOpen(false)}
              className="block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              ガイド
            </Link>
            <Link 
              href="https://github.com/Jun-T-git/prompalette" 
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className="block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              GitHub
            </Link>
            <div className="pt-4 border-t border-slate-200/50 space-y-3">
              <Link href="/desktop/guide" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start text-slate-600 hover:text-slate-900">
                  <BookOpen className="w-4 h-4 mr-2" />
                  ドキュメント
                </Button>
              </Link>
              <Link href="/desktop" onClick={() => setIsMenuOpen(false)}>
                <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Download className="w-4 h-4 mr-2" />
                  ダウンロード
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}