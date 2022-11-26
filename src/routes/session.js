import i18next from 'i18next';

export default (app) => {
  app.get('/session/new', { name: 'newSession' }, (request, reply) => {
    const errors = {};
    reply.render('session/new', { errors });
  });
  app.post(
    '/session',
    { name: 'session' },
    app.fp.authenticate('local', async (request, reply, error, user) => {
      if (error) {
        return app.httpErrors.internalServerError(error);
      }
      if (!user) {
        const signInForm = request.body.data;
        const errors = {
          email: [{ message: i18next.t('views.session.new.error') }],
        };
        reply.render('session/new', { signInForm, errors });
      }
      await request.logIn(user);
      request.flash('success', i18next.t('flash.session.success'));
      reply.redirect(app.reverse('index'));
      return reply;
    }),
  );
  app.delete('/session', (request, reply) => {
    request.flash('success', i18next.t('flash.session.delete'));
    request.logOut();
    reply.redirect(app.reverse('index'));
  });
};
