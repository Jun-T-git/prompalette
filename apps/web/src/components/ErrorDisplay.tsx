/**
 * エラー表示用UIコンポーネント
 */
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

import type { AppError, FormError } from '@/lib/error-handling';

interface ErrorDisplayProps {
  error: AppError | null;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onDismiss, 
  className = '' 
}) => {
  if (!error) return null;

  return (
    <div 
      className={`
        flex items-start gap-3 p-4 
        bg-red-50 border border-red-200 rounded-lg
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="text-sm font-medium text-red-800">
          エラーが発生しました
        </h3>
        <p className="text-sm text-red-700 mt-1">
          {error.message}
        </p>
        {error.details && process.env.NODE_ENV === 'development' && (
          <details className="mt-2">
            <summary className="text-xs text-red-600 cursor-pointer">
              詳細情報
            </summary>
            <pre className="text-xs text-red-600 mt-1 overflow-x-auto">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          </details>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-600 hover:text-red-800 p-1"
          aria-label="エラーを閉じる"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

interface FieldErrorProps {
  error: FormError | null;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error, className = '' }) => {
  if (!error) return null;

  return (
    <div 
      className={`flex items-center gap-2 text-red-600 text-sm mt-1 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{error.message}</span>
    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: AppError | null; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error: {
        code: 'REACT_ERROR',
        message: error.message,
        details: { stack: error.stack },
        timestamp: new Date().toISOString(),
      },
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} reset={this.reset} />;
      }

      return (
        <div className="p-6 max-w-lg mx-auto">
          <ErrorDisplay 
            error={this.state.error} 
            onDismiss={this.reset}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// デフォルトのエラーフォールバックコンポーネント
export const DefaultErrorFallback: React.FC<{ error: AppError | null; reset: () => void }> = ({ 
  error, 
  reset 
}) => (
  <div className="p-6 max-w-lg mx-auto">
    <ErrorDisplay error={error} />
    <button
      onClick={reset}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      再試行
    </button>
  </div>
);