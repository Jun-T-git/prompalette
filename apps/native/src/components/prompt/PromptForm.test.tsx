import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import type { Prompt } from '../../types'

import { PromptForm } from './PromptForm'

describe('PromptForm', () => {
  const mockPrompt: Partial<Prompt> = {
    title: 'Test Prompt',
    content: 'Test content',
    tags: ['react', 'typescript'],
    quickAccessKey: 'test',
  }

  it('renders form fields correctly', () => {
    render(<PromptForm onSubmit={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByLabelText('タイトル *')).toBeInTheDocument()
    expect(screen.getByLabelText('プロンプト内容 *')).toBeInTheDocument()
    expect(screen.getByLabelText('タグ')).toBeInTheDocument()
    expect(screen.getByLabelText('クイックアクセスキー')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /作成/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /キャンセル/ })).toBeInTheDocument()
  })

  it('loads initial data when provided', () => {
    render(
      <PromptForm
        initialData={mockPrompt}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(screen.getByDisplayValue('Test Prompt')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test content')).toBeInTheDocument()
    expect(screen.getByDisplayValue('react, typescript')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test')).toBeInTheDocument()
  })

  it('calls onSubmit with form data when submitted', async () => {
    const handleSubmit = vi.fn()
    render(<PromptForm onSubmit={handleSubmit} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('タイトル *'), {
      target: { value: 'New Prompt' },
    })
    fireEvent.change(screen.getByLabelText('プロンプト内容 *'), {
      target: { value: 'New content' },
    })
    fireEvent.change(screen.getByLabelText('タグ'), {
      target: { value: 'tag1, tag2' },
    })
    fireEvent.change(screen.getByLabelText('クイックアクセスキー'), {
      target: { value: 'new' },
    })

    fireEvent.click(screen.getByText('作成'))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        title: 'New Prompt',
        content: 'New content',
        tags: ['tag1', 'tag2'],
        quickAccessKey: 'new',
      })
    })
  })

  it('calls onCancel when cancel button is clicked', () => {
    const handleCancel = vi.fn()
    render(<PromptForm onSubmit={vi.fn()} onCancel={handleCancel} />)

    fireEvent.click(screen.getByRole("button", { name: /キャンセル/ }))

    expect(handleCancel).toHaveBeenCalled()
  })

  it('disables submit button when title or content is empty', () => {
    render(<PromptForm onSubmit={vi.fn()} onCancel={vi.fn()} />)

    // Submit button should be disabled when fields are empty
    expect(screen.getByText('作成')).toBeDisabled()
  })

  it('handles tag parsing correctly', async () => {
    const handleSubmit = vi.fn()
    render(<PromptForm onSubmit={handleSubmit} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('タイトル *'), {
      target: { value: 'Test' },
    })
    fireEvent.change(screen.getByLabelText('プロンプト内容 *'), {
      target: { value: 'Test content' },
    })
    fireEvent.change(screen.getByLabelText('タグ'), {
      target: { value: ' tag1 , tag2, tag3 ' },
    })

    fireEvent.click(screen.getByText('作成'))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        title: 'Test',
        content: 'Test content',
        tags: ['tag1', 'tag2', 'tag3'],
        quickAccessKey: undefined,
      })
    })
  })

  it('handles empty tags correctly', async () => {
    const handleSubmit = vi.fn()
    render(<PromptForm onSubmit={handleSubmit} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('タイトル *'), {
      target: { value: 'Test' },
    })
    fireEvent.change(screen.getByLabelText('プロンプト内容 *'), {
      target: { value: 'Test content' },
    })
    fireEvent.change(screen.getByLabelText('タグ'), {
      target: { value: '' },
    })

    fireEvent.click(screen.getByText('作成'))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        title: 'Test',
        content: 'Test content',
        tags: undefined,
        quickAccessKey: undefined,
      })
    })
  })

  it('disables buttons when loading', () => {
    render(
      <PromptForm onSubmit={vi.fn()} onCancel={vi.fn()} isLoading={true} />
    )

    expect(screen.getByRole("button", { name: /キャンセル/ })).toBeDisabled()
    expect(screen.getByText('読み込み中...')).toBeDisabled()
  })

  it('enables submit button when required fields are filled', () => {
    render(<PromptForm onSubmit={vi.fn()} onCancel={vi.fn()} />)

    // Fill required fields
    fireEvent.change(screen.getByLabelText('タイトル *'), {
      target: { value: 'Test Title' },
    })
    fireEvent.change(screen.getByLabelText('プロンプト内容 *'), {
      target: { value: 'Test Content' },
    })

    // Submit button should be enabled
    expect(screen.getByText('作成')).not.toBeDisabled()
  })
})