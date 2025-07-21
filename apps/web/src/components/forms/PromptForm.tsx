/**
 * プロダクションレベルのプロンプト作成フォーム
 * React Hook Formを使用した適切な状態管理とバリデーション
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { logError, logInfo } from '@/lib/logger';
import { getServices } from '@/lib/services/service-factory';
import { handleApiError, handleGenericError } from '@/lib/error-handling';
import type { CreatePromptInput } from '@/lib/services/prompt-service';

// バリデーションスキーマ
const promptSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(200, 'タイトルは200文字以内で入力してください'),
  content: z.string().min(1, 'プロンプト内容は必須です').max(100000, 'プロンプト内容は100,000文字以内で入力してください'),
  tags: z.string(),
  quick_access_key: z.string(),
  is_public: z.boolean(),
});

type PromptFormData = z.infer<typeof promptSchema>;

interface PromptFormProps {
  userId: string;
  username?: string;
  isLocalDevelopment: boolean;
  onSuccess?: (promptId: string) => void;
  onError?: (error: string) => void;
}

export function PromptForm({ 
  userId, 
  username,
  isLocalDevelopment, 
  onSuccess, 
  onError 
}: PromptFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { promptService } = getServices();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    setError,
    clearErrors,
  } = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: '',
      quick_access_key: '',
      is_public: true,
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  const processTags = (tagString: string): string[] => {
    return tagString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  const onSubmit = async (data: PromptFormData) => {
    setIsSubmitting(true);
    clearErrors();

    try {
      const promptInput: CreatePromptInput = {
        title: data.title.trim(),
        content: data.content.trim(),
        tags: processTags(data.tags),
        quick_access_key: data.quick_access_key.trim() || null,
        is_public: data.is_public,
      };

      logInfo('Creating prompt', {
        title: promptInput.title,
        hasContent: !!promptInput.content,
        tagCount: promptInput.tags.length,
        isPublic: promptInput.is_public,
      });

      let promptId: string;

      if (isLocalDevelopment) {
        // ローカル開発環境: サービスレイヤーを直接使用
        const newPrompt = await promptService.create(userId, promptInput);
        promptId = newPrompt.id;
        logInfo('Prompt created via service layer', { promptId });
      } else {
        // プロダクション環境: APIを使用
        // APIの期待する形式に変換（tagsは配列として送信）
        const apiPayload = {
          ...promptInput,
          tags: promptInput.tags, // 既に配列に変換済み
        };
        
        const response = await fetch('/api/prompts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiPayload),
        });

        if (!response.ok) {
          const apiError = await handleApiError(response);
          
          // フィールドレベルのエラーを適切に処理
          if (apiError.details && typeof apiError.details === 'object') {
            const details = apiError.details as any;
            if (Array.isArray(details)) {
              details.forEach((detail: any) => {
                if (detail.path && detail.path.length > 0) {
                  setError(detail.path[0] as keyof PromptFormData, {
                    type: 'server',
                    message: detail.message,
                  });
                }
              });
            }
          }
          
          throw new Error(apiError.message);
        }

        const result = await response.json();
        promptId = result.data.id;
        logInfo('Prompt created via API', { promptId });
      }

      // 成功時の処理
      if (onSuccess) {
        onSuccess(promptId);
      } else {
        // 新しいURL構造に従ってリダイレクト
        if (username) {
          router.push(`/${username}/prompts`);
        } else {
          router.push('/prompts');
        }
      }
    } catch (error) {
      logError('Error creating prompt', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      const appError = handleGenericError(error);
      const errorMessage = appError?.message || 'エラーが発生しました';
      
      if (onError) {
        onError(errorMessage);
      } else {
        setError('root', {
          type: 'server',
          message: errorMessage,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" role="form">
      {/* Global Error */}
      {errors.root && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                エラーが発生しました
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {errors.root.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          タイトル *
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
            errors.title ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="例: コードレビュー用プロンプト"
          maxLength={200}
        />
        <div className="flex justify-between items-center mt-1">
          <div className="text-xs text-gray-500">
            {watchedValues.title?.length || 0}/200文字
          </div>
          {errors.title && (
            <div className="text-xs text-red-600">
              {errors.title.message}
            </div>
          )}
        </div>
      </div>

      {/* Content Field */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          プロンプト内容 *
        </label>
        <textarea
          id="content"
          {...register('content')}
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[200px] resize-y ${
            errors.content ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="AIに送信するプロンプトを入力してください..."
          maxLength={100000}
        />
        <div className="flex justify-between items-center mt-1">
          <div className="text-xs text-gray-500">
            {watchedValues.content?.length || 0}/100,000文字
          </div>
          {errors.content && (
            <div className="text-xs text-red-600">
              {errors.content.message}
            </div>
          )}
        </div>
      </div>

      {/* Tags Field */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
          タグ
        </label>
        <input
          id="tags"
          type="text"
          {...register('tags')}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="例: development, ai, prompt (カンマ区切り)"
        />
        <p className="text-xs text-gray-500 mt-1">
          タグをカンマ区切りで入力してください
        </p>
      </div>

      {/* Quick Access Key Field */}
      <div>
        <label htmlFor="quick_access_key" className="block text-sm font-medium text-gray-700 mb-2">
          クイックアクセスキー
        </label>
        <input
          id="quick_access_key"
          type="text"
          {...register('quick_access_key')}
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="例: code-review"
        />
        <p className="text-xs text-gray-500 mt-1">
          素早くアクセスするためのキーワードを設定できます
        </p>
      </div>

      {/* Visibility Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          公開設定
        </label>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="public"
              type="radio"
              value="true"
              onChange={(e) => {
                if (e.target.checked) {
                  setValue('is_public', true, { shouldValidate: true });
                }
              }}
              defaultChecked={true}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label htmlFor="public" className="ml-2 text-sm text-gray-700">
              公開 - 他のユーザーがアクセスできます
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="private"
              type="radio"
              value="false"
              onChange={(e) => {
                if (e.target.checked) {
                  setValue('is_public', false, { shouldValidate: true });
                }
              }}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <label htmlFor="private" className="ml-2 text-sm text-gray-700">
              非公開 - 自分だけがアクセスできます
            </label>
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            isValid && !isSubmitting
              ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          data-testid="submit-button"
        >
          {isSubmitting ? '作成中...' : '作成'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}