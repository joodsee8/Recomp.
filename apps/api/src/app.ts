import express, { Application } from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.middleware';

export function crearApp(): Application {
  const app = express();

  app.use(cors({ origin: 'https://fitnessrecomp.netlify.app', credentials: true }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', entorno: env.nodeEnv });
  });

  app.use('/api', routes);

  // SIEMPRE al final, en este orden: 404 -> errorHandler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
