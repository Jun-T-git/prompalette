import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CopyButton } from '../CopyButton';

// Mock toast provider
const mockShowToast = vi.fn();
vi.mock('../providers/ToastProvider', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('CopyButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render copy button with text', () => {
    render(<CopyButton text="Test content" />);
    
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    render(<CopyButton text="Test content" className="custom-class" />);
    
    const button = screen.getByRole('button', { name: 'Copy' });
    expect(button).toHaveClass('custom-class');
  });

  it('should copy text to clipboard when clicked', async () => {
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    
    render(<CopyButton text="Test content" />);
    
    const button = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith('Test content');
    });
  });

  it('should show success toast when copy succeeds', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    
    render(<CopyButton text="Test content" />);
    
    const button = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('success', 'Copied to clipboard');
    });
  });

  it('should show error toast when copy fails', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Copy failed'));
    
    render(<CopyButton text="Test content" />);
    
    const button = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('error', 'Failed to copy to clipboard');
    });
  });

  it('should show loading state during copy operation', async () => {
    let resolvePromise: (value: void) => void;
    const copyPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    
    vi.spyOn(navigator.clipboard, 'writeText').mockReturnValue(copyPromise);
    
    render(<CopyButton text="Test content" />);
    
    const button = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(button);
    
    // Should show loading state
    await waitFor(() => {
      expect(screen.getByTestId('copy-loading')).toBeInTheDocument();
    });
    
    // Should be disabled during loading
    expect(button).toBeDisabled();
    
    // Resolve the promise
    resolvePromise!();
    
    await waitFor(() => {
      expect(screen.queryByTestId('copy-loading')).not.toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  it('should handle copy operation with prompt tracking', async () => {
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    
    render(<CopyButton text="Test content" promptId="test-prompt-id" />);
    
    const button = screen.getByRole('button', { name: 'Copy' });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith('Test content');
    });
    
    // Should show success toast
    expect(mockShowToast).toHaveBeenCalledWith('success', 'Copied to clipboard');
  });

  it('should be accessible', () => {
    render(<CopyButton text="Test content" />);
    
    const button = screen.getByRole('button', { name: 'Copy' });
    expect(button).toHaveAttribute('type', 'button');
    
    const icon = screen.getByTestId('copy-icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});