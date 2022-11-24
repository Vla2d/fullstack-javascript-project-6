import { plugin as fastifyReverseRoutes } from 'fastify-reverse-routes';
import pointOfView from '@fastify/view';
import pug from 'pug';
import i18next from 'i18next';
import fastifyStatic from '@fastify/static';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fastifyObjectionjs from 'fastify-objectionjs';
import fastifySecureSession from '@fastify/secure-session';
import fastifyPassport from '@fastify/passport';
import fastifySensible from '@fastify/sensible';
import LocalStrategy from 'passport-local';
import _ from 'lodash';
import fastifyFormbody from '@fastify/formbody';
import qs from 'qs';
import fastifyMethodOverride from 'fastify-method-override';
import Rollbar from 'rollbar';
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
  await app.register(fastifySensible);
  await app.register(fastifyMethodOverride);
  await app.register(fastifyReverseRoutes);
  await app.register(fastifyFormbody, { parser: qs.parse });
  await app.register(fastifyObjectionjs, {
    knexConfig: knexConfig[mode],
    models,
  });
  await app.register(fastifySecureSession, { secret: process.env.SESSION_SECRET, cookie: { path: '/' } });
  await app.register(fastifyPassport.initialize());
  await app.register(fastifyPassport.secureSession());
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
  // fastifyPassport.use(new FormStrategy('form', app))
  await app.decorate('fp', fastifyPassport);
  await app.decorate('isAuth', (request, reply) => {
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
      reverse: (name, options) => app.reverse(name, options),
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
  app.decorateReply('render', function render(viewPath, locals) {
    this.view(viewPath, { ...locals, reply: this });
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

const addHandlers = (app) => {
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  app.setErrorHandler((error) => {
    rollbar.log(error);
  });
};

export const options = {
  exposeHeadRoutes: false,
};

// eslint-disable-next-line no-unused-vars
export default async (app, _options) => {
  await registerPlugins(app);

  await setUpLocales(app);
  setUpStaticAssets(app);
  setUpViews(app);
  addRoutes(app);
  addHooks(app);
  addHandlers(app);

  return app;
};
