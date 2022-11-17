import i18next from 'i18next';

export default (app) => {
  app.get('/users', { name: 'users' }, async (request, reply) => {
    const users = await app.objection.models.user.query();
    reply.render('users/index', { users });
    return reply;
  });
  app.get('/users/new', { name: 'newUser' }, (request, reply) => {
    reply.render('users/new');
  });
  app.get('/users/:id/edit', { name: 'editUser' }, async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const { id } = request.params;
    if (String(request.user.id) !== id) {
      request.flash('error', i18next.t('flash.users.authorizationError'));
      reply.redirect(app.reverse('users'));
      return reply;
    }

    const user = await app.objection.models.user.query().findById(id);
    reply.render('users/edit', { user });
    return reply;
  });
  app.post('/users', async (request, reply) => {
    try {
      const validUser = await app.objection.models.user.fromJson(request.body.data);
      await app.objection.models.user.query().insert(validUser);
      request.flash('success', i18next.t('flash.users.success'));
      reply.redirect(app.reverse('index'));
    } catch (errors) {
      request.flash('error', i18next.t('flash.users.error'));
      reply.render('/users/new', { errors: errors.data, user: request.body.data });
    }
    return reply;
  });
  app.patch('/users/:id', async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    try {
      const { id } = request.params;
      const user = new app.objection.models.user();
      user.$set(request.user);
      await user.$query().findById(id).patch(request.body.data);
      request.flash('success', i18next.t('flash.users.edit'));
      reply.redirect(app.reverse('users'));
    } catch (errors) {
      request.flash('error', i18next.t('flash.users.editError'));
      reply.render('users/edit', { user: request.body.data, errors: errors.data });
    }
    return reply;
  });
  app.delete('/users/:id', { name: 'deleteUser' }, async (request, reply) => {
    if (!app.isAuth(request, reply)) {
      return reply;
    }

    const { id } = request.params;
    if (String(request.user.id) !== id) {
      request.flash('error', i18next.t('flash.users.authorizationError'));
      reply.redirect(app.reverse('users'));
      return reply;
    }

    try {
      await app.objection.models.user.query().deleteById(id);
      await request.logOut();
      request.flash('success', i18next.t('flash.users.delete'));
    } catch (error) {
      request.flash('error', i18next.t('flash.users.deleteError'));
    }
    reply.redirect(app.reverse('users'));
    return reply;
  });
};
