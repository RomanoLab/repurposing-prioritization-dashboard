import React, { useState, useEffect } from "react";

interface DrugStructureProps {
  pubchemCid: string;
  drugName: string;
}

/**
 * Component to lazily load and display drug structure from PubChem
 * Uses PubChem's REST API to fetch structure images
 */
const DrugStructure: React.FC<DrugStructureProps> = ({
  pubchemCid,
  drugName,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // PubChem structure image URL
  // Using 2D structure image with reasonable size
  const imageUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${pubchemCid}/PNG?image_size=300x300`;

  useEffect(() => {
    // Reset states when CID changes
    setImageLoaded(false);
    setImageError(false);
  }, [pubchemCid]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        border: "1px solid #ddd",
        minWidth: "320px",
        maxWidth: "320px",
      }}
    >
      <h5
        style={{
          margin: "0 0 12px 0",
          color: "#333",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        Chemical Structure
      </h5>

      {!imageLoaded && !imageError && (
        <div
          style={{
            width: "300px",
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              color: "#666",
            }}
          >
            Loading structure...
          </div>
        </div>
      )}

      {imageError && (
        <div
          style={{
            width: "300px",
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fafafa",
            borderRadius: "4px",
            border: "1px dashed #ccc",
          }}
        >
          <div
            style={{
              textAlign: "center",
              color: "#999",
              fontSize: "13px",
              padding: "20px",
            }}
          >
            Structure not available
          </div>
        </div>
      )}

      <img
        src={imageUrl}
        alt={`Chemical structure of ${drugName}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          display: imageLoaded ? "block" : "none",
          maxWidth: "300px",
          maxHeight: "300px",
          borderRadius: "4px",
          backgroundColor: "white",
          border: "1px solid #e0e0e0",
        }}
      />

      <div
        style={{
          marginTop: "8px",
          fontSize: "12px",
          color: "#666",
          textAlign: "center",
        }}
      >
        <a
          href={`https://pubchem.ncbi.nlm.nih.gov/compound/${pubchemCid}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#1976d2",
            textDecoration: "none",
          }}
        >
          View in PubChem
        </a>
        {" • "}
        CID: {pubchemCid}
      </div>
    </div>
  );
};

export default DrugStructure;
