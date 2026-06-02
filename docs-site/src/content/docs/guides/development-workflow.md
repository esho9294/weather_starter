---
title: Development Workflow
description: How to add features and make changes to the Weather Starter app.
---

## Local Development

1. Start the dev server: `npm run dev`
2. Access the app at `http://weather-starter.localhost:1355`
3. Backend API is served at `/api/*`
4. Vite middleware provides React hot-reload
5. Both frontend and backend changes reload automatically

## Adding a Feature

### Standard Flow

1. Update the database schema in `backend/src/schema.ts` (if needed)
2. Generate a migration: `npm run db:generate`
3. Apply the migration: `npm run db:migrate`
4. Add or update API endpoints in `backend/src/routes/`
5. Update the frontend API client in `frontend/src/api.ts`
6. Add or update React components in `frontend/src/components/`
7. Verify: `npm run doctor` and `npm test`

### Database Changes

- Schema is defined in `backend/src/schema.ts` using Drizzle ORM
- Migrations are stored in `backend/drizzle/`
- The database file at `backend/weather.db` is auto-created on startup
- Reset the database with `npm run reset`

Always generate migrations after schema changes to keep version control in sync.

## Code Conventions

### TypeScript

- Strict types throughout; no `any`
- Shared type definitions live in `frontend/src/types.ts`

### State Management

- Use the React Context store in `frontend/src/state/store.tsx`
- Avoid prop drilling — consume via `useStore()` hook
- Log user interactions with `logInteraction()` for analytics

### Styling

- Tailwind utility classes only
- Respect the theme system in `frontend/src/themes/`
- Theme-aware components should consume `ThemeContext`

### Logging

- **Backend:** Pino structured logging via `logger` from `backend/src/logger.ts`
- **Frontend:** `logInteraction(event, metadata)` from `frontend/src/api.ts`

### API Design

- RESTful endpoints in `backend/src/routes/`
- Always update both backend routes and the frontend API client
- Return appropriate HTTP status codes with error details in the body
