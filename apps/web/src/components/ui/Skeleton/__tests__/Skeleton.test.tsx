import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('should render with default props', () => {
    render(<Skeleton data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse', 'bg-gray-200', 'rounded-md');
  });

  it('should render with custom className', () => {
    render(<Skeleton className="custom-class" data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should render with custom width and height', () => {
    render(<Skeleton className="w-full h-4" data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('w-full', 'h-4');
  });

  it('should render circular skeleton', () => {
    render(<Skeleton className="rounded-full w-10 h-10" data-testid="skeleton" />);
    
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('rounded-full', 'w-10', 'h-10');
  });
});