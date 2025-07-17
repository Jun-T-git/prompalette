import { Button } from '@prompalette/ui';
import { Apple, ArrowRight, BookOpen, Command, Globe, Pin, Search, Zap } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { DownloadButton } from '@/components/DownloadButton';
import { PageLayout } from '@/components/PageLayout';
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
    <PageLayout>
      <StructuredData
        type="SoftwareApplication"
        name="PromPalette Desktop"
        description="macOS専用のネイティブデスクトップアプリ。⌘+Ctrlでグローバルアクセス、お気に入りプロンプトを瞬時に呼び出し。"
        url="https://prompalette.com/desktop"
        applicationCategory="ProductivityApplication"
        operatingSystem="macOS"
      />
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
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
                <Link href="/docs/desktop/guide">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    ユーザガイド
                  </Button>
                </Link>
              </div>
              <div className="flex gap-4 justify-center mb-8">
                <span className="text-sm text-gray-400 inline-flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  English Version (Coming Soon)
                </span>
              </div>
              <p className="text-sm text-slate-500">完全無料 • macOS専用 • オープンソース</p>
            </div>

            <div className="relative mx-auto max-w-6xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-3xl blur-3xl opacity-20 transform scale-110"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20 sm:w-2/3 mx-auto">
                <div className="bg-slate-100/90 backdrop-blur-sm px-6 py-1.5 sm:py-4 flex items-center gap-3 border-b border-slate-200/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">
                      PromPalette Desktop
                    </span>
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

            {/* Features Showcase */}
            <div className="mt-32 max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  なぜもっと早く使わなかったのか
                </h2>
                <p className="text-lg text-slate-600">
                  キーボード一つで完結する、究極のプロンプト体験
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Global Hotkeys */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">瞬時起動</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-mono">
                          ⌘⇧P
                        </kbd>
                        <span className="text-slate-600 text-sm">どこからでも起動</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-mono">
                          ⌘⌃1
                        </kbd>
                        <span className="text-slate-600 text-sm">お気に入り直接</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Smart Search */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-200/30 to-green-200/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Search className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">即時検索</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-mono">
                          #tag
                        </kbd>
                        <span className="text-slate-600 text-sm">タグで絞り込み</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-mono">
                          /key
                        </kbd>
                        <span className="text-slate-600 text-sm">クイックアクセス</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pin System */}
                <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Pin className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">ピン留め</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-mono">
                          1-0
                        </kbd>
                        <span className="text-slate-600 text-sm">10個まで保存</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <kbd className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-mono">
                          Enter
                        </kbd>
                        <span className="text-slate-600 text-sm">即座にコピー</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflow Demo */}
              <div className="mt-20 bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
                <div className="relative">
                  <div className="text-center mb-12">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">
                      3秒でプロンプトからペーストまで
                    </h3>
                    <p className="text-blue-200 text-lg">考える時間を削らず、実行に集中</p>
                  </div>
                  <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-400/30">
                        <Command className="w-6 h-6 text-blue-300" />
                      </div>
                      <span className="text-sm md:text-base">⌘⇧P で起動</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-300 hidden md:block" />
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center border border-teal-400/30">
                        <Search className="w-6 h-6 text-teal-300" />
                      </div>
                      <span className="text-sm md:text-base">タイプして検索</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-300 hidden md:block" />
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-400/30">
                        <kbd className="text-purple-300 font-mono text-sm">⏎</kbd>
                      </div>
                      <span className="text-sm md:text-base">Enter でコピー</span>
                    </div>
                  </div>
                </div>
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
              <Link href="/docs/desktop/guide">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-4 bg-white text-blue-600 hover:bg-blue-50 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  ユーザガイド
                </Button>
              </Link>
            </div>
            <p className="text-blue-200 text-sm">無料 • オープンソース</p>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
