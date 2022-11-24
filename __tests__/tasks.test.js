import {
  describe, beforeAll, test, expect, afterEach, afterAll,
} from '@jest/globals';
import fastify from 'fastify';
import build from '../src/server.js';

describe('test tasks CRUD', () => {
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

  test('GET /tasks', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/tasks',
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  test('GET /tasks', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/tasks',
    });
    expect(response.statusCode).toBe(302);
  });

  test('GET /tasks/new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/tasks/new',
    });
    expect(response.statusCode).toBe(302);
  });

  test('GET /tasks/1', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/tasks/1',
    });
    expect(response.statusCode).toBe(302);
  });

  test('GET /tasks/1/edit', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/tasks/1/edit',
    });
    expect(response.statusCode).toBe(302);
  });

  test('POST /tasks', async () => {
    await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: {
        data: {
          creatorId: '1',
          name: 'Наименование задачи',
          statusId: '0',
        },
      },
      cookies: cookie,
    });
    const task = await app.objection.models.task.query().findById(1);
    const { name } = task;
    expect(name).toBe('Наименование задачи');
  });

  test('DELETE /tasks', async () => {
    await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: {
        data: {
          creatorId: '1',
          name: 'Наименование задачи',
          statusId: '0',
        },
      },
      cookies: cookie,
    });

    await app.inject({
      method: 'DELETE',
      url: '/tasks/1',
      cookies: cookie,
    });
    const users = await app.objection.models.task.query();
    expect(users)
      .toEqual([]);
  });

  test('PATCH /tasks', async () => {
    await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: {
        data: {
          creatorId: '1',
          name: 'Наименование задачи',
          statusId: '0',
        },
      },
      cookies: cookie,
    });

    await app.inject({
      method: 'PATCH',
      url: '/tasks/1',
      payload: {
        data: {
          creatorId: '1',
          name: 'Наименование задачи',
          statusId: '1',
        },
      },
      cookies: cookie,
    });
    const task = await app.objection.models.task.query().findById(1);
    const { statusId } = task;
    expect(statusId)
      .toBe(1);
  });

  test('GET /tasks/1', async () => {
    await app.inject({
      method: 'POST',
      url: '/statuses',
      payload: {
        data: {
          name: 'Новый',
        },
      },
      cookies: cookie,
    });

    await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: {
        data: {
          creatorId: '1',
          name: 'Наименование задачи',
          statusId: '1',
        },
      },
      cookies: cookie,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/tasks/1',
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  test('GET /tasks/1', async () => {
    await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: {
        data: {
          creatorId: '1',
          name: 'Наименование задачи',
          statusId: '0',
        },
      },
      cookies: cookie,
    });

    const response = await app.inject({
      method: 'GET',
      url: '/tasks/1/edit',
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  afterEach(async () => {
    await app.objection.knex('tasks').truncate();
  });

  afterAll(async () => {
    await app.close();
  });
});
