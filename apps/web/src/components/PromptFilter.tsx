'use client';

import { useState } from 'react';
import { PromptCard } from '@/components/PromptCard';
import type { Prompt, User } from '@/lib/types';

interface PromptFilterProps {
  prompts: Prompt[];
  isOwnProfile: boolean;
  currentUser: User | null;
}

type FilterType = 'all' | 'public' | 'private';

export function PromptFilter({ prompts, isOwnProfile, currentUser }: PromptFilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Filter prompts based on active filter
  const publicPrompts = prompts.filter(p => p.is_public);
  const privatePrompts = prompts.filter(p => !p.is_public);
  
  const getFilteredPrompts = () => {
    switch (activeFilter) {
      case 'public':
        return publicPrompts;
      case 'private':
        return privatePrompts;
      case 'all':
      default:
        return isOwnProfile ? prompts : publicPrompts;
    }
  };

  const filteredPrompts = getFilteredPrompts();

  const getTabClass = (filter: FilterType) => {
    const baseClass = "py-2 px-1 border-b-2 font-medium transition-colors cursor-pointer";
    if (activeFilter === filter) {
      return `${baseClass} border-blue-500 text-blue-600`;
    }
    return `${baseClass} border-transparent text-gray-500 hover:text-gray-700`;
  };

  return (
    <>
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button 
            onClick={() => setActiveFilter('all')}
            className={getTabClass('all')}
          >
            {isOwnProfile ? 'All' : 'Public'} ({isOwnProfile ? prompts.length : publicPrompts.length})
          </button>
          {isOwnProfile && (
            <>
              <button 
                onClick={() => setActiveFilter('public')}
                className={getTabClass('public')}
              >
                Public ({publicPrompts.length})
              </button>
              <button 
                onClick={() => setActiveFilter('private')}
                className={getTabClass('private')}
              >
                Private ({privatePrompts.length})
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrompts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500">
              {activeFilter === 'private' ? (
                <div>
                  <p className="text-lg mb-2">No private prompts</p>
                  <p className="text-sm">All your prompts are currently public</p>
                </div>
              ) : activeFilter === 'public' ? (
                <div>
                  <p className="text-lg mb-2">No public prompts</p>
                  <p className="text-sm">Make some of your prompts public to share them</p>
                </div>
              ) : isOwnProfile ? (
                <div>
                  <p className="text-lg mb-2">No prompts yet</p>
                  <p className="text-sm mb-4">Create your first prompt to get started</p>
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
          filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              showAuthor={false}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </>
  );
}