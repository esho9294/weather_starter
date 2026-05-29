# Development Workflow

## Local Development

1. Start dev server: `npm run dev`
2. Access app at: `http://weather-starter.localhost:1355`
3. Backend serves API at `/api/*`
4. Vite middleware serves React app
5. Hot reload enabled for both frontend and backend

## Adding Features

### Standard Feature Flow

1. Update database schema in `backend/src/schema.ts` (if needed)
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:migrate`
4. Add/update API endpoints in `backend/src/routes/`
5. Update frontend API client in `frontend/src/api.ts`
6. Add/update React components in `frontend/src/components/`
7. Run verification: `npm run doctor` and `npm test`

### Database Changes

- Schema defined in `backend/src/schema.ts` using Drizzle ORM
- Migrations stored in `backend/drizzle/`
- Database file: `backend/weather.db` (auto-created)
- Reset database: `npm run reset`

**Important:** Always generate migrations after schema changes to maintain database version control.

## Feature Implementation Order

See "Feature Tasks" section in README.md for suggested implementation order. Tasks are ordered from easiest to hardest, and each builds on existing codebase patterns:

1. Delete a location
2. Geolocation + auto-detect
3. Singapore area picker
4. Current conditions detail
5. Hourly and multi-day forecast
6. Wind and atmospheric readings
7. UI overhaul and theming
8. Location detail page with charts
9. Multi-location management

## Code Conventions

### TypeScript

- Use strict types throughout
- Type definitions in `frontend/src/types.ts`
- Avoid `any` - use `unknown` if type is truly unknown

### State Management

- Use React Context store in `frontend/src/state/store.tsx`
- Avoid prop drilling
- Log user interactions via `logInteraction()` for analytics

### Styling

- Use Tailwind utility classes
- Respect the theme system in `frontend/src/themes/`
- Theme-aware components should use theme context

### Logging

- Backend: Use Pino structured logging via `logger` from `backend/src/logger.ts`
- Frontend: Use `logInteraction()` from `frontend/src/api.ts` for user events
- Log format: `{ event, metadata, page }`

### API Design

- RESTful endpoints in `backend/src/routes/`
- Always update both backend routes and frontend API client
- Return appropriate HTTP status codes
- Include error details in response body

## Environment Variables

### Backend

- `PORT` - Server port (default: 3000)
- `DATABASE_PATH` - SQLite database path (default: `backend/weather.db`)
- `WEATHER_API_KEY` - Optional data.gov.sg API key
- `NODE_ENV` - Environment mode (development/production/test)
- `LOG_LEVEL` - Pino log level (default: info, test: silent)

### Frontend

- No environment variables required (uses relative API paths)
