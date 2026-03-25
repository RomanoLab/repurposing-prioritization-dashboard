import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import db from "../src/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface RawPair {
  id: string;
  drugName: string;
  drugNdcCode: string;
  pubchemCid?: string;
  diseaseName: string;
  diseaseOntologyTerm: string;
  biologicalSuitability?: number;
  unmetMedicalNeed?: number;
  economicSuitability?: number;
  marketSize?: number;
  competitiveAdvantage?: number;
  regulatoryFeasibility?: number;
  clinicalRisk?: number;
  compositePrioritizationScore: number;
  narrative: string;
}

async function importData() {
  const inputPath = process.argv[2] || path.resolve(__dirname, "../../public/output2.json");

  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  console.log(`Reading ${inputPath}...`);
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  const pairs: RawPair[] = raw.drugDiseasePairs || raw;

  console.log(`Found ${pairs.length} records. Importing...`);

  // Clear existing data
  await db("drug_disease_pairs").truncate();

  // Batch insert — use small batches for SQLite compatibility
  const BATCH_SIZE = 50;
  let imported = 0;

  for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
    const batch = pairs.slice(i, i + BATCH_SIZE).map((p) => ({
      id: p.id,
      drug_name: p.drugName,
      drug_ndc_code: p.drugNdcCode,
      pubchem_cid: p.pubchemCid || null,
      disease_name: p.diseaseName,
      disease_ontology_term: p.diseaseOntologyTerm,
      biological_suitability: p.biologicalSuitability ?? null,
      unmet_medical_need: p.unmetMedicalNeed ?? null,
      economic_suitability: p.economicSuitability ?? null,
      market_size: p.marketSize ?? null,
      competitive_advantage: p.competitiveAdvantage ?? null,
      regulatory_feasibility: p.regulatoryFeasibility ?? null,
      clinical_risk: p.clinicalRisk ?? null,
      composite_prioritization_score: p.compositePrioritizationScore,
      narrative: p.narrative,
    }));

    await db("drug_disease_pairs").insert(batch);
    imported += batch.length;

    if (imported % 10000 === 0 || imported === pairs.length) {
      console.log(`  ${imported} / ${pairs.length} imported`);
    }
  }

  console.log("Import complete!");
  await db.destroy();
}

importData().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
