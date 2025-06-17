import React from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 4,
  ...props
}: TextareaProps) {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
  
  const textareaClasses = [
    'block w-full rounded-md border px-3 py-2 text-sm transition-colors resize-vertical',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    error
      ? 'border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500'
      : 'border-gray-300 text-gray-900 placeholder-gray-400',
    'disabled:bg-gray-50 disabled:text-gray-500',
    className,
  ].join(' ')

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      
      <textarea
        id={textareaId}
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
}