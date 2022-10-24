import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import pointOfView from 'point-of-view';
import pug from 'pug';
import i18next from 'i18next';
import fastifyStatic from '@fastify/static';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fastifyObjectionjs from 'fastify-objectionjs';
import fastifySecureSession from '@fastify/secure-session';
import fastifyPassport from '@fastify/passport';
import LocalStrategy from 'passport-local';
import _ from 'lodash';
import fastifyFormbody from '@fastify/formbody';
import qs from 'qs';
import fastifyMethodOverride from 'fastify-method-override';
import addRoutes from './routes/add-routes.js';
import ru from './locales/ru.js';
import knexConfig from '../knexfile.js';
import models from './models/index.js';

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname(fileURLToPath(import.meta.url));

const mode = process.env.NODE_ENV || 'development';

const setUpLocales = async () => {
  await i18next.init({
    lng: 'ru',
    resources: {
      ru,
    },
  });
};

const registerPlugins = async (app) => {
  await app.register(fastifyMethodOverride);
  app.register(fastifyReverseRoutes);
  app.register(fastifyFormbody, { parser: qs.parse });
  app.register(fastifyObjectionjs, {
    knexConfig: knexConfig[mode],
    models,
  });
  app.register(fastifySecureSession, { secret: process.env.SESSION_SECRET, cookie: { path: '/' } });
  app.register(fastifyPassport.initialize());
  app.register(fastifyPassport.secureSession());
  fastifyPassport.use('local', new LocalStrategy({ usernameField: 'data[email]', passwordField: 'data[password]' }, async (email, password, done) => {
    const user = await app.objection.models.user.query().findOne({ email });
    if (user && user.verifyPassword(password)) {
      return done(null, user);
    }
    return done(null, false);
  }));
  fastifyPassport.registerUserSerializer(async (user) => user.id);
  fastifyPassport.registerUserDeserializer(async (id) => {
    const user = app.objection.models.user.query().findById(id);
    return user;
  });
  app.decorate('fp', fastifyPassport);
  app.decorate('isAuth', (request, reply) => {
    if (request.isAuthenticated()) {
      return true;
    }
    request.flash('error', i18next.t('flash.authenticationError'));
    reply.redirect(app.reverse('index'));
    return false;
  });
};

const setUpStaticAssets = (app) => {
  app.register(fastifyStatic, {
    root: join(__dirname, '..', 'dist'),
    prefix: '/assets/',
  });
};

const setUpViews = (app) => {
  app.register(pointOfView, {
    engine: {
      pug,
    },
    root: join(__dirname, '..', 'src', 'views'),
    includeViewExtension: true,
    defaultContext: {
      t: (key) => i18next.t(key),
      reverse: (name) => app.reverse(name),
      _,
      getAlertClass: (type) => {
        switch (type) {
          case 'error':
            return 'danger';
          case 'success':
            return 'success';
          case 'info':
            return 'info';
          default:
            throw new Error(`Unknown flash type: ${type}`);
        }
      },
    },
  });
  app.decorateReply('render', function (path, variables) {
    this.view(path, { ...variables, reply: this });
  });
};

const addHooks = (app) => {
  app.addHook('preHandler', (request, reply, done) => {
    // eslint-disable-next-line no-param-reassign
    reply.locals = {
      isAuthenticated: request.isAuthenticated(),
    };
    done();
  });
};

// eslint-disable-next-line no-unused-vars
export default async (app, options) => {
  await registerPlugins(app);
  setUpStaticAssets(app);
  await setUpLocales(app);
  setUpViews(app);
  addRoutes(app);
  addHooks(app);
  return app;
};
