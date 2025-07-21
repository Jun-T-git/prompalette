import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from '../loading';

describe('Loading Page', () => {
  it('should render loading spinner', () => {
    render(<Loading />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render loading text', () => {
    render(<Loading />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should have proper CSS classes', () => {
    render(<Loading />);
    
    const container = screen.getByTestId('loading-container');
    expect(container).toHaveClass('flex', 'items-center', 'justify-center', 'min-h-screen');
  });

  it('should render with accessible loading state', () => {
    render(<Loading />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
    
    const loadingText = screen.getByText('Loading...');
    expect(loadingText).toBeInTheDocument();
  });
});