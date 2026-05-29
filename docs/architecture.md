# Architecture

## High-Level Structure

```
weather-starter/
├── backend/              # Express API server
│   ├── src/
│   │   ├── server.ts     # Express app + Vite middleware
│   │   ├── db.ts         # SQLite connection & data access
│   │   ├── schema.ts     # Drizzle ORM table definitions
│   │   ├── weather.ts    # Singapore weather API client
│   │   ├── logger.ts     # Pino structured logging
│   │   └── routes/
│   │       ├── locations.ts      # Location CRUD endpoints
│   │       └── locations.test.ts # API integration tests
│   ├── drizzle/          # Generated SQL migrations
│   └── weather.db        # SQLite database (gitignored)
│
├── frontend/             # React SPA
│   ├── src/
│   │   ├── App.tsx       # Root component with providers
│   │   ├── api.ts        # Backend API client
│   │   ├── types.ts      # TypeScript type definitions
│   │   ├── state/
│   │   │   └── store.tsx # React Context state management
│   │   ├── components/   # React components
│   │   │   ├── Layout.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── MapCard.tsx
│   │   │   ├── AddLocationForm.tsx
│   │   │   └── ...
│   │   └── themes/       # Theme system
│   │       ├── ThemeContext.tsx
│   │       └── themes.ts
│   └── dist/             # Build output (gitignored)
│
├── scripts/              # Utility scripts
│   ├── dev.mjs           # Development server launcher
│   ├── start.mjs         # Production server launcher
│   ├── doctor.mjs        # Health check script
│   └── reset.mjs         # Database reset script
│
└── .kiro/                # Kiro AI workspace config
    └── specs/            # Feature specifications
```

## Backend Architecture

### Server Setup (`server.ts`)

- Express app with Pino HTTP logging
- Vite middleware in development mode
- Static file serving in production
- Health check endpoint: `GET /health`
- Frontend event logging: `POST /api/logs`

### Database Layer (`db.ts`)

- SQLite with WAL mode enabled
- Drizzle ORM with sqlite-proxy adapter
- Auto-migration on startup
- CRUD operations: `listLocations()`, `createLocation()`, `getLocation()`, `updateWeather()`, `deleteLocation()`

### Weather Client (`weather.ts`)

**`SingaporeWeatherClient` class:**
- Fetches from multiple data.gov.sg endpoints:
  - 2-hour forecast (primary)
  - Temperature, humidity, rainfall readings
  - Wind speed and direction
  - UV index and air quality (PSI/PM2.5)
  - 24-hour and 4-day forecasts
- Nearest station/area matching using Haversine distance
- Retry logic with exponential backoff

### Data Model (`schema.ts`)

- Single `locations` table with embedded weather snapshot
- Unique constraint on (latitude, longitude)
- JSON columns for forecast periods and daily forecasts
- Weather fields: condition, temperature, humidity, rainfall, wind, UV, air quality

### API Endpoints (`routes/locations.ts`)

- `GET /api/locations` - List all locations
- `POST /api/locations` - Create location (auto-refreshes weather)
- `GET /api/locations/:id` - Get single location
- `POST /api/locations/:id/refresh` - Refresh weather data
- `DELETE /api/locations/:id` - Delete location

## Frontend Architecture

### State Management (`state/store.tsx`)

- React Context-based global state
- Manages: locations list, selected location, loading states, errors
- Actions: `create()`, `refresh()`, `remove()`, `select()`
- Auto-loads locations on mount
- Logs user interactions to backend

### API Client (`api.ts`)

- Fetch-based HTTP client
- Base path: `/api` (relative, no CORS needed)
- Functions: `listLocations()`, `createLocation()`, `refreshLocation()`, `deleteLocation()`, `logInteraction()`

### Component Structure

- `App.tsx` - Root with ThemeProvider and StoreProvider
- `Layout.tsx` - Main layout container
- `Hero.tsx` - Header/hero section
- `MapCard.tsx` - Interactive Leaflet map with location markers
- `AddLocationForm.tsx` - Location creation form
- `SidebarCard.tsx` - Location list item with weather details
- `HourlyStrip.tsx` - Hourly forecast timeline

### Theme System (`themes/`)

- Multiple pre-built themes (Arctic Frost, Dark Storm, Sunset Gradient)
- ThemeContext provides theme switching
- Tailwind CSS with dynamic color variables

## Data Flow

### 1. Location Creation

1. User submits coordinates via `AddLocationForm`
2. Frontend calls `POST /api/locations`
3. Backend creates location with placeholder weather
4. Backend immediately calls weather API to refresh
5. Returns updated location with real weather data
6. Frontend reloads and selects new location

### 2. Weather Refresh

1. User clicks refresh button
2. Frontend calls `POST /api/locations/:id/refresh`
3. Backend fetches latest data from data.gov.sg
4. Updates location record with new snapshot
5. Returns updated location
6. Frontend reloads all locations

### 3. Location Display

- Frontend loads locations from SQLite via API
- Displays cached weather snapshots (no API call per render)
- User can manually refresh to get latest data
