import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Dashboard from './Dashboard'

// Mock the DrugRepurposingTable to avoid Vaadin Grid issues in tests
vi.mock('./DrugRepurposingTable', () => ({
  default: ({ data }: any) => <div data-testid="drug-table">Table with {data.length} items</div>
}))

const mockData = {
  drugDiseasePairs: [
    {
      id: '1',
      drugName: 'Metformin',
      drugNdcCode: '0093-1115-01',
      diseaseName: 'Alzheimer\'s Disease',
      diseaseOntologyTerm: 'MONDO:0004975',
      biologicalSuitability: 7.2,
      unmetMedicalNeed: 9.1,
      economicSuitability: 6.8,
      marketSize: 8.5,
      competitiveAdvantage: 5.9,
      regulatoryFeasibility: 7.3,
      clinicalRisk: 4.2,
      compositePrioritizationScore: 7.1,
      narrative: 'Test narrative'
    }
  ]
}

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as any

    render(<Dashboard />)
    expect(screen.getByText(/Loading drug repurposing data/i)).toBeInTheDocument()
  })

  it('renders error state when fetch fails', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found'
    }) as any

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument()
    })
  })

  it('renders dashboard header after successful fetch', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    }) as any

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getAllByText(/Drug Repurposing Prioritization Dashboard/i)[0]).toBeInTheDocument()
    })
  })

  it('renders scoring guide after successful fetch', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    }) as any

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText(/Scoring Guide:/i)).toBeInTheDocument()
    })
  })

  it('renders footer with data source information', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    }) as any

    render(<Dashboard />)

    await waitFor(() => {
      expect(screen.getByText(/Data Source:/i)).toBeInTheDocument()
    })
  })
})
