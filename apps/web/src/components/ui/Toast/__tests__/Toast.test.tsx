import { render, screen, act } from '@testing-library/react';
import { Toast } from '../Toast';

describe('Toast', () => {
  it('should render success toast with message', () => {
    render(
      <Toast 
        type="success" 
        message="Operation completed successfully" 
        visible={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50');
  });

  it('should render error toast with message', () => {
    render(
      <Toast 
        type="error" 
        message="An error occurred" 
        visible={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50');
  });

  it('should render warning toast with message', () => {
    render(
      <Toast 
        type="warning" 
        message="This is a warning" 
        visible={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('This is a warning')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50');
  });

  it('should render info toast with message', () => {
    render(
      <Toast 
        type="info" 
        message="Information message" 
        visible={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText('Information message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50');
  });

  it('should not render when visible is false', () => {
    render(
      <Toast 
        type="success" 
        message="Hidden message" 
        visible={false}
        onClose={() => {}}
      />
    );

    expect(screen.queryByText('Hidden message')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const mockOnClose = vi.fn();
    
    render(
      <Toast 
        type="success" 
        message="Test message" 
        visible={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await act(async () => {
      closeButton.click();
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should auto close after specified duration', async () => {
    const mockOnClose = vi.fn();
    
    render(
      <Toast 
        type="success" 
        message="Auto close message" 
        visible={true}
        onClose={mockOnClose}
        autoClose={true}
        duration={1000}
      />
    );

    // Wait for auto close
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not auto close when autoClose is false', async () => {
    const mockOnClose = vi.fn();
    
    render(
      <Toast 
        type="success" 
        message="Manual close message" 
        visible={true}
        onClose={mockOnClose}
        autoClose={false}
        duration={1000}
      />
    );

    // Wait past duration
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1100));
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should show appropriate icon for each type', () => {
    const { rerender } = render(
      <Toast 
        type="success" 
        message="Success" 
        visible={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByTestId('success-icon')).toBeInTheDocument();

    rerender(
      <Toast 
        type="error" 
        message="Error" 
        visible={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByTestId('error-icon')).toBeInTheDocument();

    rerender(
      <Toast 
        type="warning" 
        message="Warning" 
        visible={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();

    rerender(
      <Toast 
        type="info" 
        message="Info" 
        visible={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
  });

  it('should handle long messages without breaking layout', () => {
    const longMessage = 'This is a very long message that should wrap properly and not break the toast layout when displayed to the user in the notification system';
    
    render(
      <Toast 
        type="info" 
        message={longMessage} 
        visible={true}
        onClose={() => {}}
      />
    );

    expect(screen.getByText(longMessage)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('max-w-md');
  });

  it('should support custom actions', () => {
    const mockAction = vi.fn();
    
    render(
      <Toast 
        type="info" 
        message="Message with action" 
        visible={true}
        onClose={() => {}}
        action={{
          label: 'Undo',
          onClick: mockAction
        }}
      />
    );

    const actionButton = screen.getByRole('button', { name: 'Undo' });
    expect(actionButton).toBeInTheDocument();
    
    act(() => {
      actionButton.click();
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
  });
});