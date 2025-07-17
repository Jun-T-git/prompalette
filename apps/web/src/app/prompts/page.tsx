'use client';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@prompalette/ui';
import { Plus, Search, Globe, Lock, Edit, Trash2, Copy } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { STUB_USER_SESSION, stubPromptStorage, isLocalDevelopment } from '@/lib/auth-stub';
import { getSupabaseClient } from '@/lib/supabase';
import { WebAppLayout } from '@/components/WebAppLayout';

interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  quick_access_key: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function PromptsPage() {
  const { data: session } = useSession();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'public' | 'private'>('all');
  const [loading, setLoading] = useState(true);

  // ローカル開発用の認証スタブ
  const currentSession = isLocalDevelopment ? STUB_USER_SESSION : session;
  
  // Supabaseが設定されているが認証されていない場合
  const shouldUseSupabase = !isLocalDevelopment && session;

  useEffect(() => {
    if (!currentSession) return;

    // Supabaseが設定されているが認証されていない場合はスキップ
    if (!isLocalDevelopment && !session) {
      setLoading(false);
      return;
    }

    const loadPrompts = async () => {
      try {
        if (isLocalDevelopment) {
          // スタブデータの取得
          const userPrompts = stubPromptStorage.getByUserId(currentSession.user.id);
          setPrompts(userPrompts);
        } else if (shouldUseSupabase) {
          // Supabaseからデータを取得
          const supabase = getSupabaseClient();
          const { data, error } = await supabase
            .from('prompts')
            .select('*')
            .eq('user_id', currentSession.user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error loading prompts:', error);
            throw error;
          }

          setPrompts(data || []);
        } else {
          // 認証されていない場合は空の配列
          setPrompts([]);
        }
      } catch (error) {
        console.error('Error loading prompts:', error);
        // TODO: Show error toast
      } finally {
        setLoading(false);
      }
    };

    loadPrompts();
  }, [currentSession]);

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'public' && prompt.is_public) ||
                         (filterType === 'private' && !prompt.is_public);
    
    return matchesSearch && matchesFilter;
  });

  const handleCopyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
    // TODO: Show toast notification
  };

  const handleDeletePrompt = async (id: string) => {
    if (!session && !isLocalDevelopment) {
      alert('削除するにはログインが必要です');
      return;
    }

    if (confirm('このプロンプトを削除しますか？')) {
      try {
        if (isLocalDevelopment) {
          stubPromptStorage.delete(id);
          setPrompts(prev => prev.filter(p => p.id !== id));
        } else if (shouldUseSupabase) {
          const supabase = getSupabaseClient();
          const { error } = await supabase
            .from('prompts')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('Error deleting prompt:', error);
            throw error;
          }

          setPrompts(prev => prev.filter(p => p.id !== id));
        }
      } catch (error) {
        console.error('Error deleting prompt:', error);
        // TODO: Show error toast
      }
    }
  };

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ログインが必要です</h1>
          <Link href="/login">
            <Button>ログイン</Button>
          </Link>
        </div>
      </div>
    );
  }

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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">マイプロンプト</h1>
                <p className="text-gray-600 mt-2">
                  あなたが作成したプロンプトを管理
                </p>
              </div>
              <Link href="/prompts/new">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  新規作成
                </Button>
              </Link>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="プロンプトを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterType('all')}
                  size="sm"
                >
                  すべて
                </Button>
                <Button
                  variant={filterType === 'public' ? 'default' : 'outline'}
                  onClick={() => setFilterType('public')}
                  size="sm"
                >
                  公開
                </Button>
                <Button
                  variant={filterType === 'private' ? 'default' : 'outline'}
                  onClick={() => setFilterType('private')}
                  size="sm"
                >
                  非公開
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-sm text-gray-600">
              <span>{prompts.length} 件のプロンプト</span>
              <span>{prompts.filter(p => p.is_public).length} 件が公開</span>
              <span>{filteredPrompts.length} 件を表示中</span>
            </div>
          </div>

          {/* Prompts List */}
          {filteredPrompts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-gray-500 mb-4">
                  {searchQuery ? '検索結果がありません' : 'まだプロンプトがありません'}
                </div>
                {!searchQuery && (
                  <Link href="/prompts/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      最初のプロンプトを作成
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrompts.map((prompt) => (
                <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg truncate flex-1 mr-2">
                        {prompt.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {prompt.is_public ? (
                          <Globe className="w-4 h-4 text-green-600" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleCopyPrompt(prompt.content)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="コピー"
                          >
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                          <Link href={`/prompts/${prompt.id}/edit`}>
                            <button className="p-1 hover:bg-gray-100 rounded" title="編集">
                              <Edit className="w-4 h-4 text-gray-500" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDeletePrompt(prompt.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="削除"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-4">
                      {prompt.content}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {prompt.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        更新: {new Date(prompt.updated_at).toLocaleDateString('ja-JP')}
                      </span>
                      {prompt.quick_access_key && (
                        <span className="text-purple-600 font-mono">
                          /{prompt.quick_access_key}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </WebAppLayout>
  );
}