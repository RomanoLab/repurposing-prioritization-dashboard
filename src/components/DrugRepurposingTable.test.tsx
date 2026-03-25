import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DrugRepurposingTable from "./DrugRepurposingTable";
import { DEFAULT_WEIGHTS } from "./AdvancedOptions";
import type { DrugDiseasePair } from "../types/DrugDiseasePair";

// Mock the API module (used in API mode)
vi.mock("../api/pairsApi", () => ({
  fetchPairs: vi.fn().mockResolvedValue({ items: [], totalSize: 0 }),
  fetchPairDetail: vi.fn().mockResolvedValue({}),
}));

const mockScoreConfig = {
  scoreColumns: [
    {
      key: "economicSuitability" as const,
      displayName: "Economic",
      description: "Economic Suitability Score",
      width: "100px",
      flexGrow: 1,
    },
    {
      key: "regulatoryFeasibility" as const,
      displayName: "Regulatory",
      description: "Regulatory Feasibility Score",
      width: "100px",
      flexGrow: 1,
    },
    {
      key: "clinicalRisk" as const,
      displayName: "Risk",
      description: "Clinical Risk Score",
      width: "70px",
      flexGrow: 1,
      isInverted: true,
    },
  ],
};

const mockData: DrugDiseasePair[] = [
  {
    id: "1",
    drugName: "Metformin",
    drugNdcCode: "0093-1115-01",
    diseaseName: "Alzheimer's Disease",
    diseaseOntologyTerm: "MONDO:0004975",
    biologicalSuitability: 7.2,
    unmetMedicalNeed: 9.1,
    economicSuitability: 6.8,
    marketSize: 8.5,
    competitiveAdvantage: 5.9,
    regulatoryFeasibility: 7.3,
    clinicalRisk: 4.2,
    compositePrioritizationScore: 7.1,
    narrative: "Metformin shows promising results",
  },
  {
    id: "2",
    drugName: "Sildenafil",
    drugNdcCode: "0069-4200-66",
    diseaseName: "Pulmonary Hypertension",
    diseaseOntologyTerm: "MONDO:0005149",
    biologicalSuitability: 8.9,
    unmetMedicalNeed: 8.7,
    economicSuitability: 7.1,
    marketSize: 6.3,
    competitiveAdvantage: 8.2,
    regulatoryFeasibility: 9.1,
    clinicalRisk: 3.5,
    compositePrioritizationScore: 7.8,
    narrative: "Sildenafil is effective",
  },
];

describe("DrugRepurposingTable Component", () => {
  it("renders component in file mode without crashing", () => {
    const { container } = render(
      <DrugRepurposingTable
        weights={DEFAULT_WEIGHTS}
        scoreConfig={mockScoreConfig}
        data={mockData}
      />,
    );
    expect(container).toBeTruthy();
  });

  it("displays item count in file mode", () => {
    render(
      <DrugRepurposingTable
        weights={DEFAULT_WEIGHTS}
        scoreConfig={mockScoreConfig}
        data={mockData}
      />,
    );
    expect(screen.getByText("Total drug-disease pairs: 2")).toBeInTheDocument();
  });

  it("renders empty table when no data provided in file mode", () => {
    render(
      <DrugRepurposingTable
        weights={DEFAULT_WEIGHTS}
        scoreConfig={mockScoreConfig}
        data={[]}
      />,
    );
    expect(screen.getByText("Total drug-disease pairs: 0")).toBeInTheDocument();
  });

  it("renders Vaadin Grid component", () => {
    const { container } = render(
      <DrugRepurposingTable
        weights={DEFAULT_WEIGHTS}
        scoreConfig={mockScoreConfig}
        data={mockData}
      />,
    );
    const grid = container.querySelector("vaadin-grid");
    expect(grid).toBeInTheDocument();
  });

  it("renders in API mode without data prop", () => {
    const { container } = render(
      <DrugRepurposingTable
        weights={DEFAULT_WEIGHTS}
        scoreConfig={mockScoreConfig}
      />,
    );
    expect(container).toBeTruthy();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
