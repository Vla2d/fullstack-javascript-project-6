import {
  describe, beforeAll, it, expect, afterAll,
} from '@jest/globals';
import fastify from 'fastify';
import build from '../src/server.js';
import {
  getTestData, prepareData, signIn,
} from './helpers/index.js';

describe('Labels CRUD', () => {
  let app;
  let knex;
  let models;
  let cookie;
  const testData = getTestData();
  const requiredDataToPrepare = ['users', 'labels'];

  beforeAll(async () => {
    const appBuild = fastify({
      exposeHeadRoutes: false,
      logger: { target: 'pino-pretty' },
    });
    app = await build(appBuild);
    knex = app.objection.knex;
    models = app.objection.models;

    await knex.migrate.latest();
    await prepareData(app, requiredDataToPrepare);
    cookie = await signIn(app, testData.users.existing);
  });

  it('shows labels page', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('labels'),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('shows create new label page', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newLabel'),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('shows existing label edit page', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editLabel', { id: testData.labels.existing.id }),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('creates new label', async () => {
    const newLabel = testData.labels.new;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('labels'),
      cookies: cookie,
      payload: {
        data: newLabel,
      },
    });
    expect(response.statusCode).toBe(302);

    const label = await models.label.query().findOne({ name: newLabel.name });
    expect(label).toMatchObject(newLabel);
  });

  it('updates existing label', async () => {
    const updatedData = { name: 'wontfix' };
    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateLabel', { id: testData.labels.existing.id }),
      cookies: cookie,
      payload: {
        data: updatedData,
      },
    });
    expect(response.statusCode).toBe(302);

    const label = await models.label.query().findById(testData.labels.existing.id);
    expect(label).toMatchObject({ ...testData.labels.existing, ...updatedData });
  });

  it('removes existing label', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteLabel', { id: testData.labels.existing.id }),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(302);

    const label = await models.label.query().findById(testData.labels.existing.id);
    expect(label).toBeUndefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
