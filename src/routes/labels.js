import i18next from 'i18next';

export default (app) => {
  app.get('/labels', { name: 'labels' }, async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const labels = await app.objection.models.label.query();
    reply.render('labels/index', { labels });
    return reply;
  });
  app.get('/labels/new', { name: 'newLabel' }, (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    reply.render('labels/new');
    return reply;
  });
  app.get('/labels/:id/edit', { name: 'editLabel' }, async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const { id } = request.params;
    const label = await app.objection.models.label.query().findById(id);
    reply.render('labels/edit', { label });
    return reply;
  });
  app.post('/labels', async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    try {
      const validLabel = await app.objection.models.label.fromJson(request.body.data);
      await app.objection.models.label.query().insert(validLabel);
      request.flash('success', i18next.t('flash.labels.success'));
      reply.redirect(app.reverse('labels'));
    } catch (errors) {
      request.flash('error', i18next.t('flash.labels.createError'));
      reply.render('/labels/new', { label: request.body.data, errors: errors.data });
    }
    return reply;
  });
  app.patch('/labels/:id', async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const { id } = request.params;
    const label = new app.objection.models.label();
    label.$set({ id, ...request.body.data });
    try {
      await label.$query().findById(id).patch(request.body.data);
      request.flash('success', i18next.t('flash.labels.edit'));
      reply.redirect(app.reverse('labels'));
    } catch (errors) {
      request.flash('error', i18next.t('flash.labels.editError'));
      reply.render('labels/edit', { label: request.body.data, errors: errors.data });
    }
    return reply;
  });
  app.delete('/labels/:id', { name: 'deleteLabel' }, async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    try {
      const { id } = request.params;
      await app.objection.models.label.query()
        .deleteById(id);
      request.flash('success', i18next.t('flash.labels.delete'));
      reply.redirect(app.reverse('labels'));
    } catch (errors) {
      request.flash('error', i18next.t('flash.labels.deleteError'));
      reply.redirect(app.reverse('labels'));
    }
    return reply;
  });
};
