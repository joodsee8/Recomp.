import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { seedDieta } from './seedDieta';
import { seedRutinas } from './seedRutinas';

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
