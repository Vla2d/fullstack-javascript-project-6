import index from './index.js';

const controllers = [index];

export default (app) => controllers.forEach((controller) => controller(app));