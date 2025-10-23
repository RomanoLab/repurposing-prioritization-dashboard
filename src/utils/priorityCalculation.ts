import type { DrugDiseasePair } from "../types/DrugDiseasePair";
import type { ComponentWeights } from "../components/AdvancedOptions";

/**
 * Calculate weighted priority score for a drug-disease pair
 *
 * The score is calculated as a weighted average of all component scores.
 * Clinical risk is inverted (10 - clinicalRisk) so that lower risk is better.
 *
 * @param item - The drug-disease pair
 * @param weights - The weights for each component (0-1 range)
 * @returns The calculated priority score
 */
export function calculateWeightedPriority(
  item: DrugDiseasePair,
  weights: ComponentWeights
): number {
  // Invert clinical risk so lower values are better
  const invertedClinicalRisk = 10 - item.clinicalRisk;

  // Calculate weighted sum
  const weightedSum =
    item.biologicalSuitability * weights.biologicalSuitability +
    item.unmetMedicalNeed * weights.unmetMedicalNeed +
    item.economicSuitability * weights.economicSuitability +
    item.marketSize * weights.marketSize +
    item.competitiveAdvantage * weights.competitiveAdvantage +
    item.regulatoryFeasibility * weights.regulatoryFeasibility +
    invertedClinicalRisk * weights.clinicalRisk;

  // Calculate total weight (sum of all weights)
  const totalWeight =
    weights.biologicalSuitability +
    weights.unmetMedicalNeed +
    weights.economicSuitability +
    weights.marketSize +
    weights.competitiveAdvantage +
    weights.regulatoryFeasibility +
    weights.clinicalRisk;

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
  weights: ComponentWeights
): DrugDiseasePair[] {
  return data.map((item) => ({
    ...item,
    compositePrioritizationScore: calculateWeightedPriority(item, weights),
  }));
}
