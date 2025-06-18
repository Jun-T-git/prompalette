/**
 * @vitest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { Toast, ToastProvider, useToast } from './Toast'

// テスト用コンポーネント
function TestComponent() {
  const { showToast } = useToast()
  
  return (
    <div>
      <button onClick={() => showToast('成功メッセージ', 'success', { autoClose: false })}>
        Success Toast
      </button>
      <button onClick={() => showToast('エラーメッセージ', 'error', { autoClose: false })}>
        Error Toast
      </button>
      <button onClick={() => showToast('情報メッセージ', 'info', { autoClose: false })}>
        Info Toast
      </button>
    </div>
  )
}

describe('Toast Component', () => {
  beforeEach(() => {
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should render toast with success variant', () => {
    render(
      <ToastProvider>
        <Toast
          message="成功メッセージ"
          variant="success"
          isVisible={true}
          onClose={() => {}}
        />
      </ToastProvider>
    )

    expect(screen.getByText('成功メッセージ')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50')
  })

  it('should render toast with error variant', () => {
    render(
      <ToastProvider>
        <Toast
          message="エラーメッセージ"
          variant="error"
          isVisible={true}
          onClose={() => {}}
        />
      </ToastProvider>
    )

    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50')
  })

  it('should render toast with info variant', () => {
    render(
      <ToastProvider>
        <Toast
          message="情報メッセージ"
          variant="info"
          isVisible={true}
          onClose={() => {}}
        />
      </ToastProvider>
    )

    expect(screen.getByText('情報メッセージ')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50')
  })

  it('should not render when isVisible is false', () => {
    render(
      <ToastProvider>
        <Toast
          message="見えないメッセージ"
          variant="info"
          isVisible={false}
          onClose={() => {}}
        />
      </ToastProvider>
    )

    expect(screen.queryByText('見えないメッセージ')).not.toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn()
    
    render(
      <ToastProvider>
        <Toast
          message="テストメッセージ"
          variant="info"
          isVisible={true}
          onClose={onClose}
        />
      </ToastProvider>
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    closeButton.click()

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('should auto close after timeout', async () => {
    const onClose = vi.fn()
    
    render(
      <ToastProvider>
        <Toast
          message="自動閉じるメッセージ"
          variant="success"
          isVisible={true}
          onClose={onClose}
          autoClose={true}
          duration={1000}
        />
      </ToastProvider>
    )

    // 1秒後に自動で閉じる
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(onClose).toHaveBeenCalledOnce()
  })
})

describe('useToast Hook', () => {
  beforeEach(() => {
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('should show success toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const successButton = screen.getByText('Success Toast')
    
    await act(async () => {
      successButton.click()
    })

    expect(screen.getByText('成功メッセージ')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50')
  })

  it('should show error toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const errorButton = screen.getByText('Error Toast')
    
    await act(async () => {
      errorButton.click()
    })

    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50')
  })

  it('should show info toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    const infoButton = screen.getByText('Info Toast')
    
    await act(async () => {
      infoButton.click()
    })

    expect(screen.getByText('情報メッセージ')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50')
  })

  it('should auto close toast after default duration', () => {
    function AutoCloseTestComponent() {
      const { showToast } = useToast()
      
      return (
        <div>
          <button onClick={() => showToast('成功メッセージ', 'success', { autoClose: true, duration: 3000 })}>
            Success Toast
          </button>
        </div>
      )
    }

    render(
      <ToastProvider>
        <AutoCloseTestComponent />
      </ToastProvider>
    )

    const successButton = screen.getByText('Success Toast')
    
    act(() => {
      successButton.click()
    })

    expect(screen.getByText('成功メッセージ')).toBeInTheDocument()

    // デフォルトの3秒後に自動で閉じる
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(screen.queryByText('成功メッセージ')).not.toBeInTheDocument()
  })
})