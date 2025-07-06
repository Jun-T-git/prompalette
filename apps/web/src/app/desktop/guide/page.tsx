'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@prompalette/ui';
import Link from 'next/link';
import { TableOfContents } from '@/components/TableOfContents';
import { Rocket, Zap, Keyboard, Lightbulb, Settings, Plug, Apple, Tag, RotateCcw, FolderOpen, RefreshCw } from 'lucide-react';

export default function GuidePageJA() {
  const sections = [
    { id: 'getting-started', title: 'はじめに', icon: Rocket },
    { id: 'features', title: '主要機能', icon: Zap },
    { id: 'keyboard-shortcuts', title: 'キーボードショートカット', icon: Keyboard },
    { id: 'tips', title: 'プロのコツ', icon: Lightbulb },
    { id: 'troubleshooting', title: 'トラブルシューティング', icon: Settings },
    { id: 'advanced', title: '高度な使用法', icon: Plug }
  ];

  return (
    <main className="container mx-auto p-4 sm:p-6 max-w-4xl relative">
      <TableOfContents sections={sections} />
      {/* Header */}
      <section className="py-12 text-center border-b border-slate-200">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-slate-900">PromPalette Desktop ガイド</h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
          すべての機能をマスターして、プロンプト管理のプロになりましょう
        </p>
      </section>

      {/* Navigation */}
      <section className="py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="#getting-started" className="block">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  はじめに
                </CardTitle>
                <CardDescription>インストールと初期設定</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="#features" className="block">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  主要機能
                </CardTitle>
                <CardDescription>検索、整理、プロンプト管理</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="#keyboard-shortcuts" className="block">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Keyboard className="w-5 h-5" />
                  キーボードショートカット
                </CardTitle>
                <CardDescription>キーボードナビゲーションをマスター</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="#tips" className="block">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  プロのコツ
                </CardTitle>
                <CardDescription>上級テクニックとワークフロー</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="#troubleshooting" className="block">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  トラブルシューティング
                </CardTitle>
                <CardDescription>よくある問題と解決策</CardDescription>
              </CardHeader>
            </Card>
          </Link>
          <Link href="#advanced" className="block">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plug className="w-5 h-5" />
                  高度な使用法
                </CardTitle>
                <CardDescription>自動化と統合</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      {/* Getting Started */}
      <section id="getting-started" className="py-12 border-b border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-slate-900 flex items-center gap-3">
          <Rocket className="w-8 h-8" />
          はじめに
        </h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">インストール</h3>
            <div className="bg-slate-50 rounded-lg p-6">
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</span>
                  <div>
                    <strong>ダウンロード</strong>：{' '}
                    <Link href="/desktop/download" className="text-indigo-600 hover:underline">ダウンロードページ</Link>
                    からお使いのオペレーティングシステムに適したバージョンをダウンロードします。
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</span>
                  <div>
                    <strong>インストール</strong>：お使いのプラットフォームの標準プロセスに従ってインストールします
（ApplicationsにドラッグしてApplicationsフォルダにコピー）。
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-indigo-100 text-indigo-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</span>
                  <div>
                    <strong>起動</strong>：PromPaletteを起動し、必要な権限を許可します
                    （macOSではグローバルホットキー用のアクセシビリティ権限）。
                  </div>
                </li>
              </ol>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">初回起動</h3>
            <p className="text-slate-600 mb-4">
              PromPaletteを初めて開くと、プロンプト用の空のインターフェースが表示されます。
              アプリはローカルSQLiteデータベースを自動的に作成します。
            </p>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                <strong className="text-indigo-800">ヒント：</strong>
              </div>
              <p className="text-indigo-800">
                macOSでは、グローバルホットキーが動作するように
                システム環境設定 → セキュリティとプライバシー → アクセシビリティで
                アクセシビリティ権限を許可する必要がある場合があります。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-12 border-b border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-slate-900 flex items-center gap-3">
          <Zap className="w-8 h-8" />
          主要機能
        </h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">プロンプトの作成</h3>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-slate-600 mb-4">
                  <kbd className="bg-slate-100 px-2 py-1 rounded text-sm">⌘N</kbd>で新しいプロンプトを作成します。
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li><strong>タイトル：</strong> 任意の説明的な名前</li>
                  <li><strong>内容：</strong> プロンプトテキスト（必須）</li>
                  <li><strong>タグ：</strong> #ハッシュタグで整理</li>
                  <li><strong>クイックキー：</strong> /ショートカットで高速アクセス</li>
                </ul>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">プロンプトの例</h4>
                <div className="text-sm space-y-1">
                  <div><strong>タイトル：</strong> メール返信</div>
                  <div><strong>タグ：</strong> #メール #仕事</div>
                  <div><strong>クイックキー：</strong> /メール</div>
                  <div className="mt-2 p-2 bg-white rounded border">
                    <div className="text-xs text-slate-500">内容：</div>
                    <div>プロフェッショナルなメール返信を書いて...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">検索 & 整理</h3>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">テキスト検索</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    インテリジェントなファジーマッチングとスコアリングでプロンプトのタイトルと内容を検索。
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">タグフィルタリング</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    <code className="bg-slate-100 px-1 rounded">#タグ</code>を使ってカテゴリやトピックでプロンプトをフィルタリング。
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">クイックアクセス</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    <code className="bg-slate-100 px-1 rounded">/キー</code>と入力してクイックアクセスキー付きプロンプトを瞬時に検索。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">ピンシステム</h3>
            <p className="text-slate-600 mb-4">
              よく使うプロンプトを番号付きスロット（1-0）にピン留めして、グローバルホットキーで瞬時にアクセスできます。
            </p>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">プロンプトのピン留め</h4>
                <ul className="space-y-1 text-slate-600 text-sm">
                  <li>• プロンプトのピンアイコンをクリック</li>
                  <li>• スロット番号（1-0）を選択</li>
                  <li>• <kbd className="bg-slate-100 px-1 rounded text-xs">⌘⇧1-0</kbd>で選択したプロンプトをピン留め</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">ピン留めプロンプトへのアクセス</h4>
                <ul className="space-y-1 text-slate-600 text-sm">
                  <li>• グローバル：<kbd className="bg-slate-100 px-1 rounded text-xs">⌘Ctrl+1-0</kbd></li>
                  <li>• アプリ内：<kbd className="bg-slate-100 px-1 rounded text-xs">⌘1-0</kbd></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Keyboard Shortcuts */}
      <section id="keyboard-shortcuts" className="py-12 border-b border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-slate-900 flex items-center gap-3">
          <Keyboard className="w-8 h-8" />
          キーボードショートカット
        </h2>
        
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">グローバルショートカット</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>PromPaletteの表示/非表示</span>
                <kbd className="bg-slate-100 px-2 py-1 rounded text-sm">⌘Ctrl+P</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>ピン留めプロンプトアクセス（1-0）</span>
                <kbd className="bg-slate-100 px-2 py-1 rounded text-sm">⌘Ctrl+1-0</kbd>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">アプリショートカット</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>新しいプロンプト</span>
                <kbd className="bg-slate-100 px-2 py-1 rounded text-sm">⌘N</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>選択したものを編集</span>
                <kbd className="bg-slate-100 px-2 py-1 rounded text-sm">⌘E</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>選択したものを削除</span>
                <kbd className="bg-slate-100 px-2 py-1 rounded text-sm">⌘D</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>検索にフォーカス</span>
                <kbd className="bg-slate-100 px-2 py-1 rounded text-sm">⌘F</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>コピー & 閉じる</span>
                <kbd className="bg-slate-100 px-2 py-1 rounded text-sm">Enter</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>設定</span>
                <kbd className="bg-slate-100 px-2 py-1 rounded text-sm">⌘,</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span>ウィンドウを閉じる</span>
                <kbd className="bg-slate-100 px-2 py-1 rounded text-sm">Esc</kbd>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Pro Tips */}
      <section id="tips" className="py-12 border-b border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-slate-900 flex items-center gap-3">
          <Lightbulb className="w-8 h-8" />
          プロのコツ
        </h2>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                スマートタグ戦略
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-600">一貫したタグシステムでプロンプトを整理：</p>
              <ul className="space-y-1 text-sm text-slate-600">
                <li><strong>目的：</strong> #メール #SNS #ブログ #コーディング</li>
                <li><strong>トーン：</strong> #正式 #カジュアル #技術的 #創造的</li>
                <li><strong>対象：</strong> #クライアント #チーム #公開 #個人</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                クイックアクセスワークフロー
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-600">これらのパターンで効率を最大化：</p>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• 日常使用のプロンプトをスロット1-5にピン留め</li>
                <li>• 覚えやすいクイックキーを使用（/メール /ツイート /バグ）</li>
                <li>• 関連プロンプトを似たタグでグループ化</li>
                <li>• プロンプトタイトルは簡潔だが説明的に</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                パワーユーザーテクニック
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-600">ヘビーユーザー向けの上級ティップス：</p>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• {`{{会社}}`}や{`{{名前}}`}などの変数を含むテンプレートを使用</li>
                <li>• 複雑なワークフロー用のプロンプトチェーンを作成</li>
                <li>• プロンプトを定期的にエクスポート/バックアップ</li>
                <li>• チーム共有のために説明的なクイックキーを使用</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Troubleshooting */}
      <section id="troubleshooting" className="py-12 border-b border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-slate-900 flex items-center gap-3">
          <Settings className="w-8 h-8" />
          トラブルシューティング
        </h2>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="w-5 h-5" />
                macOSの問題
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">グローバルホットキーが動作しない</h4>
                <p className="text-sm text-slate-600 mb-2">
                  アクセシビリティ権限を許可：システム環境設定 → セキュリティとプライバシー → アクセシビリティ → PromPaletteを追加
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">アプリが開かない（「破損している」警告）</h4>
                <p className="text-sm text-slate-600">
                  アプリを右クリック → 開く、次にダイアログで「開く」をクリック。これにより、未署名アプリのGatekeeperをバイパスします。
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* Advanced */}
      <section id="advanced" className="py-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-slate-900 flex items-center gap-3">
          <Plug className="w-8 h-8" />
          高度な使用法
        </h2>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                データ管理
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-slate-600">PromPaletteは以下の場所にデータをローカル保存します：</p>
              <div className="text-sm">
                <strong>macOS：</strong> <code className="bg-slate-100 px-1 rounded">~/Library/Application Support/PromPalette/</code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                バックアップ & エクスポート
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-3">
                プロンプトはSQLiteデータベースに保存されます。以下のことができます：
              </p>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• バックアップ用にデータベースファイルをコピー</li>
                <li>• 設定からプロンプトをJSONにエクスポート</li>
                <li>• JSONファイルからプロンプトをインポート</li>
                <li>• デバイス間でデータベースファイルを同期</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8 text-center border-t border-slate-200">
        <p className="text-slate-600 mb-4">
          さらにヘルプが必要ですか？他のリソースもご確認ください：
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/desktop/getting-started">
            <Button variant="outline">クイックスタートガイド</Button>
          </Link>
          <Link href="/desktop/download">
            <Button variant="outline">ダウンロードページ</Button>
          </Link>
          <Button variant="outline" asChild>
            <a href="https://github.com/Jun-T-git/prompalette/issues" target="_blank" rel="noopener noreferrer">
              問題を報告
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}