'use client';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@prompalette/ui';
import { Search, Copy, Globe, User, Hash, Zap } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import { WebAppLayout } from '@/components/WebAppLayout';
import { GuestLayout } from '@/components/GuestLayout';
import { Prompt } from '@/lib/types';

export default function SearchPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // ネットワークタイムアウトを設定
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒タイムアウト

      // サーバーサイドAPIを使用して検索
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&limit=20&offset=0`,
        {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error('サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。');
        } else if (response.status === 404) {
          throw new Error('検索サービスが見つかりません。');
        } else {
          throw new Error(`検索リクエストが失敗しました (${response.status})`);
        }
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setResults(data.data.prompts);
        setError(null);
      } else {
        const errorMessage = data.error?.message || '検索中にエラーが発生しました';
        setError(errorMessage);
        setResults([]);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('検索がタイムアウトしました。ネットワーク接続を確認してください。');
        } else if (error.message.includes('Failed to fetch')) {
          setError('ネットワーク接続エラーです。インターネット接続を確認してください。');
        } else {
          setError(error.message);
        }
      } else {
        setError('予期しないエラーが発生しました。');
      }
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCopyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
    // TODO: Show toast notification
  };

  const getSearchTypeFromQuery = (query: string) => {
    if (query.startsWith('@')) return 'ユーザー';
    if (query.startsWith('#')) return 'タグ';
    if (query.startsWith('/')) return 'クイックキー';
    return 'キーワード';
  };

  const Layout = session ? WebAppLayout : GuestLayout;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">プロンプト検索</h1>
            <p className="text-gray-600">
              公開プロンプトから最適なものを見つけましょう
            </p>
          </div>

          {/* Search Form */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="プロンプトを検索... (@username, #tag, /quickkey)"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                    <Search className="w-4 h-4 mr-2" />
                    検索
                  </Button>
                </div>
              </form>

              {/* Search Tips */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">検索のコツ</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span><code>@username</code> ユーザー検索</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-green-600" />
                    <span><code>#tag</code> タグ検索</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span><code>/quickkey</code> クイックキー検索</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-red-900">検索エラー</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-400 hover:text-red-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Results */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">検索中...</p>
            </div>
          ) : searchQuery && !error && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                &quot;{searchQuery}&quot; の検索結果
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{results.length} 件見つかりました</span>
                <span>検索タイプ: {getSearchTypeFromQuery(searchQuery)}</span>
              </div>
            </div>
          )}

          {/* Results List */}
          {results.length === 0 && searchQuery ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  検索結果が見つかりませんでした
                </h3>
                <p className="text-gray-600 mb-4">
                  別のキーワードで検索してみてください
                </p>
                <div className="text-sm text-gray-500">
                  <p>検索のヒント:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• より一般的なキーワードを使用</li>
                    <li>• タグ検索: #プログラミング</li>
                    <li>• ユーザー検索: @stub-user</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((prompt) => (
                <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg truncate flex-1 mr-2">
                        {prompt.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-green-600" />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyPrompt(prompt.content)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          コピー
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      by {prompt.user_id === 'stub-user-123' ? 'stub-user' : 'other-user'}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-4">
                      {prompt.content}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {prompt.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            setSearchQuery(`#${tag}`);
                            router.push(`/search?q=${encodeURIComponent(`#${tag}`)}`);
                          }}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full hover:bg-green-200 transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span>
                          更新: {new Date(prompt.updated_at).toLocaleDateString('ja-JP')}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {prompt.view_count || 0}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {prompt.copy_count || 0}
                          </span>
                        </div>
                      </div>
                      {prompt.quick_access_key && (
                        <button
                          onClick={() => {
                            setSearchQuery(`/${prompt.quick_access_key}`);
                            router.push(`/search?q=${encodeURIComponent(`/${prompt.quick_access_key}`)}`);
                          }}
                          className="text-purple-600 font-mono hover:text-purple-700"
                        >
                          /{prompt.quick_access_key}
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No search query */}
          {!searchQuery && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                プロンプトを検索しましょう
              </h3>
              <p className="text-gray-600 mb-6">
                上の検索バーにキーワードを入力して、公開プロンプトを探してみてください
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('@stub-user');
                    router.push('/search?q=@stub-user');
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  @stub-user
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('#プログラミング');
                    router.push('/search?q=%23プログラミング');
                  }}
                >
                  <Hash className="w-4 h-4 mr-2" />
                  #プログラミング
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('/review');
                    router.push('/search?q=/review');
                  }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  /review
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}