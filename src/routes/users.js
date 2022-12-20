import i18next from 'i18next';

export default (app) => {
  app.get('/users', { name: 'users' }, async (request, reply) => {
    const { models } = app.objection;

    const users = await models.user.query();
    reply.render('users/index', { users });
    return reply;
  });
  app.get('/users/new', { name: 'newUser' }, (request, reply) => {
    reply.render('users/new');
  });
  app.get('/users/:id/edit', { name: 'editUser' }, async (request, reply) => {
    const { models } = app.objection;
    const { id } = request.params;

    if (String(request.user.id) !== id) {
      request.flash('error', i18next.t('flash.users.authorizationError'));
      reply.redirect(app.reverse('users'));
      return reply;
    }

    const user = await models.user.query().findById(id);
    reply.render('users/edit', { user });
    reply.code(302);
    return reply;
  });
  app.post('/users', async (request, reply) => {
    const { models } = app.objection;
    const { data } = request.body;

    try {
      const validUser = await models.user.fromJson(data);
      await models.user.query().insert(validUser);
      request.flash('success', i18next.t('flash.users.success'));
      reply.redirect(app.reverse('index'));
    } catch (errors) {
      request.flash('error', i18next.t('flash.users.error'));
      reply.render('/users/new', { errors: errors.data, user: data });
    }
    return reply;
  });
  app.patch('/users/:id', { name: 'updateUserData' }, async (request, reply) => {
    const { models } = app.objection;
    const { data } = request.body;

    try {
      const { id } = request.params;
      const user = new models.user();
      user.$set(request.user);
      await user.$query().findById(id).patch(data);
      request.flash('success', i18next.t('flash.users.edit'));
      reply.redirect(app.reverse('users'));
    } catch (errors) {
      request.flash('error', i18next.t('flash.users.editError'));
      reply.render('users/edit', { user: data, errors: errors.data });
      reply.code(422);
    }
    return reply;
  });
  app.delete('/users/:id', { name: 'deleteUser' }, async (request, reply) => {
    const { models } = app.objection;
    const { id } = request.params;

    if (String(request.user.id) !== id) {
      request.flash('error', i18next.t('flash.users.authorizationError'));
      reply.redirect(app.reverse('users'));
      return reply;
    }

    try {
      await models.user.query().deleteById(id);
      await request.logOut();
      request.flash('success', i18next.t('flash.users.delete'));
    } catch (error) {
      request.flash('error', i18next.t('flash.users.deleteError'));
      reply.code(422);
    }
    reply.redirect(app.reverse('users'));
    return reply;
  });
};
