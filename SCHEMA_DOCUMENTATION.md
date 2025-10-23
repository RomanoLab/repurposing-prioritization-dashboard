# Drug Repurposing Data Schema Documentation

## Overview

This document describes the JSON Schema used to validate drug-disease pair data for the Drug Repurposing Prioritization Dashboard.

## Schema Location

- **Schema File**: `src/schema/drugRepurposingSchema.json`
- **Validator**: `src/utils/dataValidator.ts`
- **TypeScript Types**: `src/types/DrugDiseasePair.ts`

## Schema Structure

### Root Object

```json
{
  "drugDiseasePairs": [...]
}
```

The root object must contain a `drugDiseasePairs` array.

### Drug-Disease Pair Object

Each item in the `drugDiseasePairs` array must contain the following fields:

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | string | Yes | minLength: 1 | Unique identifier for the drug-disease pair |
| `drugName` | string | Yes | minLength: 1 | Name of the drug candidate |
| `drugNdcCode` | string | Yes | Pattern: `XXXX-XXXX-XX` | National Drug Code (NDC) |
| `diseaseName` | string | Yes | minLength: 1 | Name of the target disease |
| `diseaseOntologyTerm` | string | Yes | Pattern: `PREFIX:NUMBER` | Ontology term (e.g., MONDO:0004975) |
| `biologicalSuitability` | number | Yes | 0-10 | Biological plausibility score |
| `unmetMedicalNeed` | number | Yes | 0-10 | Medical need score |
| `economicSuitability` | number | Yes | 0-10 | Economic feasibility score |
| `marketSize` | number | Yes | 0-10 | Market potential score |
| `competitiveAdvantage` | number | Yes | 0-10 | Competitive advantage score |
| `regulatoryFeasibility` | number | Yes | 0-10 | Regulatory pathway score |
| `clinicalRisk` | number | Yes | 0-10 | Clinical risk score (lower is better) |
| `compositePrioritizationScore` | number | Yes | 0-10 | Overall priority score |
| `narrative` | string | Yes | minLength: 1 | Detailed explanation |

### Field Format Details

#### NDC Code Format
- Pattern: `XXXX(X)-XXX(X)-X(X)` (flexible segment lengths)
- Examples: `0093-1115-01`, `59572-102-00`
- Must follow the standard National Drug Code format with three segments separated by hyphens
- Segment lengths: 4-5 digits, 3-4 digits, 1-2 digits

#### Disease Ontology Term Format
- Pattern: `PREFIX:NUMBER`
- Example: `MONDO:0004975`
- Supports standard ontology identifiers (MONDO, DOID, etc.)

#### Score Ranges
All numeric scores must be between 0 and 10 (inclusive):
- **0-10 scale**: Standard scoring across all metrics
- **Clinical Risk**: Note that lower values indicate lower risk (better)

## Validation

### Automatic Validation

The dashboard automatically validates all loaded data against the schema. If validation fails:

1. The data will not be displayed
2. An error message will be shown to the user
3. Detailed errors will be logged to the browser console

### Manual Validation

You can manually validate data using the validator utility:

```typescript
import { validateDrugRepurposingData } from './utils/dataValidator';

const result = validateDrugRepurposingData(yourData);

if (result.valid) {
  console.log('Data is valid!');
  const validData = result.data;
} else {
  console.error('Validation errors:', result.errors);
}
```

### Error Messages

The validator provides detailed error information:

```typescript
{
  valid: false,
  errors: [
    {
      path: "/drugDiseasePairs/0",
      message: "Missing required field: drugNdcCode",
      keyword: "required",
      params: { missingProperty: "drugNdcCode" }
    }
  ]
}
```

## Example Valid Data

```json
{
  "drugDiseasePairs": [
    {
      "id": "1",
      "drugName": "Metformin",
      "drugNdcCode": "0093-1115-01",
      "diseaseName": "Alzheimer's Disease",
      "diseaseOntologyTerm": "MONDO:0004975",
      "biologicalSuitability": 7.2,
      "unmetMedicalNeed": 9.1,
      "economicSuitability": 6.8,
      "marketSize": 8.5,
      "competitiveAdvantage": 5.9,
      "regulatoryFeasibility": 7.3,
      "clinicalRisk": 4.2,
      "compositePrioritizationScore": 7.1,
      "narrative": "Metformin shows promising neuroprotective effects..."
    }
  ]
}
```

## Common Validation Errors

### 1. Missing Required Fields
**Error**: `Missing required field: drugNdcCode`
**Fix**: Ensure all required fields are present in each drug-disease pair

### 2. Invalid Score Range
**Error**: `Value must be <= 10`
**Fix**: Ensure all numeric scores are between 0 and 10

### 3. Invalid NDC Format
**Error**: `Value does not match required pattern: ^[0-9]{4,5}-[0-9]{3,4}-[0-9]{1,2}$`
**Fix**: Use the NDC format with three segments (e.g., `0093-1115-01` or `59572-102-00`)

### 4. Invalid Ontology Term
**Error**: `Value does not match required pattern: ^[A-Z]+:[0-9]+$`
**Fix**: Use the format `PREFIX:NUMBER` (e.g., `MONDO:0004975`)

### 5. Additional Properties
**Error**: `Unexpected property: extraField`
**Fix**: Remove any fields not defined in the schema

## Testing

A test file is provided at `src/utils/dataValidator.test.ts` that demonstrates:
- Valid data examples
- Various invalid data scenarios
- Error reporting functionality

Review this file to understand validation behavior and test cases.

## Integration

The validator is integrated into the Dashboard component:

1. Data is fetched from `/sample-data.json`
2. Data is validated against the schema
3. If valid, data is displayed in the dashboard
4. If invalid, an error message is shown

This ensures that only valid, properly formatted data is displayed to users.

## Schema Version

- **JSON Schema Version**: Draft 07
- **Schema ID**: `https://example.com/drug-repurposing-schema.json`

## Future Enhancements

Potential schema improvements:
- Add more specific patterns for drug names
- Add ontology prefix validation (e.g., only allow specific prefixes)
- Add cross-field validation (e.g., composite score should relate to component scores)
- Add support for optional metadata fields
- Version the schema for backward compatibility
