import i18next from 'i18next';

export default (app) => {
  app.get('/statuses', { name: 'statuses', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;

    const statuses = await models.taskStatus.query();
    reply.render('statuses/index', { statuses });
    return reply;
  });
  app.get('/statuses/new', { name: 'newStatus', preValidation: app.fp.isAuth }, (request, reply) => {
    reply.render('statuses/new');
    return reply;
  });
  app.get('/statuses/:id/edit', { name: 'editStatus', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;
    const { id } = request.params;

    const status = await models.taskStatus.query().findById(id);
    reply.render('statuses/edit', { status });
    return reply;
  });
  app.post('/statuses', { name: 'statusCreate', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;
    const { data } = request.body;

    try {
      const validStatus = await models.taskStatus.fromJson(data);
      await models.taskStatus.query().insert(validStatus);
      request.flash('success', i18next.t('flash.statuses.success'));
      reply.redirect(app.reverse('statuses'));
    } catch (errors) {
      request.flash('error', i18next.t('flash.statuses.createError'));
      reply.render('/statuses/new', { errors: errors.data });
      reply.code(422);
    }
    return reply;
  });
  app.patch('/statuses/:id', { name: 'updateStatus', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;
    const { data } = request.body;
    const { id } = request.params;

    const status = new models.taskStatus();
    status.$set({ id, ...data });

    try {
      await status.$query().findById(id).patch(data);
      request.flash('success', i18next.t('flash.statuses.edit'));
      reply.redirect('/statuses');
    } catch (errors) {
      request.flash('error', i18next.t('flash.statuses.editError'));
      reply.render('statuses/edit', { status: data, errors: errors.data });
      reply.code(422);
    }
    return reply;
  });
  app.delete('/statuses/:id', { name: 'deleteStatus', preValidation: app.fp.isAuth }, async (request, reply) => {
    const { models } = app.objection;

    try {
      const { id } = request.params;
      await models.taskStatus.query().deleteById(id);
      request.flash('success', i18next.t('flash.statuses.delete'));
    } catch (error) {
      request.flash('error', i18next.t('flash.statuses.deleteError'));
      reply.code(422);
    }
    reply.redirect(app.reverse('statuses'));
    return reply;
  });
};
