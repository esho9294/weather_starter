---
title: Backend
description: Express API server architecture, database layer, and weather client.
sidebar:
  order: 2
---

The backend is an Express application that serves both the API endpoints and the frontend SPA (via Vite middleware in development, static files in production).

## Server Setup

```mermaid
graph LR
  subgraph Express
    Pino[Pino HTTP Logger]
    JSON[JSON Body Parser]
    Health[GET /health]
    Logs[POST /api/logs]
    Locations[/api/locations routes]
    Areas[/api/areas routes]
    Vite[Vite Middleware / Static]
    Errors[Error Handler]
  end

  Pino --> JSON --> Health
  JSON --> Logs
  JSON --> Locations
  JSON --> Areas
  JSON --> Vite
  Vite --> Errors
```

Key features of `server.ts`:

- Pino HTTP request logging (disabled in test mode)
- JSON body parsing for all routes except `/frontman`
- Health check at `GET /health`
- Frontend event logging at `POST /api/logs`
- Vite middleware in development, static serving in production
- Global error handler returns `500` with structured error

## Database Layer

SQLite with WAL mode and Drizzle ORM (sqlite-proxy adapter). The database auto-migrates on startup.

### Schema

A single `locations` table stores both coordinates and a flattened weather snapshot:

```mermaid
erDiagram
  LOCATIONS {
    integer id PK "auto-increment"
    real latitude "NOT NULL"
    real longitude "NOT NULL"
    text created_at "NOT NULL"
    text condition
    text observed_at
    text source
    text area
    text valid_period_text
    real temperature_c
    real humidity_percent
    real rainfall_mm
    real wind_speed_knots
    real wind_direction_degrees
    real forecast_low_c
    real forecast_high_c
    real uv_index
    real psi_twenty_four_hourly
    real pm25_one_hourly
    text air_quality_region
    json forecast_periods "NOT NULL"
    json daily_forecast "NOT NULL"
  }
```

A unique index on `(latitude, longitude)` prevents duplicate locations.

### Data Access Functions

| Function | Description |
|----------|-------------|
| `listLocations()` | All locations ordered by newest first |
| `createLocation(lat, lon)` | Insert with default "not refreshed" weather |
| `getLocation(id)` | Single location by ID |
| `updateWeather(id, snapshot)` | Overwrite weather columns |
| `deleteLocation(id)` | Remove a location |
| `resetStore()` | Clear all data (for testing/dev) |

## Weather Client

The `SingaporeWeatherClient` class fetches from multiple data.gov.sg endpoints and aggregates the results into a single `WeatherSnapshot`.

```mermaid
graph TD
  Client[SingaporeWeatherClient]

  subgraph "Wave 1"
    Forecast[2-hr Forecast]
  end

  subgraph "Wave 2"
    Temp[Air Temperature]
    Humidity[Relative Humidity]
    Rainfall[Rainfall]
  end

  subgraph "Wave 3"
    Wind[Wind Speed]
    WindDir[Wind Direction]
    UV[UV Index]
  end

  subgraph "Wave 4"
    PSI[PSI / PM2.5]
    TwentyFour[24-hr Forecast]
    FourDay[4-day Forecast]
  end

  Client --> Forecast
  Client --> Temp
  Client --> Humidity
  Client --> Rainfall
  Client --> Wind
  Client --> WindDir
  Client --> UV
  Client --> PSI
  Client --> TwentyFour
  Client --> FourDay

  Forecast --> Snapshot[WeatherSnapshot]
  Temp --> Snapshot
  Humidity --> Snapshot
  Rainfall --> Snapshot
  Wind --> Snapshot
  WindDir --> Snapshot
  UV --> Snapshot
  PSI --> Snapshot
  TwentyFour --> Snapshot
  FourDay --> Snapshot
```

### Features

- **Nearest station matching:** Uses Haversine distance to find the closest weather station or forecast area for a given coordinate
- **Batched requests:** Endpoints are called in waves to stay within rate limits (~5 req/sec)
- **Retry logic:** Exponential backoff on failures and 429 responses
- **Graceful degradation:** Individual data source failures don't block the entire snapshot — missing fields are returned as `null`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/logs` | Frontend event logging |
| `GET` | `/api/locations` | List all locations |
| `POST` | `/api/locations` | Create location (auto-refreshes weather) |
| `GET` | `/api/locations/:id` | Get single location |
| `DELETE` | `/api/locations/:id` | Delete location |
| `POST` | `/api/locations/:id/refresh` | Refresh weather (60s cooldown) |
| `GET` | `/api/areas` | Fetch Singapore area metadata |

### Validation Rules

- Coordinates must be within Singapore bounds: lat `1.1–1.5`, lon `103.6–104.1`
- Duplicate `(latitude, longitude)` pairs return `409 Conflict`
- Refresh has a per-location 60-second cooldown (returns `429` if too frequent)
- Invalid location IDs return `400`
