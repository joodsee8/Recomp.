import { readFile } from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Alimento, IMacrosPor100g } from '../models/Alimento.model';
import { Comida, IIngredienteDeComida } from '../models/Comida.model';

/**
 * seedDieta.ts
 * ------------
 * Siembra las colecciones Alimento y Comida a partir de data/dieta.json.
 *
 * Uso:
 *   npx ts-node src/seeders/seedDieta.ts     (standalone: conecta, siembra, desconecta, exit)
 *   npm run seed:dieta                        (mismo comportamiento, vía package.json)
 *
 * También se puede importar `seedDieta()` desde otro script (ver
 * seeders/index.ts) para sembrar sobre una conexión ya abierta, sin volver
 * a conectar/desconectar/matar el proceso.
 */

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

/**
 * Lógica pura del seed. Asume que Mongoose YA está conectado (no llama
 * connectDB ni mongoose.disconnect internamente) para poder reutilizarse
 * desde seeders/index.ts sin abrir una segunda conexión.
 */
export async function seedDieta(rutaArchivo: string = RUTA_DIETA_JSON): Promise<void> {
  console.log(`[seedDieta] leyendo ${rutaArchivo}`);
  const contenidoRaw = await readFile(rutaArchivo, 'utf-8');
  const dieta = JSON.parse(contenidoRaw) as DietaJson;

  if (!Array.isArray(dieta.alimentos) || dieta.alimentos.length === 0) {
    throw new Error('dieta.json no contiene un array "alimentos" válido o está vacío');
  }

  // --- 1) Alimentos --------------------------------------------------------
  const borradoAlimentos = await Alimento.deleteMany({});
  console.log(`[seedDieta] Alimento: colección limpiada (${borradoAlimentos.deletedCount} eliminados)`);

  const alimentosInsertados = await Alimento.insertMany(dieta.alimentos, { ordered: true });
  console.log(`[seedDieta] Alimento: ${alimentosInsertados.length} documentos insertados`);

  // --- 2) Comidas (opcional: dieta.json puede no traer comidas todavía) ---
  if (Array.isArray(dieta.comidas) && dieta.comidas.length > 0) {
    const borradoComidas = await Comida.deleteMany({});
    console.log(`[seedDieta] Comida: colección limpiada (${borradoComidas.deletedCount} eliminados)`);

    const comidasInsertadas = await Comida.insertMany(dieta.comidas, { ordered: true });
    console.log(`[seedDieta] Comida: ${comidasInsertadas.length} documentos insertados`);
  } else {
    console.log('[seedDieta] dieta.json no trae "comidas" (o viene vacío) — paso omitido');
  }
}

/**
 * Bloque runner: solo corre si este archivo se ejecuta directamente
 * (`ts-node src/seeders/seedDieta.ts`). Si se importa desde otro módulo
 * (como seeders/index.ts), `require.main !== module` y este bloque NO se
 * ejecuta — así seeders/index.ts puede reutilizar seedDieta() sin que se
 * dispare un connect/disconnect/exit por duplicado.
 */
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
