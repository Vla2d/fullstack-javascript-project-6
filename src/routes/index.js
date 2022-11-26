export default (app) => {
  app.get('/', { name: 'index' }, (request, reply) => reply.render('index'));
};
