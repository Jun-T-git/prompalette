import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPromptService } from '@/lib/services/service-factory';
import { getUserFromSession } from '@/lib/auth-utils';
import { PromptFilter } from '@/components/PromptFilter';
import { WebAppLayout } from '@/components/WebAppLayout';
import { Prompt } from '@/lib/types';

interface UserPromptsPageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserPromptsPage({ params }: UserPromptsPageProps) {
  const { username } = await params;
  
  try {
    // Get current user session
    const currentUser = await getUserFromSession();
    
    // Get prompt service
    const promptService = getPromptService();
    
    // Get user prompts (include private if viewing own profile)
    const isOwnProfile = currentUser?.username === username;
    const prompts = await promptService.getByUsername(username, isOwnProfile);
    
    // Get user info from first prompt (temporary solution)
    const userInfo = prompts[0]?.user || {
      username,
      name: username,
      avatar_url: null,
    };
    
    // Filter prompts by visibility
    const publicPrompts = prompts.filter((p: Prompt) => p.is_public);
    const privatePrompts = prompts.filter((p: Prompt) => !p.is_public);

    return (
      <WebAppLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-6">
            {isOwnProfile && (
              <>
                <Link href={`/${username}`} className="hover:text-blue-600">
                  Dashboard
                </Link>
                <span>/</span>
              </>
            )}
            <Link href={`/${username}/profile`} className="hover:text-blue-600">
              @{username}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">prompts</span>
          </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isOwnProfile ? 'Your Prompts' : `${userInfo.name || username}'s Prompts`}
              </h1>
              <p className="text-gray-600 mt-1">
                {publicPrompts.length} public prompts
                {isOwnProfile && privatePrompts.length > 0 && `, ${privatePrompts.length} private`}
              </p>
            </div>
            
            {isOwnProfile && (
              <Link
                href="/prompts/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Prompt
              </Link>
            )}
          </div>
        </div>

        {/* Prompt Filter Component */}
        <PromptFilter
          prompts={prompts}
          isOwnProfile={isOwnProfile}
          currentUser={currentUser ? {
            id: currentUser.id,
            username: currentUser.username,
            name: currentUser.name || currentUser.username,
            email: currentUser.email || '',
            avatar_url: currentUser.image || null,
            is_public: currentUser.isPublic,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } : null}
        />
        </div>
      </WebAppLayout>
    );
  } catch (error) {
    console.error('Error loading user prompts:', error);
    notFound();
  }
}