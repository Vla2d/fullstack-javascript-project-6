import {
  describe, beforeAll, it, expect, afterAll,
} from '@jest/globals';
import fastify from 'fastify';
import _ from 'lodash';
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
  const requiredDataToPrepare = ['users', 'tasks', 'task_statuses', 'labels'];

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

  it('shows tasks page', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('tasks'),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('shows new task page', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('newTask'),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('creates new task', async () => {
    const {
      labels: { existing: existingLabel },
      tasks: { new: updatedTaskData },
    } = testData;

    const response = await app.inject({
      method: 'POST',
      url: app.reverse('createTask'),
      cookies: cookie,
      payload: {
        data: {
          ...updatedTaskData,
          labels: [existingLabel.id],
        },
      },
    });
    expect(response.statusCode).toBe(302);

    const task = await models.task.query().findOne({ name: updatedTaskData.name });
    expect(task).toMatchObject(updatedTaskData);

    const [relatedLabel] = await task.$relatedQuery('labels');
    expect(relatedLabel).toMatchObject(existingLabel);
  });

  it('shows existing task edit page', async () => {
    const { id } = testData.tasks.existing;

    const response = await app.inject({
      method: 'GET',
      url: app.reverse('editTask', { id }),
      cookies: cookie,
    });
    expect(response.statusCode).toBe(200);
  });

  it('updates existing task (from its creator)', async () => {
    const {
      tasks: { existing: existedTask },
      statuses: { existing2: anotherStatus },
    } = testData;

    const updatedTaskData = { name: 'Fix bug', statusId: Number(anotherStatus.id) };

    const response = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateTask', { id: existedTask.id }),
      cookies: cookie,
      payload: {
        data: updatedTaskData,
      },
    });
    expect(response.statusCode).toBe(302);

    const task = await models.task.query().findById(existedTask.id);
    expect(task).toMatchObject(updatedTaskData);

    // knex creates a table with 'created_at' property
    // so here we have to avoid it somehow in order to test with fixtures
    const relatedStatusWithCreatureDate = await task.$relatedQuery('taskStatus');
    const relatedStatus = _.omit(relatedStatusWithCreatureDate[0], ['createdAt']);
    expect(relatedStatus).toMatchObject(anotherStatus);
  });

  it('updates existing task (from another creator)', async () => {
    const {
      tasks: { existing2: existedTask2 },
      users: { existing: user1 },
      statuses: { existing: status },
    } = testData;

    const updatedTaskData = { name: 'Write tests', executorId: user1.id, statusId: status.id };

    const response3 = await app.inject({
      method: 'PATCH',
      url: app.reverse('updateTask', { id: existedTask2.id }),
      cookies: cookie,
      payload: {
        data: updatedTaskData,
      },
    });
    expect(response3.statusCode).toBe(302);

    const task = await models.task.query().findById(existedTask2.id);
    expect(task).toMatchObject(updatedTaskData);
  });

  it('deletes task (from its creator)', async () => {
    const {
      tasks: { existing: ownTask },
    } = testData;
    const response = await app.inject({
      method: 'DELETE',
      cookies: cookie,
      url: app.reverse('deleteTask', { id: ownTask.id }),
    });
    expect(response.statusCode).toBe(302);

    const task = await models.task.query().findById(ownTask.id);
    expect(task).toBeUndefined();
  });

  it('does not delete task (from another creator)', async () => {
    const {
      existing2: foreignTask,
    } = testData.tasks;

    const response = await app.inject({
      method: 'DELETE',
      cookies: cookie,
      url: app.reverse('deleteTask', { id: foreignTask.id }),
    });
    expect(response.statusCode).toBe(403);

    const task = await models.task.query().findById(foreignTask.id);
    expect(task).toMatchObject(task);
  });

  afterAll(() => {
    app.close();
  });
});
