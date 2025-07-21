import { HTMLAttributes } from 'react';
import { cn } from '@prompalette/ui';
import { Skeleton } from '../Skeleton';
import { PromptCardSkeleton } from '../PromptCardSkeleton';

interface UserProfileSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  promptCount?: number;
}

export function UserProfileSkeleton({ 
  className, 
  promptCount = 6, 
  ...props 
}: UserProfileSkeletonProps) {
  return (
    <div
      className={cn('max-w-6xl mx-auto', className)}
      data-testid="user-profile-skeleton"
      {...props}
    >
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4" data-testid="profile-header-skeleton">
          {/* Avatar */}
          <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full" data-testid="avatar-skeleton" />
          
          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <Skeleton className="h-8 w-48 mx-auto sm:mx-0 mb-2" data-testid="name-skeleton" />
            <Skeleton className="h-6 w-32 mx-auto sm:mx-0 mb-3" data-testid="username-skeleton" />
            
            {/* Basic Stats */}
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 sm:gap-6 mt-3" data-testid="basic-stats-skeleton">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-28" />
            </div>
            
            {/* Enhanced Statistics */}
            <div className="mt-4 p-4 sm:p-6 bg-gray-50 rounded-lg" data-testid="enhanced-stats-skeleton">
              <Skeleton className="h-5 w-20 mb-3 mx-auto sm:mx-0" />
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4" data-testid="stats-grid-skeleton">
                <div className="text-center">
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
                <div className="text-center">
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              </div>
              
              {/* Most Used Tags */}
              <div className="mt-4">
                <Skeleton className="h-5 w-28 mb-2 mx-auto sm:mx-0" />
                <div className="flex flex-wrap justify-center sm:justify-start gap-2" data-testid="profile-tags-skeleton">
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-6 w-20 rounded-md" />
                  <Skeleton className="h-6 w-12 rounded-md" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex justify-center sm:justify-end space-x-3 mt-4 sm:mt-0">
            <Skeleton className="h-10 w-24 rounded-lg" data-testid="action-button-skeleton" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 overflow-hidden">
        <div className="flex space-x-4 sm:space-x-8 overflow-x-auto pb-2" data-testid="tabs-skeleton">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-36 rounded-md" />
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" data-testid="prompts-grid-skeleton">
        {Array.from({ length: promptCount }).map((_, index) => (
          <PromptCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}