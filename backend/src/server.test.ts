// @vitest-environment node
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('server endpoints', () => {
  let tempDir: string;
  let app: Awaited<ReturnType<typeof import('./server.js').createApp>>;

  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'weather-starter-server-test-'));
    process.env.DATABASE_PATH = join(tempDir, 'weather.db');
    process.env.LOG_LEVEL = 'silent';

    const { createApp } = await import('./server.js');
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

  describe('GET /health', () => {
    it('returns healthy status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toEqual({ status: 'healthy' });
    });
  });

  describe('POST /api/logs', () => {
    it('accepts a valid frontend log event', async () => {
      await request(app)
        .post('/api/logs')
        .send({ event: 'page.view', metadata: { page: '/home' } })
        .expect(204);
    });

    it('accepts event with page field', async () => {
      await request(app)
        .post('/api/logs')
        .send({ event: 'button.click', page: '/settings' })
        .expect(204);
    });

    it('returns 422 when event is missing', async () => {
      const response = await request(app).post('/api/logs').send({}).expect(422);

      expect(response.body.detail).toBe('event is required');
    });

    it('returns 422 when event is not a string', async () => {
      const response = await request(app).post('/api/logs').send({ event: 123 }).expect(422);

      expect(response.body.detail).toBe('event is required');
    });

    it('returns 422 when event has invalid format', async () => {
      const response = await request(app)
        .post('/api/logs')
        .send({ event: 'INVALID EVENT!' })
        .expect(422);

      expect(response.body.detail).toBe('event is required');
    });

    it('returns 422 when event starts with a number', async () => {
      const response = await request(app)
        .post('/api/logs')
        .send({ event: '1invalid' })
        .expect(422);

      expect(response.body.detail).toBe('event is required');
    });

    it('accepts events with dots, colons, and hyphens', async () => {
      await request(app)
        .post('/api/logs')
        .send({ event: 'user.action:click-button' })
        .expect(204);
    });
  });
});
