import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from './page';

describe('HomePage', () => {
  it('should render the main heading', () => {
    render(<HomePage />);
    
    const heading = screen.getByRole('heading', { name: 'PromPalette', level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should render the tagline', () => {
    render(<HomePage />);
    
    const tagline = screen.getByText('Your AI Prompts, Beautifully Organized');
    expect(tagline).toBeInTheDocument();
  });

  it('should render the CTA buttons', () => {
    render(<HomePage />);
    
    const getStartedButton = screen.getByRole('button', { name: 'Get Started' });
    const learnMoreButton = screen.getByRole('button', { name: 'Learn More' });
    
    expect(getStartedButton).toBeInTheDocument();
    expect(learnMoreButton).toBeInTheDocument();
  });

  it('should render all feature cards', () => {
    render(<HomePage />);
    
    expect(screen.getByText('🚀 Instant Access')).toBeInTheDocument();
    expect(screen.getByText('🔌 Cross-Platform')).toBeInTheDocument();
    expect(screen.getByText('💾 Local-First')).toBeInTheDocument();
  });
});