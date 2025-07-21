'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Toast, ToastAction } from '@/components/ui/Toast';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastState {
  id: string;
  type: ToastType;
  message: string;
  visible: boolean;
  autoClose?: boolean;
  duration?: number;
  action?: ToastAction;
}

interface ToastOptions {
  autoClose?: boolean;
  duration?: number;
  action?: ToastAction;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string, options?: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((
    type: ToastType,
    message: string,
    options: ToastOptions = {}
  ) => {
    const id = Date.now().toString();
    setToast({
      id,
      type,
      message,
      visible: true,
      autoClose: options.autoClose ?? true,
      duration: options.duration ?? 5000,
      action: options.action
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => prev ? { ...prev, visible: false } : null);
    // Remove toast from state after animation
    setTimeout(() => {
      setToast(null);
    }, 300);
  }, []);

  const value = {
    showToast,
    hideToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Container */}
      <div 
        className="fixed top-4 right-4 z-50 flex flex-col gap-2"
        role="region"
        aria-label="Notifications"
      >
        {toast && (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            visible={toast.visible}
            onClose={hideToast}
            autoClose={toast.autoClose}
            duration={toast.duration}
            action={toast.action}
            className={`
              transform transition-all duration-300 ease-in-out
              ${toast.visible 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-full opacity-0'
              }
            `}
          />
        )}
      </div>
    </ToastContext.Provider>
  );
};