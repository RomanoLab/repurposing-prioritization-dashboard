import React, { useState, useRef, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Grid } from "@vaadin/react-components/Grid.js";
import { GridColumn } from "@vaadin/react-components/GridColumn.js";
import { GridSortColumn } from "@vaadin/react-components/GridSortColumn.js";
import { TextField } from "@vaadin/react-components/TextField.js";
import DrugStructure from "./DrugStructure";
import type { DrugDiseasePair } from "../types/DrugDiseasePair";

interface DrugRepurposingTableProps {
  data: DrugDiseasePair[];
}

const DrugRepurposingTable: React.FC<DrugRepurposingTableProps> = ({
  data,
}) => {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [drugFilter, setDrugFilter] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("");
  const gridRef = useRef<any>(null);
  const structureContainersRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const structureRootsRef = useRef<Map<string, any>>(new Map());

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
    if (expandedItemId === item.id) {
      setExpandedItemId(null);
    } else {
      setExpandedItemId(item.id);
    }
  };

  useEffect(() => {
    if (gridRef.current) {
      const grid = gridRef.current;

      grid.multiSort = [
        { path: "compositePrioritizationScore", direction: "desc" },
      ];

      grid.rowDetailsRenderer = (root: any, _column: any, model: any) => {
        const item = model.item as DrugDiseasePair;
        if (expandedItemId === item.id) {
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

          headerDiv.appendChild(title);
          headerDiv.appendChild(badge);
          headerDiv.appendChild(identifiersDiv);
          detailsDiv.appendChild(headerDiv);

          // Content container with structure and narrative side by side
          const contentDiv = document.createElement("div");
          contentDiv.style.cssText =
            "display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;";

          // Drug structure container (only if CID is available)
          if (item.pubchemCid) {
            // Get or create persistent structure container
            let structureContainer = structureContainersRef.current.get(
              item.id,
            );
            if (!structureContainer) {
              structureContainer = document.createElement("div");
              structureContainer.style.cssText = "flex-shrink: 0;";
              structureContainersRef.current.set(item.id, structureContainer);

              // Create React root for the new container
              const structureRoot = createRoot(structureContainer);
              structureRootsRef.current.set(item.id, structureRoot);

              // Initial render
              structureRoot.render(
                React.createElement(DrugStructure, {
                  pubchemCid: item.pubchemCid,
                  drugName: item.drugName,
                }),
              );
            }

            // Append the persistent container to the content
            contentDiv.appendChild(structureContainer);
          }

          // Narrative text
          const narrativeDiv = document.createElement("div");
          narrativeDiv.style.cssText = "flex: 1; min-width: 300px;";

          const description = document.createElement("p");
          description.style.cssText =
            "margin: 0; line-height: 1.6; color: #495057; font-size: 14px;";
          description.textContent = item.narrative;

          narrativeDiv.appendChild(description);
          contentDiv.appendChild(narrativeDiv);

          detailsDiv.appendChild(contentDiv);

          root.innerHTML = "";
          root.appendChild(detailsDiv);
        } else {
          root.innerHTML = "";
        }
      };

      grid.detailsOpenedItems = expandedItemId
        ? filteredData.filter((item) => item.id === expandedItemId)
        : [];

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
  }, [expandedItemId, filteredData]);

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "16px",
          alignItems: "center",
          flexWrap: "wrap",
          flex: "0 0 auto",
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
          height: "100%",
          cursor: "pointer",
        }}
        multiSort={true}
      >
        <GridColumn
          width="50px"
          flexGrow={0}
          frozen
          renderer={({ item }: { item: DrugDiseasePair }) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  color: expandedItemId === item.id ? "#1976d2" : "#666",
                  fontWeight: "bold",
                }}
              >
                {expandedItemId === item.id ? "▼" : "▶"}
              </span>
            </div>
          )}
        />
        <GridColumn
          path="drugName"
          header="Drug"
          width="160px"
          flexGrow={2}
          renderer={({ item }: { item: DrugDiseasePair }) => (
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
          renderer={({ item }: { item: DrugDiseasePair }) => {
            const score = item.compositePrioritizationScore;
            const borderColor = getScoreColor(score);
            const backgroundColor =
              score >= 8 ? "#e8f5e8" : score >= 6 ? "#fff3e0" : "#ffebee";
            const textColor =
              score >= 8 ? "#1b5e20" : score >= 6 ? "#e65100" : "#b71c1c";

            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px 12px",
                  backgroundColor,
                  borderRadius: "8px",
                  border: `2px solid ${borderColor}`,
                  margin: "2px 0",
                }}
              >
                <span
                  style={{
                    color: textColor,
                    fontWeight: "bold",
                    fontSize: "16px",
                  }}
                >
                  {formatScore(score)}
                </span>
              </div>
            );
          }}
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
