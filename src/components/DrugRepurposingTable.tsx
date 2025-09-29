import React, { useState, useRef, useEffect, useMemo } from "react";
import { Grid } from "@vaadin/react-components/Grid.js";
import { GridColumn } from "@vaadin/react-components/GridColumn.js";
import { GridSortColumn } from "@vaadin/react-components/GridSortColumn.js";
import { TextField } from "@vaadin/react-components/TextField.js";
import type { DrugDiseasePair } from "../types/DrugDiseasePair";

interface DrugRepurposingTableProps {
  data: DrugDiseasePair[];
}

const DrugRepurposingTable: React.FC<DrugRepurposingTableProps> = ({
  data,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [drugFilter, setDrugFilter] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("");
  const gridRef = useRef<any>(null);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const drugMatch = item.drugName
        .toLowerCase()
        .includes(drugFilter.toLowerCase());
      const diseaseMatch = item.diseaseName
        .toLowerCase()
        .includes(diseaseFilter.toLowerCase());
      return drugMatch && diseaseMatch;
    });
  }, [data, drugFilter, diseaseFilter]);

  const toggleExpanded = (item: DrugDiseasePair) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(item.id)) {
      newExpanded.delete(item.id);
    } else {
      newExpanded.add(item.id);
    }
    setExpandedItems(newExpanded);
  };

  useEffect(() => {
    if (gridRef.current) {
      const grid = gridRef.current;

      grid.multiSort = [
        { path: "compositePrioritizationScore", direction: "desc" },
      ];

      grid.rowDetailsRenderer = (root: any, _column: any, model: any) => {
        const item = model.item as DrugDiseasePair;
        if (expandedItems.has(item.id)) {
          const detailsDiv = document.createElement("div");
          detailsDiv.style.cssText =
            "padding: 16px 24px; background-color: #f8f9fa; border-top: 1px solid #dee2e6; border-bottom: 1px solid #dee2e6; margin: 0; width: 100%;";

          const headerDiv = document.createElement("div");
          headerDiv.style.cssText =
            "display: flex; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 12px;";

          const title = document.createElement("h4");
          title.style.cssText =
            "margin: 0; color: #1976d2; font-size: 16px; font-weight: 600;";
          title.textContent = `${item.drugName} for ${item.diseaseName}`;

          const badge = document.createElement("span");
          badge.style.cssText =
            "padding: 4px 8px; background-color: #e3f2fd; color: #1976d2; font-size: 12px; border-radius: 12px; font-weight: 500;";
          badge.textContent = "Detailed Analysis";

          const identifiersDiv = document.createElement("div");
          identifiersDiv.style.cssText =
            "font-size: 12px; color: #666; font-family: monospace; margin-left: auto;";
          identifiersDiv.innerHTML = `<div>NDC: ${item.drugNdcCode}</div><div>Disease: ${item.diseaseOntologyTerm}</div>`;

          const description = document.createElement("p");
          description.style.cssText =
            "margin: 0; line-height: 1.6; color: #495057; font-size: 14px;";
          description.textContent = item.narrative;

          headerDiv.appendChild(title);
          headerDiv.appendChild(badge);
          headerDiv.appendChild(identifiersDiv);
          detailsDiv.appendChild(headerDiv);
          detailsDiv.appendChild(description);

          root.innerHTML = "";
          root.appendChild(detailsDiv);
        } else {
          root.innerHTML = "";
        }
      };

      grid.detailsOpenedItems = Array.from(expandedItems)
        .map((id) => filteredData.find((item) => item.id === id))
        .filter(Boolean);

      grid.addEventListener("active-item-changed", (e: any) => {
        const item = e.detail.value as DrugDiseasePair;
        if (item) {
          toggleExpanded(item);
          setTimeout(() => {
            grid.activeItem = null;
          }, 100);
        }
      });

      // Add tooltips to column headers
      setTimeout(() => {
        const headers = grid.shadowRoot?.querySelectorAll(
          "vaadin-grid-cell-content",
        );
        headers?.forEach((header: any) => {
          const text = header.textContent?.trim();
          if (text) {
            switch (text) {
              case "Drug":
                header.title = "Drug Name and NDC Code";
                break;
              case "Disease":
                header.title = "Disease Name and Ontology Term";
                break;
              case "🎯 Priority":
                header.title =
                  "Final Prioritization Score (Composite of All Metrics)";
                break;
              case "Biological":
                header.title = "Biological Suitability Score";
                break;
              case "Medical Need":
                header.title = "Unmet Medical Need Score";
                break;
              case "Economic":
                header.title = "Economic Suitability Score";
                break;
              case "Market":
                header.title = "Market Size Score";
                break;
              case "Competitive":
                header.title = "Competitive Advantage Score";
                break;
              case "Regulatory":
                header.title = "Regulatory Feasibility Score";
                break;
              case "Risk":
                header.title = "Clinical Risk Score (Lower is Better)";
                break;
            }
          }
        });
      }, 100);
    }
  }, [expandedItems, filteredData]);

  const formatScore = (value: number) => value.toFixed(1);

  const getScoreColor = (value: number) => {
    if (value >= 8) return "#4CAF50";
    if (value >= 6) return "#FF9800";
    return "#F44336";
  };

  const clearFilters = () => {
    setDrugFilter("");
    setDiseaseFilter("");
  };

  return (
    <div style={{ width: "100%", overflow: "auto" }}>
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "16px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <TextField
          placeholder="Search drugs..."
          value={drugFilter}
          onInput={(e: any) => setDrugFilter(e.target.value)}
          clearButtonVisible={true}
          style={{ minWidth: "200px" }}
        />
        <TextField
          placeholder="Search diseases..."
          value={diseaseFilter}
          onInput={(e: any) => setDiseaseFilter(e.target.value)}
          clearButtonVisible={true}
          style={{ minWidth: "200px" }}
        />
        {(drugFilter || diseaseFilter) && (
          <button
            onClick={clearFilters}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Clear Filters
          </button>
        )}
        <div
          style={{
            fontSize: "14px",
            color: "#666",
            marginLeft: "auto",
          }}
        >
          {filteredData.length} of {data.length} items
        </div>
      </div>

      <Grid
        ref={gridRef}
        items={filteredData}
        theme="row-stripes"
        style={{
          width: "100%",
          cursor: "pointer",
        }}
        multiSort={true}
      >
        <GridColumn
          path="drugName"
          header="Drug"
          width="160px"
          flexGrow={2}
          renderer={({ item }: { item: DrugDiseasePair }) => (
            <div
              style={{
                fontWeight: "500",
                color: expandedItems.has(item.id) ? "#1976d2" : "#333",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span style={{ marginRight: "8px", fontSize: "12px" }}>
                {expandedItems.has(item.id) ? "▼" : "▶"}
              </span>
              <div>
                <div>
                  {drugFilter ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: item.drugName.replace(
                          new RegExp(`(${drugFilter})`, "gi"),
                          '<mark style="background-color: #ffeb3b; padding: 1px 2px; border-radius: 2px;">$1</mark>',
                        ),
                      }}
                    />
                  ) : (
                    item.drugName
                  )}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#666",
                    fontFamily: "monospace",
                  }}
                >
                  NDC: {item.drugNdcCode}
                </div>
              </div>
            </div>
          )}
        />
        <GridSortColumn
          path="diseaseName"
          width="180px"
          flexGrow={2}
          renderer={({ item }: { item: DrugDiseasePair }) => (
            <div>
              <div>
                {diseaseFilter ? (
                  <span
                    dangerouslySetInnerHTML={{
                      __html: item.diseaseName.replace(
                        new RegExp(`(${diseaseFilter})`, "gi"),
                        '<mark style="background-color: #ffeb3b; padding: 1px 2px; border-radius: 2px;">$1</mark>',
                      ),
                    }}
                  />
                ) : (
                  item.diseaseName
                )}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#666",
                  fontFamily: "monospace",
                }}
              >
                {item.diseaseOntologyTerm}
              </div>
            </div>
          )}
        />
        <GridSortColumn
          path="compositePrioritizationScore"
          header="🎯 Priority"
          width="120px"
          flexGrow={0}
          direction="desc"
          renderer={({ item }: { item: DrugDiseasePair }) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 12px",
                backgroundColor: "#e8f5e8",
                borderRadius: "8px",
                border: "2px solid #4CAF50",
                margin: "2px 0",
              }}
            >
              <span
                style={{
                  color: "#1b5e20",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                {formatScore(item.compositePrioritizationScore)}
              </span>
            </div>
          )}
        />
        <GridSortColumn
          path="biologicalSuitability"
          header="Biological"
          width="100px"
          flexGrow={1}
          renderer={({ item }: { item: DrugDiseasePair }) => (
            <span
              style={{
                color: getScoreColor(item.biologicalSuitability),
                fontWeight: "bold",
              }}
            >
              {formatScore(item.biologicalSuitability)}
            </span>
          )}
        />
        <GridSortColumn
          path="unmetMedicalNeed"
          header="Medical Need"
          width="110px"
          flexGrow={1}
          renderer={({ item }: { item: DrugDiseasePair }) => (
            <span
              style={{
                color: getScoreColor(item.unmetMedicalNeed),
                fontWeight: "bold",
              }}
            >
              {formatScore(item.unmetMedicalNeed)}
            </span>
          )}
        />
        <GridSortColumn
          path="economicSuitability"
          header="Economic"
          width="100px"
          flexGrow={1}
          renderer={({ item }: { item: DrugDiseasePair }) => (
            <span
              style={{
                color: getScoreColor(item.economicSuitability),
                fontWeight: "bold",
              }}
            >
              {formatScore(item.economicSuitability)}
            </span>
          )}
        />
        <GridSortColumn
          path="marketSize"
          header="Market"
          width="80px"
          flexGrow={1}
          renderer={({ item }: { item: DrugDiseasePair }) => (
            <span
              style={{
                color: getScoreColor(item.marketSize),
                fontWeight: "bold",
              }}
            >
              {formatScore(item.marketSize)}
            </span>
          )}
        />
        <GridSortColumn
          path="competitiveAdvantage"
          header="Competitive"
          width="110px"
          flexGrow={1}
          renderer={({ item }: { item: DrugDiseasePair }) => (
            <span
              style={{
                color: getScoreColor(item.competitiveAdvantage),
                fontWeight: "bold",
              }}
            >
              {formatScore(item.competitiveAdvantage)}
            </span>
          )}
        />
        <GridSortColumn
          path="regulatoryFeasibility"
          header="Regulatory"
          width="100px"
          flexGrow={1}
          renderer={({ item }: { item: DrugDiseasePair }) => (
            <span
              style={{
                color: getScoreColor(item.regulatoryFeasibility),
                fontWeight: "bold",
              }}
            >
              {formatScore(item.regulatoryFeasibility)}
            </span>
          )}
        />
        <GridSortColumn
          path="clinicalRisk"
          header="Risk"
          width="70px"
          flexGrow={1}
          renderer={({ item }: { item: DrugDiseasePair }) => (
            <span
              style={{
                color: getScoreColor(10 - item.clinicalRisk),
                fontWeight: "bold",
              }}
            >
              {formatScore(item.clinicalRisk)}
            </span>
          )}
        />
      </Grid>
    </div>
  );
};

export default DrugRepurposingTable;
