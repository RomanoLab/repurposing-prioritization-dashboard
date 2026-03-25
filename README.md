# Drug Repurposing Prioritization Dashboard

A React-based web application for analyzing and prioritizing drug-disease pairs for repurposing opportunities. The dashboard displays interactive tables with multiple scoring metrics to help identify promising candidates for drug repurposing.

Created and maintained by the [Center for Cytokine Storm Treatment and Laboratory](https://www.med.upenn.edu/CSTL/) and the [Romano Lab](https://romanolab.org) at the University of Pennsylvania's Perelman School of Medicine. Funded by a research grant awarded by Arnold Ventures.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Vaadin React Components (Grid, TextField)
- **Backend** (optional): Express, Knex.js
- **Database** (optional): SQLite (via better-sqlite3) or MySQL/MariaDB
- **Testing**: Vitest, React Testing Library

## Quick Start

```bash
npm install
npm run dev
```

This starts the dashboard in **file mode** (default), loading data directly from `public/output2.json`. No database or backend server required.

## Data Source Configuration

The dashboard supports two data source modes, controlled by the `VITE_DATA_SOURCE` environment variable.

### File Mode (default)

Loads all data from a static JSON file into the browser. Sorting, filtering, and weight recalculation happen client-side. Best for smaller datasets or static deployments without a backend.

```bash
npm run dev
# or explicitly:
VITE_DATA_SOURCE=file npm run dev
```

### API Mode

Uses a backend server with database support for server-side pagination, sorting, filtering, and weight computation via Vaadin Grid's lazy-loading `dataProvider`. Best for large or dynamic datasets.

```bash
# 1. Install server dependencies
cd server && npm install && cd ..

# 2. Run database migration
npm run db:migrate

# 3. Import data from JSON into the database
npm run db:import

# 4. Start in API mode
VITE_DATA_SOURCE=api npm run dev
```

Or create a `.env` file in the project root:

```
VITE_DATA_SOURCE=api
```

`npm run dev` in API mode starts both the Vite dev server and the Express backend concurrently. The Vite dev server proxies `/api` requests to the backend.

### Database Configuration

By default, the backend uses SQLite (stored at `server/data.db`). To use MySQL/MariaDB, create `server/.env`:

```
DB_CLIENT=mysql2
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=repurposing_dashboard
```

Then run the migration and import as usual:

```bash
npm run db:migrate
npm run db:import
```

## Development Commands

```bash
# Start development server (file mode by default)
npm run dev

# Start only the frontend dev server
npm run dev:frontend

# Start only the backend server
npm run dev:server

# Build frontend for production
npm run build

# Build backend for production
npm run build:server

# Start production server (serves built frontend + API)
npm start

# Preview production frontend build
npm run preview

# Database management
npm run db:migrate       # Run database migrations
npm run db:import        # Import data from public/output2.json into the database
```

## Project Structure

```
├── public/                         # Static assets and data files
│   ├── output2.json                # Main dataset (drug-disease pairs)
│   ├── sample-data.json            # Sample dataset for demos
│   ├── scoreConfig.json            # UI configuration for score columns
│   └── faqs.json                   # FAQ content
├── src/
│   ├── api/
│   │   └── pairsApi.ts             # Fetch wrappers for /api/pairs (API mode)
│   ├── components/
│   │   ├── Dashboard.tsx           # Main container: config loading, weight state
│   │   ├── DrugRepurposingTable.tsx # Data table with dual-mode support
│   │   ├── AdvancedOptions.tsx     # Weight slider controls
│   │   ├── DrugStructure.tsx       # Drug structure visualization
│   │   ├── AboutModal.tsx          # About dialog
│   │   └── FAQModal.tsx            # FAQ modal
│   ├── hooks/
│   │   └── useDebouncedValue.ts    # Debounce hook for filters/weights
│   ├── types/
│   │   ├── DrugDiseasePair.ts      # Core data type
│   │   └── ScoreConfig.ts          # UI configuration types
│   ├── utils/
│   │   ├── priorityCalculation.ts  # Weighted score calculation
│   │   └── dataValidator.ts        # AJV-based JSON schema validation
│   ├── schema/
│   │   └── drugRepurposingSchema.json
│   └── test/
│       └── setup.ts                # Test configuration and mocks
├── server/                         # Backend (optional, for API mode)
│   ├── src/
│   │   ├── index.ts                # Express entry point
│   │   ├── config.ts               # Database configuration
│   │   ├── db.ts                   # Knex singleton
│   │   └── routes/
│   │       └── pairs.ts            # GET /api/pairs, GET /api/pairs/:id
│   ├── migrations/
│   │   └── 001_create_drug_disease_pairs.ts
│   └── scripts/
│       ├── migrate.ts              # Migration runner
│       └── import-data.ts          # JSON-to-database import
├── vite.config.ts                  # Vite config with API proxy
├── vitest.config.ts                # Test config
└── package.json
```

## Data Model

Each drug-disease pair contains:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `drugName` | string | Yes | Name of the drug candidate |
| `drugNdcCode` | string | Yes | National Drug Code (format: `XXXX-XXX-XX`) |
| `pubchemCid` | string | No | PubChem Compound ID |
| `diseaseName` | string | Yes | Name of the target disease |
| `diseaseOntologyTerm` | string | Yes | Ontology term (format: `PREFIX:NUMBER`, e.g., `MONDO:0004975`) |
| `biologicalSuitability` | number | No | Biological plausibility score (0-10) |
| `unmetMedicalNeed` | number | No | Medical need score (0-10) |
| `economicSuitability` | number | No | Economic feasibility score (0-10) |
| `marketSize` | number | No | Market potential score (0-10) |
| `competitiveAdvantage` | number | No | Competitive advantage score (0-10) |
| `regulatoryFeasibility` | number | No | Regulatory pathway score (0-10) |
| `clinicalRisk` | number | No | Clinical risk score (0-10, lower is better) |
| `compositePrioritizationScore` | number | Yes | Weighted composite priority score (0-10) |
| `narrative` | string | Yes | Detailed analysis text |

### Score Color Coding

- **Green** (#4CAF50): High scores (>= 8.0)
- **Orange** (#FF9800): Medium scores (6.0-7.9)
- **Red** (#F44336): Low scores (< 6.0)
- **Clinical Risk** uses inverted logic (lower scores are better)

### Weight System

Users can adjust weights (0.0-1.0) for each score component via sliders in the Advanced Options panel. The composite priority score is recalculated as:

```
compositePrioritizationScore = sum(weight_i * score_i) / sum(weight_i)
```

where `clinicalRisk` is inverted (`10 - clinicalRisk`) before weighting, and only non-null scores are included.

In file mode, this calculation runs client-side. In API mode, it runs as a SQL expression on the server.

## Data Validation

In file mode, data is validated against a JSON Schema (Draft 07) on load using AJV. The schema is defined in `src/schema/drugRepurposingSchema.json` and enforces:

- All required fields are present
- Scores are in the 0-10 range
- NDC codes match the pattern `^[0-9]{4,5}-[0-9]{3,4}-[0-9]{1,2}$`
- Ontology terms match the pattern `^[A-Z]+:[0-9]+$`
- No unexpected properties

You can validate data programmatically:

```typescript
import { validateDrugRepurposingData } from './utils/dataValidator';

const result = validateDrugRepurposingData(yourData);
if (result.valid) {
  const validData = result.data;
} else {
  console.error('Validation errors:', result.errors);
}
```

In API mode, the database schema enforces validity at import time, so runtime validation is not needed.

## API Reference (API Mode)

### `GET /api/pairs`

Paginated list of drug-disease pairs. Narrative is excluded to reduce payload size.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 0 | Zero-indexed page number |
| `pageSize` | int | 100 | Rows per page (max 500) |
| `sortBy` | string | `compositePrioritizationScore` | Column to sort by (camelCase) |
| `sortDir` | string | `desc` | Sort direction (`asc` or `desc`) |
| `drugFilter` | string | `""` | Substring filter on drug name |
| `diseaseFilter` | string | `""` | Substring filter on disease name |
| `w_bio` | float | 1.0 | Weight for biologicalSuitability |
| `w_need` | float | 1.0 | Weight for unmetMedicalNeed |
| `w_econ` | float | 1.0 | Weight for economicSuitability |
| `w_market` | float | 1.0 | Weight for marketSize |
| `w_comp` | float | 1.0 | Weight for competitiveAdvantage |
| `w_reg` | float | 1.0 | Weight for regulatoryFeasibility |
| `w_risk` | float | 1.0 | Weight for clinicalRisk |

Response:

```json
{
  "items": [ { "id": "...", "drugName": "...", ... , "narrative": null } ],
  "totalSize": 10000
}
```

### `GET /api/pairs/:id`

Single drug-disease pair with full narrative text.

## Testing

### Running Tests

```bash
npm test              # Watch mode
npm test -- --run     # Single run (CI)
npm run test:ui       # Interactive UI
npm run test:coverage # Coverage report (requires @vitest/coverage-v8)
```

### Test Files

| File | Coverage |
|------|----------|
| `src/App.test.tsx` | App component rendering |
| `src/components/Dashboard.test.tsx` | Loading states, config fetching, error handling |
| `src/components/DrugRepurposingTable.test.tsx` | File mode and API mode rendering |
| `src/types/DrugDiseasePair.test.ts` | Type structure validation |
| `src/utils/priorityCalculation.test.ts` | Weighted score calculation |

### Known Limitations

Vaadin Grid uses Shadow DOM, which limits what React Testing Library can query. Tests focus on React state management and non-shadow-DOM elements. For comprehensive Grid interaction testing, use E2E tools like Playwright or Cypress.

## Production Deployment

```bash
# Build frontend
npm run build

# Build server (if using API mode)
npm run build:server

# Start production server (serves built frontend + API)
npm start
```

The Express server serves both the Vite-built static files from `dist/` and the `/api` routes. No separate reverse proxy is required for simple deployments.

## License

See repository for license information.
