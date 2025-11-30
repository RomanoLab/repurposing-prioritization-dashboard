import React from "react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "32px",
          maxWidth: "600px",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            margin: "0 0 20px 0",
            color: "#1976d2",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          About This Application
        </h2>

        <div
          style={{
            fontSize: "15px",
            lineHeight: "1.6",
            color: "#333",
            marginBottom: "24px",
          }}
        >
          <p style={{ margin: "0 0 16px 0" }}>
            The Drug Repurposing Prioritization Dashboard is a research tool designed to help identify and evaluate promising drug-disease pairs for repurposing opportunities. By analyzing multiple factors including economic feasibility, regulatory pathways, and clinical risk profiles, this application provides a comprehensive scoring system to prioritize candidates for further investigation. The dashboard enables researchers and decision-makers to efficiently explore large datasets of potential drug repurposing opportunities, filtering and sorting by various metrics to identify the most viable candidates for therapeutic development.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px",
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
