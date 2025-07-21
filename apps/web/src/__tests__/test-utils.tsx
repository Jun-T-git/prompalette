import React from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ToastProvider } from '@/components/providers/ToastProvider';

// Custom render function that includes providers
function customRender(ui: React.ReactElement, options?: RenderOptions): RenderResult {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <ToastProvider>
        {children}
      </ToastProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };