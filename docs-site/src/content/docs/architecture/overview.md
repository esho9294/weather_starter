---
title: System Overview
description: High-level architecture of the Weather Starter application.
sidebar:
  order: 1
---

Weather Starter is a full-stack TypeScript monorepo that displays real-time weather data for saved Singapore locations. It combines an Express API backend with a React SPA frontend, backed by SQLite for persistence and Singapore's data.gov.sg APIs for weather data.

## System Architecture

```mermaid
graph TB
  subgraph Client
    Browser[Browser]
  end

  subgraph Frontend["Frontend (React + Vite)"]
    App[App.tsx]
    Store[State Store]
    API[API Client]
    Map[Leaflet Map]
  end

  subgraph Backend["Backend (Express)"]
    Server[Express Server]
    Routes[API Routes]
    Weather[Weather Client]
    DB[Drizzle ORM]
  end

  subgraph External
    DataGov[data.gov.sg APIs]
    SQLite[(SQLite DB)]
  end

  Browser --> App
  App --> Store
  Store --> API
  API -->|fetch /api/*| Server
  Server --> Routes
  Routes --> DB
  Routes --> Weather
  DB --> SQLite
  Weather -->|HTTP| DataGov
  App --> Map
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Leaflet |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite with WAL mode, Drizzle ORM |
| External Data | Singapore data.gov.sg REST APIs |
| Testing | Vitest, Testing Library, Supertest |
| Dev Tools | Husky, ESLint, Prettier, Portless |

## Monorepo Structure

The project uses npm workspaces with three packages:

```
weather-starter/
├── backend/          # Express API + SQLite
├── frontend/         # React SPA + Vite
├── docs-site/        # Astro Starlight documentation
└── scripts/          # Dev/build utility scripts
```

## Request Flow

```mermaid
sequenceDiagram
  participant U as User
  participant F as Frontend
  participant B as Backend API
  participant D as SQLite
  participant W as data.gov.sg

  U->>F: Interact with app
  F->>B: GET /api/locations
  B->>D: SELECT * FROM locations
  D-->>B: Location rows
  B-->>F: JSON response
  F-->>U: Render weather cards

  U->>F: Click refresh
  F->>B: POST /api/locations/:id/refresh
  B->>W: Fetch weather readings
  W-->>B: Weather data
  B->>D: UPDATE locations SET ...
  D-->>B: Updated row
  B-->>F: Updated location
  F-->>U: Re-render with fresh data
```
