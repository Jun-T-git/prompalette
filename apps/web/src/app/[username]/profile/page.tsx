import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPromptService } from '@/lib/services/service-factory';
import { getUserFromSession } from '@/lib/auth-utils';
import { UserProfile } from '@/components/UserProfile';
import { WebAppLayout } from '@/components/WebAppLayout';

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params;
  
  try {
    // Get current user session
    const currentUser = await getUserFromSession();
    
    // Get prompt service
    const promptService = getPromptService();
    
    // Get user prompts (include private if viewing own profile)
    const isOwnProfile = currentUser?.username === username;
    const prompts = await promptService.getByUsername(username, isOwnProfile);
    
    // If no prompts found and not own profile, check if user exists
    if (prompts.length === 0 && !isOwnProfile) {
      // Try to get at least one public prompt to verify user exists
      // In a real app, we'd have a separate user service to check existence
    }
    
    // Get user info from first prompt (temporary solution)
    const userInfo = prompts[0]?.user || {
      username,
      name: username,
      avatar_url: null,
    };
    
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
            <span className="text-gray-900 font-medium">@{username}</span>
          </nav>
          
          <UserProfile
            user={userInfo}
            prompts={prompts}
            isOwnProfile={isOwnProfile}
            currentUser={currentUser}
          />
        </div>
      </WebAppLayout>
    );
  } catch (error) {
    console.error('Error loading user profile:', error);
    notFound();
  }
}