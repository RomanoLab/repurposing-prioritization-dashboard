import React, { useState, useEffect, useMemo } from "react";
import DrugRepurposingTable from "./DrugRepurposingTable";
import AdvancedOptions, {
  DEFAULT_WEIGHTS,
  type ComponentWeights,
} from "./AdvancedOptions";
import FAQModal from "./FAQModal";
import AboutModal from "./AboutModal";
import { applyWeightsToPairs } from "../utils/priorityCalculation";
import { validateDrugRepurposingData } from "../utils/dataValidator";
import type { DrugDiseasePair } from "../types/DrugDiseasePair";
import type { ScoreConfig } from "../types/ScoreConfig";

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DrugDiseasePair[]>([]);
  const [scoreConfig, setScoreConfig] = useState<ScoreConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weights, setWeights] = useState<ComponentWeights>(DEFAULT_WEIGHTS);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load score config
        const configResponse = await fetch("/scoreConfig.json");
        if (!configResponse.ok) {
          throw new Error(
            `Failed to load score config: ${configResponse.statusText}`,
          );
        }
        const configData = await configResponse.json();
        setScoreConfig(configData);

        // Load data
        const response = await fetch("/output2.json");
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "20px", flex: "0 0 auto" }}>
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
            <p
              style={{
                margin: 0,
                color: "#666",
                fontSize: "16px",
                lineHeight: "1.5",
              }}
            >
              The Drug Repurposing Prioritization Dashboard is created and
              maintained by the{" "}
              <a href="https://www.med.upenn.edu/CSTL/">
                Center for Cytokine Storm Treatment and Laboratory
              </a>{" "}
              and the <a href="https://romanolab.org">Romano Lab</a> at the
              Unviersity of Pennsylvania's Perelman School of Medicine.
            </p>
          </div>
        </header>

        <div style={{ marginBottom: "16px", display: "flex", gap: "12px" }}>
          <button
            onClick={() => setIsAboutOpen(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#1565c0")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#1976d2")
            }
          >
            About this application
          </button>
          <button
            onClick={() => setIsFAQOpen(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#1565c0")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#1976d2")
            }
          >
            Frequently Asked Questions
          </button>
          <button
            onClick={() =>
              window.open(
                "https://github.com/RomanoLab/repurposing-prioritization-dashboard",
                "_blank",
              )
            }
            style={{
              padding: "10px 20px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#1565c0")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#1976d2")
            }
          >
            Github link
          </button>
          <button
            onClick={() =>
              window.open(
                "https://upenn.box.com/v/repurposing-scoring-system",
                "_blank",
              )
            }
            style={{
              padding: "10px 20px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#1565c0")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#1976d2")
            }
          >
            Download raw data
          </button>
        </div>

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
      </div>

      <div
        style={{
          flex: "1 1 auto",
          overflow: "hidden",
          paddingLeft: "20px",
          paddingRight: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {scoreConfig && (
          <DrugRepurposingTable data={weightedData} scoreConfig={scoreConfig} />
        )}
      </div>

      <footer
        style={{
          flex: "0 0 auto",
          padding: "16px 20px",
          backgroundColor: "#f5f5f5",
          fontSize: "14px",
          color: "#666",
          borderTop: "1px solid #ddd",
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
          Prioritization Dashboard is provided by a research grant awarded by
          Arnold Ventures.
        </p>
      </footer>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
    </div>
  );
};

export default Dashboard;
