import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  
  const inputClasses = [
    'block w-full rounded-md border px-3 py-2 text-sm transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
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
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      
      <input
        id={inputId}
        className={inputClasses}
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