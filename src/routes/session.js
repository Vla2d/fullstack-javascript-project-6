import i18next from 'i18next';

export default (app) => {
  app.get('/session/new', { name: 'newSession' }, (request, reply) => {
    const errors = {};
    reply.render('session/new', { errors });
  });
  app.post(
    '/session',
    { name: 'session' },
    app.fp.authenticate('local', async (requset, reply, error, user) => {
      if (!user) {
        const errors = {
          email: [{ message: i18next.t('views.session.new.error') }],
        };
        return reply.render('session/new', { errors, values: requset.body.data });
      }
      await requset.logIn(user);
      requset.flash('success', i18next.t('flash.session.success'));
      return reply.redirect(app.reverse('index'));
    }),
  );
  app.delete('/session', (request, reply) => {
    request.flash('success', i18next.t('flash.session.delete'));
    request.logOut();
    reply.redirect(app.reverse('index'));
  });
};
