# Testing

## Test Configuration

**File:** `vitest.config.ts`

- **Environment:** jsdom (for React component tests)
- **Test files:** `**/*.test.ts`, `**/*.test.tsx` in `backend/src` and `frontend/src`
- **Pool:** forks (isolated test execution)
- **File parallelism:** Disabled for database test isolation
- **Setup file:** `vitest.setup.ts`

## Test Types

### Backend API Tests

**Location:** `backend/src/routes/locations.test.ts`

- Integration tests using Supertest
- Tests CRUD operations on locations
- Tests weather refresh functionality
- Uses in-memory or test database

### Frontend Component Tests

**Patterns:**
- `*.test.tsx` - Unit tests for individual components
- `*.integration.test.tsx` - Integration tests with multiple components
- `*.interaction.test.tsx` - User interaction tests
- `*.responsive.test.tsx` - Responsive design tests
- `*.fullscreen.test.tsx` - Fullscreen mode tests

**Tools:**
- `@testing-library/react` - Component testing utilities
- `@testing-library/user-event` - User interaction simulation
- `@testing-library/jest-dom` - DOM matchers

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- locations.test.ts

# Run tests with coverage
npm test -- --coverage
```

## Test Environment

Tests run with:
- `NODE_ENV=test` (automatic)
- `LOG_LEVEL=silent` (suppresses logs)
- Isolated database instances
- No request logging

## Writing Tests

### Backend API Test Example

```typescript
import request from 'supertest';
import { createApp } from '../server.js';

test('POST /api/locations creates a location', async () => {
  const app = await createApp({ serveFrontend: false });
  const response = await request(app)
    .post('/api/locations')
    .send({ latitude: 1.35, longitude: 103.85 });
  
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('id');
});
```

### Frontend Component Test Example

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

test('button click triggers action', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);
  
  const button = screen.getByRole('button', { name: /click me/i });
  await user.click(button);
  
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});
```

## Test Isolation

- Each test should be independent
- Backend tests use separate database instances
- Clean up resources after tests
- Mock external API calls to avoid rate limits

## Troubleshooting Tests

### Tests Failing

1. Ensure `NODE_ENV=test` is set (automatic in vitest.config.ts)
2. Check test database isolation
3. Run `npm run reset` to clear database
4. Check for port conflicts

### Slow Tests

- Mock external API calls
- Use test database in memory
- Reduce timeout values for faster feedback
