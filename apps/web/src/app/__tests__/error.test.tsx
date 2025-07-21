import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Error from '../error';

describe('Error Page', () => {
  const mockReset = vi.fn();

  beforeEach(() => {
    mockReset.mockClear();
  });

  it('should render error title', () => {
    const mockError = { message: 'Test error' } as Error & { digest?: string };
    render(<Error error={mockError} reset={mockReset} />);
    
    expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
  });

  it('should render error message', () => {
    const mockError = { message: 'Test error' } as Error & { digest?: string };
    render(<Error error={mockError} reset={mockReset} />);
    
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should render try again button', () => {
    const mockError = { message: 'Test error' } as Error & { digest?: string };
    render(<Error error={mockError} reset={mockReset} />);
    
    const button = screen.getByRole('button', { name: 'Try again' });
    expect(button).toBeInTheDocument();
  });

  it('should call reset when try again button is clicked', () => {
    const mockError = { message: 'Test error' } as Error & { digest?: string };
    render(<Error error={mockError} reset={mockReset} />);
    
    const button = screen.getByRole('button', { name: 'Try again' });
    fireEvent.click(button);
    
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should render home link', () => {
    const mockError = { message: 'Test error' } as Error & { digest?: string };
    render(<Error error={mockError} reset={mockReset} />);
    
    const homeLink = screen.getByRole('link', { name: 'Go home' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should have proper CSS classes', () => {
    const mockError = { message: 'Test error' } as Error & { digest?: string };
    render(<Error error={mockError} reset={mockReset} />);
    
    const container = screen.getByTestId('error-container');
    expect(container).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-screen');
  });

  it('should handle error without message', () => {
    const errorWithoutMessage = {} as Error & { digest?: string };
    render(<Error error={errorWithoutMessage} reset={mockReset} />);
    
    expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument();
  });
});