import { HTMLAttributes } from 'react';
import { cn } from '@prompalette/ui';
import { Skeleton } from '../Skeleton';

interface PromptCardSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function PromptCardSkeleton({ className, ...props }: PromptCardSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200',
        className
      )}
      data-testid="prompt-card-skeleton"
      {...props}
    >
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-100" data-testid="header-skeleton">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <Skeleton className="h-6 w-3/4 mb-2" data-testid="title-skeleton" />
            
            {/* Author and date */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <Skeleton className="h-4 w-24" data-testid="author-skeleton" />
              <Skeleton className="h-4 w-20 sm:ml-2" />
            </div>
          </div>
          
          {/* Visibility indicator */}
          <Skeleton className="h-6 w-16 rounded-full" data-testid="visibility-skeleton" />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4" data-testid="content-skeleton-section">
        {/* Content preview */}
        <div className="space-y-2" data-testid="content-skeleton">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2 sm:mt-3" data-testid="tags-skeleton">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-12 rounded-md" />
        </div>
        
        {/* Quick access key */}
        <div className="mt-2 sm:mt-3" data-testid="quick-key-skeleton">
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      </div>

      {/* Actions */}
      <div className="px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 border-t border-gray-100" data-testid="actions-skeleton-section">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto" data-testid="actions-skeleton">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
          
          {/* Stats */}
          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-center sm:justify-end" data-testid="stats-skeleton">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
}