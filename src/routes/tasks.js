import i18next from 'i18next';

export default (app) => {
  app.get('/tasks', { name: 'tasks', preValidation: app.fp.isAuth }, async (request, reply) => {
    const status = request.query.status || undefined;
    const executor = request.query.executor || undefined;
    const label = request.query.label || undefined;
    const creator = request.query.isCreatorUser === 'on' ? request.user.id : undefined;
    const tasks = await app.objection.models.task.query()
      .withGraphJoined('[taskStatus, creator, executor, labels]')
      .modify((queryBuilder) => {
        if (status) queryBuilder.where('task_status.id', '=', status);
        if (executor) queryBuilder.where('executor.id', '=', executor);
        if (label) queryBuilder.where('labels.id', '=', label);
        if (creator) queryBuilder.where('creator.id', '=', creator);
      });
    const statuses = await app.objection.models.taskStatus.query();
    const labels = await app.objection.models.label.query();
    const users = await app.objection.models.user.query();
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
    const users = await app.objection.models.user.query();
    const statuses = await app.objection.models.taskStatus.query();
    const labels = await app.objection.models.label.query();
    reply.render('tasks/new', { users, statuses, labels });
    return reply;
  });
  app.get('/tasks/:id/edit', { name: 'editTask', preValidation: app.fp.isAuth }, async (request, reply) => {
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
  app.get('/tasks/:id', { name: 'showTask', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { id } = request.params;
    const task = await app.objection.models.task.query().findById(id).withGraphJoined('[taskStatus, creator, executor, labels]');
    reply.render('tasks/view', { task });
    return reply;
  });
  app.post('/tasks', { name: 'createTask', preValidation: app.fp.isAuth }, async (request, reply) => {
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
      reply.code(422);
    }
    return reply;
  });
  app.patch('/tasks/:id', { name: 'updateTask', preValidation: app.fp.isAuth }, async (request, reply) => {
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
      reply.code(422);
    }
    return reply;
  });
  app.delete('/tasks/:id', { name: 'deleteTask', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { id } = request.params;
    const task = await app.objection.models.task.query().findById(id);

    if (request.user.id !== task.creatorId) {
      request.flash('error', i18next.t('flash.tasks.authorizationError'));
      reply.code(403);
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
