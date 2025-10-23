import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DrugRepurposingTable from './DrugRepurposingTable'
import type { DrugDiseasePair } from '../types/DrugDiseasePair'

const mockData: DrugDiseasePair[] = [
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
    narrative: 'Metformin shows promising results'
  },
  {
    id: '2',
    drugName: 'Sildenafil',
    drugNdcCode: '0069-4200-66',
    diseaseName: 'Pulmonary Hypertension',
    diseaseOntologyTerm: 'MONDO:0005149',
    biologicalSuitability: 8.9,
    unmetMedicalNeed: 8.7,
    economicSuitability: 7.1,
    marketSize: 6.3,
    competitiveAdvantage: 8.2,
    regulatoryFeasibility: 9.1,
    clinicalRisk: 3.5,
    compositePrioritizationScore: 7.8,
    narrative: 'Sildenafil is effective'
  }
]

describe('DrugRepurposingTable Component', () => {
  it('renders component without crashing', () => {
    const { container } = render(<DrugRepurposingTable data={mockData} />)
    expect(container).toBeTruthy()
  })

  it('displays item count', () => {
    render(<DrugRepurposingTable data={mockData} />)
    expect(screen.getByText('2 of 2 items')).toBeInTheDocument()
  })

  it('renders empty table when no data provided', () => {
    render(<DrugRepurposingTable data={[]} />)
    expect(screen.getByText('0 of 0 items')).toBeInTheDocument()
  })

  it('renders Vaadin Grid component', () => {
    const { container } = render(<DrugRepurposingTable data={mockData} />)
    const grid = container.querySelector('vaadin-grid')
    expect(grid).toBeInTheDocument()
  })
})
