# Testing Framework

## Overview

This project uses a modern testing setup with **Vitest** and **React Testing Library**.

## Quick Start

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm test -- --run

# Run tests with UI interface
npm run test:ui

# Run tests with coverage (requires @vitest/coverage-v8)
npm run test:coverage
```

## Test Structure

```
src/
├── test/
│   ├── setup.ts          # Global test configuration
│   └── README.md         # Testing documentation
├── types/
│   └── DrugDiseasePair.test.ts
└── components/
    ├── Dashboard.test.tsx
    └── DrugRepurposingTable.test.tsx
```

## Configuration

### vitest.config.ts
- Uses jsdom environment for DOM testing
- Globals enabled for describe/it/expect
- Setup file for test utilities and mocks

### Test Setup (src/test/setup.ts)
- Imports @testing-library/jest-dom matchers
- Mocks `fetch` API globally
- Mocks `ResizeObserver` for Vaadin components
- Auto-cleanup after each test

## Test Coverage

### Current Tests
- ✅ **DrugDiseasePair types** - Type validation and structure
- ✅ **Dashboard component** - Loading states, data fetching, error handling
- ✅ **DrugRepurposingTable component** - Rendering, basic functionality

### Known Limitations

**Vaadin Grid Testing**: The Vaadin Grid components use Shadow DOM which makes them difficult to test with React Testing Library. Current approach:
- Mock the table component in Dashboard tests
- Test basic rendering and state management in Table tests
- Skip deep DOM queries into Shadow DOM elements

**Recommendation**: For comprehensive Grid testing, use E2E tests with Playwright or Cypress.

## Writing Tests

### Example: Component Test

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders without crashing', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Example: Async Test with Fetch

```typescript
it('loads data successfully', async () => {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: 'test' })
  })

  render(<MyComponent />)

  await waitFor(() => {
    expect(screen.getByText('test')).toBeInTheDocument()
  })
})
```

## CI Integration

Tests run in CI mode with:
```bash
npm test -- --run
```

This executes all tests once without watch mode and exits with proper status codes.

## Troubleshooting

### Issue: "ResizeObserver is not defined"
**Solution**: Already mocked in `src/test/setup.ts`

### Issue: Cannot query Vaadin Grid content
**Solution**: Test the React state/props instead of DOM, or mock the Grid component

### Issue: Tests timing out
**Solution**: Ensure async operations use `waitFor` and mocks are properly set up
