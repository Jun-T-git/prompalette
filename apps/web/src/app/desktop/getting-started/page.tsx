'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@prompalette/ui';
import Link from 'next/link';
import { TableOfContents } from '@/components/TableOfContents';
import { Rocket, Keyboard, ArrowRight, HelpCircle, Apple, Lightbulb, CheckCircle, AlertTriangle, BookOpen, MessageSquare } from 'lucide-react';

export default function GettingStartedPageJA() {
  const sections = [
    { id: 'quickstart', title: 'クイックスタート', icon: Rocket },
    { id: 'shortcuts', title: 'キーボードショートカット', icon: Keyboard },
    { id: 'next-steps', title: '次のステップ', icon: ArrowRight },
    { id: 'troubleshooting', title: 'よくある問題', icon: HelpCircle }
  ];

  return (
    <main className="container mx-auto p-4 sm:p-6 max-w-4xl relative">
      <TableOfContents sections={sections} />
      {/* Header */}
      <section className="py-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">PromPalette Desktop はじめかた</h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8">
          インストール、セットアップ、使い方を数分で学びましょう
        </p>
      </section>

      {/* Quick Start Steps */}
      <section id="quickstart" className="mb-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
          <Rocket className="w-6 h-6" />
          クイックスタート（5分）
        </h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">1</Badge>
                ダウンロード & インストール
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Apple className="w-4 h-4" />
                  macOS
                </h4>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. .dmgファイルをダウンロード</li>
                  <li>2. .dmgファイルを開く</li>
                  <li>3. PromPaletteをApplicationsにドラッグ</li>
                  <li>4. 右クリック → 開く（初回のみ）</li>
                </ol>
              </div>
              <div className="pt-4">
                <Link href="/desktop/download">
                  <Button>今すぐダウンロード</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">2</Badge>
                初回起動 & セットアップ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  PromPaletteを初めて起動すると、以下が表示されます：
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                  <li>• セットアップ手順付きのウェルカム画面</li>
                  <li>• 空のプロンプトリスト（最初のプロンプト作成準備完了）</li>
                  <li>• キーボードショートカットを表示するヘルプパネル</li>
                  <li>• メニューバーアイコン</li>
                </ul>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-medium text-indigo-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    プロのコツ
                  </h4>
                  <p className="text-sm text-indigo-800">
                    macOSでは、グローバルホットキーを有効にするためにアクセシビリティ権限を求められます。
                    最高の体験のために、これらの権限を許可してください。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">3</Badge>
                最初のプロンプトを作成
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  最初のプロンプトを作成してみましょう：
                </p>
                <ol className="text-sm text-muted-foreground space-y-2 ml-4">
                  <li>1. <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘N</kbd>を押す</li>
                  <li>2. タイトルを入力（任意）：「メール返信テンプレート」</li>
                  <li>3. プロンプト内容を追加：「プロフェッショナルなメール返信を書いて...」</li>
                  <li>4. タグを追加：「メール, 仕事, テンプレート」</li>
                  <li>5. クイックアクセスキーを設定：「メール」</li>
                  <li>6. <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘S</kbd>を押して保存</li>
                </ol>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    成功！
                  </h4>
                  <p className="text-sm text-green-800">
                    これで、テキスト、タグ（#メール）、またはクイックアクセス（/メール）を使ってこのプロンプトを検索できます。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">4</Badge>
                グローバルホットキーの設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  システム全体からのアクセスのためにグローバルホットキーを設定：
                </p>
                <ol className="text-sm text-muted-foreground space-y-2 ml-4">
                  <li>1. <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘,</kbd>で設定を開く</li>
                  <li>2. 「グローバルホットキー」セクションに移動</li>
                  <li>3. グローバルホットキーを有効にする</li>
                  <li>4. <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘Ctrl+P</kbd>でテスト</li>
                </ol>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    権限が必要
                  </h4>
                  <p className="text-sm text-orange-800">
                    macOSユーザーは、システム環境設定 → セキュリティとプライバシー → アクセシビリティでアクセシビリティ権限を許可する必要があります。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">5</Badge>
                効率的な使用を開始
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  これで、ワークフローを強化する準備が整いました：
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                  <li>• グローバルホットキーを使ってどこからでもPromPaletteにアクセス</li>
                  <li>• よく使うプロンプトを番号付きスロット（1-0）にピン留め</li>
                  <li>• テキスト、タグ（#）、またはクイックアクセスキー（/）で検索</li>
                  <li>• <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Enter</kbd>でプロンプトを直接クリップボードにコピー</li>
                  <li>• <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Esc</kbd>でウィンドウを閉じる</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Essential Keyboard Shortcuts */}
      <section id="shortcuts" className="mb-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
          <Keyboard className="w-6 h-6" />
          必須キーボードショートカット
        </h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-3">グローバルショートカット</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>PromPaletteの表示/非表示</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘Ctrl+P</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>クイックアクセス（1-0）</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘Ctrl+1-0</kbd>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">アプリ内ショートカット</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>新しいプロンプト</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘N</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>コピー & 閉じる</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Enter</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>設定</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">⌘,</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>ウィンドウを閉じる</span>
                    <kbd className="bg-gray-100 px-2 py-1 rounded text-xs">Esc</kbd>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Next Steps */}
      <section id="next-steps" className="mb-12">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
          <ArrowRight className="w-6 h-6" />
          次のステップ
        </h2>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                完全ガイドを読む
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                高度な機能、ティップス、プロンプト整理のベストプラクティスを学びましょう。
              </p>
              <Link href="/desktop/guide">
                <Button variant="outline" className="w-full">
                  ユーザーガイドを見る
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                ヘルプを受ける
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                質問やヘルプが必要ですか？コミュニティに参加するか問題を報告してください。
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="https://github.com/Jun-T-git/prompalette/issues" target="_blank" rel="noopener noreferrer">
                  サポートを受ける
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Troubleshooting */}
      <section id="troubleshooting">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              よくある問題
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">グローバルホットキーが動作しない（macOS）</h4>
                <p className="text-sm text-muted-foreground">
                  アクセシビリティ権限を許可：システム環境設定 → セキュリティとプライバシー → アクセシビリティ → PromPaletteを追加
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">データベースが見つからない</h4>
                <p className="text-sm text-muted-foreground">
                  初回起動時、PromPaletteは自動的にデータベースを作成します。エラーが表示される場合は、アプリケーションを再起動してみてください。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}