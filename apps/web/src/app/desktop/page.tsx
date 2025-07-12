import { Button } from '@prompalette/ui';
import { Apple, BookOpen, Globe } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { DownloadButton } from '@/components/DownloadButton';
import { StructuredData } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: 'PromPalette Desktop - macOS用AIプロンプト管理アプリ',
  description:
    'macOS専用のネイティブデスクトップアプリ。⌘+Ctrlでグローバルアクセス、お気に入りプロンプトを瞬時に呼び出し。バックグラウンドから1秒でAIワークフローを最適化。',
  openGraph: {
    title: 'PromPalette Desktop - macOS用AIプロンプト管理アプリ',
    description:
      'macOS専用のネイティブデスクトップアプリ。⌘+Ctrlでグローバルアクセス、お気に入りプロンプトを瞬時に呼び出し。',
    url: 'https://prompalette.com/desktop',
  },
};

export default function DesktopLandingPage() {
  return (
    <>
      <StructuredData
        type="SoftwareApplication"
        name="PromPalette Desktop"
        description="macOS専用のネイティブデスクトップアプリ。⌘+Ctrlでグローバルアクセス、お気に入りプロンプトを瞬時に呼び出し。"
        url="https://prompalette.com/desktop"
        applicationCategory="ProductivityApplication"
        operatingSystem="macOS"
      />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 max-w-7xl">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-8">
                <Image
                  src="/prompalette_logo_1080_1080.png"
                  alt="PromPalette Logo"
                  width={100}
                  height={100}
                  className="rounded-3xl shadow-xl w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28"
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, (max-width: 1024px) 96px, 112px"
                />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                PromPalette
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-slate-700 mb-4">
                AIワークフローを、もっと速く、もっと賢く
              </p>
              <p className="text-base sm:text-lg text-slate-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
                プロンプト管理を革新するmacOSネイティブアプリ。瞬時のアクセス、強力な整理機能、
                お気に入りのAIツールとのシームレスな連携を実現します。
              </p>
              <div className="flex gap-3 sm:gap-4 justify-center flex-wrap mb-8">
                <DownloadButton
                  platform="macos"
                  className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  無料ダウンロード
                </DownloadButton>
                <Link href="/desktop/getting-started">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    クイックスタート
                  </Button>
                </Link>
              </div>
              <div className="flex gap-4 justify-center mb-8">
                <Link
                  href="/en/desktop"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors inline-flex items-center gap-1"
                >
                  <Globe className="w-4 h-4" />
                  English Version
                </Link>
              </div>
              <p className="text-sm text-slate-500">完全無料 • macOS専用 • オープンソース</p>
            </div>

            <div className="relative mx-auto max-w-6xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-3xl blur-3xl opacity-20 transform scale-110"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20 w-2/3 mx-auto">
                <div className="bg-slate-100/90 backdrop-blur-sm px-6 py-4 flex items-center gap-3 border-b border-slate-200/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-sm text-slate-700 font-medium">PromPalette Desktop</span>
                  </div>
                </div>
                <Image
                  src="/main-interface.gif"
                  alt="PromPalette Desktop インターフェース"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-5xl text-center relative">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              macOSでAIワークフローを革新しませんか？
            </h2>
            <p className="text-xl mb-12 text-blue-100 max-w-3xl mx-auto">
              AIプロンプト管理をもっと効率的に。今すぐ無料でお試しください。
            </p>
            <div className="flex gap-6 justify-center flex-wrap mb-8">
              <DownloadButton
                platform="macos"
                className="text-lg px-10 py-4 bg-white text-blue-600 hover:bg-blue-50 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Apple className="w-5 h-5 mr-2" />
                macOS版を無料ダウンロード
              </DownloadButton>
              <Link href="/desktop/getting-started">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-4 bg-white text-blue-600 hover:bg-blue-50 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  インストールガイド
                </Button>
              </Link>
            </div>
            <p className="text-blue-200 text-sm">無料 • オープンソース</p>
          </div>
        </section>
      </main>
    </>
  );
}
