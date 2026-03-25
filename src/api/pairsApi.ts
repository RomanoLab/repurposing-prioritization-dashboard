import type { DrugDiseasePair } from "../types/DrugDiseasePair";
import type { ComponentWeights } from "../components/AdvancedOptions";

export interface PairsQueryParams {
  page: number;
  pageSize: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  drugFilter: string;
  diseaseFilter: string;
  weights: ComponentWeights;
}

export interface PairsResponse {
  items: DrugDiseasePair[];
  totalSize: number;
}

export async function fetchPairs(params: PairsQueryParams): Promise<PairsResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
    sortBy: params.sortBy,
    sortDir: params.sortDir,
    drugFilter: params.drugFilter,
    diseaseFilter: params.diseaseFilter,
    w_bio: String(params.weights.biologicalSuitability),
    w_need: String(params.weights.unmetMedicalNeed),
    w_econ: String(params.weights.economicSuitability),
    w_market: String(params.weights.marketSize),
    w_comp: String(params.weights.competitiveAdvantage),
    w_reg: String(params.weights.regulatoryFeasibility),
    w_risk: String(params.weights.clinicalRisk),
  });

  const response = await fetch(`/api/pairs?${searchParams}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchPairDetail(id: string): Promise<DrugDiseasePair> {
  const response = await fetch(`/api/pairs/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
}
