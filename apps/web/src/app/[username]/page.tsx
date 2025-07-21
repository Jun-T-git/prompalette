import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@prompalette/ui';
import { Plus, Search, Star, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { getPromptService } from '@/lib/services/service-factory';
import { getUserFromSession } from '@/lib/auth-utils';
import { PromptCard } from '@/components/PromptCard';
import { WebAppLayout } from '@/components/WebAppLayout';

interface UserDashboardPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserDashboardPage({ params }: UserDashboardPageProps) {
  const { username } = await params;
  
  try {
    // Get current user session
    const currentUser = await getUserFromSession();
    
    // If not logged in, redirect to login
    if (!currentUser) {
      redirect('/login');
    }
    
    // Debug logging for development
    console.log('Current user:', currentUser.username);
    console.log('Requested username:', username);
    
    // Check if this is the user's own dashboard
    const isOwnDashboard = currentUser.username === username;
    if (!isOwnDashboard) {
      // For development, show available usernames
      console.log('Available usernames: stub-user, dev-expert, ai-researcher, etc.');
      // Redirect to user's profile page if accessing someone else's dashboard
      redirect(`/${username}/profile`);
    }
    
    // Get prompt service
    const promptService = getPromptService();
    
    // Get user's prompts
    const myPrompts = await promptService.getByUsername(username, true);
    const publicPrompts = await promptService.getPublic();
    
    // Calculate stats
    const publicCount = myPrompts.filter(p => p.is_public).length;
    const recentlyUpdated = myPrompts.filter(p => {
      const updated = new Date(p.updated_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return updated > weekAgo;
    }).length;

    return (
      <WebAppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    こんにちは、{currentUser.name || username}さん
                  </h1>
                  <p className="text-gray-600 mt-2">
                    プロンプトを管理し、AIワークフローを最適化しましょう
                  </p>
                </div>
                <div className="flex gap-4">
                  <Link 
                    href="/prompts/new"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    新規作成
                  </Link>
                  <Link 
                    href="/search"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    検索
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
                  {publicCount} 件が公開中
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">最近の更新</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentlyUpdated}</div>
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
              <Link 
                href={`/${username}/prompts`} 
                className="text-indigo-600 hover:text-indigo-500"
              >
                すべて見る
              </Link>
            </div>
            
            {myPrompts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-500 mb-4">まだプロンプトがありません</p>
                  <Link 
                    href="/prompts/new"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    最初のプロンプトを作成
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myPrompts.slice(0, 6).map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    showAuthor={false}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Public Prompts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">コミュニティのプロンプト</h2>
              <Link 
                href="/search" 
                className="text-indigo-600 hover:text-indigo-500"
              >
                すべて見る
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicPrompts.slice(0, 6).map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  showAuthor={true}
                  currentUser={currentUser}
                />
              ))}
            </div>
            </div>
          </div>
        </div>
      </WebAppLayout>
    );
  } catch (error) {
    console.error('Error loading dashboard:', error);
    notFound();
  }
}