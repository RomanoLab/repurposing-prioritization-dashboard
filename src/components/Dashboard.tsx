import React, { useState, useEffect, useMemo } from "react";
import DrugRepurposingTable from "./DrugRepurposingTable";
import AdvancedOptions, {
  DEFAULT_WEIGHTS,
  type ComponentWeights,
} from "./AdvancedOptions";
import { applyWeightsToPairs } from "../utils/priorityCalculation";
import { validateDrugRepurposingData } from "../utils/dataValidator";
import type { DrugDiseasePair } from "../types/DrugDiseasePair";

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DrugDiseasePair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weights, setWeights] = useState<ComponentWeights>(DEFAULT_WEIGHTS);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/sample-data.json");
        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.statusText}`);
        }
        const jsonData = await response.json();

        // Validate the data against the schema
        const validationResult = validateDrugRepurposingData(jsonData);

        if (!validationResult.valid) {
          const errorMessages = validationResult.errors
            .map((err) => `${err.path}: ${err.message}`)
            .join("; ");
          throw new Error(`Data validation failed: ${errorMessages}`);
        }

        console.log("✓ Data validation passed");
        setData(validationResult.data!.drugDiseasePairs);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Recalculate priority scores based on current weights
  const weightedData = useMemo(() => {
    return applyWeightsToPairs(data, weights);
  }, [data, weights]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        Loading drug repurposing data...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          fontSize: "18px",
          color: "#f44336",
        }}
      >
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "100%", overflow: "auto" }}>
      <header
        style={{
          marginBottom: "24px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              margin: "0 0 8px 0",
              color: "#1976d2",
              fontSize: "32px",
              fontWeight: "bold",
            }}
          >
            Drug Repurposing Prioritization Dashboard
          </h1>
          <p
            style={{
              margin: 0,
              color: "#666",
              fontSize: "16px",
              lineHeight: "1.5",
            }}
          >
            Interactive analysis of drug-disease pairs for repurposing
            opportunities ranked by Final Priority Score (composite of all
            metrics). Use search filters to find specific drugs or diseases.
            Click anywhere on a row to expand and view detailed narratives.
            Click column headers to sort data.
          </p>
        </div>
        <div style={{ flexShrink: 0 }}>
          <img
            src="/everycure_blue@4x.webp"
            alt="Every Cure Logo"
            style={{
              height: "60px",
              width: "auto",
              objectFit: "contain",
            }}
          />
        </div>
      </header>

      <div
        style={{
          marginBottom: "16px",
          padding: "12px",
          backgroundColor: "#e3f2fd",
          borderRadius: "4px",
          border: "1px solid #bbdefb",
        }}
      >
        <strong>Scoring Guide:</strong>
        <span style={{ color: "#4CAF50", marginLeft: "8px" }}>
          ■ High (8.0+)
        </span>
        <span style={{ color: "#FF9800", marginLeft: "8px" }}>
          ■ Medium (6.0-7.9)
        </span>
        <span style={{ color: "#F44336", marginLeft: "8px" }}>
          ■ Low (&lt;6.0)
        </span>
        <span style={{ marginLeft: "16px", fontStyle: "italic" }}>
          Note: Clinical Risk is inverted (lower scores are better)
        </span>
      </div>

      <AdvancedOptions weights={weights} onWeightsChange={setWeights} />

      <DrugRepurposingTable data={weightedData} />

      <footer
        style={{
          marginTop: "24px",
          padding: "16px",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
          fontSize: "14px",
          color: "#666",
        }}
      >
        <p style={{ margin: "0 0 8px 0" }}>
          <strong>Data Source:</strong> Sample data for demonstration purposes.
          Real implementation would connect to clinical databases and literature
          sources.
        </p>
        <p style={{ margin: "0 0 8px 0" }}>
          <strong>Future Enhancements:</strong> Support for Arrow/Parquet data
          formats, advanced filtering, sorting, and export capabilities.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Funding Support:</strong> Funding for the Drug Repurposing
          Prioritization Dashboard is provided by Arnold Ventures ([GRANT
          NUMBER, ETC.]).
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
