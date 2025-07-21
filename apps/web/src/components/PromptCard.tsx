'use client';

import Link from 'next/link';
import { User } from 'next-auth';
import { Prompt } from '@/lib/services/prompt-service';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CopyButton } from './CopyButton';

interface PromptCardProps {
  prompt: Prompt;
  showAuthor?: boolean;
  currentUser?: User | null;
}

export function PromptCard({ prompt, showAuthor = true, currentUser }: PromptCardProps) {
  const isOwner = currentUser?.id === prompt.user_id;
  const authorInfo = prompt.user || { username: 'unknown', name: null, avatar_url: null };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-100">
        <div className="flex items-start justify-between" data-testid="prompt-header">
          <div className="flex-1 min-w-0">
            <Link 
              href={`/${authorInfo.username}/prompts/${prompt.slug}`}
              className="block hover:text-blue-600 transition-colors"
            >
              <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                {prompt.title || 'Untitled Prompt'}
              </h3>
            </Link>
            
            {showAuthor && (
              <div className="flex flex-col sm:flex-row sm:items-center mt-1 text-xs sm:text-sm text-gray-500 gap-1 sm:gap-0">
                <Link 
                  href={`/${authorInfo.username}/profile`}
                  className="hover:text-blue-600 transition-colors"
                >
                  by @{authorInfo.username}
                </Link>
                <span className="mx-1 hidden sm:inline">•</span>
                <span className="text-xs sm:text-sm">
                  {formatDistanceToNow(new Date(prompt.created_at), { 
                    addSuffix: true, 
                    locale: ja 
                  })}
                </span>
              </div>
            )}
          </div>
          
          {/* Visibility indicator */}
          <div className="flex items-center space-x-2 ml-2">
            {prompt.is_public ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="hidden sm:inline">Public</span>
                <span className="sm:hidden">P</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                <span className="hidden sm:inline">Private</span>
                <span className="sm:hidden">Pr</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="p-3 sm:p-4">
        <p className="text-gray-700 text-xs sm:text-sm line-clamp-3">
          {prompt.content.substring(0, 200)}
          {prompt.content.length > 200 && '...'}
        </p>
        
        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
            {prompt.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
              >
                #{tag}
              </span>
            ))}
            {prompt.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                +{prompt.tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Quick Access Key */}
        {prompt.quick_access_key && (
          <div className="mt-2 sm:mt-3">
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono bg-gray-100 text-gray-700">
              /{prompt.quick_access_key}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0" data-testid="prompt-actions">
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto" data-testid="action-buttons">
          <CopyButton
            text={prompt.content}
            promptId={prompt.id}
            className="w-full sm:w-auto justify-center sm:justify-start"
          />
          
          {isOwner && (
            <Link
              href={`/${authorInfo.username}/prompts/${prompt.slug}/edit`}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors w-full sm:w-auto justify-center sm:justify-start"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </Link>
          )}
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-neutral-400 w-full sm:w-auto justify-center sm:justify-end" data-testid="stats-section">
          <span className="hidden sm:inline">{prompt.content.length} characters</span>
          <span className="sm:hidden">{prompt.content.length}c</span>
          <div className="flex items-center space-x-2">
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-testid="eye-icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-xs" data-testid="view-count-text">{prompt.view_count || 0}</span>
            </span>
            <span className="flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-testid="copy-count-icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="text-xs" data-testid="copy-count-text">{prompt.copy_count || 0}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}