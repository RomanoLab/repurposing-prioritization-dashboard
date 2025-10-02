# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Drug Repurposing Prioritization Dashboard - A React-based web application for analyzing and prioritizing drug-disease pairs for repurposing opportunities. The dashboard displays interactive tables with multiple scoring metrics to help identify promising candidates for drug repurposing.

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Vaadin React Components (Grid, TextField)
- **Data Format**: JSON (with planned support for Arrow/Parquet)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production (compiles TypeScript and bundles with Vite)
npm run build

# Preview production build
npm run preview

# Run tests (watch mode)
npm test

# Run tests once (CI mode)
npm test -- --run

# Run tests with UI
npm run test:ui
```

## Architecture

### Component Structure

The application follows a simple hierarchical component architecture:

1. **App.tsx** - Root component that renders the Dashboard
2. **Dashboard.tsx** - Main container component that:
   - Fetches data from `/sample-data.json` on mount
   - Manages loading and error states
   - Renders header with logo and scoring guide
   - Passes data to DrugRepurposingTable
3. **DrugRepurposingTable.tsx** - Complex data table component that:
   - Uses Vaadin Grid with sortable columns
   - Implements row expansion for detailed narratives
   - Provides search/filter functionality for drugs and diseases
   - Renders custom score visualizations with color-coded values

### Data Model

**DrugDiseasePair** (core data structure in `src/types/DrugDiseasePair.ts`):
- Drug identifiers: `drugName`, `drugNdcCode`
- Disease identifiers: `diseaseName`, `diseaseOntologyTerm`
- Scoring metrics (0-10 scale):
  - `biologicalSuitability` - Biological mechanism fit
  - `unmetMedicalNeed` - Medical need for treatment
  - `economicSuitability` - Economic viability
  - `marketSize` - Potential market size
  - `competitiveAdvantage` - Competitive positioning
  - `regulatoryFeasibility` - Regulatory pathway clarity
  - `clinicalRisk` - Risk level (inverted: lower is better)
  - `compositePrioritizationScore` - Weighted composite score
- `narrative` - Detailed analysis text for expanded view

### Key Implementation Details

**Vaadin Grid Integration**:
- The table uses Vaadin's web components with React wrappers
- Row expansion is implemented via `rowDetailsRenderer` and `detailsOpenedItems`
- Sorting is enabled through `GridSortColumn` components with default sort by `compositePrioritizationScore` descending
- Custom renderers handle score formatting, color coding, and search highlighting

**Score Color Coding**:
- Green (#4CAF50): High scores (≥8.0)
- Orange (#FF9800): Medium scores (6.0-7.9)
- Red (#F44336): Low scores (<6.0)
- Clinical Risk uses inverted color logic (lower scores are better)

**Data Loading**:
- Dashboard fetches from `/public/sample-data.json` on mount
- Future implementation will support Arrow/Parquet formats for larger datasets
- Data structure is typed via `DrugRepurposingData` interface

## TypeScript Configuration

- Strict mode enabled with comprehensive linting rules
- Target: ES2022 with DOM libraries
- JSX: react-jsx transform
- Module resolution: bundler mode (Vite-specific)

## Testing

**Framework**: Vitest with React Testing Library

**Test Files**:
- `src/App.test.tsx` - App component tests
- `src/components/Dashboard.test.tsx` - Dashboard component tests
- `src/components/DrugRepurposingTable.test.tsx` - Table component tests
- `src/types/DrugDiseasePair.test.ts` - Type validation tests

**Test Setup** (`src/test/setup.ts`):
- Mocks `fetch` API globally
- Mocks `ResizeObserver` for Vaadin components
- Auto-cleanup after each test

**Important**: Vaadin Grid uses Shadow DOM which limits testing capabilities. Tests focus on React state management and non-shadow DOM elements. For comprehensive Grid testing, use E2E tools like Playwright.

See `TESTING.md` for detailed testing documentation.
