export interface ScoreColumnConfig {
  key: keyof {
    biologicalSuitability: number;
    unmetMedicalNeed: number;
    economicSuitability: number;
    marketSize: number;
    competitiveAdvantage: number;
    regulatoryFeasibility: number;
    clinicalRisk: number;
  };
  displayName: string;
  description: string;
  width: string;
  flexGrow: number;
  isInverted?: boolean;
}

export interface ScoreConfig {
  scoreColumns: ScoreColumnConfig[];
}
