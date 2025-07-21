'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Prompt } from '@/lib/services/prompt-service';

interface EditPromptFormProps {
  prompt: Prompt;
  username: string;
}

export function EditPromptForm({ prompt, username }: EditPromptFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: prompt.title,
    content: prompt.content,
    tags: prompt.tags.join(', '),
    quick_access_key: prompt.quick_access_key || '',
    is_public: prompt.is_public,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const updateData = {
        title: formData.title,
        content: formData.content,
        tags: tagsArray,
        quick_access_key: formData.quick_access_key || null,
        is_public: formData.is_public,
      };

      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update prompt');
      }

      const updatedPrompt = await response.json();
      
      // Redirect to the updated prompt (slug might have changed)
      router.push(`/${username}/prompts/${updatedPrompt.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete prompt');
      }

      // Redirect to user's prompts page
      router.push(`/${username}/prompts`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Title */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter prompt title"
            required
            disabled={isLoading}
          />
        </div>

        {/* Content */}
        <div className="mb-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Enter your prompt content"
            required
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.content.length} characters
          </p>
        </div>

        {/* Tags */}
        <div className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="tag1, tag2, tag3"
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500 mt-1">
            Separate tags with commas. Maximum 10 tags.
          </p>
        </div>

        {/* Quick Access Key */}
        <div className="mb-6">
          <label htmlFor="quick_access_key" className="block text-sm font-medium text-gray-700 mb-2">
            Quick Access Key
          </label>
          <div className="flex items-center">
            <span className="text-gray-500 mr-1">/</span>
            <input
              type="text"
              id="quick_access_key"
              value={formData.quick_access_key}
              onChange={(e) => setFormData({ ...formData, quick_access_key: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              placeholder="shortcut"
              disabled={isLoading}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Optional shortcut for quick access (e.g., /email, /code)
          </p>
        </div>

        {/* Visibility */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_public}
              onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-gray-700">
              Make this prompt public
            </span>
          </label>
          <p className="text-sm text-gray-500 mt-1 ml-6">
            Public prompts can be viewed by anyone
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <Link
              href={`/${username}/prompts/${prompt.slug}`}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 text-red-700 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Delete Prompt
          </button>
        </div>
      </form>
    </div>
  );
}