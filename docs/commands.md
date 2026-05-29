# Commands Reference

## Development

```bash
# Install all dependencies (root + workspaces)
npm install

# Start development server with Portless proxy
npm run dev
# Opens at: http://weather-starter.localhost:1355

# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Check API health and endpoints
npm run doctor

# Reset SQLite database
npm run reset
```

## Build & Production

```bash
# Build frontend and compile backend TypeScript
npm run build

# Start production server (requires build first)
npm run start
```

## Database Management

```bash
# Generate Drizzle migrations after schema changes
npm run db:generate

# Apply migrations to backend/weather.db
npm run db:migrate
```

## Workspace-Specific Commands

### Frontend Only

```bash
cd frontend
npm run dev          # Vite dev server (standalone)
npm run build        # Build frontend
npm run preview      # Preview production build
```

### Backend Only

```bash
cd backend
npm run dev          # Watch mode with tsx
npm run build        # Compile TypeScript
npm run start        # Run compiled server
```

## Code Quality

**Note:** No explicit lint/format scripts in package.json. Run via IDE integration or add custom scripts if needed:

```bash
# Example commands (not configured by default)
npx eslint . --ext .ts,.tsx
npx prettier --write .
```

Linting and formatting are enforced via Husky pre-commit hooks (configured in `.husky/`).
