export default (app) => {
  app.get('/', { name: 'index' }, (request, reply) => reply.render('index'));
  app.get('/test', { name: 'test' }, (request, reply) => reply.send('Hello, test!'));
};
