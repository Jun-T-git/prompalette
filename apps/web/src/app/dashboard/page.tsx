'use client';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@prompalette/ui';
import { Plus, Search, Star, Clock, Users, Globe } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { STUB_USER_SESSION, stubPromptStorage, isLocalDevelopment } from '@/lib/auth-stub';
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

export default function DashboardPage() {
  const { data: session } = useSession();
  const [myPrompts, setMyPrompts] = useState<Prompt[]>([]);
  const [publicPrompts, setPublicPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  // ローカル開発用の認証スタブ
  const currentSession = isLocalDevelopment ? STUB_USER_SESSION : session;

  useEffect(() => {
    if (!currentSession) return;

    // スタブデータの取得
    if (isLocalDevelopment) {
      const userPrompts = stubPromptStorage.getByUserId(currentSession.user.id);
      const allPublicPrompts = stubPromptStorage.getPublic();
      
      setMyPrompts(userPrompts);
      setPublicPrompts(allPublicPrompts.slice(0, 6)); // 最新6件
    }
    
    setLoading(false);
  }, [currentSession]);

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  こんにちは、{currentSession.user.name}さん
                </h1>
                <p className="text-gray-600 mt-2">
                  プロンプトを管理し、AIワークフローを最適化しましょう
                </p>
              </div>
              <div className="flex gap-4">
                <Link href="/prompts/new">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    新規作成
                  </Button>
                </Link>
                <Link href="/search">
                  <Button variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    検索
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">マイプロンプト</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myPrompts.length}</div>
                <p className="text-xs text-muted-foreground">
                  {myPrompts.filter(p => p.is_public).length} 件が公開中
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">最近の更新</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {myPrompts.filter(p => {
                    const updated = new Date(p.updated_at);
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return updated > weekAgo;
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  この1週間で更新
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">コミュニティ</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{publicPrompts.length}</div>
                <p className="text-xs text-muted-foreground">
                  公開プロンプト
                </p>
              </CardContent>
            </Card>
          </div>

          {/* My Prompts */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">マイプロンプト</h2>
              <Link href="/prompts" className="text-indigo-600 hover:text-indigo-500">
                すべて見る
              </Link>
            </div>
            
            {myPrompts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500 mb-4">まだプロンプトがありません</p>
                  <Link href="/prompts/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      最初のプロンプトを作成
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myPrompts.slice(0, 6).map((prompt) => (
                  <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg truncate">{prompt.title}</CardTitle>
                        {prompt.is_public ? (
                          <Globe className="w-4 h-4 text-green-600" />
                        ) : (
                          <Star className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {prompt.content}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {prompt.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(prompt.updated_at).toLocaleDateString('ja-JP')}
                        </span>
                        {prompt.quick_access_key && (
                          <span className="text-xs text-purple-600 font-mono">
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

          {/* Public Prompts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">コミュニティのプロンプト</h2>
              <Link href="/explore" className="text-indigo-600 hover:text-indigo-500">
                すべて見る
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicPrompts.map((prompt) => (
                <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg truncate">{prompt.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {prompt.content}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {prompt.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(prompt.updated_at).toLocaleDateString('ja-JP')}
                      </span>
                      <Button size="sm" variant="outline">
                        コピー
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WebAppLayout>
  );
}