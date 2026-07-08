import { readFile } from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Ejercicio } from '../models/Ejercicio.model';
import { Rutina, IDiaRutina } from '../models/Rutina.model';

/**
 * seedRutinas.ts
 * --------------
 * Siembra las colecciones Ejercicio (biblioteca) y Rutina (programa
 * completo con días/ejercicios/series embebidos) a partir de
 * data/rutinas.json.
 *
 * Uso:
 *   npx ts-node src/seeders/seedRutinas.ts    (standalone: conecta, siembra, desconecta, exit)
 *   npm run seed:rutinas                       (mismo comportamiento, vía package.json)
 */

interface RutinasJsonEjercicio {
  ejercicioId: string;
  nombre: string;
  grupoMuscularPrincipal: string;
  equipo: string;
  videoUrl: string | null;
}

interface RutinasJsonRutina {
  rutinaId: string;
  nombre: string;
  version: string;
  objetivo: string;
  diasPorSemana: number;
  fechaCreacion: string;
  notasGenerales?: string;
  dias: IDiaRutina[];
}

interface RutinasJson {
  rutina: RutinasJsonRutina;
  bibliotecaEjercicios: RutinasJsonEjercicio[];
}

const RUTA_RUTINAS_JSON = path.join(__dirname, '..', '..', 'data', 'rutinas.json');

/**
 * Lógica pura del seed. Asume que Mongoose YA está conectado, mismo patrón
 * que seedDieta(), para poder combinarse en seeders/index.ts.
 */
export async function seedRutinas(rutaArchivo: string = RUTA_RUTINAS_JSON): Promise<void> {
  console.log(`[seedRutinas] leyendo ${rutaArchivo}`);
  const contenidoRaw = await readFile(rutaArchivo, 'utf-8');
  const rutinas = JSON.parse(contenidoRaw) as RutinasJson;

  if (!Array.isArray(rutinas.bibliotecaEjercicios) || rutinas.bibliotecaEjercicios.length === 0) {
    throw new Error('rutinas.json no contiene un array "bibliotecaEjercicios" válido o está vacío');
  }
  if (!rutinas.rutina || !Array.isArray(rutinas.rutina.dias) || rutinas.rutina.dias.length === 0) {
    throw new Error('rutinas.json no contiene un objeto "rutina" válido con al menos un día');
  }

  // --- 1) Biblioteca de ejercicios -----------------------------------------
  const borradoEjercicios = await Ejercicio.deleteMany({});
  console.log(`[seedRutinas] Ejercicio: colección limpiada (${borradoEjercicios.deletedCount} eliminados)`);

  const ejerciciosInsertados = await Ejercicio.insertMany(rutinas.bibliotecaEjercicios, { ordered: true });
  console.log(`[seedRutinas] Ejercicio: ${ejerciciosInsertados.length} documentos insertados`);

  // --- 2) Programa de rutina ------------------------------------------------
  const borradoRutinas = await Rutina.deleteMany({});
  console.log(`[seedRutinas] Rutina: colección limpiada (${borradoRutinas.deletedCount} eliminados)`);

  // insertMany() recibe un array. Hoy rutinas.json define un solo programa
  // bajo la clave "rutina", pero envolverlo en [] deja la puerta abierta a
  // soportar varios programas en el futuro (ej. rutinas.json con una clave
  // "rutinas": [...]) sin tener que reescribir este seeder, solo el mapeo
  // de entrada.
  const rutinasInsertadas = await Rutina.insertMany([rutinas.rutina], { ordered: true });
  console.log(`[seedRutinas] Rutina: ${rutinasInsertadas.length} programa(s) insertado(s)`);
}

/**
 * Bloque runner: mismo patrón que seedDieta.ts — solo corre standalone,
 * nunca cuando se importa desde seeders/index.ts.
 */
async function ejecutarComoScript(): Promise<void> {
  try {
    await connectDB();
    await seedRutinas();
    console.log('[seedRutinas] completado con éxito');
    await mongoose.disconnect();
    console.log('[seedRutinas] conexión a MongoDB cerrada');
    process.exit(0);
  } catch (error) {
    console.error('[seedRutinas] error durante el seed:', error);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  }
}

if (require.main === module) {
  void ejecutarComoScript();
}
