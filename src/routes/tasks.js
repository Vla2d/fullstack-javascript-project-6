import i18next from 'i18next';

export default (app) => {
  app.get('/tasks', { name: 'tasks', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;
    const {
      status, executor, label, isCreatorUser,
    } = request.query;

    const tasks = await models.task.query()
      .withGraphJoined('[taskStatus, creator, executor, labels]')
      .modify((queryBuilder) => {
        if (status) queryBuilder.where('statusId', '=', status);
        if (executor) queryBuilder.where('executor.id', '=', executor);
        if (label) queryBuilder.where('labels.id', '=', label);
        if (isCreatorUser) queryBuilder.where('creator.id', '=', request.user.id);
      });

    const statuses = await models.taskStatus.query();
    const labels = await models.label.query();
    const users = await models.user.query();
    reply.render('tasks/index', {
      tasks,
      statuses,
      labels,
      users,
      values:
      request.query,
    });
    return reply;
  });
  app.get('/tasks/new', { name: 'newTask', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;

    const users = await models.user.query();
    const statuses = await models.taskStatus.query();
    const labels = await models.label.query();
    reply.render('tasks/new', { users, statuses, labels });
    return reply;
  });
  app.get('/tasks/:id/edit', { name: 'editTask', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;
    const { id } = request.params;

    const task = await models.task.query().findById(id).withGraphJoined('[taskStatus, creator, executor, labels]');
    const selectedLabels = task.labels.map((label) => String(label.id));
    const statuses = await models.taskStatus.query();
    const users = await models.user.query();
    const labels = await models.label.query();
    reply.render('tasks/edit', {
      task: { ...task, labels: selectedLabels },
      statuses,
      users,
      labels,
    });
    return reply;
  });
  app.get('/tasks/:id', { name: 'showTask', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;
    const { id } = request.params;

    const task = await models.task.query().findById(id).withGraphJoined('[taskStatus, creator, executor, labels]');
    reply.render('tasks/view', { task });
    return reply;
  });
  app.post('/tasks', { name: 'createTask', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;
    const { data } = request.body;

    const parsedData = {
      id: Number(data.id),
      name: data.name.trim(),
      ...(data.description ? { description: data.description.trim() } : { description: null }),
      ...(data.statusId && { statusId: Number(data.statusId) }),
      ...(data.executorId ? { executorId: Number(data.executorId) } : { executorId: null }),
      ...(data.labels ? { labels: data.labels } : { labels: null }),
      creatorId: request.user.id,
    };

    try {
      await models.task.transaction(async (trx) => {
        const validTask = await models.task.fromJson({ ...parsedData });
        await models.task.query(trx).insert(validTask);

        if (parsedData.labels) {
          const labels = [...parsedData.labels];
          const results = labels.map((label) => validTask.$relatedQuery('labels', trx).relate(label));
          await Promise.all(results);
        }
      });

      request.flash('success', i18next.t('flash.tasks.success'));
      reply.redirect('/tasks');
    } catch (errors) {
      request.flash('error', i18next.t('flash.tasks.createError'));
      const users = await models.user.query();
      const statuses = await models.taskStatus.query();
      const labels = await models.label.query();
      reply.render('/tasks/new', {
        task: parsedData,
        errors: errors.data,
        users,
        statuses,
        labels,
      });
      reply.code(422);
    }
    return reply;
  });
  app.patch('/tasks/:id', { name: 'updateTask', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;
    const { data } = request.body;
    const { id } = request.params;

    const parsedData = {
      ...(data.id && { id: Number(data.id) }),
      name: data.name.trim(),
      ...(data.description ? { description: data.description.trim() } : { description: null }),
      statusId: Number(data.statusId),
      ...(data.executorId ? { executorId: Number(data.executorId) } : { executorId: null }),
      ...(data.labels ? { labels: data.labels } : { labels: null }),
      ...(data.creatorId && { creatorId: Number(data.creatorId) }),
    };

    try {
      await models.task.transaction(async (trx) => {
        const task = new models.task();
        task.$set({ id, ...parsedData });
        await task.$query(trx).findById(id).patch({ ...parsedData });
        if (parsedData.labels) {
          await task.$relatedQuery('labels', trx).unrelate();
          const labels = [...parsedData.labels];
          const results = labels.map((label) => task.$relatedQuery('labels', trx).relate(label));
          await Promise.all(results);
        }
      });
      request.flash('success', i18next.t('flash.tasks.edit'));
      reply.redirect(app.reverse('tasks'));
    } catch (errors) {
      request.flash('error', i18next.t('flash.tasks.editError'));
      const statuses = await models.taskStatus.query();
      const users = await models.user.query();
      const labels = await models.label.query();
      reply.render('tasks/edit', {
        task: { id, ...parsedData },
        statuses,
        users,
        labels,
        errors: errors.data,
      });
      reply.code(422);
    }
    return reply;
  });
  app.delete('/tasks/:id', { name: 'deleteTask', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;
    const { id } = request.params;

    const task = await models.task.query().findById(id);

    if (request.user.id !== task.creatorId) {
      request.flash('error', i18next.t('flash.tasks.authorizationError'));
      reply.code(403);
      reply.redirect(app.reverse('tasks'));
      return reply;
    }

    await task.$relatedQuery('labels').unrelate();
    await models.task.query().deleteById(id);
    request.flash('success', i18next.t('flash.tasks.delete'));

    reply.redirect(app.reverse('tasks'));
    return reply;
  });
};
