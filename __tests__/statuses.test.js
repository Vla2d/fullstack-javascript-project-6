import {
  describe, beforeAll, beforeEach, test, expect, afterEach, afterAll,
} from '@jest/globals';
import fastify from 'fastify';
import build from '../src/server.js';

describe('test statuses CRUD with login', () => {
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
    await app.objection.knex('task_statuses').insert({ name: 'новый' });
  });

  test('GET /statuses', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/statuses',
    });
    expect(response.statusCode).toBe(302);
  });

  test('GET /statuses/new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/statuses/new',
    });
    expect(response.statusCode).toBe(302);
  });

  test('GET /statuses/1/edit', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/statuses/1/edit',
    });
    expect(response.statusCode).toBe(302);
  });

  test('PATCH /statuses/1', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/statuses/1',
    });
    expect(response.statusCode).toBe(302);
  });

  test('DELETE /users/1', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/statuses/1',
    });
    expect(response.statusCode).toBe(302);
  });

  test('DELETE /statuses', async () => {
    await app.inject({
      method: 'DELETE',
      url: '/statuses/1',
      cookies: cookie,
    });
    const users = await app.objection.models.taskStatus.query();
    expect(users).toEqual([]);
  });

  test('GET /statuses', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/statuses',
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  test('POST /statuses', async () => {
    await app.inject({
      method: 'POST',
      url: '/statuses',
      payload: {
        data: {
          name: 'На тестировании',
        },
      },
      cookies: cookie,
    });
    const taskStatus = await app.objection.models.taskStatus.query().findById(2);
    const { name } = taskStatus;
    expect(name).toBe('На тестировании');
  });

  test('PATCH /statuses', async () => {
    await app.inject({
      method: 'PATCH',
      url: '/statuses/1',
      cookies: cookie,
      payload: {
        data: {
          name: 'В работе',
        },
      },
    });
    const taskStatus = await app.objection.models.taskStatus.query().findById(1);
    const { name } = taskStatus;
    expect(name).toBe('В работе');
  });

  afterEach(async () => {
    await app.objection.knex('task_statuses').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
