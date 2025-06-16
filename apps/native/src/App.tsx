import { useState, useEffect } from 'react'

import { SearchInput, PromptCard, PromptForm, Button, EnvironmentError, ToastProvider, useToast } from './components'
import { usePromptStore } from './stores'
import type { CreatePromptRequest, UpdatePromptRequest, Prompt } from './types'
import { copyPromptToClipboard } from './utils'
import './App.css'

function AppContent() {
  const {
    prompts,
    selectedPrompt,
    searchQuery,
    isLoading,
    error,
    setSelectedPrompt,
    setSearchQuery,
    createPrompt,
    updatePrompt,
    deletePrompt,
    loadPrompts,
  } = usePromptStore()

  const { showToast } = useToast()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [environmentError, setEnvironmentError] = useState<string | null>(null)

  // Load prompts on mount
  useEffect(() => {
    loadPrompts()
  }, []) // 空の依存配列で初回マウント時のみ実行

  // ストアのエラーを監視して環境エラーを検出
  useEffect(() => {
    if (error && error.includes('Tauri environment not available')) {
      setEnvironmentError(error)
    }
  }, [error])

  // Filter prompts based on search query
  const filteredPrompts = prompts.filter(prompt => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      prompt.title.toLowerCase().includes(query) ||
      prompt.content.toLowerCase().includes(query) ||
      prompt.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  })

  const handleCreatePrompt = async (data: CreatePromptRequest | UpdatePromptRequest) => {
    if ('id' in data) {
      // This is an update request
      await updatePrompt(data as UpdatePromptRequest)
    } else {
      // This is a create request
      await createPrompt(data as CreatePromptRequest)
    }
    setShowCreateForm(false)
  }

  const handleUpdatePrompt = async (data: CreatePromptRequest | UpdatePromptRequest) => {
    if ('id' in data) {
      // This is an update request
      await updatePrompt(data as UpdatePromptRequest)
    } else {
      // This is a create request
      await createPrompt(data as CreatePromptRequest)
    }
    setShowEditForm(false)
    setSelectedPrompt(null)
  }

  const handleDeletePrompt = async (id: string) => {
    if (confirm('このプロンプトを削除しますか？')) {
      await deletePrompt(id)
    }
  }

  const handleEditPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setShowEditForm(true)
  }

  const handleCopyPrompt = async (prompt: Prompt) => {
    const result = await copyPromptToClipboard(prompt.content, prompt.id)
    if (result.success) {
      showToast(`「${prompt.title}」をコピーしました`, 'success')
    } else {
      showToast(`コピーに失敗しました: ${result.error}`, 'error')
    }
  }

  // 環境エラーがある場合は専用画面を表示
  if (environmentError) {
    return (
      <EnvironmentError 
        error={environmentError} 
        onRetry={() => {
          setEnvironmentError(null)
          loadPrompts().catch((error) => {
            if (error?.message?.includes('Tauri environment not available')) {
              setEnvironmentError(error.message)
            }
          })
        }}
      />
    )
  }

  return (
    <div className="app-layout bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/prompalette_logo_1080_1080.png" 
              alt="PromPalette" 
              className="w-8 h-8"
            />
            <h1 className="text-xl font-semibold text-gray-900">PromPalette</h1>
          </div>
          
          <Button
            onClick={() => setShowCreateForm(true)}
            size="sm"
            className="flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>新規作成</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="p-4">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="プロンプトを検索..."
            />
          </div>
          
          <div className="px-4 pb-4">
            <div className="text-sm text-gray-500 mb-3">
              {filteredPrompts.length} 件のプロンプト
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                <div className="mt-2 text-sm text-gray-500">読み込み中...</div>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-sm text-gray-500">
                  {searchQuery ? '検索結果がありません' : 'プロンプトがありません'}
                </div>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="mt-2"
                  >
                    検索をクリア
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {filteredPrompts.map((prompt) => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    isSelected={selectedPrompt?.id === prompt.id}
                    onClick={() => setSelectedPrompt(prompt)}
                    onCopy={() => handleCopyPrompt(prompt)}
                    onEdit={() => handleEditPrompt(prompt)}
                    onDelete={() => handleDeletePrompt(prompt.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
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
                onSubmit={handleCreatePrompt}
                onCancel={() => setShowCreateForm(false)}
                isLoading={isLoading}
              />
            </div>
          ) : showEditForm && selectedPrompt ? (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">プロンプト編集</h2>
              <PromptForm
                initialData={selectedPrompt}
                onSubmit={handleUpdatePrompt}
                onCancel={() => {
                  setShowEditForm(false)
                  setSelectedPrompt(null)
                }}
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
                    onClick={() => handleCopyPrompt(selectedPrompt)}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    コピー
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPrompt(selectedPrompt)}
                  >
                    編集
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePrompt(selectedPrompt.id)}
                  >
                    削除
                  </Button>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap">
                  {selectedPrompt.content}
                </div>
                
                {selectedPrompt.tags?.length && (
                  <div className="mt-6">
                    <span className="text-sm font-medium text-gray-500">タグ: </span>
                    <div className="inline-flex flex-wrap gap-1 mt-1">
                      {selectedPrompt.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
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
                <Button onClick={() => setShowCreateForm(true)}>
                  新しいプロンプトを作成
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

export default App