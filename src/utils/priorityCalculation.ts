import type { DrugDiseasePair } from "../types/DrugDiseasePair";
import type { ComponentWeights } from "../components/AdvancedOptions";

/**
 * Calculate weighted priority score for a drug-disease pair
 *
 * The score is calculated as a weighted average of all component scores.
 * Clinical risk is inverted (10 - clinicalRisk) so that lower risk is better.
 * Only available (non-null/undefined) scores are included in the calculation.
 *
 * @param item - The drug-disease pair
 * @param weights - The weights for each component (0-1 range)
 * @returns The calculated priority score
 */
export function calculateWeightedPriority(
  item: DrugDiseasePair,
  weights: ComponentWeights,
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  // Helper to add a component if it exists
  const addComponent = (
    value: number | undefined,
    weight: number,
    invert = false,
  ) => {
    if (value !== undefined && value !== null) {
      const actualValue = invert ? 10 - value : value;
      weightedSum += actualValue * weight;
      totalWeight += weight;
    }
  };

  addComponent(item.biologicalSuitability, weights.biologicalSuitability);
  addComponent(item.unmetMedicalNeed, weights.unmetMedicalNeed);
  addComponent(item.economicSuitability, weights.economicSuitability);
  addComponent(item.marketSize, weights.marketSize);
  addComponent(item.competitiveAdvantage, weights.competitiveAdvantage);
  addComponent(item.regulatoryFeasibility, weights.regulatoryFeasibility);
  addComponent(item.clinicalRisk, weights.clinicalRisk, true);

  // Return weighted average (avoid division by zero)
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Apply weights to all drug-disease pairs and recalculate priority scores
 *
 * @param data - Array of drug-disease pairs
 * @param weights - The weights for each component
 * @returns New array with updated priority scores
 */
export function applyWeightsToPairs(
  data: DrugDiseasePair[],
  weights: ComponentWeights,
): DrugDiseasePair[] {
  return data.map((item) => ({
    ...item,
    compositePrioritizationScore: calculateWeightedPriority(item, weights),
  }));
}
