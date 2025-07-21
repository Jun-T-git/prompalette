import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SessionProvider } from 'next-auth/react';
import { GuestLayout } from '@/components/GuestLayout';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
}));

describe('GuestLayout', () => {
  it('should render guest header and children', () => {
    render(
      <SessionProvider session={null}>
        <GuestLayout>
          <div>Test Content</div>
        </GuestLayout>
      </SessionProvider>
    );

    expect(screen.getAllByText('PromPalette').length).toBeGreaterThan(0);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render guest footer', () => {
    render(
      <SessionProvider session={null}>
        <GuestLayout>
          <div>Test Content</div>
        </GuestLayout>
      </SessionProvider>
    );

    expect(screen.getByText('© 2024 PromPalette. All rights reserved.')).toBeInTheDocument();
  });

  it('should display guest-specific information', () => {
    render(
      <SessionProvider session={null}>
        <GuestLayout>
          <div>Test Content</div>
        </GuestLayout>
      </SessionProvider>
    );

    expect(screen.getAllByText('プロンプト管理・共有プラットフォーム').length).toBeGreaterThan(0);
    expect(screen.getAllByText('無料で始める').length).toBeGreaterThan(0);
  });

  it('should have proper layout structure', () => {
    render(
      <SessionProvider session={null}>
        <GuestLayout>
          <div>Test Content</div>
        </GuestLayout>
      </SessionProvider>
    );

    // Check main layout structure
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    
    // Check header
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    
    // Check footer
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('should be responsive', () => {
    render(
      <SessionProvider session={null}>
        <GuestLayout>
          <div>Test Content</div>
        </GuestLayout>
      </SessionProvider>
    );

    // Check that layout has responsive classes
    const main = screen.getByRole('main');
    expect(main).toHaveClass('flex-1');
  });
});