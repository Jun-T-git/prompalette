import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { HelpModal } from './HelpModal';

describe('HelpModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when isOpen is true', () => {
    render(<HelpModal {...defaultProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('キーボードショートカット')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    render(<HelpModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should display all keyboard shortcuts', () => {
    render(<HelpModal {...defaultProps} />);
    
    // 新規作成ショートカット
    expect(screen.getByText('⌘/Ctrl + N')).toBeInTheDocument();
    expect(screen.getByText('新規プロンプト作成')).toBeInTheDocument();
    
    // ピン留めショートカット
    expect(screen.getByText('⌘/Ctrl + 1-9')).toBeInTheDocument();
    expect(screen.getByText('ピン留めプロンプト選択')).toBeInTheDocument();
    
    // ナビゲーション
    expect(screen.getByText('↑ / ↓')).toBeInTheDocument();
    expect(screen.getByText('プロンプト選択移動')).toBeInTheDocument();
    
    // アクション
    expect(screen.getByText('Enter')).toBeInTheDocument();
    expect(screen.getByText('プロンプトコピー&閉じる')).toBeInTheDocument();
    
    expect(screen.getByText('Esc')).toBeInTheDocument();
    expect(screen.getByText('閉じる/選択解除')).toBeInTheDocument();
    
    // ヘルプ
    expect(screen.getByText('⌘/Ctrl + H')).toBeInTheDocument();
    expect(screen.getByText('このヘルプを表示')).toBeInTheDocument();
  });

  it('should call onClose when footer close button is clicked', async () => {
    const user = userEvent.setup();
    render(<HelpModal {...defaultProps} />);
    
    const footerCloseButton = screen.getByTestId('footer-close-button');
    await user.click(footerCloseButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when header close button is clicked', async () => {
    const user = userEvent.setup();
    render(<HelpModal {...defaultProps} />);
    
    const headerCloseButton = screen.getByTestId('header-close-button');
    await user.click(headerCloseButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<HelpModal {...defaultProps} />);
    
    await user.keyboard('{Escape}');
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    render(<HelpModal {...defaultProps} />);
    
    const backdrop = screen.getByTestId('modal-backdrop');
    await user.click(backdrop);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should focus on modal when opened', () => {
    render(<HelpModal {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveFocus();
  });

  it('should have proper accessibility attributes', () => {
    render(<HelpModal {...defaultProps} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  it('should group shortcuts by category', () => {
    render(<HelpModal {...defaultProps} />);
    
    expect(screen.getByText('プロンプト作成')).toBeInTheDocument();
    expect(screen.getByText('ナビゲーション')).toBeInTheDocument();
    expect(screen.getByText('アクション')).toBeInTheDocument();
    expect(screen.getByText('その他')).toBeInTheDocument();
  });

  it('should handle keyboard navigation within modal', async () => {
    const user = userEvent.setup();
    render(<HelpModal {...defaultProps} />);
    
    const headerCloseButton = screen.getByTestId('header-close-button');
    const footerCloseButton = screen.getByTestId('footer-close-button');
    
    // Tab should focus on the first focusable element (header close button)
    await user.tab();
    expect(headerCloseButton).toHaveFocus();
    
    // Tab again should focus on footer close button
    await user.tab();
    expect(footerCloseButton).toHaveFocus();
    
    // Tab again should cycle back to header close button
    await user.tab();
    expect(headerCloseButton).toHaveFocus();
  });
});