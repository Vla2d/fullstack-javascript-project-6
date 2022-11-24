import {
  describe, beforeAll, beforeEach, test, expect, afterEach, afterAll,
} from '@jest/globals';
import fastify from 'fastify';
import build from '../src/server.js';

describe('test labels CRUD', () => {
  let app;
  let cookie;

  beforeAll(async () => {
    app = fastify();
    await build(app);
    await app.objection.knex.migrate.latest();
    await app.objection.knex('users').insert({ email: 'admin123@gmail.com', password_digest: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3' });
    const response = await app.inject({
      method: 'POST',
      url: '/session',
      payload: {
        data: { email: 'admin123@gmail.com', password: '123' },
      },
    });
    const [sessionCookie] = response.cookies;
    const { name, value } = sessionCookie;
    cookie = { [name]: value };
  });

  beforeEach(async () => {
    await app.objection.knex('labels').insert({ name: 'новая' });
  });

  test('GET /labels', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/labels',
    });
    expect(response.statusCode).toBe(302);
  });

  test('GET /labels/new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/labels/new',
    });
    expect(response.statusCode).toBe(302);
  });

  test('GET /labels/1/edit', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/labels/1/edit',
    });
    expect(response.statusCode).toBe(302);
  });

  test('PATCH /labels/1', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/labels/1',
    });
    expect(response.statusCode).toBe(302);
  });

  test('DELETE /labels/1', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/labels/1',
    });
    expect(response.statusCode).toBe(302);
  });

  test('DELETE /labels', async () => {
    await app.inject({
      method: 'DELETE',
      url: '/labels/1',
      cookies: cookie,
    });
    const users = await app.objection.models.label.query();
    expect(users).toEqual([]);
  });

  test('GET /labels', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/labels',
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  test('POST /labels', async () => {
    await app.inject({
      method: 'POST',
      url: '/labels',
      payload: {
        data: {
          name: 'Cрочно сделать',
        },
      },
      cookies: cookie,
    });
    const taskStatus = await app.objection.models.label.query().findById(2);
    const { name } = taskStatus;
    expect(name).toBe('Cрочно сделать');
  });

  test('PATCH /labels', async () => {
    await app.inject({
      method: 'PATCH',
      url: '/labels/1',
      cookies: cookie,
      payload: {
        data: {
          name: 'Переделать',
        },
      },
    });
    const taskStatus = await app.objection.models.label.query().findById(1);
    const { name } = taskStatus;
    expect(name).toBe('Переделать');
  });

  afterEach(async () => {
    await app.objection.knex('labels').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
