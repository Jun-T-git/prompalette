'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@prompalette/ui';
import {
  CheckCircle,
  Cloud,
  Globe,
  Monitor,
  Search,
  Users,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { DownloadButton } from '@/components/DownloadButton';
import { PageLayout } from '@/components/PageLayout';
import { StructuredData } from '@/components/StructuredData';

export default function MarketingPage() {
  return (
    <PageLayout>
      <StructuredData
        type="WebApplication"
        name="PromPalette"
        description="AIプロンプト管理ツール - ウェブとデスクトップで使える、プロンプト管理のためのオールインワンプラットフォーム"
        url="https://prompalette.com"
        applicationCategory="ProductivityApplication"
      />
      <div className="bg-slate-50 font-inter antialiased relative">
        {/* Hero Section */}
        <section
          id="hero"
          className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-indigo-50/30"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/20 via-transparent to-purple-50/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32 max-w-7xl relative">
            <div className="text-center mb-24">
              <div className="flex items-center justify-center mb-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-lg opacity-30"></div>
                  <div className="relative p-6 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
                    <Image
                      src="/prompalette_logo_1080_1080.png"
                      alt="PromPalette Logo"
                      width={64}
                      height={64}
                      className="rounded-2xl w-12 h-12 sm:w-16 sm:h-16"
                      sizes="(max-width: 640px) 48px, 64px"
                    />
                  </div>
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 lg:mb-8 bg-gradient-to-r from-gray-900 via-indigo-600 to-purple-600 bg-clip-text text-transparent leading-[1.1] tracking-tight">
                PromPalette
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-700 mb-6 max-w-4xl mx-auto leading-tight">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  ⌘+Ctrl
                </span>
                でどこからでも瞬時に呼び出し
                <br className="hidden md:block" />
                お気に入りプロンプトは即座にペースト
              </p>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                バックグラウンドから<strong>1秒</strong>でプロンプトにアクセス。
                <br className="hidden md:block" />
                作業を中断せず、思考の流れを止めることなく、AIと対話を続けられます。
              </p>

              {/* Key Benefits */}
              <div className="max-w-5xl mx-auto mb-16">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      グローバルホットキー
                    </h3>
                    <p className="text-gray-600 text-sm">
                      お気に入りプロンプトを番号キーで瞬時に呼び出し
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Search className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">即時検索</h3>
                    <p className="text-gray-600 text-sm">
                      入力と同時にプロンプトが絞り込まれて見つかる
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Monitor className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">即時ペースト</h3>
                    <p className="text-gray-600 text-sm">
                      選択と同時にクリップボードにコピー、即座に貼り付け
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Options */}
              <div
                id="solutions"
                className="grid lg:grid-cols-2 gap-6 lg:gap-10 max-w-6xl mx-auto mb-20"
              >
                <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 to-indigo-100/30"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-200/30 to-indigo-300/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
                  <CardHeader className="relative p-10 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:shadow-indigo-500/20 transition-all duration-300">
                      <Globe className="w-12 h-12 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-gray-800 mb-4">
                      PromPalette Web
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600 leading-relaxed">
                      ブラウザベースのコラボレーションプラットフォーム
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative px-10 pb-10">
                    <div className="space-y-5 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Cloud className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">クラウド同期</h4>
                          <p className="text-sm text-gray-600">どこからでもアクセス可能</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">公開プロンプト発見</h4>
                          <p className="text-sm text-gray-600">コミュニティのプロンプトを探索</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Search className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">高度な検索</h4>
                          <p className="text-sm text-gray-600">@username, #tag検索対応</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 font-semibold py-4 rounded-2xl shadow-lg cursor-not-allowed"
                      size="lg"
                    >
                      Webアプリを開始（開発中）
                    </Button>
                    <p className="text-sm text-slate-500 text-center mt-4">
                      完全無料 • OAuth認証
                    </p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden border-0 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/40 to-pink-50/30"></div>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-pink-200/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
                  <CardHeader className="relative p-10 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:shadow-purple-500/20 transition-all duration-300">
                      <Monitor className="w-12 h-12 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-gray-800 mb-4">
                      PromPalette Desktop
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600 leading-relaxed">
                      バックグラウンドから1秒でアクセス
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative px-10 pb-10">
                    <div className="space-y-5 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">⌘+Ctrl+数字キー</h4>
                          <p className="text-sm text-gray-600">
                            お気に入りプロンプトを瞬時に呼び出し
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Search className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">⌘+⇧+P で即時検索</h4>
                          <p className="text-sm text-gray-600">入力しながらリアルタイム絞り込み</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Monitor className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">選択即コピー</h4>
                          <p className="text-sm text-gray-600">Enterで即座にクリップボードへ</p>
                        </div>
                      </div>
                    </div>
                    <Link href="/docs/desktop" className="block">
                      <Button
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                        size="lg"
                      >
                        デスクトップ版を見る
                      </Button>
                    </Link>
                    <p className="text-sm text-slate-500 text-center mt-4">
                      現在はmacOS専用（Windows/Linux版は開発予定）
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          id="cta"
          className="py-32 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"></div>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent"></div>
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl text-center relative">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
              今すぐAIワークフローを革新しよう
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-3xl mx-auto leading-relaxed">
              プロンプト管理の効率化で、
              <br className="hidden md:block" />
              AIワークフローを次のレベルへ。
            </p>
            <div className="flex gap-6 justify-center flex-wrap mb-12">
              <Button
                disabled
                size="lg"
                className="text-lg px-12 py-5 bg-gray-300 text-gray-500 rounded-2xl font-semibold shadow-lg cursor-not-allowed"
              >
                <Globe className="w-5 h-5 mr-2" />
                Webアプリを開始（開発中）
              </Button>
              <DownloadButton
                platform="macos"
                className="text-lg px-12 py-5 bg-white text-gray-900 hover:bg-gray-50 rounded-2xl font-semibold shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-[1.02] border-2 border-white/30"
              >
                デスクトップ版をダウンロード
              </DownloadButton>
            </div>
            <div className="flex items-center justify-center gap-8 text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>完全無料</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>オープンソース</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>アカウント不要</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}