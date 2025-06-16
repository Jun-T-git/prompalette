import type { Prompt } from '../../types'
import { timeAgo } from '../../utils'

interface PromptCardProps {
  prompt: Prompt
  isSelected?: boolean
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onCopy?: () => void
}

export function PromptCard({
  prompt,
  isSelected = false,
  onClick,
  onEdit,
  onDelete,
  onCopy,
}: PromptCardProps) {
  const cardClasses = [
    'p-4 rounded-lg border cursor-pointer transition-all duration-200',
    isSelected
      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
  ].join(' ')

  const truncateContent = (content: string, maxLength = 100) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content
  }

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 line-clamp-2 flex-1">
          {prompt.title}
        </h3>
        
        <div className="flex items-center space-x-1 ml-2">
          {onCopy && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCopy()
              }}
              className="p-1 text-gray-400 hover:text-blue-600 rounded"
              title="コピー"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="編集"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="削除"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">
        {truncateContent(prompt.content)}
      </p>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="flex space-x-1">
              {prompt.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {tag}
                </span>
              ))}
              {prompt.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{prompt.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
        
        <span className="text-xs text-gray-400">
          {timeAgo(prompt.updated_at)}
        </span>
      </div>
    </div>
  )
}