import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

// Mock Dashboard to avoid Vaadin Grid issues
vi.mock('./components/Dashboard', () => ({
  default: () => <div data-testid="dashboard">Dashboard Component</div>
}))

describe('App Component', () => {
  it('renders Dashboard component', () => {
    const { getByTestId } = render(<App />)
    expect(getByTestId('dashboard')).toBeInTheDocument()
  })

  it('renders without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })
})
