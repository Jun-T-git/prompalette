import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPromptService } from '@/lib/services/service-factory';
import { getUserFromSession } from '@/lib/auth-utils';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CopyButton } from '@/components/CopyButton';
import { WebAppLayout } from '@/components/WebAppLayout';

interface PromptDetailPageProps {
  params: Promise<{
    username: string;
    'prompt-slug': string;
  }>;
}

export default async function PromptDetailPage({ params }: PromptDetailPageProps) {
  const { username, 'prompt-slug': promptSlug } = await params;
  
  try {
    // Get current user session
    const currentUser = await getUserFromSession();
    
    // Get prompt service
    const promptService = getPromptService();
    
    // Get the specific prompt
    const prompt = await promptService.getByUsernameAndSlug(username, promptSlug);
    
    if (!prompt) {
      notFound();
    }
    
    // Check access permissions
    const isOwner = currentUser?.id === prompt.user_id;
    const canView = prompt.is_public || isOwner;
    
    if (!canView) {
      notFound();
    }
    
    // Get user info
    const userInfo = prompt.user || {
      username,
      name: username,
      avatar_url: null,
    };

    return (
      <WebAppLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-6">
            {isOwner && (
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
            <Link href={`/${username}/prompts`} className="hover:text-blue-600">
              prompts
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{prompt.slug}</span>
          </nav>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {prompt.title || 'Untitled Prompt'}
                </h1>
                
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {userInfo.avatar_url ? (
                        <Image 
                          src={userInfo.avatar_url} 
                          alt={`${username}'s avatar`}
                          width={24}
                          height={24}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span>by @{username}</span>
                  </div>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(prompt.created_at), { 
                      addSuffix: true, 
                      locale: ja 
                    })}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Visibility indicator */}
                {prompt.is_public ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Public
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Private
                  </span>
                )}
                
                {/* Edit button for owner */}
                {isOwner && (
                  <Link
                    href={`/${username}/prompts/${promptSlug}/edit`}
                    className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                )}
              </div>
            </div>
            
            {/* Tags */}
            {prompt.tags && prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {prompt.tags.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Quick Access Key */}
            {prompt.quick_access_key && (
              <div className="mb-4">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono bg-gray-100 text-gray-700">
                  /{prompt.quick_access_key}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Prompt Content</h2>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {prompt.content.length} characters
                  </span>
                  <CopyButton text={prompt.content} />
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed font-mono">
                  {prompt.content}
                </pre>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  Created {formatDistanceToNow(new Date(prompt.created_at), { 
                    addSuffix: true, 
                    locale: ja 
                  })}
                  {prompt.updated_at !== prompt.created_at && (
                    <span>
                      {' • Updated '}
                      {formatDistanceToNow(new Date(prompt.updated_at), { 
                        addSuffix: true, 
                        locale: ja 
                      })}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4">
                  <Link
                    href={`/${username}/prompts`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View all prompts by @{username}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </WebAppLayout>
    );
  } catch (error) {
    console.error('Error loading prompt:', error);
    notFound();
  }
}