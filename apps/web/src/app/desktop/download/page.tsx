'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@prompalette/ui';
import { DownloadButton } from '@/components/DownloadButton';
import Image from 'next/image';
import Link from 'next/link';
import { Apple, Download, Zap, Menu, Settings, RotateCcw, Lock, Github, BookOpen, MessageSquare, ExternalLink, List, HelpCircle } from 'lucide-react';
import { TableOfContents } from '@/components/TableOfContents';

export default function DownloadPage() {
  const sections = [
    { id: 'download', title: 'ダウンロード', icon: Download },
    { id: 'requirements', title: 'システム要件', icon: Settings },
    { id: 'installation', title: 'インストール', icon: List },
    { id: 'security', title: 'セキュリティ', icon: Lock },
    { id: 'support', title: 'サポート', icon: HelpCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/50 to-purple-50/50 relative">
      <TableOfContents sections={sections} />
      {/* Header with Logo */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/prompalette_logo_1080_1080.png"
              alt="PromPalette Logo"
              width={80}
              height={80}
              className="rounded-2xl shadow-lg w-16 h-16 sm:w-20 sm:h-20"
              sizes="(max-width: 640px) 64px, 80px"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            PromPalette Desktop をダウンロード
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-8 sm:mb-12 max-w-2xl mx-auto">
            macOS用のネイティブデスクトップアプリケーション。システム全体からの瞬時アクセスでAIワークフローを革新。
          </p>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="pb-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-2 items-center">
            {/* Download Card */}
            <div className="order-2 lg:order-1">
              <Card className="relative overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                      <Apple className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-slate-900">macOS</CardTitle>
                      <CardDescription className="text-base text-slate-600 mt-1">
                        macOS 11.0 (Big Sur) 以降
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <DownloadButton 
                      platform="macos"
                      className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      macOS版をダウンロード
                      <span className="ml-2 text-sm opacity-90">(.dmg)</span>
                    </DownloadButton>
                    <p className="text-sm text-slate-500 mt-3">
                      ユニバーサルバイナリ（Intel & Apple Silicon）
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500" />
                      主な機能
                    </h4>
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-indigo-500" />
                        <span className="text-slate-700">ネイティブパフォーマンス</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-purple-500" />
                        <span className="text-slate-700">グローバルホットキー対応</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Menu className="w-4 h-4 text-teal-500" />
                        <span className="text-slate-700">メニューバー統合</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <RotateCcw className="w-4 h-4 text-orange-500" />
                        <span className="text-slate-700">自動アップデート</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Screenshot */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl blur-2xl opacity-20 transform scale-105"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
                  <div className="bg-slate-100 px-4 py-3 flex items-center gap-2 border-b border-slate-200">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-sm text-slate-600 font-medium">PromPalette Desktop</span>
                    </div>
                  </div>
                  <Image
                    src="/main-interface.png"
                    alt="PromPalette Desktop インターフェース"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Requirements */}
      <section id="requirements" className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-slate-900">システム要件</CardTitle>
              <CardDescription className="text-base">
                PromPalette Desktop を快適にお使いいただくための推奨環境
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-600" />
                    最小要件
                  </h4>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                      macOS 11.0 (Big Sur) 以降
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                      50 MB の空きディスク容量
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                      4 GB RAM
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    推奨環境
                  </h4>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      macOS 13.0 (Ventura) 以降
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      Apple Silicon Mac
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      8 GB RAM 以上
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Installation Instructions */}
      <section id="installation" className="py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">簡単インストール</h2>
            <p className="text-base sm:text-lg text-slate-600">3ステップでPromPaletteをすぐに使い始められます</p>
          </div>

          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">ダウンロード</h3>
                <p className="text-sm text-slate-600">.dmgファイルをダウンロードして開きます</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">インストール</h3>
                <p className="text-sm text-slate-600">PromPaletteをApplicationsフォルダにドラッグ</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">起動</h3>
                <p className="text-sm text-slate-600">右クリック→開くで初回起動し、権限を許可</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <section id="security" className="py-16 bg-orange-50/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <Card className="border-orange-200 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-orange-900">
                <Lock className="w-6 h-6 text-orange-600" />
                セキュリティについて
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-orange-800">
              <div className="bg-orange-100/50 rounded-lg p-4">
                <h4 className="font-semibold mb-2">macOS Gatekeeperについて</h4>
                <p className="text-sm leading-relaxed">
                  PromPaletteは現在Apple Developer Program未署名のため、初回起動時にGatekeeperの警告が表示されます。
                  <strong>右クリック → 「開く」</strong>を選択してインストールを続行してください。
                  これはオープンソースアプリケーションでは一般的な手順です。
                </p>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>アプリケーションはローカルで動作し、外部サーバーに個人データを送信しません</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>ソースコードは公開されており、GitHubで確認いただけます</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section id="support" className="py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                インストールでお困りですか？
              </h2>
              <p className="text-lg text-slate-600">
                詳しいガイドやサポートリソースをご用意しています
              </p>
            </div>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/desktop/getting-started">
                <Button size="lg" variant="outline" className="text-base px-6 py-3 border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50">
                  <BookOpen className="w-4 h-4 mr-2" />
                  インストールガイド
                </Button>
              </Link>
              <Link href="/desktop/guide">
                <Button size="lg" variant="outline" className="text-base px-6 py-3 border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50">
                  <BookOpen className="w-4 h-4 mr-2" />
                  ユーザーガイド
                </Button>
              </Link>
              <Button size="lg" variant="outline" asChild className="text-base px-6 py-3 border-2 border-slate-200 hover:border-teal-300 hover:bg-teal-50">
                <a href="https://github.com/Jun-T-git/prompalette/issues" target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  問題を報告
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-50/80 backdrop-blur-sm border-t border-slate-200">
        <div className="container mx-auto px-4 text-center">
          <div className="text-sm text-slate-600 space-y-2">
            <p>最新バージョン: v0.1.0 • リリース: 2025年7月</p>
            <p>
              <Link href="https://github.com/Jun-T-git/prompalette" className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors inline-flex items-center gap-1">
                <Github className="w-4 h-4" />
                GitHubでソースコードを見る
                <ExternalLink className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}