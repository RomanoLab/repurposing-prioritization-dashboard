import { describe, it, expect } from 'vitest'
import type { DrugDiseasePair, DrugRepurposingData } from './DrugDiseasePair'

describe('DrugDiseasePair Type', () => {
  it('should accept valid DrugDiseasePair object', () => {
    const validPair: DrugDiseasePair = {
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

    expect(validPair).toBeDefined()
    expect(validPair.id).toBe('1')
    expect(validPair.drugName).toBe('Metformin')
    expect(validPair.compositePrioritizationScore).toBe(7.1)
  })

  it('should accept valid DrugRepurposingData object', () => {
    const validData: DrugRepurposingData = {
      drugDiseasePairs: [
        {
          id: '1',
          drugName: 'Test Drug',
          drugNdcCode: 'NDC-123',
          diseaseName: 'Test Disease',
          diseaseOntologyTerm: 'MONDO:123',
          biologicalSuitability: 5.0,
          unmetMedicalNeed: 5.0,
          economicSuitability: 5.0,
          marketSize: 5.0,
          competitiveAdvantage: 5.0,
          regulatoryFeasibility: 5.0,
          clinicalRisk: 5.0,
          compositePrioritizationScore: 5.0,
          narrative: 'Test'
        }
      ]
    }

    expect(validData).toBeDefined()
    expect(validData.drugDiseasePairs).toHaveLength(1)
    expect(validData.drugDiseasePairs[0].drugName).toBe('Test Drug')
  })
})
