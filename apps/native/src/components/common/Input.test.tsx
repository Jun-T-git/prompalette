import { render, screen, fireEvent } from '@testing-library/react'

import { Input } from './Input'

describe('Input', () => {
  it('renders input correctly', () => {
    render(<Input placeholder="Test input" />)
    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Input label="Test Label" />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<Input error="This is an error" />)
    expect(screen.getByText('This is an error')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500')
  })

  it('shows helper text when no error', () => {
    render(<Input helperText="This is helper text" />)
    expect(screen.getByText('This is helper text')).toBeInTheDocument()
  })

  it('does not show helper text when error is present', () => {
    render(<Input error="Error message" helperText="Helper text" />)
    expect(screen.getByText('Error message')).toBeInTheDocument()
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-class')
  })

  it('supports disabled state', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveClass('disabled:bg-gray-50')
  })
})