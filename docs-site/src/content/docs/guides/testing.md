---
title: Testing
description: Test configuration, patterns, and conventions for Weather Starter.
---

## Configuration

Tests are powered by [Vitest](https://vitest.dev/) with the following setup:

- **Environment:** jsdom (for React component tests)
- **Test files:** `**/*.test.ts` and `**/*.test.tsx` in both `backend/src` and `frontend/src`
- **Pool:** forks (isolated execution)
- **File parallelism:** Disabled (ensures database test isolation)

## Running Tests

```bash
# Run all tests once
npm test

# Watch mode
npm run test:watch

# Specific file
npm test -- locations.test.ts

# With coverage
npm test -- --coverage
```

## Test Types

### Backend API Tests

Located in `backend/src/routes/*.test.ts`. Integration tests using [Supertest](https://github.com/ladjs/supertest) that exercise the full request/response cycle.

```typescript
import request from 'supertest';
import { createApp } from '../server.js';

test('POST /api/locations creates a location', async () => {
  const app = await createApp({ serveFrontend: false });
  const response = await request(app)
    .post('/api/locations')
    .send({ latitude: 1.35, longitude: 103.85 });

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
});
```

### Frontend Component Tests

Located in `frontend/src/components/*.test.tsx`. Multiple test flavours:

| Suffix | Purpose |
|--------|---------|
| `.test.tsx` | Unit tests |
| `.integration.test.tsx` | Multi-component integration |
| `.interaction.test.tsx` | User interaction flows |
| `.responsive.test.tsx` | Responsive layout checks |
| `.fullscreen.test.tsx` | Fullscreen mode behaviour |

Tools: `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`.

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

test('button click triggers action', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);

  await user.click(screen.getByRole('button', { name: /click me/i }));
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});
```

## Test Environment

Tests run with:

- `NODE_ENV=test` (set automatically)
- `LOG_LEVEL=silent` (suppresses Pino output)
- Isolated database instances per test suite
- No HTTP request logging

## Best Practices

- Each test should be independent and self-contained
- Mock external API calls (data.gov.sg) to avoid rate limits
- Clean up resources after tests
- Use `npm run reset` if the database becomes corrupted
