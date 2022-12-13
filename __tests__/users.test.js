import {
  describe, beforeAll, it, expect, afterAll,
} from '@jest/globals';
import fastify from 'fastify';
import _ from 'lodash';
import build from '../src/server.js';
import encrypt from '../src/lib/secure.js';
import {
  getTestData, prepareData, signIn,
} from './helpers/index.js';

describe('statuses CRUD', () => {
  let app;
  let knex;
  let models;
  let cookie;
  const testData = getTestData();
  const requiredDataToPrepare = ['users'];

  const existedUser = testData.users.existing;

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

  it('shows users page', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });
    expect(response.statusCode).toBe(200);
  });

  it('shows sign up page', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newUser'),
    });
    expect(response.statusCode).toBe(200);
  });

  it('creates user', async () => {
    const newUserData = testData.users.new;
    const response = await app.inject({
      method: 'POST',
      url: app.reverse('users'),
      cookies: cookie,
      payload: {
        data: newUserData,
      },
    });
    expect(response.statusCode).toBe(302);

    const expected = {
      ..._.omit(newUserData, 'password'),
      passwordDigest: encrypt(newUserData.password),
    };
    const user = await models.user.query().findOne({ email: newUserData.email });
    expect(user).toMatchObject(expected);
  });

  it('shows existing user edit page', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editUser', { id: existedUser.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);
  });

  it('edits user own account', async () => {
    const newData = {
      firstName: 'Napoleon',
      lastName: 'Bonaparte',
      email: 'war@di.com',
      password: 'password',
    };

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateUserData', { id: existedUser.id }),
      cookies: cookie,
      payload: {
        data: newData,
      },
    });
    expect(response.statusCode).toBe(302);

    const userData = await models.user.query().findById(existedUser.id);
    const expected = {
      ..._.omit(newData, 'password'),
      passwordDigest: encrypt(newData.password),
    };
    expect(userData).toMatchObject(expected);
  });

  it('deletes user own account', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: app.reverse('deleteUser', { id: existedUser.id }),
      cookies: cookie,
    });

    expect(response.statusCode).toBe(302);

    const user = await models.user.query().findById(existedUser.id);
    expect(user).toBeUndefined();
  });

  afterAll(() => {
    app.close();
  });
});
