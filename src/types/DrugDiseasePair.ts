export interface DrugDiseasePair {
  id: string;
  drugName: string;
  drugNdcCode: string;
  pubchemCid?: string;
  diseaseName: string;
  diseaseOntologyTerm: string;
  biologicalSuitability: number;
  unmetMedicalNeed: number;
  economicSuitability: number;
  marketSize: number;
  competitiveAdvantage: number;
  regulatoryFeasibility: number;
  clinicalRisk: number;
  compositePrioritizationScore: number;
  narrative: string;
}

export interface DrugRepurposingData {
  drugDiseasePairs: DrugDiseasePair[];
}
