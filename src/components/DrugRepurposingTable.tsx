import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Grid } from "@vaadin/react-components/Grid.js";
import { GridColumn } from "@vaadin/react-components/GridColumn.js";
import { GridSortColumn } from "@vaadin/react-components/GridSortColumn.js";
import { TextField } from "@vaadin/react-components/TextField.js";
import DrugStructure from "./DrugStructure";
import { fetchPairs, fetchPairDetail } from "../api/pairsApi";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { DrugDiseasePair } from "../types/DrugDiseasePair";
import type { ComponentWeights } from "./AdvancedOptions";
import type { ScoreConfig } from "../types/ScoreConfig";
import schema from "../schema/drugRepurposingSchema.json";

interface DrugRepurposingTableProps {
  weights: ComponentWeights;
  scoreConfig: ScoreConfig;
  /** When provided, uses client-side filtering/sorting (file mode).
   *  When undefined, uses server-side dataProvider (API mode). */
  data?: DrugDiseasePair[];
}

const DrugRepurposingTable: React.FC<DrugRepurposingTableProps> = ({
  weights,
  scoreConfig,
  data,
}) => {
  const isFileMode = data !== undefined;

  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [expandedNarrative, setExpandedNarrative] = useState<string | null>(null);
  const [drugFilter, setDrugFilter] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("");
  const [showColumnInfo, setShowColumnInfo] = useState(false);
  const [totalSize, setTotalSize] = useState<number | null>(null);
  const gridRef = useRef<any>(null);
  const structureContainersRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const structureRootsRef = useRef<Map<string, any>>(new Map());
  const dataProviderSetRef = useRef(false);

  // Refs for dataProvider closure (API mode only)
  const weightsRef = useRef(weights);
  const drugFilterRef = useRef("");
  const diseaseFilterRef = useRef("");

  // Debounce filters and weights for API mode
  const debouncedDrugFilter = useDebouncedValue(drugFilter, isFileMode ? 0 : 300);
  const debouncedDiseaseFilter = useDebouncedValue(diseaseFilter, isFileMode ? 0 : 300);
  const debouncedWeights = useDebouncedValue(weights, isFileMode ? 0 : 300);

  // Get schema descriptions
  const properties = schema.definitions.drugDiseasePair.properties;

  // --- File mode: client-side filtering ---
  const filteredData = useMemo(() => {
    if (!isFileMode) return [];
    return data.filter((item) => {
      const drugMatch = item.drugName
        .toLowerCase()
        .includes(drugFilter.toLowerCase());
      const diseaseMatch = item.diseaseName
        .toLowerCase()
        .includes(diseaseFilter.toLowerCase());
      return drugMatch && diseaseMatch;
    });
  }, [data, drugFilter, diseaseFilter, isFileMode]);

  // --- API mode: keep refs in sync and set up dataProvider ---
  useEffect(() => { weightsRef.current = debouncedWeights; }, [debouncedWeights]);
  useEffect(() => { drugFilterRef.current = debouncedDrugFilter; }, [debouncedDrugFilter]);
  useEffect(() => { diseaseFilterRef.current = debouncedDiseaseFilter; }, [debouncedDiseaseFilter]);

  useEffect(() => {
    if (isFileMode) return;
    const grid = gridRef.current;
    if (!grid || dataProviderSetRef.current) return;
    dataProviderSetRef.current = true;

    grid.dataProvider = (
      params: { page: number; pageSize: number; sortOrders?: Array<{ path: string; direction: string }> },
      callback: (items: DrugDiseasePair[], totalSize: number) => void,
    ) => {
      const sortOrder = params.sortOrders?.[0];
      fetchPairs({
        page: params.page,
        pageSize: params.pageSize,
        sortBy: sortOrder?.path || "compositePrioritizationScore",
        sortDir: (sortOrder?.direction?.toLowerCase() === "asc" ? "asc" : "desc") as "asc" | "desc",
        drugFilter: drugFilterRef.current,
        diseaseFilter: diseaseFilterRef.current,
        weights: weightsRef.current,
      }).then(({ items, totalSize: total }) => {
        setTotalSize(total);
        callback(items, total);
      }).catch((err) => {
        console.error("Data provider error:", err);
        callback([], 0);
      });
    };
  }, [isFileMode]);

  // Set default sort
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    grid.multiSort = [
      { path: "compositePrioritizationScore", direction: "desc" },
    ];
  }, []);

  // API mode: clear cache when debounced inputs change
  useEffect(() => {
    if (isFileMode) return;
    if (dataProviderSetRef.current && gridRef.current) {
      gridRef.current.clearCache();
    }
  }, [debouncedDrugFilter, debouncedDiseaseFilter, debouncedWeights, isFileMode]);

  const toggleExpanded = useCallback(async (item: DrugDiseasePair) => {
    if (expandedItemId === item.id) {
      setExpandedItemId(null);
      setExpandedNarrative(null);
    } else {
      setExpandedItemId(item.id);
      if (isFileMode) {
        // In file mode, narrative is already in the item
        setExpandedNarrative(item.narrative);
      } else {
        // In API mode, fetch narrative on demand
        setExpandedNarrative(null);
        try {
          const detail = await fetchPairDetail(item.id);
          setExpandedNarrative(detail.narrative);
        } catch (err) {
          console.error("Failed to fetch narrative:", err);
          setExpandedNarrative("Failed to load narrative.");
        }
      }
    }
  }, [expandedItemId, isFileMode]);

  // Row details renderer
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

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
        title.textContent = `${capitalizeDrugName(item.drugName)} for ${item.diseaseName}`;

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

        const contentDiv = document.createElement("div");
        contentDiv.style.cssText =
          "display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;";

        if (item.pubchemCid) {
          let structureContainer = structureContainersRef.current.get(item.id);
          if (!structureContainer) {
            structureContainer = document.createElement("div");
            structureContainer.style.cssText = "flex-shrink: 0;";
            structureContainersRef.current.set(item.id, structureContainer);

            const structureRoot = createRoot(structureContainer);
            structureRootsRef.current.set(item.id, structureRoot);

            structureRoot.render(
              React.createElement(DrugStructure, {
                pubchemCid: item.pubchemCid,
                drugName: capitalizeDrugName(item.drugName),
              }),
            );
          }
          contentDiv.appendChild(structureContainer);
        }

        const narrativeDiv = document.createElement("div");
        narrativeDiv.style.cssText = "flex: 1; min-width: 300px;";

        const description = document.createElement("p");
        description.style.cssText =
          "margin: 0; line-height: 1.6; color: #495057; font-size: 14px; white-space: pre-wrap;";
        description.textContent = expandedNarrative || "Loading narrative...";

        narrativeDiv.appendChild(description);
        contentDiv.appendChild(narrativeDiv);

        detailsDiv.appendChild(contentDiv);

        root.innerHTML = "";
        root.appendChild(detailsDiv);
      } else {
        root.innerHTML = "";
      }
    };

    if (expandedItemId) {
      if (isFileMode) {
        grid.detailsOpenedItems = filteredData.filter(
          (item) => item.id === expandedItemId,
        );
      } else {
        grid.itemIdPath = "id";
        grid.detailsOpenedItems = [{ id: expandedItemId }];
      }
    } else {
      grid.detailsOpenedItems = [];
    }
  }, [expandedItemId, expandedNarrative, isFileMode, filteredData]);

  // Active item click handler
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handler = (e: any) => {
      const item = e.detail.value as DrugDiseasePair;
      if (item) {
        toggleExpanded(item);
        setTimeout(() => {
          grid.activeItem = null;
        }, 100);
      }
    };

    grid.addEventListener("active-item-changed", handler);
    return () => grid.removeEventListener("active-item-changed", handler);
  }, [toggleExpanded]);

  // Add tooltips to column headers
  useEffect(() => {
    if (!gridRef.current) return;
    const grid = gridRef.current;

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
  }, []);

  const capitalizeDrugName = (name: string) => {
    const words = name.split(/\s+/);
    if (words.length === 0) return name;
    words[0] =
      words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
    return words.join(" ");
  };

  const formatScore = (value: number | undefined) => {
    if (value === undefined || value === null) return "N/A";
    return value.toFixed(1);
  };

  const getScoreColor = (value: number | undefined) => {
    if (value === undefined || value === null) return "#999";
    if (value >= 8) return "#4CAF50";
    if (value >= 6) return "#FF9800";
    return "#F44336";
  };

  const clearFilters = () => {
    setDrugFilter("");
    setDiseaseFilter("");
  };

  // Compute display count
  const displayCount = isFileMode
    ? `Total drug-disease pairs: ${filteredData.length.toLocaleString()}`
    : totalSize !== null
      ? `Total drug-disease pairs: ${totalSize.toLocaleString()}`
      : "Loading...";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Column Descriptions Info Panel */}
      <div
        style={{
          marginBottom: "12px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <button
          onClick={() => setShowColumnInfo(!showColumnInfo)}
          style={{
            width: "100%",
            padding: "10px 16px",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#333",
          }}
        >
          <span style={{ fontSize: "12px" }}>{showColumnInfo ? "▼" : "▶"}</span>
          Column Descriptions
        </button>
        {showColumnInfo && (
          <div
            style={{
              padding: "0 16px 16px 16px",
              fontSize: "13px",
              lineHeight: "1.6",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "8px 16px",
              }}
            >
              <strong>Drug:</strong>
              <span>{properties.drugName.description}</span>

              <strong>Disease:</strong>
              <span>{properties.diseaseName.description}</span>

              <strong>Priority:</strong>
              <span>{properties.compositePrioritizationScore.description}</span>

              {scoreConfig.scoreColumns.map((col) => (
                <React.Fragment key={col.key}>
                  <strong>{col.displayName}:</strong>
                  <span>{col.description}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

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
          {displayCount}
        </div>
      </div>

      <Grid
        ref={gridRef}
        {...(isFileMode ? { items: filteredData } : {})}
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
          renderer={({ item }: { item: DrugDiseasePair }) => {
            const capitalizedName = capitalizeDrugName(item.drugName);
            return (
              <div>
                <div>
                  {drugFilter ? (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: capitalizedName.replace(
                          new RegExp(`(${drugFilter})`, "gi"),
                          '<mark style="background-color: #ffeb3b; padding: 1px 2px; border-radius: 2px;">$1</mark>',
                        ),
                      }}
                    />
                  ) : (
                    capitalizedName
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
            );
          }}
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
        {scoreConfig.scoreColumns.map((col) => (
          <GridSortColumn
            key={col.key}
            path={col.key}
            header={col.displayName}
            width={col.width}
            flexGrow={col.flexGrow}
            renderer={({ item }: { item: DrugDiseasePair }) => {
              const value = item[col.key];
              const displayValue =
                value !== undefined && value !== null
                  ? col.isInverted
                    ? 10 - value
                    : value
                  : undefined;

              return (
                <span
                  style={{
                    color: getScoreColor(displayValue),
                    fontWeight: "bold",
                  }}
                >
                  {formatScore(value)}
                </span>
              );
            }}
          />
        ))}
      </Grid>
    </div>
  );
};

export default DrugRepurposingTable;
