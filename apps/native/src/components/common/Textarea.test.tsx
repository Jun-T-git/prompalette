import { render, screen, fireEvent } from '@testing-library/react'

import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('renders textarea correctly', () => {
    render(<Textarea placeholder="Test textarea" />)
    expect(screen.getByPlaceholderText('Test textarea')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Textarea label="Test Label" />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<Textarea error="This is an error" />)
    expect(screen.getByText('This is an error')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-red-500')
  })

  it('shows helper text when no error', () => {
    render(<Textarea helperText="This is helper text" />)
    expect(screen.getByText('This is helper text')).toBeInTheDocument()
  })

  it('sets custom rows', () => {
    render(<Textarea rows={8} />)
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '8')
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Textarea onChange={handleChange} />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'test content' } })
    
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('supports disabled state', () => {
    render(<Textarea disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('applies resize-vertical class', () => {
    render(<Textarea />)
    expect(screen.getByRole('textbox')).toHaveClass('resize-vertical')
  })
})