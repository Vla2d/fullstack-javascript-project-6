import addRoutes from './routes/add-routes.js';
import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';

const registerPlugins = (app) => {
  app.register(fastifyReverseRoutes);
};

// eslint-disable-next-line no-unused-vars
export default (app, options) => {
  registerPlugins(app);
  addRoutes(app);
  return app;
};