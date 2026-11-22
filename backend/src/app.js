const express = require('express');
const cors = require('cors');
const createAuth = require('./middleware/auth');
const buildRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp(container) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', buildRoutes({ controllers: container.controllers, auth: createAuth(container.services.auth) }));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
module.exports = createApp;
