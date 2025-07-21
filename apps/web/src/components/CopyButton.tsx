'use client';

import { useState } from 'react';
import { useToast } from './providers/ToastProvider';

interface CopyButtonProps {
  text: string;
  className?: string;
  promptId?: string;
}

export function CopyButton({ text, className = "", promptId }: CopyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      await navigator.clipboard.writeText(text);
      
      // Track copy statistics if promptId is provided
      if (promptId) {
        try {
          await fetch(`/api/v1/prompts/${promptId}/copy`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
        } catch (statsError) {
          console.error('Failed to track copy stats:', statsError);
        }
      }
      
      showToast('success', 'Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      showToast('error', 'Failed to copy to clipboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={isLoading}
      className={`flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <div
          className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"
          data-testid="copy-loading"
          aria-hidden="true"
        />
      ) : (
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          data-testid="copy-icon"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" 
          />
        </svg>
      )}
      <span>Copy</span>
    </button>
  );
}