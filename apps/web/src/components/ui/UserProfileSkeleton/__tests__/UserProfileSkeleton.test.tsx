import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserProfileSkeleton } from '../UserProfileSkeleton';

describe('UserProfileSkeleton', () => {
  it('should render all skeleton elements', () => {
    render(<UserProfileSkeleton />);
    
    // Check profile header skeleton elements
    expect(screen.getByTestId('avatar-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('name-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('username-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('basic-stats-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('action-button-skeleton')).toBeInTheDocument();
    
    // Check enhanced stats skeleton elements
    expect(screen.getByTestId('enhanced-stats-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('stats-grid-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('profile-tags-skeleton')).toBeInTheDocument();
    
    // Check tabs skeleton elements
    expect(screen.getByTestId('tabs-skeleton')).toBeInTheDocument();
    
    // Check prompts grid skeleton elements
    expect(screen.getByTestId('prompts-grid-skeleton')).toBeInTheDocument();
  });

  it('should have correct CSS structure', () => {
    render(<UserProfileSkeleton />);
    
    const container = screen.getByTestId('user-profile-skeleton');
    expect(container).toHaveClass('max-w-6xl', 'mx-auto');
  });

  it('should render with custom className', () => {
    render(<UserProfileSkeleton className="custom-class" />);
    
    const container = screen.getByTestId('user-profile-skeleton');
    expect(container).toHaveClass('custom-class');
  });

  it('should have proper responsive layout', () => {
    render(<UserProfileSkeleton />);
    
    // Check responsive profile header
    const profileHeader = screen.getByTestId('profile-header-skeleton');
    expect(profileHeader).toHaveClass('flex', 'flex-col', 'sm:flex-row');
    
    // Check responsive stats grid
    const statsGrid = screen.getByTestId('stats-grid-skeleton');
    expect(statsGrid).toHaveClass('grid', 'grid-cols-2', 'sm:grid-cols-2', 'md:grid-cols-4');
    
    // Check responsive prompts grid
    const promptsGrid = screen.getByTestId('prompts-grid-skeleton');
    expect(promptsGrid).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
  });

  it('should render correct number of prompt card skeletons', () => {
    render(<UserProfileSkeleton />);
    
    // Should render 6 prompt card skeletons by default
    const promptCards = screen.getAllByTestId('prompt-card-skeleton');
    expect(promptCards).toHaveLength(6);
  });

  it('should render with custom prompt count', () => {
    render(<UserProfileSkeleton promptCount={3} />);
    
    const promptCards = screen.getAllByTestId('prompt-card-skeleton');
    expect(promptCards).toHaveLength(3);
  });
});