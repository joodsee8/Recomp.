import mongoose from 'mongoose';
import { env } from './env';

/**
 * Cacheamos la promesa de conexión (no solo la conexión) en una variable de
 * módulo. Esto evita abrir conexiones duplicadas si connectDB() se llama más
 * de una vez (por ejemplo con hot-reload de ts-node-dev, o si en el futuro
 * se despliega como función serverless con contenedores reciclados).
 */
let conexionPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  if (conexionPromise) return conexionPromise;

  mongoose.set('strictQuery', true);

  conexionPromise = mongoose
    .connect(env.mongodbUri)
    .then((conexion) => {
      console.log(`[mongo] conectado a la base de datos: ${conexion.connection.name}`);
      return conexion;
    })
    .catch((error) => {
      conexionPromise = null; // permite reintentar si la primera conexión falla
      console.error('[mongo] error al conectar:', error);
      throw error;
    });

  return conexionPromise;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  conexionPromise = null;
}
