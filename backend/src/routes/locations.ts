import type { Router } from 'express';
import { Router as createRouter } from 'express';
import {
  createLocation,
  deleteLocation,
  getLocation,
  listLocations,
  updateWeather,
} from '../db.js';
import { SingaporeWeatherClient, WeatherProviderError, type WeatherSnapshot } from '../weather.js';
import { logger } from '../logger.js';

export interface WeatherClient {
  getCurrentWeather(latitude: number, longitude: number): Promise<WeatherSnapshot>;
}

interface LocationsRouterOptions {
  weatherClient?: WeatherClient;
}

const SG_BOUNDS = { latMin: 1.1, latMax: 1.5, lonMin: 103.6, lonMax: 104.1 } as const;

const REFRESH_COOLDOWN_MS = 60_000; // 1 minute cooldown per location

function parseLocationId(raw: string): number | null {
  const id = Number(raw);
  if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) return null;
  return id;
}

export function createLocationsRouter(options: LocationsRouterOptions = {}): Router {
  const router: Router = createRouter();
  const weatherClient =
    options.weatherClient ?? new SingaporeWeatherClient({ apiKey: process.env.WEATHER_API_KEY });

  // Track last refresh time per location to enforce cooldown
  const lastRefresh = new Map<number, number>();

  router.get('/locations', async (_request, response, next) => {
    try {
      response.json({ locations: await listLocations() });
    } catch (error) {
      next(error);
    }
  });

  router.post('/locations', async (request, response, next) => {
    try {
      const latitude = Number(request.body?.latitude);
      const longitude = Number(request.body?.longitude);

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        response.status(422).json({ detail: 'latitude and longitude are required' });
        return;
      }
      if (
        !(
          SG_BOUNDS.latMin <= latitude &&
          latitude <= SG_BOUNDS.latMax &&
          SG_BOUNDS.lonMin <= longitude &&
          longitude <= SG_BOUNDS.lonMax
        )
      ) {
        response.status(422).json({
          detail: `Coordinates must be within Singapore (lat ${SG_BOUNDS.latMin}-${SG_BOUNDS.latMax}, lon ${SG_BOUNDS.lonMin}-${SG_BOUNDS.lonMax})`,
        });
        return;
      }

      const location = await createLocation(latitude, longitude);

      try {
        const snapshot = await weatherClient.getCurrentWeather(
          location.latitude,
          location.longitude,
        );
        const updated = await updateWeather(location.id, snapshot);
        lastRefresh.set(location.id, Date.now());
        response.status(201).json(updated ?? location);
      } catch (error) {
        if (!(error instanceof WeatherProviderError)) throw error;
        logger.warn(
          { err: error, locationId: location.id },
          'weather refresh failed after location create',
        );
        response.status(201).json(location);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'DuplicateLocationError') {
        logger.warn({ err: error }, 'duplicate location rejected');
        response.status(409).json({ detail: error.message });
        return;
      }
      next(error);
    }
  });

  router.get('/locations/:locationId', async (request, response, next) => {
    try {
      const locationId = parseLocationId(request.params.locationId);
      if (locationId === null) {
        response.status(400).json({ detail: 'Invalid location ID' });
        return;
      }
      const location = await getLocation(locationId);
      if (!location) {
        response.status(404).json({ detail: 'Location not found' });
        return;
      }
      response.json(location);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/locations/:locationId', async (request, response, next) => {
    try {
      const locationId = parseLocationId(request.params.locationId);
      if (locationId === null) {
        response.status(400).json({ detail: 'Invalid location ID' });
        return;
      }
      const deleted = await deleteLocation(locationId);
      if (!deleted) {
        response.status(404).json({ detail: 'Location not found' });
        return;
      }
      lastRefresh.delete(locationId);
      response.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  router.post('/locations/:locationId/refresh', async (request, response, next) => {
    try {
      const locationId = parseLocationId(request.params.locationId);
      if (locationId === null) {
        response.status(400).json({ detail: 'Invalid location ID' });
        return;
      }

      const lastTime = lastRefresh.get(locationId);
      if (lastTime && Date.now() - lastTime < REFRESH_COOLDOWN_MS) {
        response.status(429).json({
          detail: 'Refresh too frequent. Please wait at least 60 seconds between refreshes.',
        });
        return;
      }

      const location = await getLocation(locationId);
      if (!location) {
        response.status(404).json({ detail: 'Location not found' });
        return;
      }

      const snapshot = await weatherClient.getCurrentWeather(location.latitude, location.longitude);
      const updated = await updateWeather(locationId, snapshot);
      lastRefresh.set(locationId, Date.now());
      response.json(updated);
    } catch (error) {
      if (error instanceof WeatherProviderError) {
        response.status(502).json({ detail: error.message });
        return;
      }
      next(error);
    }
  });

  return router;
}
