/**
 * Test file demonstrating data validation
 * Run this with: node --loader ts-node/esm dataValidator.test.ts
 * Or just review the test cases to understand validation behavior
 */

import { validateDrugRepurposingData, dataValidator } from "./dataValidator";

// Valid data example
const validData = {
  drugDiseasePairs: [
    {
      id: "1",
      drugName: "Metformin",
      drugNdcCode: "0093-1115-01",
      diseaseName: "Alzheimer's Disease",
      diseaseOntologyTerm: "MONDO:0004975",
      biologicalSuitability: 7.2,
      unmetMedicalNeed: 9.1,
      economicSuitability: 6.8,
      marketSize: 8.5,
      competitiveAdvantage: 5.9,
      regulatoryFeasibility: 7.3,
      clinicalRisk: 4.2,
      compositePrioritizationScore: 7.1,
      narrative: "Metformin shows promising neuroprotective effects.",
    },
  ],
};

// Invalid data examples
const invalidDataExamples = {
  missingRequiredField: {
    drugDiseasePairs: [
      {
        id: "1",
        drugName: "Test Drug",
        // Missing drugNdcCode
        diseaseName: "Test Disease",
        diseaseOntologyTerm: "MONDO:0000001",
        biologicalSuitability: 7.0,
        unmetMedicalNeed: 8.0,
        economicSuitability: 6.0,
        marketSize: 7.5,
        competitiveAdvantage: 6.5,
        regulatoryFeasibility: 7.0,
        clinicalRisk: 4.0,
        compositePrioritizationScore: 7.0,
        narrative: "Test narrative",
      },
    ],
  },
  invalidScoreRange: {
    drugDiseasePairs: [
      {
        id: "1",
        drugName: "Test Drug",
        drugNdcCode: "0093-1115-01",
        diseaseName: "Test Disease",
        diseaseOntologyTerm: "MONDO:0000001",
        biologicalSuitability: 15.0, // Invalid: exceeds maximum of 10
        unmetMedicalNeed: 8.0,
        economicSuitability: 6.0,
        marketSize: 7.5,
        competitiveAdvantage: 6.5,
        regulatoryFeasibility: 7.0,
        clinicalRisk: 4.0,
        compositePrioritizationScore: 7.0,
        narrative: "Test narrative",
      },
    ],
  },
  invalidNdcFormat: {
    drugDiseasePairs: [
      {
        id: "1",
        drugName: "Test Drug",
        drugNdcCode: "INVALID-NDC", // Invalid format
        diseaseName: "Test Disease",
        diseaseOntologyTerm: "MONDO:0000001",
        biologicalSuitability: 7.0,
        unmetMedicalNeed: 8.0,
        economicSuitability: 6.0,
        marketSize: 7.5,
        competitiveAdvantage: 6.5,
        regulatoryFeasibility: 7.0,
        clinicalRisk: 4.0,
        compositePrioritizationScore: 7.0,
        narrative: "Test narrative",
      },
    ],
  },
  invalidOntologyTerm: {
    drugDiseasePairs: [
      {
        id: "1",
        drugName: "Test Drug",
        drugNdcCode: "0093-1115-01",
        diseaseName: "Test Disease",
        diseaseOntologyTerm: "invalid", // Invalid format (should be PREFIX:NUMBER)
        biologicalSuitability: 7.0,
        unmetMedicalNeed: 8.0,
        economicSuitability: 6.0,
        marketSize: 7.5,
        competitiveAdvantage: 6.5,
        regulatoryFeasibility: 7.0,
        clinicalRisk: 4.0,
        compositePrioritizationScore: 7.0,
        narrative: "Test narrative",
      },
    ],
  },
  additionalProperty: {
    drugDiseasePairs: [
      {
        id: "1",
        drugName: "Test Drug",
        drugNdcCode: "0093-1115-01",
        diseaseName: "Test Disease",
        diseaseOntologyTerm: "MONDO:0000001",
        biologicalSuitability: 7.0,
        unmetMedicalNeed: 8.0,
        economicSuitability: 6.0,
        marketSize: 7.5,
        competitiveAdvantage: 6.5,
        regulatoryFeasibility: 7.0,
        clinicalRisk: 4.0,
        compositePrioritizationScore: 7.0,
        narrative: "Test narrative",
        extraField: "This should not be here", // Additional property not allowed
      },
    ],
  },
};

console.log("=== Testing Data Validator ===\n");

// Test valid data
console.log("1. Testing VALID data:");
const validResult = validateDrugRepurposingData(validData);
console.log(`   Valid: ${validResult.valid}`);
console.log(`   Errors: ${validResult.errors.length}\n`);

// Test invalid data
Object.entries(invalidDataExamples).forEach(([testName, testData], index) => {
  console.log(`${index + 2}. Testing INVALID data (${testName}):`);
  const result = validateDrugRepurposingData(testData);
  console.log(`   Valid: ${result.valid}`);
  console.log(`   Errors: ${result.errors.length}`);
  if (result.errors.length > 0) {
    result.errors.forEach((error) => {
      console.log(`   - ${error.path}: ${error.message}`);
    });
  }
  console.log();
});

console.log("\n=== Error Report Example ===\n");
const invalidResult = validateDrugRepurposingData(
  invalidDataExamples.missingRequiredField
);
console.log(dataValidator.generateErrorReport(invalidResult.errors));
