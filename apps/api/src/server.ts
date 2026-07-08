import { crearApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  await connectDB();

  const app = crearApp();
  app.listen(env.port, () => {
    console.log(`[server] escuchando en http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('[server] error fatal al arrancar:', error);
  process.exit(1);
});
