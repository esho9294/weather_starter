---
title: API Reference
description: Complete HTTP API reference for Weather Starter.
sidebar:
  order: 1
---

All endpoints are served at the `/api` prefix. Responses are JSON unless otherwise noted.

## Health

### `GET /health`

Returns server health status.

**Response:** `200 OK`
```json
{ "status": "healthy" }
```

## Locations

### `GET /api/locations`

List all saved locations with their current weather data.

**Response:** `200 OK`
```json
{
  "locations": [
    {
      "id": 1,
      "latitude": 1.3521,
      "longitude": 103.8198,
      "created_at": "2024-12-01T10:30:00",
      "weather": {
        "condition": "Partly Cloudy",
        "temperature_c": 31.2,
        "humidity_percent": 72,
        "rainfall_mm": 0,
        "wind_speed_knots": 5.4,
        "wind_direction_degrees": 180,
        "forecast_low_c": 25,
        "forecast_high_c": 34,
        "uv_index": 8,
        "psi_twenty_four_hourly": 52,
        "pm25_one_hourly": 15,
        "air_quality_region": "central",
        "forecast_periods": [],
        "daily_forecast": []
      }
    }
  ]
}
```

### `POST /api/locations`

Create a new location. Automatically fetches weather data from data.gov.sg.

**Request body:**
```json
{
  "latitude": 1.3521,
  "longitude": 103.8198
}
```

**Validation:**
- Coordinates must be within Singapore: lat `1.1–1.5`, lon `103.6–104.1`
- Duplicate `(latitude, longitude)` pairs are rejected

**Responses:**

| Status | Condition |
|--------|-----------|
| `201` | Created successfully (includes weather data) |
| `409` | Duplicate location |
| `422` | Invalid or missing coordinates |

### `GET /api/locations/:id`

Get a single location by ID.

**Responses:**

| Status | Condition |
|--------|-----------|
| `200` | Location found |
| `400` | Invalid ID format |
| `404` | Location not found |

### `DELETE /api/locations/:id`

Delete a location.

**Responses:**

| Status | Condition |
|--------|-----------|
| `204` | Deleted (no body) |
| `400` | Invalid ID format |
| `404` | Location not found |

### `POST /api/locations/:id/refresh`

Refresh weather data for a location. Subject to a 60-second cooldown per location.

**Responses:**

| Status | Condition |
|--------|-----------|
| `200` | Refreshed successfully |
| `400` | Invalid ID format |
| `404` | Location not found |
| `429` | Refresh too frequent (wait 60s) |
| `502` | Weather provider error |

## Areas

### `GET /api/areas`

Fetch Singapore area metadata from data.gov.sg. Returns named areas with coordinates (useful for the area picker UI).

**Response:** `200 OK`
```json
[
  {
    "name": "Ang Mo Kio",
    "latitude": 1.3691,
    "longitude": 103.8454
  }
]
```

**Error:** `502` if the upstream data.gov.sg API is unavailable.

## Frontend Logging

### `POST /api/logs`

Log frontend user interactions for analytics.

**Request body:**
```json
{
  "event": "location_created",
  "metadata": { "locationId": 1 },
  "page": "/"
}
```

**Validation:** `event` must match pattern `^[a-z][a-z0-9_.:-]{1,63}$`

**Response:** `204 No Content`
