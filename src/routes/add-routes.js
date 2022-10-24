import index from './index.js';
import session from './session.js';
import users from './users.js';

const controllers = [index, session, users];

export default (app) => controllers.forEach((controller) => controller(app));
