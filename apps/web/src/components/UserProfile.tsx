'use client';

import { User } from 'next-auth';
import Image from 'next/image';
import { Prompt } from '@/lib/services/prompt-service';
import { PromptCard } from '@/components/PromptCard';

interface UserProfileProps {
  user: {
    username: string;
    name: string | null;
    avatar_url: string | null;
  };
  prompts: Prompt[];
  isOwnProfile: boolean;
  currentUser: User | null;
}

export function UserProfile({ user, prompts, isOwnProfile, currentUser }: UserProfileProps) {
  const publicPrompts = prompts.filter(p => p.is_public);
  const privatePrompts = prompts.filter(p => !p.is_public);
  
  // Calculate statistics
  const calculateStats = () => {
    const relevantPrompts = isOwnProfile ? prompts : publicPrompts;
    const totalViews = relevantPrompts.reduce((sum, p) => sum + (p.view_count || 0), 0);
    const totalCopies = relevantPrompts.reduce((sum, p) => sum + (p.copy_count || 0), 0);
    const avgLength = relevantPrompts.length > 0 ? 
      Math.round(relevantPrompts.reduce((sum, p) => sum + p.content.length, 0) / relevantPrompts.length) : 0;
    
    // Calculate most used tags
    const tagCounts = new Map<string, number>();
    relevantPrompts.forEach(prompt => {
      if (prompt.tags && prompt.tags.length > 0) {
        prompt.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });
    
    const mostUsedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
    
    return {
      totalViews,
      totalCopies,
      avgLength,
      mostUsedTags
    };
  };
  
  const stats = calculateStats();
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4" data-testid="profile-header">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold" data-testid="avatar-container">
            {user.avatar_url ? (
              <Image 
                src={user.avatar_url} 
                alt={`${user.username}'s avatar`}
                width={96}
                height={96}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>
          
          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {user.name || user.username}
            </h1>
            <p className="text-gray-600 text-lg sm:text-base">@{user.username}</p>
            
            {/* Basic Stats */}
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 sm:gap-6 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <strong className="text-gray-900">{publicPrompts.length}</strong> 
                <span className="hidden sm:inline">public prompts</span>
                <span className="sm:hidden">public</span>
              </span>
              {isOwnProfile && privatePrompts.length > 0 && (
                <span className="flex items-center gap-1">
                  <strong className="text-gray-900">{privatePrompts.length}</strong> 
                  <span className="hidden sm:inline">private prompts</span>
                  <span className="sm:hidden">private</span>
                </span>
              )}
            </div>
            
            {/* Enhanced Statistics */}
            <div className="mt-4 p-4 sm:p-6 bg-gray-50 rounded-lg" data-testid="user-stats-section">
              <h3 className="text-sm font-medium text-gray-900 mb-3 text-center sm:text-left">Statistics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4" data-testid="stats-grid">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600" data-testid="total-views">{stats.totalViews}</div>
                  <div className="text-xs text-gray-500">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600" data-testid="total-copies">{stats.totalCopies}</div>
                  <div className="text-xs text-gray-500">Total Copies</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600" data-testid="avg-length">{stats.avgLength}</div>
                  <div className="text-xs text-gray-500">Avg Length</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600">{prompts.length}</div>
                  <div className="text-xs text-gray-500">Total Prompts</div>
                </div>
              </div>
              
              {/* Most Used Tags */}
              {stats.mostUsedTags.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 text-center sm:text-left">Most Used Tags</h4>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2" data-testid="most-used-tags">
                    {stats.mostUsedTags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-center sm:justify-end space-x-3 mt-4 sm:mt-0">
            {isOwnProfile ? (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
                Edit Profile
              </button>
            ) : (
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">
                Follow
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 overflow-hidden">
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto pb-2" data-testid="tab-navigation">
          <button className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium whitespace-nowrap text-sm sm:text-base">
            Public Prompts ({publicPrompts.length})
          </button>
          {isOwnProfile && (
            <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium whitespace-nowrap text-sm sm:text-base">
              Private Prompts ({privatePrompts.length})
            </button>
          )}
        </nav>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" data-testid="prompts-grid">
        {prompts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              {isOwnProfile ? (
                <div>
                  <p className="text-lg mb-2">No prompts yet</p>
                  <p className="text-sm">Create your first prompt to get started</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg mb-2">No public prompts</p>
                  <p className="text-sm">This user hasn&apos;t shared any prompts yet</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              showAuthor={false}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </div>
  );
}