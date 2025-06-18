import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import type { Prompt } from '../../types';

import { AppContentArea } from './AppContentArea';

// Mock dependencies
vi.mock('../../stores', () => ({
  useFavoritesStore: () => ({
    pinnedPrompts: [],
    unpinPrompt: vi.fn(),
    swapOrReplacePinnedPrompt: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock('../common', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
  ConfirmModal: ({ isOpen, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <button onClick={onConfirm} data-testid="confirm-button">
          確認
        </button>
        <button onClick={onCancel} data-testid="cancel-button">
          キャンセル
        </button>
      </div>
    ) : null,
  PaletteDropdown: ({ trigger }: any) => trigger,
}));

vi.mock('../prompt', () => ({
  PromptForm: ({ onSubmit, onCancel }: any) => (
    <div data-testid="prompt-form">
      <button onClick={() => onSubmit({ title: 'Test', content: 'Test content' })}>Submit</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('AppContentArea - Tag Click & Quick Access Key', () => {
  const mockPrompt: Prompt = {
    id: '1',
    title: 'Test Prompt',
    content: 'Test content',
    tags: ['react', 'typescript', 'frontend'],
    quickAccessKey: 'test',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  };

  const defaultProps = {
    selectedPrompt: mockPrompt,
    showCreateForm: false,
    showEditForm: false,
    isLoading: false,
    error: null,
    onCreatePrompt: vi.fn(),
    onUpdatePrompt: vi.fn(),
    onCopyPrompt: vi.fn(),
    onEditPrompt: vi.fn(),
    onDeletePrompt: vi.fn(),
    onShowCreateForm: vi.fn(),
    onCancelCreateForm: vi.fn(),
    onCancelEditForm: vi.fn(),
  };

  it('プロンプトにタグが表示される', () => {
    render(<AppContentArea {...defaultProps} />);

    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('#typescript')).toBeInTheDocument();
    expect(screen.getByText('#frontend')).toBeInTheDocument();
  });

  it('タグをクリックするとonTagClickが呼び出される', () => {
    const mockOnTagClick = vi.fn();
    render(<AppContentArea {...defaultProps} onTagClick={mockOnTagClick} />);

    const reactTag = screen.getByText('#react');
    fireEvent.click(reactTag);

    expect(mockOnTagClick).toHaveBeenCalledWith('react');
  });

  it('複数のタグをクリックできる', () => {
    const mockOnTagClick = vi.fn();
    render(<AppContentArea {...defaultProps} onTagClick={mockOnTagClick} />);

    const reactTag = screen.getByText('#react');
    const typescriptTag = screen.getByText('#typescript');

    fireEvent.click(reactTag);
    fireEvent.click(typescriptTag);

    expect(mockOnTagClick).toHaveBeenCalledTimes(2);
    expect(mockOnTagClick).toHaveBeenNthCalledWith(1, 'react');
    expect(mockOnTagClick).toHaveBeenNthCalledWith(2, 'typescript');
  });

  it('タグにホバー効果が適用される', () => {
    render(<AppContentArea {...defaultProps} />);

    const reactTag = screen.getByText('#react');
    expect(reactTag).toHaveClass('hover:bg-gray-200');
    expect(reactTag).toHaveClass('cursor-pointer');
  });

  it('タグにツールチップが表示される', () => {
    render(<AppContentArea {...defaultProps} />);

    const reactTag = screen.getByText('#react');
    expect(reactTag).toHaveAttribute('title', '"#react" で検索');
  });

  it('onTagClickが未定義でもエラーにならない', () => {
    render(<AppContentArea {...defaultProps} onTagClick={undefined} />);

    const reactTag = screen.getByText('#react');
    expect(() => fireEvent.click(reactTag)).not.toThrow();
  });

  it('タグがない場合はタグ領域が表示されない', () => {
    const promptWithoutTags = { ...mockPrompt, tags: [] };
    render(<AppContentArea {...defaultProps} selectedPrompt={promptWithoutTags} />);

    expect(screen.queryByText('react')).not.toBeInTheDocument();
  });

  it('tagsがundefinedの場合はタグ領域が表示されない', () => {
    const promptWithoutTags = { ...mockPrompt, tags: undefined };
    render(<AppContentArea {...defaultProps} selectedPrompt={promptWithoutTags} />);

    expect(screen.queryByText('react')).not.toBeInTheDocument();
  });

  it('selectedPromptがnullの場合は何も表示されない', () => {
    render(<AppContentArea {...defaultProps} selectedPrompt={null} />);

    expect(screen.queryByText('react')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Prompt')).not.toBeInTheDocument();
  });

  // クイックアクセスキーのテスト
  it('クイックアクセスキーが表示される', () => {
    render(<AppContentArea {...defaultProps} />);

    expect(screen.getByText('/test')).toBeInTheDocument();
  });

  it('クイックアクセスキーをクリックするとonQuickAccessKeyClickが呼び出される', () => {
    const mockOnQuickAccessKeyClick = vi.fn();
    render(<AppContentArea {...defaultProps} onQuickAccessKeyClick={mockOnQuickAccessKeyClick} />);

    const quickAccessKey = screen.getByText('/test');
    fireEvent.click(quickAccessKey);

    expect(mockOnQuickAccessKeyClick).toHaveBeenCalledWith('test');
  });

  it('クイックアクセスキーにホバー効果が適用される', () => {
    render(<AppContentArea {...defaultProps} />);

    const quickAccessKey = screen.getByText('/test');
    expect(quickAccessKey).toHaveClass('hover:bg-blue-100');
    expect(quickAccessKey).toHaveClass('cursor-pointer');
  });

  it('クイックアクセスキーにツールチップが表示される', () => {
    render(<AppContentArea {...defaultProps} />);

    const quickAccessKey = screen.getByText('/test');
    expect(quickAccessKey).toHaveAttribute('title', '"/test" で検索');
  });

  it('クイックアクセスキーがない場合は表示されない', () => {
    const promptWithoutQuickAccess = { ...mockPrompt, quickAccessKey: undefined };
    render(<AppContentArea {...defaultProps} selectedPrompt={promptWithoutQuickAccess} />);

    expect(screen.queryByText('/test')).not.toBeInTheDocument();
  });

  it('onQuickAccessKeyClickが未定義でもエラーにならない', () => {
    render(<AppContentArea {...defaultProps} onQuickAccessKeyClick={undefined} />);

    const quickAccessKey = screen.getByText('/test');
    expect(() => fireEvent.click(quickAccessKey)).not.toThrow();
  });

  it('クイックアクセスキーとタグが両方表示される', () => {
    render(<AppContentArea {...defaultProps} />);

    expect(screen.getByText('/test')).toBeInTheDocument();
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('#typescript')).toBeInTheDocument();
  });
});
