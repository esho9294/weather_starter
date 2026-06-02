// @vitest-environment node
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

describe('areas API', () => {
  let tempDir: string;
  let app: Awaited<ReturnType<typeof import('../server.js').createApp>>;

  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'weather-starter-areas-test-'));
    process.env.DATABASE_PATH = join(tempDir, 'weather.db');
    process.env.LOG_LEVEL = 'silent';

    const { createApp } = await import('../server.js');
    app = await createApp({
      serveFrontend: false,
      enableRequestLogging: false,
    });
  });

  afterAll(async () => {
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch {
      // On Windows, SQLite WAL/SHM files may remain locked briefly
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/areas', () => {
    it('returns area metadata from the weather provider', async () => {
      const { SingaporeWeatherClient } = await import('../weather.js');

      vi.spyOn(SingaporeWeatherClient.prototype, 'fetchLatestForecastPayload').mockResolvedValue({
        data: {
          area_metadata: [
            { name: 'Bishan', label_location: { latitude: 1.3526, longitude: 103.8352 } },
            { name: 'Orchard', label_location: { latitude: 1.3048, longitude: 103.8318 } },
          ],
          items: [],
        },
      });

      const response = await request(app).get('/api/areas').expect(200);

      expect(response.body).toEqual([
        { name: 'Bishan', latitude: 1.3526, longitude: 103.8352 },
        { name: 'Orchard', latitude: 1.3048, longitude: 103.8318 },
      ]);
    });

    it('filters out areas with missing or invalid coordinates', async () => {
      const { SingaporeWeatherClient } = await import('../weather.js');

      vi.spyOn(SingaporeWeatherClient.prototype, 'fetchLatestForecastPayload').mockResolvedValue({
        data: {
          area_metadata: [
            { name: 'Valid', label_location: { latitude: 1.35, longitude: 103.8 } },
            { name: 'NoCoords', label_location: {} },
            { name: '', label_location: { latitude: 1.35, longitude: 103.8 } },
            { label_location: { latitude: 1.35, longitude: 103.8 } },
          ],
          items: [],
        },
      });

      const response = await request(app).get('/api/areas').expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Valid');
    });

    it('returns 502 when weather provider fails', async () => {
      const { SingaporeWeatherClient } = await import('../weather.js');

      vi.spyOn(SingaporeWeatherClient.prototype, 'fetchLatestForecastPayload').mockRejectedValue(
        new Error('Network error'),
      );

      const response = await request(app).get('/api/areas').expect(502);

      expect(response.body.detail).toBe('Unable to fetch forecast areas');
    });

    it('handles payload with top-level area_metadata (no data wrapper)', async () => {
      const { SingaporeWeatherClient } = await import('../weather.js');

      vi.spyOn(SingaporeWeatherClient.prototype, 'fetchLatestForecastPayload').mockResolvedValue({
        area_metadata: [
          { name: 'Tampines', label_location: { latitude: 1.3496, longitude: 103.9568 } },
        ],
        items: [],
      });

      const response = await request(app).get('/api/areas').expect(200);

      expect(response.body).toEqual([
        { name: 'Tampines', latitude: 1.3496, longitude: 103.9568 },
      ]);
    });
  });
});
