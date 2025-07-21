import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/__tests__/test-utils';
import { PromptCard } from '../PromptCard';
import type { Prompt } from '@/lib/services/prompt-service';
import type { User } from 'next-auth';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

const mockUser: User = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
};

const mockPrompt: Prompt = {
  id: 'test-prompt-id',
  slug: 'hello-world',
  title: 'Hello World',
  content: 'This is a test prompt content that should be displayed in the card',
  tags: ['test', 'example'],
  quick_access_key: 'hello',
  is_public: true,
  user_id: 'test-user-id',
  user: {
    username: 'testuser',
    name: 'Test User',
    avatar_url: null,
  },
  view_count: 0,
  copy_count: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('PromptCard', () => {
  it('should render prompt information correctly', () => {
    render(
      <PromptCard 
        prompt={mockPrompt} 
        currentUser={mockUser}
        showAuthor={true}
      />
    );

    // Check title
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    
    // Check content preview
    expect(screen.getByText(/This is a test prompt content/)).toBeInTheDocument();
    
    // Check tags
    expect(screen.getByText('#test')).toBeInTheDocument();
    expect(screen.getByText('#example')).toBeInTheDocument();
    
    // Check quick access key
    expect(screen.getByText('/hello')).toBeInTheDocument();
    
    // Check visibility indicator
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('should generate correct URL links', () => {
    render(
      <PromptCard 
        prompt={mockPrompt} 
        currentUser={mockUser}
        showAuthor={true}
      />
    );

    // Check prompt detail link
    const promptLink = screen.getByRole('link', { name: mockPrompt.title });
    expect(promptLink).toHaveAttribute('href', '/testuser/prompts/hello-world');
    
    // Check author link
    const authorLink = screen.getByRole('link', { name: 'by @testuser' });
    expect(authorLink).toHaveAttribute('href', '/testuser/profile');
  });

  it('should show edit button for prompt owner', () => {
    render(
      <PromptCard 
        prompt={mockPrompt} 
        currentUser={mockUser}
        showAuthor={true}
      />
    );

    const editLink = screen.getByRole('link', { name: 'Edit' });
    expect(editLink).toBeInTheDocument();
    expect(editLink).toHaveAttribute('href', '/testuser/prompts/hello-world/edit');
  });

  it('should hide edit button for non-owners', () => {
    const otherUser: User = {
      id: 'other-user-id',
      name: 'Other User',
      email: 'other@example.com',
    };

    render(
      <PromptCard 
        prompt={mockPrompt} 
        currentUser={otherUser}
        showAuthor={true}
      />
    );

    expect(screen.queryByRole('link', { name: 'Edit' })).not.toBeInTheDocument();
  });

  it('should hide author when showAuthor is false', () => {
    render(
      <PromptCard 
        prompt={mockPrompt} 
        currentUser={mockUser}
        showAuthor={false}
      />
    );

    expect(screen.queryByText('by @testuser')).not.toBeInTheDocument();
  });

  it('should handle copy to clipboard', async () => {
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText');
    
    render(
      <PromptCard 
        prompt={mockPrompt} 
        currentUser={mockUser}
        showAuthor={true}
      />
    );

    const copyButton = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(copyButton);

    expect(writeTextSpy).toHaveBeenCalledWith(mockPrompt.content);
  });

  it('should show private indicator for private prompts', () => {
    const privatePrompt = {
      ...mockPrompt,
      is_public: false,
    };

    render(
      <PromptCard 
        prompt={privatePrompt} 
        currentUser={mockUser}
        showAuthor={true}
      />
    );

    expect(screen.getByText('Private')).toBeInTheDocument();
    expect(screen.queryByText('Public')).not.toBeInTheDocument();
  });

  it('should limit tags display to 3', () => {
    const promptWithManyTags = {
      ...mockPrompt,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };

    render(
      <PromptCard 
        prompt={promptWithManyTags} 
        currentUser={mockUser}
        showAuthor={true}
      />
    );

    expect(screen.getByText('#tag1')).toBeInTheDocument();
    expect(screen.getByText('#tag2')).toBeInTheDocument();
    expect(screen.getByText('#tag3')).toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
    expect(screen.queryByText('#tag4')).not.toBeInTheDocument();
  });

  it('should handle missing user information gracefully', () => {
    const promptWithoutUser = {
      ...mockPrompt,
      user: null as any,
    };

    render(
      <PromptCard 
        prompt={promptWithoutUser} 
        currentUser={mockUser}
        showAuthor={true}
      />
    );

    // Should still render the card without crashing
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('by @unknown')).toBeInTheDocument();
  });

  it('should truncate long content', () => {
    const promptWithLongContent = {
      ...mockPrompt,
      content: 'A'.repeat(300), // Long content
    };

    render(
      <PromptCard 
        prompt={promptWithLongContent} 
        currentUser={mockUser}
        showAuthor={true}
      />
    );

    const contentElement = screen.getByText(/A{200}\.\.\.$/);
    expect(contentElement).toBeInTheDocument();
  });

  it('should display character count', () => {
    render(
      <PromptCard 
        prompt={mockPrompt} 
        currentUser={mockUser}
        showAuthor={true}
      />
    );

    expect(screen.getByText(`${mockPrompt.content.length} characters`)).toBeInTheDocument();
  });

  it('should display view count with eye icon', () => {
    const promptWithViews = {
      ...mockPrompt,
      view_count: 42,
    };

    render(
      <PromptCard 
        prompt={promptWithViews} 
        currentUser={mockUser}
        showAuthor={true}
      />
    );

    expect(screen.getByText('42')).toBeInTheDocument();
    
    // Check if eye icon is present (we'll use data-testid for this)
    const eyeIcon = screen.getByTestId('eye-icon');
    expect(eyeIcon).toBeInTheDocument();
    expect(eyeIcon).toHaveClass('w-3', 'h-3');
  });

  it('should display copy count with copy icon', () => {
    const promptWithCopies = {
      ...mockPrompt,
      copy_count: 15,
    };

    render(
      <PromptCard 
        prompt={promptWithCopies} 
        currentUser={mockUser}
        showAuthor={true}
      />
    );

    expect(screen.getByText('15')).toBeInTheDocument();
    
    // Check if copy icon is present (we'll use data-testid for this)
    const copyIcon = screen.getByTestId('copy-count-icon');
    expect(copyIcon).toBeInTheDocument();
    expect(copyIcon).toHaveClass('w-3', 'h-3');
  });

  it('should display stats section with proper styling', () => {
    const promptWithStats = {
      ...mockPrompt,
      view_count: 100,
      copy_count: 25,
    };

    render(
      <PromptCard 
        prompt={promptWithStats} 
        currentUser={mockUser}
        showAuthor={true}
      />
    );

    // Check if stats section exists with proper classes
    const statsSection = screen.getByTestId('stats-section');
    expect(statsSection).toBeInTheDocument();
    expect(statsSection).toHaveClass('text-neutral-400');
    
    // Check if view count text has proper styling
    const viewCountText = screen.getByTestId('view-count-text');
    expect(viewCountText).toBeInTheDocument();
    expect(viewCountText).toHaveClass('text-xs');
    
    // Check if copy count text has proper styling  
    const copyCountText = screen.getByTestId('copy-count-text');
    expect(copyCountText).toBeInTheDocument();
    expect(copyCountText).toHaveClass('text-xs');
  });

  it('should handle zero view and copy counts', () => {
    render(
      <PromptCard 
        prompt={mockPrompt} 
        currentUser={mockUser}
        showAuthor={true}
      />
    );

    // Both view_count and copy_count are 0 in mockPrompt
    expect(screen.getByTestId('view-count-text')).toHaveTextContent('0');
    expect(screen.getByTestId('copy-count-text')).toHaveTextContent('0');
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    expect(screen.getByTestId('copy-count-icon')).toBeInTheDocument();
  });

  it('should handle large view and copy counts', () => {
    const promptWithLargeCounts = {
      ...mockPrompt,
      view_count: 9999,
      copy_count: 1234,
    };

    render(
      <PromptCard 
        prompt={promptWithLargeCounts} 
        currentUser={mockUser}
        showAuthor={true}
      />
    );

    expect(screen.getByText('9999')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('should have responsive design classes', () => {
    render(
      <PromptCard 
        prompt={mockPrompt} 
        currentUser={mockUser}
        showAuthor={true}
      />
    );

    // Check responsive header layout
    const headerSection = screen.getByTestId('prompt-header');
    expect(headerSection).toHaveClass('flex', 'items-start', 'justify-between');
    
    // Check responsive actions layout
    const actionsSection = screen.getByTestId('prompt-actions');
    expect(actionsSection).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'items-center', 'justify-between');
    
    // Check responsive stats layout
    const statsSection = screen.getByTestId('stats-section');
    expect(statsSection).toHaveClass('flex', 'items-center', 'space-x-2', 'sm:space-x-3');
  });

  it('should have responsive button layouts', () => {
    render(
      <PromptCard 
        prompt={mockPrompt} 
        currentUser={mockUser}
        showAuthor={true}
      />
    );

    // Check responsive action buttons
    const actionButtons = screen.getByTestId('action-buttons');
    expect(actionButtons).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'items-center', 'space-y-2', 'sm:space-y-0', 'sm:space-x-3');
  });
});