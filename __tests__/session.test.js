import {
  describe, beforeAll, beforeEach, test, expect, afterEach, afterAll,
} from '@jest/globals';
import fastify from 'fastify';
import build from '../src/server.js';

describe('test sessions', () => {
  let app;
  let cookie;

  beforeAll(async () => {
    app = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    });
    await build(app);
    await app.objection.knex.migrate.latest();
  });

  beforeEach(async () => {
    await app.objection.knex('users').insert({ email: 'admin123@gmail.com', password_digest: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3' });
  });

  test('POST and DELETE /session', async () => {
    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: {
          email: 'admin123@gmail.com',
          password: '123',
        },
      },
    });
    expect(responseSignIn.headers.location).toBe(app.reverse('index'));
    const [sessionCookie] = responseSignIn.cookies;
    const { name, value } = sessionCookie;
    cookie = { [name]: value };

    const responseSignOut = await app.inject({
      method: 'DELETE',
      url: app.reverse('session'),
      cookies: cookie,
    });
    expect(responseSignOut.statusCode).toBe(302);
  });

  test('POST with incorrect password', async () => {
    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: {
          email: 'admin123@gmail.com',
          password: '1234',
        },
      },
    });
    expect(responseSignIn.raw.req.url).toBe(app.reverse('session'));
  });

  test('GET /session/new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newSession'),
    });
    expect(response.statusCode).toBe(200);
  });

  afterEach(async () => {
    await app.objection.knex('users').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
