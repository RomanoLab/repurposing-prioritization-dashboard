import { Router } from "express";
import db from "../db.js";
import type { Knex } from "knex";

const router = Router();

// Allowed sort columns (camelCase from frontend → snake_case in DB)
const SORT_COLUMN_MAP: Record<string, string> = {
  drugName: "drug_name",
  diseaseName: "disease_name",
  compositePrioritizationScore: "weighted_score",
  biologicalSuitability: "biological_suitability",
  unmetMedicalNeed: "unmet_medical_need",
  economicSuitability: "economic_suitability",
  marketSize: "market_size",
  competitiveAdvantage: "competitive_advantage",
  regulatoryFeasibility: "regulatory_feasibility",
  clinicalRisk: "clinical_risk",
};

function buildWeightedScoreExpr(
  knex: Knex,
  weights: Record<string, number>,
): Knex.Raw {
  const w = weights;

  // Numerator: sum of weight * value for non-null scores
  // Clinical risk is inverted: (10 - clinical_risk)
  const numerator = `
    COALESCE(biological_suitability * ?, 0) +
    COALESCE(unmet_medical_need * ?, 0) +
    COALESCE(economic_suitability * ?, 0) +
    COALESCE(market_size * ?, 0) +
    COALESCE(competitive_advantage * ?, 0) +
    COALESCE(regulatory_feasibility * ?, 0) +
    COALESCE((10 - clinical_risk) * ?, 0)
  `;

  // Denominator: sum of weights for non-null scores
  const denominator = `
    (CASE WHEN biological_suitability IS NOT NULL THEN ? ELSE 0 END) +
    (CASE WHEN unmet_medical_need IS NOT NULL THEN ? ELSE 0 END) +
    (CASE WHEN economic_suitability IS NOT NULL THEN ? ELSE 0 END) +
    (CASE WHEN market_size IS NOT NULL THEN ? ELSE 0 END) +
    (CASE WHEN competitive_advantage IS NOT NULL THEN ? ELSE 0 END) +
    (CASE WHEN regulatory_feasibility IS NOT NULL THEN ? ELSE 0 END) +
    (CASE WHEN clinical_risk IS NOT NULL THEN ? ELSE 0 END)
  `;

  // Use NULLIF to avoid division by zero — returns 0 if all weights are 0
  const expr = `COALESCE((${numerator}) / NULLIF(${denominator}, 0), 0)`;

  return knex.raw(expr, [
    // numerator bindings
    w.bio, w.need, w.econ, w.market, w.comp, w.reg, w.risk,
    // denominator bindings
    w.bio, w.need, w.econ, w.market, w.comp, w.reg, w.risk,
  ]);
}

function snakeToCamel(row: Record<string, unknown>): Record<string, unknown> {
  return {
    id: row.id,
    drugName: row.drug_name,
    drugNdcCode: row.drug_ndc_code,
    pubchemCid: row.pubchem_cid ?? undefined,
    diseaseName: row.disease_name,
    diseaseOntologyTerm: row.disease_ontology_term,
    biologicalSuitability: row.biological_suitability ?? undefined,
    unmetMedicalNeed: row.unmet_medical_need ?? undefined,
    economicSuitability: row.economic_suitability ?? undefined,
    marketSize: row.market_size ?? undefined,
    competitiveAdvantage: row.competitive_advantage ?? undefined,
    regulatoryFeasibility: row.regulatory_feasibility ?? undefined,
    clinicalRisk: row.clinical_risk ?? undefined,
    compositePrioritizationScore: row.weighted_score ?? row.composite_prioritization_score,
    narrative: row.narrative ?? null,
  };
}

// GET /api/pairs — paginated list (narrative excluded)
router.get("/", async (req, res) => {
  try {
    const page = Math.max(0, parseInt(req.query.page as string) || 0);
    const pageSize = Math.min(500, Math.max(1, parseInt(req.query.pageSize as string) || 100));
    const sortBy = (req.query.sortBy as string) || "compositePrioritizationScore";
    const sortDir = (req.query.sortDir as string)?.toLowerCase() === "asc" ? "asc" : "desc";
    const drugFilter = (req.query.drugFilter as string) || "";
    const diseaseFilter = (req.query.diseaseFilter as string) || "";

    const weights = {
      bio: parseFloat(req.query.w_bio as string) || 1.0,
      need: parseFloat(req.query.w_need as string) || 1.0,
      econ: parseFloat(req.query.w_econ as string) || 1.0,
      market: parseFloat(req.query.w_market as string) || 1.0,
      comp: parseFloat(req.query.w_comp as string) || 1.0,
      reg: parseFloat(req.query.w_reg as string) || 1.0,
      risk: parseFloat(req.query.w_risk as string) || 1.0,
    };

    // Handle NaN from parseFloat (e.g. w_bio=abc)
    for (const key of Object.keys(weights) as (keyof typeof weights)[]) {
      if (isNaN(weights[key])) weights[key] = 1.0;
    }

    const weightedScoreExpr = buildWeightedScoreExpr(db, weights);

    // Build base query (no narrative for list)
    let query = db("drug_disease_pairs")
      .select(
        "id",
        "drug_name",
        "drug_ndc_code",
        "pubchem_cid",
        "disease_name",
        "disease_ontology_term",
        "biological_suitability",
        "unmet_medical_need",
        "economic_suitability",
        "market_size",
        "competitive_advantage",
        "regulatory_feasibility",
        "clinical_risk",
        db.raw(`${weightedScoreExpr} as weighted_score`),
      );

    // Filters
    if (drugFilter) {
      query = query.whereRaw("LOWER(drug_name) LIKE ?", [`%${drugFilter.toLowerCase()}%`]);
    }
    if (diseaseFilter) {
      query = query.whereRaw("LOWER(disease_name) LIKE ?", [`%${diseaseFilter.toLowerCase()}%`]);
    }

    // Count (with same filters)
    let countQuery = db("drug_disease_pairs");
    if (drugFilter) {
      countQuery = countQuery.whereRaw("LOWER(drug_name) LIKE ?", [`%${drugFilter.toLowerCase()}%`]);
    }
    if (diseaseFilter) {
      countQuery = countQuery.whereRaw("LOWER(disease_name) LIKE ?", [`%${diseaseFilter.toLowerCase()}%`]);
    }
    const [{ count: totalSize }] = await countQuery.count("* as count");

    // Sort
    const dbSortCol = SORT_COLUMN_MAP[sortBy];
    if (dbSortCol === "weighted_score") {
      query = query.orderByRaw(`weighted_score ${sortDir === "asc" ? "ASC" : "DESC"}`);
    } else if (dbSortCol) {
      query = query.orderBy(dbSortCol, sortDir);
    } else {
      query = query.orderByRaw(`weighted_score DESC`);
    }

    // Pagination
    query = query.limit(pageSize).offset(page * pageSize);

    const rows = await query;
    const items = rows.map((row: Record<string, unknown>) => snakeToCamel(row));

    res.json({ items, totalSize: Number(totalSize) });
  } catch (err) {
    console.error("Error fetching pairs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/pairs/:id — single pair with narrative
router.get("/:id", async (req, res) => {
  try {
    const row = await db("drug_disease_pairs").where("id", req.params.id).first();
    if (!row) {
      return res.status(404).json({ error: "Pair not found" });
    }
    const item = snakeToCamel(row);
    // Use stored composite score for single item (no weight recalc needed for detail view)
    item.compositePrioritizationScore = row.composite_prioritization_score;
    res.json(item);
  } catch (err) {
    console.error("Error fetching pair:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
