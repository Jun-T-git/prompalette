'use client';

import React, { useEffect, useRef } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@prompalette/ui';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  visible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
  action?: ToastAction;
  className?: string;
}

const toastStyles = {
  success: {
    container: 'bg-green-50 border-green-200',
    icon: 'text-green-600',
    text: 'text-green-800'
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: 'text-red-600',
    text: 'text-red-800'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: 'text-yellow-600',
    text: 'text-yellow-800'
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: 'text-blue-600',
    text: 'text-blue-800'
  }
};

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  visible,
  onClose,
  autoClose = true,
  duration = 5000,
  action,
  className
}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const styles = toastStyles[type] || toastStyles.info;
  const IconComponent = iconMap[type] || iconMap.info;

  useEffect(() => {
    if (visible && autoClose) {
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible, autoClose, duration, onClose]);

  if (!visible) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-4 border rounded-lg shadow-lg max-w-md transition-all duration-300',
        styles.container,
        className
      )}
    >
      <IconComponent 
        className={cn('w-5 h-5 flex-shrink-0 mt-0.5', styles.icon)}
        data-testid={`${type}-icon`}
      />
      
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', styles.text)}>
          {message}
        </p>
        
        {action && (
          <div className="mt-2">
            <button
              type="button"
              onClick={action.onClick}
              className={cn(
                'text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
                styles.text
              )}
            >
              {action.label}
            </button>
          </div>
        )}
      </div>
      
      <button
        type="button"
        onClick={onClose}
        className={cn(
          'flex-shrink-0 p-1 rounded-md hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
          styles.text
        )}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};