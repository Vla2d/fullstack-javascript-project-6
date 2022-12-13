import i18next from 'i18next';

export default (app) => {
  app.get('/labels', { name: 'labels', preValidation: app.fp.isAuth }, async (request, reply) => {
    const labels = await app.objection.models.label.query();
    reply.render('labels/index', { labels });
    return reply;
  });
  app.get('/labels/new', { name: 'newLabel', preValidation: app.fp.isAuth }, (request, reply) => {
    reply.render('labels/new');
    return reply;
  });
  app.get('/labels/:id/edit', { name: 'editLabel', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { id } = request.params;
    const label = await app.objection.models.label.query().findById(id);
    reply.render('labels/edit', { label });
    return reply;
  });
  app.post('/labels', { preValidation: app.fp.isAuth }, async (request, reply) => {
    try {
      const validLabel = await app.objection.models.label.fromJson(request.body.data);
      await app.objection.models.label.query().insert(validLabel);
      request.flash('success', i18next.t('flash.labels.success'));
      reply.redirect(app.reverse('labels'));
    } catch (errors) {
      request.flash('error', i18next.t('flash.labels.createError'));
      reply.render('/labels/new', { label: request.body.data, errors: errors.data });
      reply.code(422);
    }
    return reply;
  });
  app.patch('/labels/:id', { name: 'updateLabel', preValidation: app.fp.isAuth }, async (request, reply) => {
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
      reply.code(422);
    }
    return reply;
  });
  app.delete('/labels/:id', { name: 'deleteLabel', preValidation: app.fp.isAuth }, async (request, reply) => {
    try {
      const { id } = request.params;
      await app.objection.models.label.query()
        .deleteById(id);
      request.flash('success', i18next.t('flash.labels.delete'));
      reply.redirect(app.reverse('labels'));
    } catch (errors) {
      request.flash('error', i18next.t('flash.labels.deleteError'));
      reply.redirect(app.reverse('labels'));
      reply.code(422);
    }
    return reply;
  });
};
