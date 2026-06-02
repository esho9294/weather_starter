import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { SingaporeWeatherClient } from '../weather.js';
import { logger } from '../logger.js';

export interface AreaMetadata {
  name: string;
  latitude: number;
  longitude: number;
}

export function createAreasRouter(): Router {
  const router: Router = createRouter();
  const weatherClient = new SingaporeWeatherClient({ apiKey: process.env.WEATHER_API_KEY });

  router.get('/areas', async (_request, response, _next) => {
    try {
      const payload = await weatherClient.fetchLatestForecastPayload();
      const root = (payload as Record<string, unknown>).data ?? payload;
      const rawAreas: Array<{
        name?: string;
        label_location?: { latitude?: number | string; longitude?: number | string };
      }> = root.area_metadata ?? [];

      const areas: AreaMetadata[] = rawAreas
        .filter((area) => {
          const lat = Number(area.label_location?.latitude);
          const lon = Number(area.label_location?.longitude);
          return area.name && !Number.isNaN(lat) && !Number.isNaN(lon);
        })
        .map((area) => ({
          name: area.name as string,
          latitude: Number(area.label_location!.latitude),
          longitude: Number(area.label_location!.longitude),
        }));

      response.json(areas);
    } catch (error) {
      logger.error({ err: error }, 'Failed to fetch area metadata');
      response.status(502).json({ detail: 'Unable to fetch forecast areas' });
    }
  });

  return router;
}
