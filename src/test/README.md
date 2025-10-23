# Testing Documentation

## Test Framework

This project uses **Vitest** with React Testing Library for testing.

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run tests with UI
npm run test:ui

# Run tests with coverage (requires @vitest/coverage-v8)
npm run test:coverage
```

## Test Structure

- **`src/test/setup.ts`** - Global test configuration and mocks
- **`*.test.ts(x)`** - Test files colocated with source files

## Known Limitations

### Vaadin Components Testing

Vaadin Grid and other web components use Shadow DOM, which makes traditional RTL queries challenging. Current tests focus on:
- Component rendering
- React state management (filters, data)
- User interactions with form inputs
- Non-shadow DOM elements

For comprehensive Vaadin Grid testing, consider:
- Using Playwright/Cypress for E2E tests
- Testing the filtered data arrays directly
- Mocking Grid components for unit tests

## Test Coverage

Current test files:
- `src/types/DrugDiseasePair.test.ts` - Type validation tests
- `src/components/Dashboard.test.tsx` - Dashboard component tests
- `src/components/DrugRepurposingTable.test.tsx` - Table component tests (limited by Vaadin Shadow DOM)
