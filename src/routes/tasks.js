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
  app.get('/tasks/new', async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const users = await app.objection.models.user.query();
    const statuses = await app.objection.models.taskStatus.query();
    reply.render('tasks/new', { users, statuses });
    return reply;
  });
  app.get('/tasks/:id/edit', { name: 'editTask' }, async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const { id } = request.params;
    const task = await app.objection.models.task.query().findById(id);
    const statuses = await app.objection.models.taskStatus.query();
    const users = await app.objection.models.user.query();
    reply.render('tasks/edit', { task, statuses, users });
    return reply;
  });
  app.get('/tasks/:id', async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const { id } = request.params;
    const task = await app.objection.models.task.query().findById(id).withGraphJoined('[taskStatus, creator, executor]');
    reply.render('tasks/view', { task });
    return reply;
  });
  app.post('/tasks', async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    try {
      const creatorId = String(request.user.id);
      const executorId = request.body.data.executorId || undefined;
      const validTask = await app
        .objection.models.task.fromJson({ ...request.body.data, creatorId, executorId });
      await app.objection.models.task.query().insert(validTask);
      request.flash('success', i18next.t('flash.tasks.success'));
      reply.redirect('/tasks');
    } catch (errors) {
      request.flash('error', i18next.t('flash.tasks.createError'));
      const users = await app.objection.models.user.query();
      const statuses = await app.objection.models.taskStatus.query();
      reply.render('/tasks/new', {
        task: request.body.data,
        errors: errors.data,
        users,
        statuses,
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
      const task = new app.objection.models.task();
      task.$set({ id, ...request.body.data });
      const executorId = request.body.data.executorId || undefined;
      await task.$query().findById(id).patch({ ...request.body.data, executorId });
      request.flash('success', i18next.t('flash.tasks.edit'));
      reply.redirect(app.reverse('tasks'));
    } catch (errors) {
      request.flash('error', i18next.t('flash.tasks.editError'));
      const statuses = await app.objection.models.taskStatus.query();
      const users = await app.objection.models.user.query();
      reply.render('tasks/edit', {
        task: { id, ...request.body.data },
        statuses,
        users,
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

    await app.objection.models.task.query().deleteById(id);
    request.flash('success', i18next.t('flash.tasks.delete'));
    reply.redirect(app.reverse('tasks'));
    return reply;
  });
};