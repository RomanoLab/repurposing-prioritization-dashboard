import React, { useState } from "react";
import "./AdvancedOptions.css";

export interface ComponentWeights {
  biologicalSuitability: number;
  unmetMedicalNeed: number;
  economicSuitability: number;
  marketSize: number;
  competitiveAdvantage: number;
  regulatoryFeasibility: number;
  clinicalRisk: number;
}

export const DEFAULT_WEIGHTS: ComponentWeights = {
  biologicalSuitability: 1.0,
  unmetMedicalNeed: 1.0,
  economicSuitability: 1.0,
  marketSize: 1.0,
  competitiveAdvantage: 1.0,
  regulatoryFeasibility: 1.0,
  clinicalRisk: 1.0,
};

interface AdvancedOptionsProps {
  weights: ComponentWeights;
  onWeightsChange: (weights: ComponentWeights) => void;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  weights,
  onWeightsChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleWeightChange = (key: keyof ComponentWeights, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 1) {
      onWeightsChange({
        ...weights,
        [key]: numValue,
      });
    }
  };

  const resetWeights = () => {
    onWeightsChange(DEFAULT_WEIGHTS);
  };

  const weightFields: Array<{
    key: keyof ComponentWeights;
    label: string;
    description: string;
  }> = [
    {
      key: "biologicalSuitability",
      label: "Biological Suitability",
      description: "Weight for biological plausibility and mechanism of action",
    },
    {
      key: "unmetMedicalNeed",
      label: "Unmet Medical Need",
      description: "Weight for severity and availability of treatments",
    },
    {
      key: "economicSuitability",
      label: "Economic Suitability",
      description: "Weight for development costs and economic feasibility",
    },
    {
      key: "marketSize",
      label: "Market Size",
      description: "Weight for patient population and market potential",
    },
    {
      key: "competitiveAdvantage",
      label: "Competitive Advantage",
      description: "Weight for uniqueness versus existing therapies",
    },
    {
      key: "regulatoryFeasibility",
      label: "Regulatory Feasibility",
      description: "Weight for regulatory pathway and approval likelihood",
    },
    {
      key: "clinicalRisk",
      label: "Clinical Risk",
      description:
        "Weight for safety concerns and trial failure risk (inverted)",
    },
  ];

  return (
    <div
      style={{
        marginBottom: "16px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        backgroundColor: "#fff",
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: "100%",
          padding: "12px 16px",
          backgroundColor: "#f5f5f5",
          border: "none",
          borderRadius: isExpanded ? "4px 4px 0 0" : "4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "14px",
          fontWeight: "600",
          color: "#333",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#e8e8e8";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#f5f5f5";
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>{isExpanded ? "▼" : "▶"}</span>
          <span>Advanced Options</span>
        </span>
        <span style={{ fontSize: "12px", color: "#666", fontWeight: "normal" }}>
          Customize component score weights (0.0 - 1.0)
        </span>
      </button>

      {isExpanded && (
        <div style={{ padding: "20px" }}>
          <div
            style={{
              marginBottom: "16px",
              padding: "12px",
              backgroundColor: "#e3f2fd",
              borderRadius: "4px",
              fontSize: "13px",
              color: "#333",
            }}
          >
            <strong>About Weights:</strong> Adjust weights between 0.0 and 1.0
            to control how much each component contributes to the overall
            Priority Score. A weight of 0 excludes the component entirely, while
            1.0 gives it full contribution. The final score is the weighted
            average of all components.
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            {weightFields.map(({ key, label, description }) => (
              <div
                key={key}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    marginBottom: "4px",
                    color: "#333",
                  }}
                >
                  {label}
                </label>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#666",
                    marginBottom: "6px",
                    lineHeight: "1.4",
                  }}
                >
                  {description}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    padding: "8px 0",
                  }}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={weights[key]}
                    onChange={(e) => handleWeightChange(key, e.target.value)}
                    className="weight-slider"
                    style={{
                      background: `linear-gradient(to right, #1976d2 0%, #1976d2 ${weights[key] * 100}%, #ddd ${weights[key] * 100}%, #ddd 100%)`,
                    }}
                  />
                  <span
                    style={{
                      textAlign: "center",
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#1976d2",
                    }}
                  >
                    {weights[key].toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              paddingTop: "12px",
              borderTop: "1px solid #ddd",
            }}
          >
            <button
              onClick={resetWeights}
              style={{
                padding: "8px 16px",
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedOptions;
