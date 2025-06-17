import type { CreatePromptRequest, UpdatePromptRequest, Prompt } from '../../types'
import { Button } from '../common'
import { PromptForm } from '../prompt'

interface AppContentAreaProps {
  /** 選択中のプロンプト */
  selectedPrompt: Prompt | null
  /** 新規作成フォーム表示状態 */
  showCreateForm: boolean
  /** 編集フォーム表示状態 */
  showEditForm: boolean
  /** ローディング状態 */
  isLoading: boolean
  /** エラー状態 */
  error: string | null
  /** プロンプト作成ハンドラー */
  onCreatePrompt: (data: CreatePromptRequest | UpdatePromptRequest) => Promise<void>
  /** プロンプト更新ハンドラー */
  onUpdatePrompt: (data: CreatePromptRequest | UpdatePromptRequest) => Promise<void>
  /** プロンプトコピーハンドラー */
  onCopyPrompt: (prompt: Prompt) => Promise<void>
  /** プロンプト編集ハンドラー */
  onEditPrompt: (prompt: Prompt) => void
  /** プロンプト削除ハンドラー */
  onDeletePrompt: (id: string) => Promise<void>
  /** 新規作成フォーム表示ハンドラー */
  onShowCreateForm: () => void
  /** 新規作成フォームキャンセルハンドラー */
  onCancelCreateForm: () => void
  /** 編集フォームキャンセルハンドラー */
  onCancelEditForm: () => void
}

/**
 * アプリケーションのコンテンツエリアコンポーネント
 * プロンプトの詳細表示、作成・編集フォームを含む
 */
export function AppContentArea({
  selectedPrompt,
  showCreateForm,
  showEditForm,
  isLoading,
  error,
  onCreatePrompt,
  onUpdatePrompt,
  onCopyPrompt,
  onEditPrompt,
  onDeletePrompt,
  onShowCreateForm,
  onCancelCreateForm,
  onCancelEditForm,
}: AppContentAreaProps) {
  return (
    <div className="content-area bg-white">
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="text-red-800">{error}</div>
        </div>
      )}
      
      {showCreateForm ? (
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">新規プロンプト作成</h2>
          <PromptForm
            onSubmit={onCreatePrompt}
            onCancel={onCancelCreateForm}
            isLoading={isLoading}
          />
        </div>
      ) : showEditForm && selectedPrompt ? (
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">プロンプト編集</h2>
          <PromptForm
            initialData={selectedPrompt}
            onSubmit={onUpdatePrompt}
            onCancel={onCancelEditForm}
            isLoading={isLoading}
          />
        </div>
      ) : selectedPrompt ? (
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">{selectedPrompt.title}</h2>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopyPrompt(selectedPrompt)}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                コピー
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditPrompt(selectedPrompt)}
              >
                編集
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeletePrompt(selectedPrompt.id)}
              >
                削除
              </Button>
            </div>
          </div>
          
          <div className="prose max-w-none">
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
              {selectedPrompt.content}
            </div>
            
            {Array.isArray(selectedPrompt.tags) && selectedPrompt.tags.length > 0 && (
              <div className="mt-6">
                <span className="text-sm font-medium text-gray-500">タグ: </span>
                <div className="inline-flex flex-wrap gap-1 mt-1">
                  {selectedPrompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">プロンプトを選択</h3>
            <p className="text-gray-500 mb-4">
              左側のリストからプロンプトを選択して内容を表示
            </p>
            <Button onClick={onShowCreateForm}>
              新しいプロンプトを作成
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}