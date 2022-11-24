import {
  describe, beforeAll, test, expect, afterAll,
} from '@jest/globals';
import fastify from 'fastify';
import build from '../src/server.js';

describe('test main page', () => {
  let app;

  beforeAll(async () => {
    app = fastify();
    await build(app);
  });

  test('GET 200', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
    });
    expect(response.statusCode).toBe(200);
  });

  test('GET 404', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/index.html',
    });
    expect(response.statusCode).toBe(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
