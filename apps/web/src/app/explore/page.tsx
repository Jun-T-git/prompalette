'use client';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@prompalette/ui';
import { Search, TrendingUp, Clock, Hash, Copy, Globe } from 'lucide-react';
import Link from 'next/link';
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

export default function ExplorePage() {
  const [publicPrompts, setPublicPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPublicPrompts = async () => {
      try {
        if (isLocalDevelopment) {
          const prompts = stubPromptStorage.getPublic();
          setPublicPrompts(prompts);
        } else if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
          // Supabaseが設定されている場合のみ実行
          const supabase = getSupabaseClient();
          const { data, error } = await supabase
            .from('prompts')
            .select('*')
            .eq('is_public', true)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error loading public prompts:', error);
            throw error;
          }

          setPublicPrompts(data || []);
        } else {
          // Supabaseが設定されていない場合は空の配列
          setPublicPrompts([]);
        }
      } catch (error) {
        console.error('Error loading public prompts:', error);
        // TODO: Show error toast
      } finally {
        setLoading(false);
      }
    };

    loadPublicPrompts();
  }, []);

  const handleCopyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
    // TODO: Show toast notification
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }
  return (
    <WebAppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              プロンプトを探索
            </h1>
            <p className="text-xl text-gray-600">
              コミュニティが作成した優秀なプロンプトを発見しよう
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">トレンド</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">人気急上昇中のプロンプト</p>
                <Link href="/search?q=コードレビュー" className="text-indigo-600 font-medium hover:text-indigo-500">
                  探索する
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">最新</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">新しく投稿されたプロンプト</p>
                <Link href="/search?q=" className="text-green-600 font-medium hover:text-green-500">
                  探索する
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                  <Hash className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">タグ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">カテゴリー別にプロンプトを探索</p>
                <Link href="/search?q=%23プログラミング" className="text-orange-600 font-medium hover:text-orange-500">
                  探索する
                </Link>
              </CardContent>
            </Card>
          </div>
          
          {/* Public Prompts */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">公開プロンプト</h2>
            {publicPrompts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    公開プロンプトがありません
                  </h3>
                  <p className="text-gray-600">
                    まだ公開されたプロンプトがありません。
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicPrompts.map((prompt) => (
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
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {prompt.content}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {prompt.tags.map((tag) => (
                          <Link
                            key={tag}
                            href={`/search?q=${encodeURIComponent(`#${tag}`)}`}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full hover:bg-green-200 transition-colors"
                          >
                            #{tag}
                          </Link>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          更新: {new Date(prompt.updated_at).toLocaleDateString('ja-JP')}
                        </span>
                        {prompt.quick_access_key && (
                          <Link
                            href={`/search?q=${encodeURIComponent(`/${prompt.quick_access_key}`)}`}
                            className="text-purple-600 font-mono hover:text-purple-700"
                          >
                            /{prompt.quick_access_key}
                          </Link>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="text-center">
            <div className="flex justify-center gap-4">
              <Link href="/search">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Search className="w-4 h-4 mr-2" />
                  詳細検索
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline">
                  トップページに戻る
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </WebAppLayout>
  );
}