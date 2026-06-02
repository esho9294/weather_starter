---
title: Getting Started
description: Set up and run the Weather Starter application locally.
---

## Prerequisites

- Node.js 22+
- npm 10+

## Quick Start

```bash
# Install all dependencies (root + workspaces)
npm install

# Start the development server
npm run dev
```

The app will be available at `http://weather-starter.localhost:1355`.

## Environment Variables

Create a `.env` file in the workspace root (copy from `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Express server port |
| `DATABASE_PATH` | `backend/weather.db` | SQLite database file path |
| `WEATHER_API_KEY` | — | Optional data.gov.sg API key for higher rate limits |
| `NODE_ENV` | `development` | Environment mode |
| `LOG_LEVEL` | `info` | Pino log level (`debug`, `info`, `warn`, `error`, `silent`) |

The frontend uses relative `/api` paths, so no frontend-specific environment variables are needed.

## Project Structure

```
weather-starter/
├── backend/src/        # Express API server
├── frontend/src/       # React SPA (Vite)
├── docs-site/          # This documentation site
├── scripts/            # Dev/build utility scripts
└── docs/               # Markdown design docs
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Vite HMR |
| `npm run build` | Build frontend + compile backend |
| `npm run start` | Start production server |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint frontend and backend source |
| `npm run format` | Format code with Prettier |
| `npm run doctor` | Health check API endpoints |
| `npm run reset` | Reset the SQLite database |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply database migrations |
| `npm run docs` | Start this documentation site |
