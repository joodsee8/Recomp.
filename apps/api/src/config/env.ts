import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  clientOrigin: string;
}

/**
 * Lee process.env una sola vez al arrancar la app. Si falta una variable
 * crítica, preferimos morir inmediatamente con un mensaje claro en vez de
 * fallar más tarde con un error críptico de Mongoose o JWT.
 */
function leerVariablesDeEntorno(): EnvConfig {
  const requeridas = ['MONGODB_URI', 'JWT_SECRET'] as const;
  const faltantes = requeridas.filter((clave) => !process.env[clave]);

  if (faltantes.length > 0) {
    throw new Error(
      `Faltan variables de entorno requeridas: ${faltantes.join(', ')}. Revisa tu archivo .env (usa .env.example como referencia).`
    );
  }

  return {
    mongodbUri: process.env.MONGODB_URI as string,
    jwtSecret: process.env.JWT_SECRET as string,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '30d',
    port: Number(process.env.PORT ?? 4000),
    nodeEnv: (process.env.NODE_ENV as EnvConfig['nodeEnv']) ?? 'development',
    clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'
  };
}

export const env = leerVariablesDeEntorno();
