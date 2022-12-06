import {
  describe, beforeAll, beforeEach, test, expect, afterEach, afterAll,
} from '@jest/globals';
import fastify from 'fastify';
import build from '../src/server.js';
import { getSessionCookie } from './helpers/index.js';

describe('test labels CRUD', () => {
  let app;
  let cookie;

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    });
    await build(app);
    await app.objection.knex.migrate.latest();
    cookie = await getSessionCookie(app);
  });

  beforeEach(async () => {
    await app.objection.knex('labels').insert({ name: 'Новая' });
  });

  test('test', () => {
    expect(cookie).toBeTruthy();
  });

  afterEach(async () => {
    await app.objection.knex('labels').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
