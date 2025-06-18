import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'

import { DropdownButton, type DropdownItem } from './DropdownButton'

describe('DropdownButton', () => {
  const mockItems: DropdownItem[] = [
    { label: 'Edit', onClick: vi.fn() },
    { label: 'Delete', onClick: vi.fn(), variant: 'danger' },
    { label: 'Disabled', onClick: vi.fn(), disabled: true },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders trigger button', () => {
    render(
      <DropdownButton
        trigger={<button>Menu</button>}
        items={mockItems}
      />
    )

    expect(screen.getByText('Menu')).toBeInTheDocument()
  })

  it('shows dropdown menu when trigger is clicked', () => {
    render(
      <DropdownButton
        trigger={<button>Menu</button>}
        items={mockItems}
      />
    )

    fireEvent.click(screen.getByText('Menu'))

    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
    expect(screen.getByText('Disabled')).toBeInTheDocument()
  })

  it('hides dropdown menu when trigger is clicked again', () => {
    render(
      <DropdownButton
        trigger={<button>Menu</button>}
        items={mockItems}
      />
    )

    // Open dropdown
    fireEvent.click(screen.getByText('Menu'))
    expect(screen.getByText('Edit')).toBeInTheDocument()

    // Close dropdown
    fireEvent.click(screen.getByText('Menu'))
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })

  it('calls item onClick when item is clicked', () => {
    render(
      <DropdownButton
        trigger={<button>Menu</button>}
        items={mockItems}
      />
    )

    fireEvent.click(screen.getByText('Menu'))
    fireEvent.click(screen.getByText('Edit'))

    expect(mockItems[0]!.onClick).toHaveBeenCalledTimes(1)
  })

  it('closes dropdown when item is clicked', () => {
    render(
      <DropdownButton
        trigger={<button>Menu</button>}
        items={mockItems}
      />
    )

    fireEvent.click(screen.getByText('Menu'))
    fireEvent.click(screen.getByText('Edit'))

    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })

  it('does not call onClick for disabled items', () => {
    render(
      <DropdownButton
        trigger={<button>Menu</button>}
        items={mockItems}
      />
    )

    fireEvent.click(screen.getByText('Menu'))
    fireEvent.click(screen.getByText('Disabled'))

    expect(mockItems[2]!.onClick).not.toHaveBeenCalled()
  })

  it('closes dropdown when clicking outside', () => {
    render(
      <div>
        <DropdownButton
          trigger={<button>Menu</button>}
          items={mockItems}
        />
        <div>Outside</div>
      </div>
    )

    fireEvent.click(screen.getByText('Menu'))
    expect(screen.getByText('Edit')).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByText('Outside'))
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })

  it('closes dropdown when pressing Escape key', () => {
    render(
      <DropdownButton
        trigger={<button>Menu</button>}
        items={mockItems}
      />
    )

    fireEvent.click(screen.getByText('Menu'))
    expect(screen.getByText('Edit')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })

  it('supports controlled mode', () => {
    const onToggle = vi.fn()
    
    render(
      <DropdownButton
        trigger={<button>Menu</button>}
        items={mockItems}
        isOpen={true}
        onToggle={onToggle}
      />
    )

    expect(screen.getByText('Edit')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Menu'))
    expect(onToggle).toHaveBeenCalledWith(false)
  })

  it('does not open when disabled', () => {
    render(
      <DropdownButton
        trigger={<button>Menu</button>}
        items={mockItems}
        disabled={true}
      />
    )

    fireEvent.click(screen.getByText('Menu'))
    expect(screen.queryByText('Edit')).not.toBeInTheDocument()
  })

  it('renders items with icons', () => {
    const itemsWithIcons: DropdownItem[] = [
      { 
        label: 'Edit', 
        onClick: vi.fn(),
        icon: <span data-testid="edit-icon">✏️</span>
      },
    ]

    render(
      <DropdownButton
        trigger={<button>Menu</button>}
        items={itemsWithIcons}
      />
    )

    fireEvent.click(screen.getByText('Menu'))
    expect(screen.getByTestId('edit-icon')).toBeInTheDocument()
  })
})