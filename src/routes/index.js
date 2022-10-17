export default (app) => {
    app.get('/', { name: 'root'}, (request, reply) => reply.send('Hello, world!'));
    app.get('/test', { name: 'test'}, (request, reply) => reply.send('Hello, test!'));
};