'use client';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@prompalette/ui';
import { Search, Copy, Globe, User, Hash, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { stubPromptStorage, isLocalDevelopment } from '@/lib/auth-stub';
import { getSupabaseClient } from '@/lib/supabase';
import { WebAppLayout } from '@/components/WebAppLayout';

interface Prompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  quick_access_key: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    try {
      let searchResults: Prompt[] = [];

      if (isLocalDevelopment) {
        // スタブデータで検索
        // @username 検索
        if (query.startsWith('@')) {
          const username = query.substring(1);
          // スタブデータでは簡単な実装
          if (username === 'stub-user') {
            searchResults = stubPromptStorage.getByUserId('stub-user-123').filter(p => p.is_public);
          } else if (username === 'other-user') {
            searchResults = stubPromptStorage.getByUserId('other-user-456').filter(p => p.is_public);
          }
        }
        // #tag 検索
        else if (query.startsWith('#')) {
          const tag = query.substring(1);
          searchResults = stubPromptStorage.getPublic().filter(p => 
            p.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
          );
        }
        // /quickkey 検索
        else if (query.startsWith('/')) {
          const quickkey = query.substring(1);
          searchResults = stubPromptStorage.getPublic().filter(p => 
            p.quick_access_key?.toLowerCase().includes(quickkey.toLowerCase())
          );
        }
        // 通常の検索
        else {
          searchResults = stubPromptStorage.search(query).filter(p => p.is_public);
        }
      } else if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        // Supabaseで検索
        const supabase = getSupabaseClient();
        
        if (query.startsWith('@')) {
          // ユーザー名検索 (将来実装予定)
          const { data, error } = await supabase
            .from('prompts')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          searchResults = data || [];
        } else if (query.startsWith('#')) {
          // タグ検索
          const tag = query.substring(1);
          const { data, error } = await supabase
            .from('prompts')
            .select('*')
            .eq('is_public', true)
            .contains('tags', [tag])
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          searchResults = data || [];
        } else if (query.startsWith('/')) {
          // クイックキー検索
          const quickkey = query.substring(1);
          const { data, error } = await supabase
            .from('prompts')
            .select('*')
            .eq('is_public', true)
            .ilike('quick_access_key', `%${quickkey}%`)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          searchResults = data || [];
        } else {
          // 通常の検索
          const { data, error } = await supabase
            .from('prompts')
            .select('*')
            .eq('is_public', true)
            .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          searchResults = data || [];
        }
      } else {
        // Supabaseが設定されていない場合は空の結果
        searchResults = [];
      }

      setResults(searchResults);
    } catch (error) {
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

  return (
    <WebAppLayout>
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

          {/* Search Results */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">検索中...</p>
            </div>
          ) : searchQuery && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                "{searchQuery}" の検索結果
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
                      <span>
                        更新: {new Date(prompt.updated_at).toLocaleDateString('ja-JP')}
                      </span>
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
    </WebAppLayout>
  );
}