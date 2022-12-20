import i18next from 'i18next';

export default (app) => {
  app.get('/labels', { name: 'labels', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;

    const labels = await models.label.query();
    reply.render('labels/index', { labels });
    return reply;
  });
  app.get('/labels/new', { name: 'newLabel', preValidation: app.fp.isAuth }, (request, reply) => {
    reply.render('labels/new');
    return reply;
  });
  app.get('/labels/:id/edit', { name: 'editLabel', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;
    const { id } = request.params;

    const label = await models.label.query().findById(id);
    reply.render('labels/edit', { label });
    return reply;
  });
  app.post('/labels', { preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;
    const { data } = request.body;

    try {
      const validLabel = await models.label.fromJson(data);
      await models.label.query().insert(validLabel);
      request.flash('success', i18next.t('flash.labels.success'));
      reply.redirect(app.reverse('labels'));
    } catch (errors) {
      request.flash('error', i18next.t('flash.labels.createError'));
      reply.render('/labels/new', { label: data, errors: errors.data });
      reply.code(422);
    }
    return reply;
  });
  app.patch('/labels/:id', { name: 'updateLabel', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;
    const { data } = request.body;
    const { id } = request.params;

    const label = new models.label();
    label.$set({ id, ...data });

    try {
      await label.$query().findById(id).patch(data);
      request.flash('success', i18next.t('flash.labels.edit'));
      reply.redirect(app.reverse('labels'));
    } catch (errors) {
      request.flash('error', i18next.t('flash.labels.editError'));
      reply.render('labels/edit', { label: data, errors: errors.data });
      reply.code(422);
    }
    return reply;
  });
  app.delete('/labels/:id', { name: 'deleteLabel', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;

    try {
      const { id } = request.params;
      await models.label.query()
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
