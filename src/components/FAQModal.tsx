import React, { useState, useEffect } from "react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQModal: React.FC<FAQModalProps> = ({ isOpen, onClose }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch("/faqs.json")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to load FAQs");
          }
          return response.json();
        })
        .then((data) => {
          setFaqs(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
          padding: "24px",
          maxWidth: "700px",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          width: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            borderBottom: "2px solid #1976d2",
            paddingBottom: "12px",
          }}
        >
          <h2 style={{ margin: 0, color: "#1976d2", fontSize: "24px" }}>
            Frequently Asked Questions
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "28px",
              cursor: "pointer",
              color: "#666",
              padding: "0",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Close"
          >
            ×
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            Loading FAQs...
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "20px",
              backgroundColor: "#ffebee",
              color: "#c62828",
              borderRadius: "4px",
            }}
          >
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {faqs.map((faq) => (
              <div
                key={faq.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    backgroundColor:
                      expandedId === faq.id ? "#e3f2fd" : "#f8f9fa",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "15px",
                    fontWeight: "500",
                    color: "#333",
                    textAlign: "left",
                  }}
                >
                  <span>{faq.question}</span>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#1976d2",
                      fontWeight: "bold",
                      marginLeft: "12px",
                    }}
                  >
                    {expandedId === faq.id ? "−" : "+"}
                  </span>
                </button>
                {expandedId === faq.id && (
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "white",
                      borderTop: "1px solid #ddd",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      color: "#555",
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQModal;
