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
  let models;
  let cookie;
  const testData = getTestData();
  const requiredDataToPrepare = ['users', 'task_statuses'];

  beforeAll(async () => {
    const appBuild = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    });
    app = await build(appBuild);
    knex = app.objection.knex;
    models = app.objection.models;

    await knex.migrate.latest();
    await prepareData(requiredDataToPrepare, app);
    cookie = await signIn(app, testData.users.existing);
  });

  it('shows statuses page', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('statuses'),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('shows new status page', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newStatus'),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('creates new status', async () => {
    const updatedData = testData.statuses.new;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('statusCreate'),
      cookies: cookie,
      payload: {
        data: updatedData,
      },
    });
    expect(response.statusCode).toBe(302);

    const status = await models.taskStatus.query().findOne({ name: updatedData.name });
    expect(status).toMatchObject(updatedData);
  });

  it('shows existing status edit page', async () => {
    const { id } = testData.statuses.existing;

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editStatus', { id }),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('updates existing status', async () => {
    const { id } = testData.statuses.existing;
    const updatedData = { name: 'new status' };

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateStatus', { id }),
      cookies: cookie,
      payload: {
        data: updatedData,
      },
    });
    expect(response.statusCode).toBe(302);

    const status = await models.taskStatus.query().findById(id);
    expect(status).toMatchObject({ ...testData.statuses.existing, ...updatedData });
  });

  it('delete status', async () => {
    const { existing } = testData.statuses;

    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteStatus', { id: existing.id }),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(302);

    const status2 = await models.taskStatus.query().findById(existing.id);
    expect(status2).toBeUndefined();
  });

  afterAll(() => {
    app.close();
  });
});
