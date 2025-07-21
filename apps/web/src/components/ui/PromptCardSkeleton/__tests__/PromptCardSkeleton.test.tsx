import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PromptCardSkeleton } from '../PromptCardSkeleton';

describe('PromptCardSkeleton', () => {
  it('should render all skeleton elements', () => {
    render(<PromptCardSkeleton />);
    
    // Check header skeleton elements
    expect(screen.getByTestId('title-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('author-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('visibility-skeleton')).toBeInTheDocument();
    
    // Check content skeleton elements
    expect(screen.getByTestId('content-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('tags-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('quick-key-skeleton')).toBeInTheDocument();
    
    // Check actions skeleton elements
    expect(screen.getByTestId('actions-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('stats-skeleton')).toBeInTheDocument();
  });

  it('should have correct CSS structure', () => {
    render(<PromptCardSkeleton />);
    
    const container = screen.getByTestId('prompt-card-skeleton');
    expect(container).toHaveClass('bg-white', 'rounded-lg', 'shadow-sm', 'border');
  });

  it('should render with custom className', () => {
    render(<PromptCardSkeleton className="custom-class" />);
    
    const container = screen.getByTestId('prompt-card-skeleton');
    expect(container).toHaveClass('custom-class');
  });

  it('should have proper spacing and layout', () => {
    render(<PromptCardSkeleton />);
    
    // Check header has proper padding
    const header = screen.getByTestId('header-skeleton');
    expect(header).toHaveClass('p-3', 'sm:p-4');
    
    // Check content has proper padding
    const content = screen.getByTestId('content-skeleton-section');
    expect(content).toHaveClass('p-3', 'sm:p-4');
    
    // Check actions has proper styling
    const actions = screen.getByTestId('actions-skeleton-section');
    expect(actions).toHaveClass('px-3', 'py-2', 'sm:px-4', 'sm:py-3');
  });
});