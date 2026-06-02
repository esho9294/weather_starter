# AGENTS.md

Weather Starter is a TypeScript monorepo weather app tracking Singapore locations with data from data.gov.sg API, using Express + React + SQLite.

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://weather-starter.localhost:1355
npm test             # Run tests
```

## Tech Stack

- **Backend:** Node.js, TypeScript, Express, SQLite (Drizzle ORM)
- **Frontend:** React 18, Vite, Tailwind CSS, Leaflet
- **Dev Tools:** Vitest, Husky, Portless

## Documentation

- **[Architecture](docs/architecture.md)** - System design, backend/frontend structure, data flow
- **[Commands](docs/commands.md)** - All available CLI commands
- **[Development Workflow](docs/development-workflow.md)** - How to add features and make changes
- **[External APIs](docs/external-apis.md)** - Singapore data.gov.sg integration details
- **[Testing](docs/testing.md)** - Test configuration and patterns
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

## Agent Guidelines

When working on this codebase:

1. **Database changes:** Always generate migrations (`npm run db:generate`) after schema changes
2. **API changes:** Update both `backend/src/routes/` and `frontend/src/api.ts`
3. **State management:** Use React Context store in `frontend/src/state/store.tsx`
4. **Styling:** Use Tailwind utility classes, respect the theme system
5. **Logging:** Use Pino for structured logging, log user interactions via `logInteraction()`

### Working with SQLite Data

When you need to query or display saved locations/weather data:

- The database file is at `backend/weather.db` (SQLite, managed by Drizzle ORM)
- Use Node's built-in `node:sqlite` module to query it: `node --experimental-sqlite -e "const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync('backend/weather.db'); const rows = db.prepare('SELECT * FROM locations').all(); console.log(JSON.stringify(rows, null, 2));"`
- Or use DB Browser for SQLite (GUI tool) if available
- The file is gitignored via `backend/*.db` — users will have their own local copy

## Project Structure

```
weather-starter/
├── backend/src/
│   ├── server.ts              # Express + Vite middleware
│   ├── db.ts                  # SQLite + Drizzle ORM
│   ├── schema.ts              # Database schema
│   ├── weather.ts             # Singapore API client
│   └── routes/locations.ts    # CRUD endpoints
├── frontend/src/
│   ├── App.tsx                # Root component
│   ├── api.ts                 # Backend API client
│   ├── state/store.tsx        # React Context state
│   ├── components/            # React components
│   └── themes/                # Theme system
└── docs/                      # Detailed documentation
```

## API Endpoints

- `GET /api/locations` - List all locations
- `POST /api/locations` - Create location (auto-refreshes weather)
- `POST /api/locations/:id/refresh` - Refresh weather data
- `DELETE /api/locations/:id` - Delete location

See [Architecture](docs/architecture.md) for detailed system design.
