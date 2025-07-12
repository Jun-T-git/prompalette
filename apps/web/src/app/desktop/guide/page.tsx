'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@prompalette/ui';
import { Apple, Keyboard, Lightbulb, Rocket, Settings, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { TableOfContents } from '@/components/TableOfContents';

export default function GuidePageJA() {
  const sections = [
    { id: 'getting-started', title: 'はじめに', icon: Rocket },
    {
      id: 'features',
      title: '機能',
      icon: Zap,
      subsections: [
        { id: 'save-prompts', title: 'プロンプトを保存する' },
        { id: 'search-prompts', title: 'プロンプトを検索する' },
        { id: 'use-prompts', title: 'プロンプトを使用する' },
        { id: 'palette-favorites', title: 'パレット（お気に入り）' },
      ],
    },
    { id: 'keyboard-shortcuts', title: 'キーボードショートカット', icon: Keyboard },
    { id: 'troubleshooting', title: 'トラブルシューティング', icon: Settings },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto p-4 sm:p-6 max-w-4xl relative">
        <TableOfContents sections={sections} />
        {/* Header */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20 max-w-4xl">
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                PromPalette Desktop ガイド
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-700 mb-4">
                AIプロンプトを効率的に管理・活用する
              </p>
              <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
                すべての機能を詳しく解説。使い方から応用テクニックまで、
                PromPaletteを最大限活用するための完全ガイドです。
              </p>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <section className="py-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="#getting-started" className="block">
              <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm border border-white/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Rocket className="w-4 h-4 text-white" />
                    </div>
                    はじめに
                  </CardTitle>
                  <CardDescription>基本的な使い方</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="#features" className="block">
              <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm border border-white/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    機能
                  </CardTitle>
                  <CardDescription>主要な4つの機能</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="#keyboard-shortcuts" className="block">
              <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm border border-white/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Keyboard className="w-4 h-4 text-white" />
                    </div>
                    キーボードショートカット
                  </CardTitle>
                  <CardDescription>便利なショートカット一覧</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link href="#troubleshooting" className="block">
              <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm border border-white/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    トラブルシューティング
                  </CardTitle>
                  <CardDescription>よくある問題の解決法</CardDescription>
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

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-slate-800">PromPaletteとは</h3>
              <p className="text-slate-600 mb-4">
                PromPaletteは、AIプロンプトを保存・管理し、必要な時に瞬時にアクセスできるmacOS専用アプリです。
                ChatGPT、Claude、Geminiなど、あらゆるAIツールで使用するプロンプトを効率的に管理できます。
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">基本的な使い方</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </span>
                    <span>プロンプトを作成・保存</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </span>
                    <span>タグやキーワードで整理</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </span>
                    <span>検索して瞬時に呼び出し</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium">
                      4
                    </span>
                    <span>クリップボードにコピーして使用</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-amber-800">初回設定が必要です</strong>
                  <p className="text-amber-700 text-sm mt-1">
                    グローバルホットキーを使用するため、システム環境設定 →
                    セキュリティとプライバシー → アクセシビリティで
                    PromPaletteにアクセシビリティ権限を許可してください。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-12 border-b border-slate-200">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-slate-900 flex items-center gap-3">
            <Zap className="w-8 h-8" />
            機能
          </h2>

          <div className="space-y-16">
            <div id="save-prompts" className="pt-8 border-t border-slate-100">
              <h3 className="text-xl font-semibold mb-6 text-slate-800">プロンプトを保存する</h3>
              <p className="text-slate-600 mb-6">
                よく使うAIプロンプトを保存して整理します。プロンプトには分かりやすいタイトルを付け、
                タグやクイックアクセスキーを設定することで、後から素早く見つけることができます。
              </p>

              <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 max-w-2xl mx-auto mb-6">
                <Image
                  src="/movies/new-prompt.gif"
                  alt="新しいプロンプトを作成・保存する流れ"
                  width={800}
                  height={571}
                  className="w-full h-auto"
                  unoptimized
                />
              </div>

              <div className="bg-slate-50 rounded-lg p-6 mb-4">
                <h4 className="font-semibold text-slate-800 mb-3">入力項目</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="font-medium text-slate-700 mb-1">タイトル（任意）</div>
                    <div className="text-sm text-slate-600">プロンプトの目的や用途</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-700 mb-1">プロンプト内容（必須）</div>
                    <div className="text-sm text-slate-600">実際のAIプロンプトテキスト</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-700 mb-1">タグ（任意）</div>
                    <div className="text-sm text-slate-600">#メール #仕事 など</div>
                  </div>
                  <div>
                    <div className="font-medium text-slate-700 mb-1">クイックアクセス（任意）</div>
                    <div className="text-sm text-slate-600">/メール /翻訳 など</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="font-medium text-blue-800 mb-2">操作方法</div>
                <div className="space-y-1 text-sm text-blue-700">
                  <div>
                    • <kbd className="bg-blue-100 px-2 py-1 rounded text-xs">⌘N</kbd>{' '}
                    で新規作成フォームを開く
                  </div>
                  <div>• 各項目を入力して内容を充実</div>
                  <div>
                    • <kbd className="bg-blue-100 px-2 py-1 rounded text-xs">⌘S</kbd> で保存完了
                  </div>
                </div>
              </div>
            </div>

            <div id="search-prompts" className="pt-8 border-t border-slate-100">
              <h3 className="text-xl font-semibold mb-6 text-slate-800">プロンプトを検索する</h3>
              <p className="text-slate-600 mb-6">
                保存したプロンプトを様々な方法で素早く見つけることができます。
                リアルタイム検索により、入力しながら結果が瞬時に絞り込まれます。
              </p>

              <div className="space-y-12">
                <div>
                  <h4 className="font-medium text-slate-700 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </span>
                    キーワード検索
                  </h4>
                  <p className="text-sm text-slate-600 mb-3">
                    プロンプトのタイトルや内容から自然な言葉で検索できます。
                  </p>
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 max-w-xl mx-auto">
                    <Image
                      src="/movies/keyword-search.gif"
                      alt="キーワードでプロンプトを検索する様子"
                      width={800}
                      height={571}
                      className="w-full h-auto"
                      unoptimized
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-700 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </span>
                    タグ検索
                  </h4>
                  <p className="text-sm text-slate-600 mb-3">
                    <code className="bg-slate-200 px-2 py-1 rounded text-xs">#タグ名</code>{' '}
                    の形式で、特定のカテゴリのプロンプトのみを表示できます。
                    以下のGIFでは、タグ検索とキーワード検索の組み合わせ例も確認できます。
                  </p>
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 max-w-xl mx-auto">
                    <Image
                      src="/movies/tag-search.gif"
                      alt="タグを使ってプロンプトを検索する様子"
                      width={800}
                      height={571}
                      className="w-full h-auto"
                      unoptimized
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-700 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </span>
                    クイックアクセス検索
                  </h4>
                  <p className="text-sm text-slate-600 mb-3">
                    <code className="bg-slate-200 px-2 py-1 rounded text-xs">/キー名</code>{' '}
                    で設定したプロンプトに直接アクセスできます。
                  </p>
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 max-w-xl mx-auto">
                    <Image
                      src="/movies/qak-search.gif"
                      alt="クイックアクセスキーでプロンプトを検索する様子"
                      width={800}
                      height={571}
                      className="w-full h-auto"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="font-medium text-blue-800 mb-2">検索構文の組み合わせ</div>
                  <p className="text-sm text-blue-700 mb-3">
                    複数の検索方法を同時に使用することで、より精密な絞り込みが可能です。
                    例えば、タグとキーワードを組み合わせて特定のカテゴリ内から目的のプロンプトを素早く見つけられます。
                  </p>
                  <div className="space-y-1 text-sm text-blue-600">
                    <div>
                      <code className="bg-blue-100 px-2 py-1 rounded text-xs">#メール 返信</code> -
                      メールタグの中から「返信」を含むプロンプト
                    </div>
                    <div>
                      <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                        #コード レビュー
                      </code>{' '}
                      - コードタグの中から「レビュー」を含むプロンプト
                    </div>
                    <div>
                      <code className="bg-blue-100 px-2 py-1 rounded text-xs">/翻訳 英語</code> -
                      翻訳クイックアクセス内から「英語」を含むプロンプト
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="font-medium text-green-800 mb-2">基本操作</div>
                  <div className="space-y-1 text-sm text-green-700">
                    <div>
                      • <kbd className="bg-green-100 px-2 py-1 rounded text-xs">⌘⇧P</kbd>{' '}
                      でアプリを起動
                    </div>
                    <div>• 検索ボックスに文字を入力すると即座に絞り込み</div>
                    <div>
                      • <kbd className="bg-green-100 px-2 py-1 rounded text-xs">↑↓</kbd>{' '}
                      で候補を選択
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="use-prompts" className="pt-8 border-t border-slate-100">
              <h3 className="text-xl font-semibold mb-6 text-slate-800">プロンプトを使用する</h3>
              <p className="text-slate-600 mb-6">
                見つけたプロンプトを瞬時にクリップボードにコピーして、ChatGPT、Claude、
                その他任意のAIツールやアプリケーションで使用できます。
              </p>

              <div className="space-y-12">
                <div>
                  <h4 className="font-medium text-slate-700 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </span>
                    使用とコピーの基本操作
                  </h4>
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 max-w-xl mx-auto mb-4">
                    <Image
                      src="/movies/use-prompts.gif"
                      alt="プロンプトを選択してコピーする流れ"
                      width={800}
                      height={571}
                      className="w-full h-auto"
                      unoptimized
                    />
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="space-y-2 text-sm text-slate-600">
                      <div>
                        • プロンプトを選択して{' '}
                        <kbd className="bg-slate-100 px-2 py-1 rounded text-xs">Enter</kbd> でコピー
                      </div>
                      <div>• アプリが自動的に非表示になり、作業の流れを中断しません</div>
                      <div>
                        • <kbd className="bg-slate-100 px-2 py-1 rounded text-xs">⌘V</kbd>{' '}
                        で任意の場所に貼り付け
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-700 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </span>
                    クイックペースト機能
                  </h4>
                  <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 max-w-xl mx-auto mb-4">
                    <Image
                      src="/movies/quick-paste.gif"
                      alt="プロンプトを即座に貼り付ける様子"
                      width={800}
                      height={571}
                      className="w-full h-auto"
                      unoptimized
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h5 className="font-medium text-slate-800 mb-2">クイックペーストとは</h5>
                      <p className="text-sm text-slate-600 mb-3">
                        通常のコピー操作を経由せず、プロンプトを選択すると同時に直接フォーカスされているテキストフィールドに貼り付ける機能です。
                        ChatGPTやClaudeなどのテキスト入力欄に、ワンステップでプロンプトを挿入できます。
                      </p>
                      <div className="text-xs text-slate-500">
                        ※ 設定で有効/無効を切り替えできます
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="font-medium text-purple-800 mb-2">使用シーン</div>
                      <div className="space-y-1 text-sm text-purple-700">
                        <div>• ブラウザでChatGPTを使用中に、入力欄に直接プロンプトを挿入</div>
                        <div>• Slack、Discord等のメッセージ入力時に定型文を即座に貼り付け</div>
                        <div>• メールクライアントで返信テンプレートを瞬時に呼び出し</div>
                        <div>• テキストエディタやIDEでのコード生成プロンプトの挿入</div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="font-medium text-amber-800 mb-2">通常コピーとの違い</div>
                      <div className="grid gap-3 md:grid-cols-2 text-sm">
                        <div>
                          <div className="font-medium text-amber-700 mb-1">通常のコピー</div>
                          <div className="text-amber-600 text-xs space-y-1">
                            <div>1. プロンプト選択</div>
                            <div>2. Enterでコピー</div>
                            <div>3. アプリ切り替え</div>
                            <div>4. ⌘Vで貼り付け</div>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-amber-700 mb-1">クイックペースト</div>
                          <div className="text-amber-600 text-xs space-y-1">
                            <div>1. プロンプト選択</div>
                            <div>2. 自動で貼り付け完了</div>
                            <div className="text-gray-400">（手順削減）</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="palette-favorites" className="pt-8 border-t border-slate-100">
              <h3 className="text-xl font-semibold mb-6 text-slate-800">パレット（お気に入り）</h3>
              <p className="text-slate-600 mb-6">
                最もよく使うプロンプトを数字キー（1〜0）に登録して、検索なしで瞬時にアクセスできる機能です。
                日常的に使うプロンプトをパレットに登録しておくことで、劇的に作業効率が向上します。
              </p>

              <div className="mb-6">
                <h4 className="font-medium text-slate-700 mb-4">パレット機能の使用例</h4>
                <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 max-w-xl mx-auto mb-4">
                  <Image
                    src="/movies/palette.gif"
                    alt="パレット機能でプロンプトをピン留めして使用する様子"
                    width={800}
                    height={571}
                    className="w-full h-auto"
                    unoptimized
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mb-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">パレットに登録</h4>
                  <div className="space-y-2 text-sm">
                    <div>1. 保存済みプロンプトの右側にあるピンアイコンをクリック</div>
                    <div>2. 登録したいスロット番号（1〜0）を選択</div>
                    <div>
                      3. または{' '}
                      <kbd className="bg-slate-100 px-1 py-0.5 rounded text-xs">⌘⇧数字</kbd> で登録
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">パレットから使用</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>グローバル：</strong>{' '}
                      <kbd className="bg-slate-100 px-1 py-0.5 rounded text-xs">⌘Ctrl+数字</kbd>
                    </div>
                    <div>
                      <strong>アプリ内：</strong>{' '}
                      <kbd className="bg-slate-100 px-1 py-0.5 rounded text-xs">⌘数字</kbd>
                    </div>
                    <div>即座にクリップボードにコピーされます</div>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="font-medium text-orange-800 mb-2">使用例</div>
                <div className="space-y-1 text-sm text-orange-700">
                  <div>• スロット1：よく使うメール返信プロンプト</div>
                  <div>• スロット2：コードレビュー用プロンプト</div>
                  <div>• スロット3：SNS投稿用プロンプト</div>
                  <div>• スロット4：議事録要約プロンプト</div>
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
                  <kbd className="bg-slate-100 px-2 py-1 rounded text-sm">⌘⇧P</kbd>
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
                    アクセシビリティ権限を許可：システム環境設定 → セキュリティとプライバシー →
                    アクセシビリティ → PromPaletteを追加
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">アプリが開かない（「破損している」警告）</h4>
                  <p className="text-sm text-slate-600">
                    アプリを右クリック →
                    開く、次にダイアログで「開く」をクリック。これにより、未署名アプリのGatekeeperをバイパスします。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <section className="py-8 text-center border-t border-slate-200">
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/desktop">
              <Button variant="outline">← デスクトップページに戻る</Button>
            </Link>
            <Button variant="outline" asChild>
              <a
                href="https://github.com/Jun-T-git/prompalette/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                問題を報告
              </a>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
