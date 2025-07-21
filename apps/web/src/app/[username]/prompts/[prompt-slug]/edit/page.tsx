import { notFound, redirect } from 'next/navigation';
import { getPromptService } from '@/lib/services/service-factory';
import { getUserFromSession } from '@/lib/auth-utils';
import { EditPromptForm } from '@/components/EditPromptForm';
import { WebAppLayout } from '@/components/WebAppLayout';

interface EditPromptPageProps {
  params: Promise<{
    username: string;
    'prompt-slug': string;
  }>;
}

export default async function EditPromptPage({ params }: EditPromptPageProps) {
  const { username, 'prompt-slug': promptSlug } = await params;
  
  try {
    // Get current user session - required for editing
    const currentUser = await getUserFromSession();
    
    if (!currentUser) {
      redirect('/login');
    }
    
    // Get prompt service
    const promptService = getPromptService();
    
    // Get the specific prompt
    const prompt = await promptService.getByUsernameAndSlug(username, promptSlug);
    
    if (!prompt) {
      notFound();
    }
    
    // Check ownership - only owner can edit
    const isOwner = currentUser.id === prompt.user_id;
    const isCorrectUser = currentUser.username === username;
    
    if (!isOwner || !isCorrectUser) {
      notFound();
    }

    return (
      <WebAppLayout>
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-1 text-sm text-gray-500 mb-6">
            <a href={`/${username}`} className="hover:text-blue-600">
              Dashboard
            </a>
            <span>/</span>
            <a href={`/${username}/profile`} className="hover:text-blue-600">
              @{username}
            </a>
            <span>/</span>
            <a href={`/${username}/prompts`} className="hover:text-blue-600">
              prompts
            </a>
            <span>/</span>
            <a href={`/${username}/prompts/${promptSlug}`} className="hover:text-blue-600">
              {prompt.slug}
            </a>
            <span>/</span>
            <span className="text-gray-900 font-medium">edit</span>
          </nav>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Edit Prompt
            </h1>
            <p className="text-gray-600">
              Make changes to your prompt. Changes will be saved immediately.
            </p>
          </div>

          {/* Edit Form */}
          <EditPromptForm 
            prompt={prompt}
            username={username}
          />
        </div>
        </div>
      </WebAppLayout>
    );
  } catch (error) {
    console.error('Error loading prompt for editing:', error);
    notFound();
  }
}