---
inclusion: manual
---

# Singapore Weather API (data.gov.sg)

This skill provides context about the Singapore data.gov.sg weather APIs used in this project.

## Overview

The app uses Singapore's open data APIs to fetch real-time weather data. The client implementation lives in `backend/src/weather.ts` as the `SingaporeWeatherClient` class.

## API Base URLs

- **v2 (primary):** `https://api-open.data.gov.sg`
- **v1 (legacy, 4-day forecast only):** `https://api.data.gov.sg`

## Authentication

- No API key required (free tier with rate limits)
- Optional: Set `WEATHER_API_KEY` in `.env` for higher rate limits
- Key is sent as `x-api-key` header when configured

## Endpoints

### Real-Time (v2)

| Endpoint | Description |
|----------|-------------|
| `GET /v2/real-time/api/two-hr-forecast` | 2-hour forecast with area metadata |
| `GET /v2/real-time/api/air-temperature` | Temperature readings from stations |
| `GET /v2/real-time/api/relative-humidity` | Humidity readings |
| `GET /v2/real-time/api/rainfall` | Rainfall in mm |
| `GET /v2/real-time/api/wind-speed` | Wind speed in knots |
| `GET /v2/real-time/api/wind-direction` | Wind direction in degrees |
| `GET /v2/real-time/api/uv` | UV index |
| `GET /v2/real-time/api/psi` | PSI air quality readings |
| `GET /v2/real-time/api/pm25` | PM2.5 readings |
| `GET /v2/real-time/api/twenty-four-hr-forecast` | 24-hour forecast with temperature ranges |

### Forecasts (v1 legacy)

| Endpoint | Description |
|----------|-------------|
| `GET /v1/environment/4-day-weather-forecast` | 4-day outlook with temperature ranges |

## Response Patterns

### Forecast (two-hr-forecast)

```json
{
  "code": 0,
  "data": {
    "area_metadata": [
      { "name": "Ang Mo Kio", "label_location": { "latitude": 1.375, "longitude": 103.839 } }
    ],
    "items": [
      {
        "update_timestamp": "2024-01-15T10:00:00+08:00",
        "valid_period": { "text": "10 AM to 12 PM" },
        "forecasts": [
          { "area": "Ang Mo Kio", "forecast": "Partly Cloudy" }
        ]
      }
    ]
  }
}
```

### Station Readings (temperature, humidity, rainfall, wind)

```json
{
  "code": 0,
  "data": {
    "stations": [
      { "id": "S50", "name": "Clementi", "location": { "latitude": 1.3337, "longitude": 103.7768 } }
    ],
    "readings": [
      {
        "timestamp": "2024-01-15T10:05:00+08:00",
        "data": [
          { "stationId": "S50", "value": 28.5 }
        ]
      }
    ]
  }
}
```

### 24-Hour Forecast

```json
{
  "code": 0,
  "data": {
    "records": [
      {
        "general": { "temperature": { "low": 24, "high": 33 } },
        "periods": [
          {
            "timePeriod": { "text": "Morning" },
            "regions": {
              "central": { "text": "Partly Cloudy", "code": "PC" },
              "north": { "text": "Thundery Showers", "code": "TS" }
            }
          }
        ]
      }
    ]
  }
}
```

### 4-Day Forecast (v1)

```json
{
  "items": [
    {
      "forecasts": [
        {
          "date": "2024-01-15",
          "forecast": "Thundery Showers",
          "temperature": { "low": 24, "high": 33 }
        }
      ]
    }
  ]
}
```

## WeatherSnapshot Type

The client aggregates all API responses into a single `WeatherSnapshot`:

```typescript
interface WeatherSnapshot {
  condition: string;
  observed_at: string;
  source: string;
  area: string | null;
  valid_period_text: string | null;
  temperature_c: number | null;
  humidity_percent: number | null;
  rainfall_mm: number | null;
  wind_speed_knots: number | null;
  wind_direction_degrees: number | null;
  forecast_low_c: number | null;
  forecast_high_c: number | null;
  uv_index: number | null;
  psi_twenty_four_hourly: number | null;
  pm25_one_hourly: number | null;
  air_quality_region: string | null;
  forecast_periods: Array<{ label: string; forecast: string }>;
  daily_forecast: Array<{
    date: string;
    forecast: string;
    temperature_low_c: number | null;
    temperature_high_c: number | null;
  }>;
}
```

## Nearest Station/Area Matching

The client uses squared Euclidean distance (not Haversine, since Singapore is small enough) to find:
- **Nearest area** — matches coordinates to forecast area metadata
- **Nearest station** — matches coordinates to weather station (only considers stations with valid readings)
- **Nearest region** — matches coordinates to one of 5 regions: west, north, central, south, east

## Singapore Regions (default coordinates)

| Region | Latitude | Longitude |
|--------|----------|-----------|
| west | 1.35735 | 103.7 |
| north | 1.41803 | 103.82 |
| central | 1.35735 | 103.82 |
| south | 1.29587 | 103.82 |
| east | 1.35735 | 103.94 |

## Error Handling & Retry

- Exponential backoff on HTTP 429 (rate limit): retries up to 3 times with 800ms × (attempt+1) delay
- 8-second timeout per request (configurable)
- Individual endpoint failures are caught and return null values (graceful degradation)
- `WeatherProviderError` is thrown for hard failures (auth errors, repeated rate limits)

## Key Implementation Notes

- v1 and v2 endpoints have different response shapes — don't mix them
- All numeric values may come as strings from the API — always use `Number()` conversion
- The `code` field in responses: `0` = success, non-zero = error
- Area metadata coordinates may be strings or numbers — handle both
- Readings are sorted newest-first; the client uses index `[0]` for latest
