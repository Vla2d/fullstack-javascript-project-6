import {
  describe, beforeAll, it, expect, afterAll,
} from '@jest/globals';
import fastify from 'fastify';
import build from '../src/server.js';

describe('Main page', () => {
  let app;

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    });
    await build(app);
  });

  it('shows main page', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('index'),
    });
    expect(response.statusCode).toBe(200);
  });

  it('shows 404 page', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/page-404',
    });
    expect(response.statusCode).toBe(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
