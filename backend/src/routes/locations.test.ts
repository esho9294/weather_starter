// @vitest-environment node
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { WeatherSnapshot } from '../weather.js';
import type { WeatherClient } from './locations.js';

const weather: WeatherSnapshot = {
  condition: 'Cloudy',
  observed_at: '2026-05-04T00:00:00Z',
  source: 'test',
  area: 'Bishan',
  valid_period_text: 'Now',
  temperature_c: 29,
  humidity_percent: 80,
  rainfall_mm: 0,
  wind_speed_knots: 4,
  wind_direction_degrees: 180,
  forecast_low_c: 25,
  forecast_high_c: 32,
  uv_index: 7,
  psi_twenty_four_hourly: 42,
  pm25_one_hourly: 9,
  air_quality_region: 'central',
  forecast_periods: [{ label: 'Now', forecast: 'Cloudy' }],
  daily_forecast: [
    { date: '2026-05-04', forecast: 'Cloudy', temperature_low_c: 25, temperature_high_c: 32 },
  ],
};

describe('locations API', () => {
  let tempDir: string;
  let app: Awaited<ReturnType<typeof import('../server.js').createApp>>;
  let weatherClient: WeatherClient;

  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'weather-starter-test-'));
    process.env.DATABASE_PATH = join(tempDir, 'weather.db');
    process.env.LOG_LEVEL = 'silent';

    weatherClient = {
      async getCurrentWeather() {
        return weather;
      },
    };

    const { createApp } = await import('../server.js');
    app = await createApp({
      serveFrontend: false,
      enableRequestLogging: false,
      weatherClient,
    });
  });

  afterAll(async () => {
    try {
      await rm(tempDir, { recursive: true, force: true });
    } catch {
      // On Windows, SQLite WAL/SHM files may remain locked briefly
    }
  });

  describe('POST /api/locations', () => {
    it('creates a location and refreshes weather', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.35, longitude: 103.85 })
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        latitude: 1.35,
        longitude: 103.85,
        weather: {
          condition: 'Cloudy',
          area: 'Bishan',
          temperature_c: 29,
          humidity_percent: 80,
          rainfall_mm: 0,
          wind_speed_knots: 4,
          wind_direction_degrees: 180,
          forecast_low_c: 25,
          forecast_high_c: 32,
          uv_index: 7,
          psi_twenty_four_hourly: 42,
          pm25_one_hourly: 9,
          air_quality_region: 'central',
        },
      });
    });

    it('returns 422 when latitude/longitude are missing', async () => {
      const response = await request(app).post('/api/locations').send({}).expect(422);

      expect(response.body.detail).toBe('latitude and longitude are required');
    });

    it('returns 422 when latitude is not a number', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({ latitude: 'abc', longitude: 103.85 })
        .expect(422);

      expect(response.body.detail).toBe('latitude and longitude are required');
    });

    it('returns 422 when coordinates are outside Singapore bounds', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({ latitude: 40.7, longitude: -74.0 })
        .expect(422);

      expect(response.body.detail).toContain('Coordinates must be within Singapore');
    });

    it('returns 409 for duplicate coordinates', async () => {
      // First creation should succeed
      await request(app)
        .post('/api/locations')
        .send({ latitude: 1.30, longitude: 103.80 })
        .expect(201);

      // Second creation at same coordinates should conflict
      const response = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.30, longitude: 103.80 })
        .expect(409);

      expect(response.body.detail).toContain('already exists');
    });

    it('still creates the location when weather fetch fails', async () => {
      const { createApp } = await import('../server.js');
      const failingApp = await createApp({
        serveFrontend: false,
        enableRequestLogging: false,
        weatherClient: {
          async getCurrentWeather() {
            const { WeatherProviderError } = await import('../weather.js');
            throw new WeatherProviderError('API down');
          },
        },
      });

      const response = await request(failingApp)
        .post('/api/locations')
        .send({ latitude: 1.40, longitude: 103.70 })
        .expect(201);

      expect(response.body.latitude).toBe(1.40);
      expect(response.body.longitude).toBe(103.70);
    });
  });

  describe('GET /api/locations', () => {
    it('returns all locations', async () => {
      const response = await request(app).get('/api/locations').expect(200);

      expect(response.body.locations).toBeInstanceOf(Array);
      expect(response.body.locations.length).toBeGreaterThan(0);
      expect(response.body.locations[0]).toHaveProperty('id');
      expect(response.body.locations[0]).toHaveProperty('latitude');
      expect(response.body.locations[0]).toHaveProperty('longitude');
      expect(response.body.locations[0]).toHaveProperty('weather');
    });
  });

  describe('GET /api/locations/:locationId', () => {
    it('returns a single location by id', async () => {
      // Create a location to retrieve
      const createRes = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.28, longitude: 103.75 })
        .expect(201);

      const response = await request(app)
        .get(`/api/locations/${createRes.body.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createRes.body.id,
        latitude: 1.28,
        longitude: 103.75,
      });
    });

    it('returns 404 for non-existent location', async () => {
      const response = await request(app).get('/api/locations/99999').expect(404);

      expect(response.body.detail).toBe('Location not found');
    });

    it('returns 400 for invalid location id', async () => {
      const response = await request(app).get('/api/locations/abc').expect(400);

      expect(response.body.detail).toBe('Invalid location ID');
    });

    it('returns 400 for negative location id', async () => {
      const response = await request(app).get('/api/locations/-1').expect(400);

      expect(response.body.detail).toBe('Invalid location ID');
    });

    it('returns 400 for non-integer location id', async () => {
      const response = await request(app).get('/api/locations/1.5').expect(400);

      expect(response.body.detail).toBe('Invalid location ID');
    });
  });

  describe('DELETE /api/locations/:locationId', () => {
    it('deletes an existing location', async () => {
      const createRes = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.32, longitude: 103.90 })
        .expect(201);

      await request(app).delete(`/api/locations/${createRes.body.id}`).expect(204);

      // Confirm it's gone
      await request(app).get(`/api/locations/${createRes.body.id}`).expect(404);
    });

    it('returns 404 when deleting non-existent location', async () => {
      const response = await request(app).delete('/api/locations/99999').expect(404);

      expect(response.body.detail).toBe('Location not found');
    });

    it('returns 400 for invalid location id', async () => {
      const response = await request(app).delete('/api/locations/abc').expect(400);

      expect(response.body.detail).toBe('Invalid location ID');
    });
  });

  describe('POST /api/locations/:locationId/refresh', () => {
    it('returns 429 when refresh is called within cooldown period', async () => {
      // The location was just created (which triggers a refresh), so immediate
      // refresh should be rate-limited
      const createRes = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.33, longitude: 103.88 })
        .expect(201);

      const response = await request(app)
        .post(`/api/locations/${createRes.body.id}/refresh`)
        .expect(429);

      expect(response.body.detail).toContain('Refresh too frequent');
    });

    it('returns 404 for non-existent location', async () => {
      const response = await request(app).post('/api/locations/99999/refresh').expect(404);

      expect(response.body.detail).toBe('Location not found');
    });

    it('returns 400 for invalid location id', async () => {
      const response = await request(app).post('/api/locations/abc/refresh').expect(400);

      expect(response.body.detail).toBe('Invalid location ID');
    });

    it('returns 502 when weather provider fails', async () => {
      const { createApp } = await import('../server.js');
      const failingApp = await createApp({
        serveFrontend: false,
        enableRequestLogging: false,
        weatherClient: {
          async getCurrentWeather() {
            const { WeatherProviderError } = await import('../weather.js');
            throw new WeatherProviderError('Provider unreachable');
          },
        },
      });

      // Create a location via the failing app (weather fails on create, so
      // no cooldown is recorded)
      const createRes = await request(failingApp)
        .post('/api/locations')
        .send({ latitude: 1.38, longitude: 103.78 })
        .expect(201);

      // Refresh should return 502
      const response = await request(failingApp)
        .post(`/api/locations/${createRes.body.id}/refresh`)
        .expect(502);

      expect(response.body.detail).toBe('Provider unreachable');
    });
  });
});
