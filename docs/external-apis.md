# External API Integration

## Singapore data.gov.sg APIs

- **Base URL:** `https://api-open.data.gov.sg`
- **Authentication:** No API key required (rate limits apply)
- **Optional API Key:** Set `WEATHER_API_KEY` environment variable

## Key Endpoints Used

### Real-Time Weather (v2)

- `GET /v2/real-time/api/two-hr-forecast` - Primary forecast data with area metadata
- `GET /v2/real-time/api/air-temperature` - Temperature readings from weather stations
- `GET /v2/real-time/api/relative-humidity` - Humidity readings
- `GET /v2/real-time/api/rainfall` - Rainfall data in mm
- `GET /v2/real-time/api/wind-speed` - Wind speed in knots
- `GET /v2/real-time/api/wind-direction` - Wind direction in degrees

### Forecasts (v1)

- `GET /v1/environment/24-hour-weather-forecast` - 24-hour forecast by time periods
- `GET /v1/environment/4-day-weather-forecast` - 4-day outlook with temperature ranges

**Note:** v1 and v2 endpoints have different response shapes.

## Weather Client Features

The `SingaporeWeatherClient` class in `backend/src/weather.ts` provides:

### Nearest Station/Area Matching

- Uses Haversine formula to find closest weather station or forecast area
- Matches user coordinates to Singapore's predefined areas
- Functions: `nearestAreaName()`, `nearestRegionName()`, `nearestStation()`

### Retry Logic

- Exponential backoff for failed requests
- Configurable retry attempts
- Handles rate limiting gracefully

### Data Aggregation

- Combines multiple API responses into single `WeatherSnapshot`
- Handles missing/null data gracefully
- Provides default values for unavailable data

### Response Structure

The weather client returns a `WeatherSnapshot` object containing:

```typescript
{
  condition: string | null;
  observed_at: string | null;
  source: string | null;
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

## API Documentation

- **Official Docs:** https://data.gov.sg/collections/realtime-weather-readings/view
- **2-hour Forecast:** https://data.gov.sg/datasets/d_3f9e064e25005b0e42969944ccaf2e7a/view
- **Weather Forecast Collection:** https://data.gov.sg/collections/weather-forecast/view

## Rate Limiting

- No official rate limit documentation
- Recommended: Add `WEATHER_API_KEY` to `.env` for higher limits
- Reduce refresh frequency during development to avoid hitting limits
