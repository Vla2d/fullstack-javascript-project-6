import i18next from 'i18next';

export default (app) => {
  app.get('/tasks', { name: 'tasks' }, async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const tasks = await app.objection.models.task.query().withGraphJoined('[taskStatus, creator, executor]');
    reply.render('tasks/index', { tasks });
    return reply;
  });
  app.get('/tasks/new', { name: 'newTask' }, async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const users = await app.objection.models.user.query();
    const statuses = await app.objection.models.taskStatus.query();
    const labels = await app.objection.models.label.query();
    reply.render('tasks/new', { users, statuses, labels });
    return reply;
  });
  app.get('/tasks/:id/edit', { name: 'editTask' }, async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const { id } = request.params;
    const task = await app.objection.models.task.query().findById(id).withGraphJoined('[taskStatus, creator, executor, labels]');
    const selectedLabels = task.labels.map((label) => String(label.id));
    const statuses = await app.objection.models.taskStatus.query();
    const users = await app.objection.models.user.query();
    const labels = await app.objection.models.label.query();
    reply.render('tasks/edit', {
      task: { ...task, labels: selectedLabels },
      statuses,
      users,
      labels,
    });
    return reply;
  });
  app.get('/tasks/:id', async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const { id } = request.params;
    const task = await app.objection.models.task.query().findById(id).withGraphJoined('[taskStatus, creator, executor, labels]');
    reply.render('tasks/view', { task });
    return reply;
  });
  app.post('/tasks', async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    try {
      await app.objection.models.task.transaction(async (trx) => {
        const creatorId = String(request.user.id);
        const executorId = request.body.data.executorId || undefined;
        const validTask = await app
          .objection.models.task.fromJson({ ...request.body.data, creatorId, executorId });
        await app.objection.models.task.query(trx)
          .insert(validTask);

        if (request.body.data.labels) {
          const labels = [...request.body.data.labels];
          const results = labels.map((label) => validTask.$relatedQuery('labels', trx).relate(label));
          await Promise.all(results);
        }
      });

      request.flash('success', i18next.t('flash.tasks.success'));
      reply.redirect('/tasks');
    } catch (errors) {
      request.flash('error', i18next.t('flash.tasks.createError'));
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      const labels = await app.objection.models.label.query();
      reply.render('/tasks/new', {
        task: request.body.data,
        errors: errors.data,
        users,
        statuses,
        labels,
      });
    }
    return reply;
  });
  app.patch('/tasks/:id', { name: 'task' }, async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const { id } = request.params;
    try {
      await app.objection.models.task.transaction(async (trx) => {
        const task = new app.objection.models.task();
        task.$set({ id, ...request.body.data });
        const executorId = request.body.data.executorId || undefined;
        await task.$query(trx).findById(id).patch({ ...request.body.data, executorId });

        if (request.body.data.labels) {
          await task.$relatedQuery('labels', trx).unrelate();
          const labels = [...request.body.data.labels];
          const results = labels.map((label) => task.$relatedQuery('labels', trx).relate(label));
          await Promise.all(results);
        }
      });
      request.flash('success', i18next.t('flash.tasks.edit'));
      reply.redirect(app.reverse('tasks'));
    } catch (errors) {
      request.flash('error', i18next.t('flash.tasks.editError'));
      const statuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      const labels = await app.objection.models.label.query();
      reply.render('tasks/edit', {
        task: { id, ...request.body.data },
        statuses,
        users,
        labels,
        errors: errors.data,
      });
    }
    return reply;
  });
  app.delete('/tasks/:id', { name: 'deleteTask' }, async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const { id } = request.params;
    const task = await app.objection.models.task.query().findById(id);
    if (request.user.id !== task.creatorId) {
      request.flash('error', i18next.t('flash.tasks.authorizationError'));
      reply.redirect(app.reverse('tasks'));
      return reply;
    }

    await task.$relatedQuery('labels').unrelate();
    await app.objection.models.task.query().deleteById(id);
    request.flash('success', i18next.t('flash.tasks.delete'));
    reply.redirect(app.reverse('tasks'));
    return reply;
  });
};