import {
  describe, beforeAll, beforeEach, test, expect, afterEach, afterAll,
} from '@jest/globals';
import fastify from 'fastify';
import build from '../src/server.js';
import { getSessionCookie } from './helpers/index.js';

describe('test users CRUD', () => {
  let app;
  let cookie;

  beforeAll(async () => {
    app = fastify();
    await build(app);
    await app.objection.knex.migrate.latest();
  });

  beforeEach(async () => {
    cookie = await getSessionCookie(app);
  });

  test('GET /users/new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users/new',
    });
    expect(response.statusCode).toBe(200);
  });

  test('GET /users/1/edit', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users/1/edit',
    });
    expect(response.statusCode).toBe(302);
  });

  test('PATCH /users/1', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/users/1',
    });
    expect(response.statusCode).toBe(302);
  });

  test('DELETE /users/1', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/users/1',
    });
    expect(response.statusCode).toBe(302);
  });

  test('GET /users', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users',
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  test('DELETE /users', async () => {
    await app.inject({
      method: 'DELETE',
      url: '/users/1',
      cookies: cookie,
    });
    const users = await app.objection.models.user.query();
    expect(users).toEqual([]);
  });

  test('PATCH /users', async () => {
    await app.inject({
      method: 'PATCH',
      url: '/users/1',
      cookies: cookie,
      payload: {
        data: {
          firstName: 'admin123',
          lastName: 'admin123',
          email: 'admin123@gmail.com',
          password: '123',
        },
      },
    });
    const user = await app.objection.models.user.query().findById(1);
    const { firstName } = user;
    expect(firstName).toBe('admin123');
  });

  test('POST /users', async () => {
    await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        data: {
          firstName: 'admin1234',
          lastName: 'admin1234',
          email: 'admin1234@gmail.com',
          password: '123',
        },
      },
    });

    const user = await app.objection.models.user.query().findById(2);
    const { email } = user;
    expect(email).toBe('admin1234@gmail.com');
  });

  afterEach(async () => {
    await app.objection.knex('users').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
