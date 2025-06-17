import type { Prompt } from '../../types'

interface PromptCardProps {
  prompt: Prompt
  isSelected?: boolean
  onClick?: () => void
  onDelete?: () => void
  onCopy?: () => void
}

export function PromptCard({
  prompt,
  isSelected = false,
  onClick,
  onDelete,
  onCopy,
}: PromptCardProps) {
  const cardClasses = [
    'p-2 rounded border cursor-pointer transition-all duration-200 h-12 flex items-center justify-between',
    isSelected
      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
  ].join(' ')

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* 左側: タイトルとタグ */}
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {prompt.title}
        </h3>
        
        {Array.isArray(prompt.tags) && prompt.tags.length > 0 && (
          <div className="flex space-x-1">
            {prompt.tags.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 truncate max-w-20"
              >
                {tag}
              </span>
            ))}
            {prompt.tags.length > 1 && (
              <span className="text-xs text-gray-500 flex-shrink-0">
                +{prompt.tags.length - 1}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* 右側: アクションとEnterキー */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        {onCopy && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCopy()
            }}
            className="p-0.5 text-gray-400 hover:text-blue-600 rounded"
            title="コピー"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-0.5 text-gray-400 hover:text-red-600 rounded"
            title="削除"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
        
      </div>
    </div>
  )
}