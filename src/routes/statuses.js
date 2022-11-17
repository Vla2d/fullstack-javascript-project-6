import i18next from 'i18next';

export default (app) => {
  app.get('/statuses', { name: 'statuses' }, async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const statuses = await app.objection.models.taskStatus.query();
    reply.render('statuses/index', { statuses });
    return reply;
  });
  app.get('/statuses/new', { name: 'newStatus' }, (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    reply.render('statuses/new');
    return reply;
  });
  app.get('/statuses/:id/edit', { name: 'editStatus' }, async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const { id } = request.params;
    const status = await app.objection.models.taskStatus.query().findById(id);
    reply.render('statuses/edit', { status });
    return reply;
  });
  app.post('/statuses', async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    try {
      const validStatus = await app.objection.models.taskStatus.fromJson(request.body.data);
      await app.objection.models.taskStatus.query().insert(validStatus);
      request.flash('success', i18next.t('flash.statuses.success'));
      reply.redirect(app.reverse('statuses'));
    } catch (errors) {
      request.flash('error', i18next.t('flash.statuses.createError'));
      reply.render('/statuses/new', { errors: errors.data });
    }
    return reply;
  });
  app.patch('/statuses/:id', async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const { id } = request.params;
    try {
      const status = new app.objection.models.taskStatus();
      status.$set({ id, ...request.body.data });
      await status.$query().findById(id).patch(request.body.data);
      request.flash('success', i18next.t('flash.statuses.edit'));
      reply.redirect('/statuses');
    } catch (errors) {
      request.flash('error', i18next.t('flash.statuses.editError'));
      reply.render('statuses/edit', { status: { id, ...request.body.data }, errors: errors.data });
    }
    return reply;
  });
  app.delete('/statuses/:id', { name: 'deleteStatus' }, async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    try {
      const { id } = request.params;
      await app.objection.models.taskStatus.query().deleteById(id);
      request.flash('success', i18next.t('flash.statuses.delete'));
    } catch (error) {
      request.flash('error', i18next.t('flash.statuses.deleteError'));
    }
    reply.redirect(app.reverse('statuses'));
    return reply;
  });
};
