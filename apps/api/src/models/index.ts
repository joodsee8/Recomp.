import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { seedDieta } from './seedDieta';
import { seedRutinas } from './seedRutinas';

/**
 * seeders/index.ts
 * ----------------
 * Corre TODOS los seeders sobre una sola conexión a Mongo, en vez de que
 * cada uno abra y cierre la suya (más rápido y evita el log duplicado de
 * "conectado a MongoDB" dos veces seguidas).
 *
 * Uso: npm run seed
 *
 * Importar seedDieta/seedRutinas aquí NO dispara sus bloques runner: cada
 * uno solo se auto-ejecuta si `require.main === module` en SU PROPIO
 * archivo, y aquí el módulo principal es este index.ts, no ellos.
 */
async function seedTodoElCatalogo(): Promise<void> {
  try {
    await connectDB();

    await seedDieta();
    await seedRutinas();

    console.log('[seed] catálogo completo (dieta + rutinas) sembrado con éxito');
    await mongoose.disconnect();
    console.log('[seed] conexión a MongoDB cerrada');
    process.exit(0);
  } catch (error) {
    console.error('[seed] error durante el seed combinado:', error);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  }
}

void seedTodoElCatalogo();
