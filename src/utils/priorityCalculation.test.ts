import { describe, it, expect } from 'vitest'
import { calculateWeightedPriority, applyWeightsToPairs } from './priorityCalculation'
import { DEFAULT_WEIGHTS } from '../components/AdvancedOptions'
import type { DrugDiseasePair } from '../types/DrugDiseasePair'

describe('Priority Calculation', () => {
  describe('calculateWeightedPriority', () => {
    it('calculates weighted priority with all scores present', () => {
      const item: DrugDiseasePair = {
        id: '1',
        drugName: 'Test Drug',
        drugNdcCode: '0093-1115-01',
        diseaseName: 'Test Disease',
        diseaseOntologyTerm: 'MONDO:0000001',
        biologicalSuitability: 8.0,
        unmetMedicalNeed: 7.0,
        economicSuitability: 6.0,
        marketSize: 5.0,
        competitiveAdvantage: 7.5,
        regulatoryFeasibility: 8.5,
        clinicalRisk: 3.0,
        compositePrioritizationScore: 0,
        narrative: 'Test'
      }

      const result = calculateWeightedPriority(item, DEFAULT_WEIGHTS)

      // With all weights at 1.0 and clinicalRisk inverted (10-3=7)
      // Average should be (8+7+6+5+7.5+8.5+7)/7 = 7.0
      expect(result).toBeCloseTo(7.0, 1)
    })

    it('calculates weighted priority with only some scores present', () => {
      const item: DrugDiseasePair = {
        id: '2',
        drugName: 'Test Drug',
        drugNdcCode: '0093-1115-01',
        diseaseName: 'Test Disease',
        diseaseOntologyTerm: 'MONDO:0000001',
        economicSuitability: 6.0,
        regulatoryFeasibility: 8.0,
        clinicalRisk: 4.0,
        compositePrioritizationScore: 0,
        narrative: 'Test'
      }

      const result = calculateWeightedPriority(item, DEFAULT_WEIGHTS)

      // With only 3 scores: economicSuitability (6), regulatoryFeasibility (8), inverted clinicalRisk (10-4=6)
      // Average should be (6+8+6)/3 = 6.67
      expect(result).toBeCloseTo(6.67, 1)
    })

    it('calculates weighted priority with no component scores', () => {
      const item: DrugDiseasePair = {
        id: '3',
        drugName: 'Test Drug',
        drugNdcCode: '0093-1115-01',
        diseaseName: 'Test Disease',
        diseaseOntologyTerm: 'MONDO:0000001',
        compositePrioritizationScore: 0,
        narrative: 'Test'
      }

      const result = calculateWeightedPriority(item, DEFAULT_WEIGHTS)

      // With no scores, should return 0
      expect(result).toBe(0)
    })

    it('respects custom weights', () => {
      const item: DrugDiseasePair = {
        id: '4',
        drugName: 'Test Drug',
        drugNdcCode: '0093-1115-01',
        diseaseName: 'Test Disease',
        diseaseOntologyTerm: 'MONDO:0000001',
        economicSuitability: 10.0,
        regulatoryFeasibility: 5.0,
        compositePrioritizationScore: 0,
        narrative: 'Test'
      }

      const customWeights = {
        ...DEFAULT_WEIGHTS,
        economicSuitability: 0.8,
        regulatoryFeasibility: 0.2
      }

      const result = calculateWeightedPriority(item, customWeights)

      // (10*0.8 + 5*0.2) / (0.8+0.2) = 9.0
      expect(result).toBeCloseTo(9.0, 1)
    })

    it('handles zero weights for missing scores', () => {
      const item: DrugDiseasePair = {
        id: '5',
        drugName: 'Test Drug',
        drugNdcCode: '0093-1115-01',
        diseaseName: 'Test Disease',
        diseaseOntologyTerm: 'MONDO:0000001',
        economicSuitability: 7.0,
        compositePrioritizationScore: 0,
        narrative: 'Test'
      }

      const weights = {
        biologicalSuitability: 1.0,
        unmetMedicalNeed: 1.0,
        economicSuitability: 1.0,
        marketSize: 1.0,
        competitiveAdvantage: 1.0,
        regulatoryFeasibility: 1.0,
        clinicalRisk: 1.0
      }

      const result = calculateWeightedPriority(item, weights)

      // Only economicSuitability has a value, so result should be 7.0
      expect(result).toBe(7.0)
    })
  })

  describe('applyWeightsToPairs', () => {
    it('applies weights to multiple pairs', () => {
      const pairs: DrugDiseasePair[] = [
        {
          id: '1',
          drugName: 'Drug A',
          drugNdcCode: '0093-1111-01',
          diseaseName: 'Disease A',
          diseaseOntologyTerm: 'MONDO:0000001',
          economicSuitability: 8.0,
          regulatoryFeasibility: 7.0,
          clinicalRisk: 3.0,
          compositePrioritizationScore: 0,
          narrative: 'Test A'
        },
        {
          id: '2',
          drugName: 'Drug B',
          drugNdcCode: '0093-2222-01',
          diseaseName: 'Disease B',
          diseaseOntologyTerm: 'MONDO:0000002',
          economicSuitability: 6.0,
          compositePrioritizationScore: 0,
          narrative: 'Test B'
        }
      ]

      const result = applyWeightsToPairs(pairs, DEFAULT_WEIGHTS)

      expect(result).toHaveLength(2)
      expect(result[0].compositePrioritizationScore).toBeGreaterThan(0)
      expect(result[1].compositePrioritizationScore).toBeGreaterThan(0)

      // First pair has more scores, so should have higher priority
      expect(result[0].compositePrioritizationScore).toBeGreaterThan(result[1].compositePrioritizationScore)
    })

    it('preserves original data while updating scores', () => {
      const pairs: DrugDiseasePair[] = [
        {
          id: '1',
          drugName: 'Drug A',
          drugNdcCode: '0093-1111-01',
          diseaseName: 'Disease A',
          diseaseOntologyTerm: 'MONDO:0000001',
          economicSuitability: 8.0,
          compositePrioritizationScore: 5.0,
          narrative: 'Original narrative'
        }
      ]

      const result = applyWeightsToPairs(pairs, DEFAULT_WEIGHTS)

      expect(result[0].id).toBe('1')
      expect(result[0].drugName).toBe('Drug A')
      expect(result[0].narrative).toBe('Original narrative')
      expect(result[0].compositePrioritizationScore).not.toBe(5.0)
    })
  })
})
