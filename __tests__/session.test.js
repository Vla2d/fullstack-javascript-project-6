import {
  describe, beforeAll, it, expect, afterAll,
} from '@jest/globals';
import fastify from 'fastify';
import build from '../src/server.js';
import {
  getTestData, prepareData, signIn,
} from './helpers/index.js';

describe('statuses CRUD', () => {
  let app;
  let knex;
  const testData = getTestData();
  const requiredDataToPrepare = ['users', 'tasks', 'task_statuses', 'labels', 'tasks_labels'];

  beforeAll(async () => {
    const appBuild = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    });
    app = await build(appBuild);
    knex = app.objection.knex;

    await knex.migrate.latest();
    await prepareData(requiredDataToPrepare, app);
  });

  it('shows login page', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newSession'),
    });
    expect(response.statusCode).toBe(200);
  });

  it('signs in', async () => {
    const responseSignIn = await app.inject({
      method: 'POST',
      url: app.reverse('session'),
      payload: {
        data: testData.users.existing,
      },
    });

    expect(responseSignIn.statusCode).toBe(302);
  });

  it('signs out', async () => {
    const cookie = await signIn(app, testData.users.existing);

    const responseSignOut = await app.inject({
      method: 'DELETE',
      url: app.reverse('session'),
      cookies: cookie,
    });
    expect(responseSignOut.statusCode).toBe(302);
  });

  afterAll(() => {
    app.close();
  });
});
