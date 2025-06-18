import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { useFavoritesStore } from '../../stores/favorites';
import type { PinnedPrompt, Prompt } from '../../types';
import { useToast } from '../common/Toast';

import { PromptCard } from './PromptCard';

// Mock dependencies
vi.mock('../../stores/favorites');
vi.mock('../common/Toast');

const mockUseFavoritesStore = useFavoritesStore as any;
const mockUseToast = useToast as any;

describe('PromptCard', () => {
  const mockPrompt: Prompt = {
    id: '1',
    title: 'Test Prompt',
    content: 'Test content',
    tags: ['test', 'example'],
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const mockPinnedPrompt: PinnedPrompt = {
    ...mockPrompt,
    position: 1,
    pinned_at: '2023-01-01T00:00:00Z',
  };

  const mockPinPrompt = vi.fn();
  const mockUnpinPrompt = vi.fn();
  const mockShowToast = vi.fn();

  const defaultStoreState = {
    pinnedPrompts: Array(10).fill(null),
    pinPrompt: mockPinPrompt,
    unpinPrompt: mockUnpinPrompt,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseFavoritesStore.mockReturnValue(defaultStoreState as any);
    mockUseToast.mockReturnValue({
      showToast: mockShowToast,
      hideToast: vi.fn(),
      toasts: [],
    });
  });

  it('renders prompt card with basic information', () => {
    render(<PromptCard prompt={mockPrompt} />);

    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
  });

  it('shows selected state when isSelected is true', () => {
    render(<PromptCard prompt={mockPrompt} isSelected={true} />);

    const cardContainer = screen.getByText('Test Prompt').closest('.border');
    expect(cardContainer).toHaveClass('border-blue-500', 'bg-blue-50', 'ring-2', 'ring-blue-200');
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(<PromptCard prompt={mockPrompt} onClick={onClick} />);

    fireEvent.click(screen.getByText('Test Prompt'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders copy button when onCopy is provided', () => {
    const onCopy = vi.fn();
    render(<PromptCard prompt={mockPrompt} onCopy={onCopy} />);

    const copyButton = screen.getByTitle('コピー');
    expect(copyButton).toBeInTheDocument();

    fireEvent.click(copyButton);
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it('shows pin status badge for pinned prompts', () => {
    const pinnedPrompts = Array(10).fill(null);
    pinnedPrompts[0] = mockPinnedPrompt;

    mockUseFavoritesStore.mockReturnValue({
      ...defaultStoreState,
      pinnedPrompts,
    } as any);

    render(<PromptCard prompt={mockPrompt} />);

    const badge = screen.getByTitle('ピン留め位置 1');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle('background-color: #ef4444'); // First position uses red color
  });

});
