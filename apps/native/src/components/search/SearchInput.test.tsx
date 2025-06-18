import { render, screen, fireEvent, act } from '@testing-library/react'

import { SearchInput } from './SearchInput'

// Mock timers for debounce testing
vi.useFakeTimers()

describe('SearchInput', () => {
  afterEach(() => {
    vi.clearAllTimers()
  })

  it('renders search input correctly', () => {
    const { container } = render(<SearchInput value="" onChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    // Check for search icon by looking for the SVG element in the container
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('shows custom placeholder', () => {
    render(<SearchInput value="" onChange={vi.fn()} placeholder="Search prompts..." />)
    expect(screen.getByPlaceholderText('Search prompts...')).toBeInTheDocument()
  })

  it('shows clear button when value is present', () => {
    render(<SearchInput value="test" onChange={vi.fn()} />)
    expect(screen.getByTitle('クリア')).toBeInTheDocument()
  })

  it('does not show clear button when value is empty', () => {
    render(<SearchInput value="" onChange={vi.fn()} />)
    expect(screen.queryByTitle('クリア')).not.toBeInTheDocument()
  })

  it('calls onChange after debounce delay', async () => {
    const handleChange = vi.fn()
    render(<SearchInput value="" onChange={handleChange} debounceMs={300} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test' } })
    
    // Should not call immediately
    expect(handleChange).not.toHaveBeenCalled()
    
    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    // Should call after debounce
    expect(handleChange).toHaveBeenCalledWith('test')
  })

  it('calls onSearch when provided', async () => {
    const handleSearch = vi.fn()
    render(<SearchInput value="" onChange={vi.fn()} onSearch={handleSearch} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'search term' } })
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    expect(handleSearch).toHaveBeenCalledWith('search term')
  })

  it('clears input when clear button is clicked', () => {
    const handleChange = vi.fn()
    const handleSearch = vi.fn()
    render(<SearchInput value="test" onChange={handleChange} onSearch={handleSearch} />)
    
    const clearButton = screen.getByTitle('クリア')
    fireEvent.click(clearButton)
    
    expect(handleChange).toHaveBeenCalledWith('')
    expect(handleSearch).toHaveBeenCalledWith('')
  })

  it('syncs with external value changes', () => {
    const { rerender } = render(<SearchInput value="initial" onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('initial')).toBeInTheDocument()
    
    rerender(<SearchInput value="updated" onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('updated')).toBeInTheDocument()
  })

  it('cancels previous debounce when new input is received', async () => {
    const handleChange = vi.fn()
    render(<SearchInput value="" onChange={handleChange} debounceMs={300} />)
    
    const input = screen.getByRole('textbox')
    
    // First input
    fireEvent.change(input, { target: { value: 'first' } })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    
    // Second input before first debounce completes
    fireEvent.change(input, { target: { value: 'second' } })
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    // Should only call with the latest value
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith('second')
  })

  describe('Inline Completion', () => {
    it('should show inline completion when enableInlineCompletion is true', () => {
      const mockPrompts = [
        { id: '1', title: 'Test', content: 'Test', tags: ['react'], quickAccessKey: 'test', created_at: '2023-01-01', updated_at: '2023-01-01' }
      ]
      
      render(
        <SearchInput 
          value="/t" 
          onChange={vi.fn()} 
          enableInlineCompletion={true}
          prompts={mockPrompts}
        />
      )
      
      // Check that ghost text is rendered
      expect(screen.getByText('est')).toBeInTheDocument()
    })

    it('should not show inline completion when enableInlineCompletion is false', () => {
      const mockPrompts = [
        { id: '1', title: 'Test', content: 'Test', tags: ['react'], quickAccessKey: 'test', created_at: '2023-01-01', updated_at: '2023-01-01' }
      ]
      
      render(
        <SearchInput 
          value="/t" 
          onChange={vi.fn()} 
          enableInlineCompletion={false}
          prompts={mockPrompts}
        />
      )
      
      // Check that ghost text is NOT rendered
      expect(screen.queryByText('est')).not.toBeInTheDocument()
    })

    it('should accept inline completion with Tab key', () => {
      const handleChange = vi.fn()
      const mockPrompts = [
        { id: '1', title: 'Test', content: 'Test', tags: ['react'], quickAccessKey: 'test', created_at: '2023-01-01', updated_at: '2023-01-01' }
      ]
      
      render(
        <SearchInput 
          value="/t" 
          onChange={handleChange} 
          enableInlineCompletion={true}
          prompts={mockPrompts}
        />
      )
      
      const input = screen.getByRole('textbox')
      fireEvent.keyDown(input, { key: 'Tab' })
      
      expect(handleChange).toHaveBeenCalledWith('/test')
    })
  })
})