import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserProfile } from '../UserProfile';
import type { Prompt } from '@/lib/services/prompt-service';
import type { User } from 'next-auth';

// Mock PromptCard component
vi.mock('../PromptCard', () => ({
  PromptCard: ({ prompt }: { prompt: Prompt }) => (
    <div data-testid={`prompt-card-${prompt.id}`}>
      <h3>{prompt.title}</h3>
      <span>{prompt.is_public ? 'Public' : 'Private'}</span>
    </div>
  ),
}));

const mockUser = {
  username: 'testuser',
  name: 'Test User',
  avatar_url: null,
};

const mockCurrentUser: User = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
};

const mockPrompts: Prompt[] = [
  {
    id: 'prompt-1',
    slug: 'public-prompt',
    title: 'Public Prompt',
    content: 'Content 1',
    tags: ['productivity', 'coding'],
    quick_access_key: null,
    is_public: true,
    user_id: 'test-user-id',
    user: mockUser,
    view_count: 150,
    copy_count: 25,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prompt-2',
    slug: 'private-prompt',
    title: 'Private Prompt',
    content: 'Content 2',
    tags: ['writing', 'productivity'],
    quick_access_key: null,
    is_public: false,
    user_id: 'test-user-id',
    user: mockUser,
    view_count: 80,
    copy_count: 10,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('UserProfile', () => {
  it('should render user information correctly', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={mockPrompts}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    // Check user name and username
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('should display correct prompt counts', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={mockPrompts}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    // Check public prompts count (split across elements)
    expect(screen.getAllByText('1')).toHaveLength(2); // 1 in stats, 1 in tabs
    expect(screen.getByText('public prompts')).toBeInTheDocument();
    
    // Check private prompts count (shown for own profile)
    expect(screen.getByText('private prompts')).toBeInTheDocument();
  });

  it('should hide private prompts count for other users', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={[mockPrompts[0]]} // Only public prompt
        isOwnProfile={false}
        currentUser={mockCurrentUser}
      />
    );

    // Should show public count
    expect(screen.getByText('public prompts')).toBeInTheDocument();
    
    // Should not show private count
    expect(screen.queryByText(/private prompts/)).not.toBeInTheDocument();
  });

  it('should show Edit Profile button for own profile', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={mockPrompts}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.getByRole('button', { name: 'Edit Profile' })).toBeInTheDocument();
  });

  it('should show Follow button for other users', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={mockPrompts}
        isOwnProfile={false}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit Profile' })).not.toBeInTheDocument();
  });

  it('should render prompt cards', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={mockPrompts}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.getByTestId('prompt-card-prompt-1')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-card-prompt-2')).toBeInTheDocument();
  });

  it('should display tabs correctly', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={mockPrompts}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    // Check tab buttons (split text)
    expect(screen.getByText(/Public Prompts/)).toBeInTheDocument();
    expect(screen.getByText(/Private Prompts/)).toBeInTheDocument();
  });

  it('should show only public tab for other users', () => {
    const publicPrompts = [mockPrompts[0]];
    
    render(
      <UserProfile
        user={mockUser}
        prompts={publicPrompts}
        isOwnProfile={false}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.getByText(/Public Prompts/)).toBeInTheDocument();
    expect(screen.queryByText(/Private Prompts/)).not.toBeInTheDocument();
  });

  it('should show empty state for no prompts', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={[]}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.getByText('No prompts yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first prompt to get started')).toBeInTheDocument();
  });

  it('should show different empty state for other users', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={[]}
        isOwnProfile={false}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.getByText('No public prompts')).toBeInTheDocument();
    expect(screen.getByText('This user hasn\'t shared any prompts yet')).toBeInTheDocument();
  });

  it('should handle user without avatar', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={mockPrompts}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    // Should show initial letter as fallback
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of username
  });

  it('should display user avatar when available', () => {
    const userWithAvatar = {
      ...mockUser,
      avatar_url: 'https://example.com/avatar.jpg',
    };

    render(
      <UserProfile
        user={userWithAvatar}
        prompts={mockPrompts}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    const avatar = screen.getByAltText('testuser\'s avatar');
    expect(avatar).toBeInTheDocument();
    // Next.js Image optimizes src, so just check that it contains the original URL
    expect(avatar.getAttribute('src')).toContain('example.com');
  });

  it('should fall back to username when name is not available', () => {
    const userWithoutName = {
      ...mockUser,
      name: null,
    };

    render(
      <UserProfile
        user={userWithoutName}
        prompts={mockPrompts}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    // Should display username as fallback for name (one occurrence in heading)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('testuser');
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('should display enhanced statistics section', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={mockPrompts}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    // Check enhanced statistics section exists
    expect(screen.getByTestId('user-stats-section')).toBeInTheDocument();
    
    // Check total views (150 + 80 = 230)
    expect(screen.getByTestId('total-views')).toHaveTextContent('230');
    
    // Check total copies (25 + 10 = 35)
    expect(screen.getByTestId('total-copies')).toHaveTextContent('35');
    
    // Check average prompt length
    expect(screen.getByTestId('avg-length')).toBeInTheDocument();
  });

  it('should display most used tags', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={mockPrompts}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    // Check most used tags section
    expect(screen.getByTestId('most-used-tags')).toBeInTheDocument();
    
    // 'productivity' appears in both prompts, so should be most used
    expect(screen.getByText('#productivity')).toBeInTheDocument();
    expect(screen.getByText('#coding')).toBeInTheDocument();
    expect(screen.getByText('#writing')).toBeInTheDocument();
  });

  it('should hide enhanced statistics for other users when appropriate', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={[mockPrompts[0]]} // Only public prompt
        isOwnProfile={false}
        currentUser={mockCurrentUser}
      />
    );

    // Should show public stats
    expect(screen.getByTestId('user-stats-section')).toBeInTheDocument();
    expect(screen.getByTestId('total-views')).toHaveTextContent('150');
    expect(screen.getByTestId('total-copies')).toHaveTextContent('25');
    
    // Should not include private prompt data
    expect(screen.queryByText('230')).not.toBeInTheDocument(); // Total with private
    expect(screen.queryByText('35')).not.toBeInTheDocument(); // Total with private
  });

  it('should handle zero statistics gracefully', () => {
    const promptsWithZeroStats = mockPrompts.map(p => ({
      ...p,
      view_count: 0,
      copy_count: 0,
    }));

    render(
      <UserProfile
        user={mockUser}
        prompts={promptsWithZeroStats}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    expect(screen.getByTestId('total-views')).toHaveTextContent('0');
    expect(screen.getByTestId('total-copies')).toHaveTextContent('0');
  });

  it('should calculate average prompt length correctly', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={mockPrompts}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    const avgLengthElement = screen.getByTestId('avg-length');
    // 'Content 1' (9 chars) + 'Content 2' (9 chars) = 18 chars / 2 prompts = 9 chars average
    expect(avgLengthElement).toHaveTextContent('9');
  });

  it('should have responsive design classes', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={mockPrompts}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    // Check responsive grid classes for statistics
    const statsGrid = screen.getByTestId('stats-grid');
    expect(statsGrid).toHaveClass('grid-cols-2', 'md:grid-cols-4');
    
    // Check responsive grid classes for prompts
    const promptsGrid = screen.getByTestId('prompts-grid');
    expect(promptsGrid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
  });

  it('should have responsive profile header layout', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={mockPrompts}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    // Check responsive avatar sizing
    const avatarContainer = screen.getByTestId('avatar-container');
    expect(avatarContainer).toHaveClass('w-20', 'h-20', 'sm:w-24', 'sm:h-24');
    
    // Check responsive flex direction for profile header
    const profileHeader = screen.getByTestId('profile-header');
    expect(profileHeader).toHaveClass('flex-col', 'sm:flex-row');
  });

  it('should have responsive stats section layout', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={mockPrompts}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    // Check responsive spacing and padding
    const statsSection = screen.getByTestId('user-stats-section');
    expect(statsSection).toHaveClass('mt-4', 'p-4', 'sm:p-6');
    
    // Check responsive tag layout
    const tagsContainer = screen.getByTestId('most-used-tags');
    expect(tagsContainer).toHaveClass('flex-wrap', 'gap-2');
  });

  it('should have responsive tab navigation', () => {
    render(
      <UserProfile
        user={mockUser}
        prompts={mockPrompts}
        isOwnProfile={true}
        currentUser={mockCurrentUser}
      />
    );

    // Check responsive tab navigation
    const tabNav = screen.getByTestId('tab-navigation');
    expect(tabNav).toHaveClass('flex', 'space-x-4', 'sm:space-x-8', 'overflow-x-auto');
  });
});