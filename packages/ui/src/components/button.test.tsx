import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';

import { Button } from './button';

describe('Button', () => {
  it('should render button with text', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
  });
  
  it('should apply variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    
    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button.className).toContain('bg-destructive');
  });
  
  it('should apply size classes', () => {
    render(<Button size="sm">Small</Button>);
    
    const button = screen.getByRole('button', { name: 'Small' });
    expect(button.className).toContain('h-9');
  });
  
  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
  });
});