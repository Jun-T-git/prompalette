import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

import { ConfirmModal } from './ConfirmModal'

describe('ConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('does not render when isOpen is false', () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument()
  })

  it('renders modal content when isOpen is true', () => {
    render(<ConfirmModal {...defaultProps} />)

    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument()
    expect(screen.getByText('確認')).toBeInTheDocument()
    expect(screen.getByText('キャンセル')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const handleConfirm = vi.fn()
    render(<ConfirmModal {...defaultProps} onConfirm={handleConfirm} />)

    fireEvent.click(screen.getByText('確認'))

    expect(handleConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button is clicked', () => {
    const handleCancel = vi.fn()
    render(<ConfirmModal {...defaultProps} onCancel={handleCancel} />)

    fireEvent.click(screen.getByText('キャンセル'))

    expect(handleCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when backdrop is clicked', () => {
    const handleCancel = vi.fn()
    render(<ConfirmModal {...defaultProps} onCancel={handleCancel} />)

    // Click on the backdrop (the overlay div)
    const backdrop = document.querySelector('.bg-black.bg-opacity-50')
    fireEvent.click(backdrop!)

    expect(handleCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when Escape key is pressed', () => {
    const handleCancel = vi.fn()
    render(<ConfirmModal {...defaultProps} onCancel={handleCancel} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(handleCancel).toHaveBeenCalledTimes(1)
  })

  it('renders custom button texts', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        confirmText="Delete"
        cancelText="Keep"
      />
    )

    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Keep')).toBeInTheDocument()
  })

  it('renders danger variant styling', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        confirmVariant="danger"
      />
    )

    const confirmButton = screen.getByText('確認')
    expect(confirmButton).toHaveClass('text-red-600')
  })

  it('renders default variant styling', () => {
    render(<ConfirmModal {...defaultProps} />)

    const confirmButton = screen.getByText('確認')
    expect(confirmButton).toHaveClass('bg-blue-600')
  })

  it('prevents modal content click from closing modal', () => {
    const handleCancel = vi.fn()
    render(<ConfirmModal {...defaultProps} onCancel={handleCancel} />)

    // Click on the modal content (should not close)
    const modalContent = document.querySelector('.bg-white.rounded-lg')
    fireEvent.click(modalContent!)

    expect(handleCancel).not.toHaveBeenCalled()
  })
})