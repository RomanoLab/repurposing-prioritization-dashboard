import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("drug_disease_pairs", (table) => {
    table.string("id", 64).primary();
    table.string("drug_name", 255).notNullable();
    table.string("drug_ndc_code", 64).notNullable();
    table.string("pubchem_cid", 32).nullable();
    table.string("disease_name", 512).notNullable();
    table.string("disease_ontology_term", 128).notNullable();
    table.decimal("biological_suitability", 4, 2).nullable();
    table.decimal("unmet_medical_need", 4, 2).nullable();
    table.decimal("economic_suitability", 4, 2).nullable();
    table.decimal("market_size", 4, 2).nullable();
    table.decimal("competitive_advantage", 4, 2).nullable();
    table.decimal("regulatory_feasibility", 4, 2).nullable();
    table.decimal("clinical_risk", 4, 2).nullable();
    table.decimal("composite_prioritization_score", 5, 3).notNullable();
    table.text("narrative").notNullable();

    table.index("drug_name", "idx_drug_name");
    table.index("disease_name", "idx_disease_name");
    table.index("composite_prioritization_score", "idx_composite_score");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("drug_disease_pairs");
}
