import index from './index.js';
import session from './session.js';
import users from './users.js';
import statuses from './statuses.js';
import tasks from './tasks.js';
import labels from './labels.js';

const controllers = [index, session, users, statuses, tasks, labels];

export default (app) => controllers.forEach((controller) => controller(app));
