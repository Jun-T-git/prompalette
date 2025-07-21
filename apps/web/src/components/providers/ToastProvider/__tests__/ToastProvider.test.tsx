import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../ToastProvider';

// Test component to access toast context
const TestComponent = () => {
  const { showToast, hideToast } = useToast();

  return (
    <div>
      <button onClick={() => showToast('success', 'Success message')}>
        Show Success
      </button>
      <button onClick={() => showToast('error', 'Error message')}>
        Show Error
      </button>
      <button onClick={() => showToast('warning', 'Warning message')}>
        Show Warning
      </button>
      <button onClick={() => showToast('info', 'Info message')}>
        Show Info
      </button>
      <button onClick={() => showToast('success', 'Action message', { 
        action: { label: 'Undo', onClick: () => {} } 
      })}>
        Show With Action
      </button>
      <button onClick={() => hideToast()}>
        Hide Toast
      </button>
    </div>
  );
};

describe('ToastProvider', () => {
  it('should show success toast when showToast is called', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const showButton = screen.getByText('Show Success');
    
    await act(async () => {
      showButton.click();
    });

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();
  });

  it('should show error toast when showToast is called', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const showButton = screen.getByText('Show Error');
    
    await act(async () => {
      showButton.click();
    });

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
  });

  it('should show warning toast when showToast is called', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const showButton = screen.getByText('Show Warning');
    
    await act(async () => {
      showButton.click();
    });

    expect(screen.getByText('Warning message')).toBeInTheDocument();
    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
  });

  it('should show info toast when showToast is called', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const showButton = screen.getByText('Show Info');
    
    await act(async () => {
      showButton.click();
    });

    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
  });

  it('should show toast with action', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const showButton = screen.getByText('Show With Action');
    
    await act(async () => {
      showButton.click();
    });

    expect(screen.getByText('Action message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
  });

  it('should hide toast when hideToast is called', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Show toast first
    const showButton = screen.getByText('Show Success');
    await act(async () => {
      showButton.click();
    });

    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Hide toast
    const hideButton = screen.getByText('Hide Toast');
    await act(async () => {
      hideButton.click();
    });

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('should hide toast when close button is clicked', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Show toast first
    const showButton = screen.getByText('Show Success');
    await act(async () => {
      showButton.click();
    });

    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Click close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    await act(async () => {
      closeButton.click();
    });

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('should replace existing toast when new toast is shown', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    // Show first toast
    const showSuccessButton = screen.getByText('Show Success');
    await act(async () => {
      showSuccessButton.click();
    });

    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Show second toast
    const showErrorButton = screen.getByText('Show Error');
    await act(async () => {
      showErrorButton.click();
    });

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should throw error when useToast is used outside provider', () => {
    const ConsoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');

    ConsoleErrorSpy.mockRestore();
  });

  it('should auto hide toast after default duration', async () => {
    vi.useFakeTimers();
    
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const showButton = screen.getByText('Show Success');
    await act(async () => {
      showButton.click();
    });

    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Fast forward time by 5 seconds (default duration)
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    
    vi.useRealTimers();
  });
});