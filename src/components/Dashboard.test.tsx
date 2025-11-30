import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "./Dashboard";

// Mock the DrugRepurposingTable to avoid Vaadin Grid issues in tests
vi.mock("./DrugRepurposingTable", () => ({
  default: ({ data }: any) => (
    <div data-testid="drug-table">Table with {data.length} items</div>
  ),
}));

const mockScoreConfig = {
  scoreColumns: [
    {
      key: "economicSuitability",
      displayName: "Economic",
      description: "Economic Suitability Score",
      width: "100px",
      flexGrow: 1,
    },
    {
      key: "regulatoryFeasibility",
      displayName: "Regulatory",
      description: "Regulatory Feasibility Score",
      width: "100px",
      flexGrow: 1,
    },
    {
      key: "clinicalRisk",
      displayName: "Risk",
      description: "Clinical Risk Score",
      width: "70px",
      flexGrow: 1,
      isInverted: true,
    },
  ],
};

const mockData = {
  drugDiseasePairs: [
    {
      id: "1",
      drugName: "Metformin",
      drugNdcCode: "0093-1115-01",
      diseaseName: "Alzheimer's Disease",
      diseaseOntologyTerm: "MONDO:0004975",
      economicSuitability: 6.8,
      regulatoryFeasibility: 7.3,
      clinicalRisk: 4.2,
      compositePrioritizationScore: 7.1,
      narrative: "Test narrative",
    },
  ],
};

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as any;

    render(<Dashboard />);
    expect(
      screen.getByText(/Loading drug repurposing data/i),
    ).toBeInTheDocument();
  });

  it("renders error state when fetch fails", async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      statusText: "Not Found",
    }) as any;

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });
  });

  it("renders dashboard header after successful fetch", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockScoreConfig,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      }) as any;

    render(<Dashboard />);

    await waitFor(() => {
      expect(
        screen.getAllByText(/Drug Repurposing Prioritization Dashboard/i)[0],
      ).toBeInTheDocument();
    });
  });

  it("renders scoring guide after successful fetch", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockScoreConfig,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      }) as any;

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Scoring Guide:/i)).toBeInTheDocument();
    });
  });

  it("renders footer with data source information", async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockScoreConfig,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      }) as any;

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Data Source:/i)).toBeInTheDocument();
    });
  });
});
