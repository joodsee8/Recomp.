import { readFile } from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Alimento, IMacrosPor100g } from '../models/Alimento.model';
import { Comida, IIngredienteDeComida } from '../models/Comida.model';

interface DietaJsonAlimento {
  alimentoId: string;
  nombre: string;
  categoria: string;
  macrosPor100g: IMacrosPor100g;
  porcionComunG?: number;
  porcionComunNombre?: string;
}

interface DietaJsonComida {
  comidaId: string;
  nombre: string;
  horarioSugerido?: string;
  ingredientes: IIngredienteDeComida[];
}

interface DietaJson {
  alimentos: DietaJsonAlimento[];
  comidas?: DietaJsonComida[];
}

const RUTA_DIETA_JSON = path.join(__dirname, '..', '..', 'data', 'dieta.json');

export async function seedDieta(rutaArchivo: string = RUTA_DIETA_JSON): Promise<void> {
  console.log(`[seedDieta] leyendo ${rutaArchivo}`);
  const contenidoRaw = await readFile(rutaArchivo, 'utf-8');
  const dieta = JSON.parse(contenidoRaw) as DietaJson;

  if (!Array.isArray(dieta.alimentos) || dieta.alimentos.length === 0) {
    throw new Error('dieta.json no contiene un array "alimentos" válido o está vacío');
  }

  const borradoAlimentos = await Alimento.deleteMany({});
  console.log(`[seedDieta] Alimento: colección limpiada (${borradoAlimentos.deletedCount} eliminados)`);

  const alimentosInsertados = await Alimento.insertMany(dieta.alimentos, { ordered: true });
  console.log(`[seedDieta] Alimento: ${alimentosInsertados.length} documentos insertados`);

  if (Array.isArray(dieta.comidas) && dieta.comidas.length > 0) {
    const borradoComidas = await Comida.deleteMany({});
    console.log(`[seedDieta] Comida: colección limpiada (${borradoComidas.deletedCount} eliminados)`);

    const comidasInsertadas = await Comida.insertMany(dieta.comidas, { ordered: true });
    console.log(`[seedDieta] Comida: ${comidasInsertadas.length} documentos insertados`);
  } else {
    console.log('[seedDieta] dieta.json no trae "comidas" (o viene vacío) — paso omitido');
  }
}

async function ejecutarComoScript(): Promise<void> {
  try {
    await connectDB();
    await seedDieta();
    console.log('[seedDieta] completado con éxito');
    await mongoose.disconnect();
    console.log('[seedDieta] conexión a MongoDB cerrada');
    process.exit(0);
  } catch (error) {
    console.error('[seedDieta] error durante el seed:', error);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  }
}

if (require.main === module) {
  void ejecutarComoScript();
}
