import { readFile } from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Ejercicio } from '../models/Ejercicio.model';
import { Rutina, IDiaRutina } from '../models/Rutina.model';

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
  version?: string;
  objetivo: string;
  diasPorSemana: number;
  fechaCreacion?: string;
  notasGenerales?: string;
  dias: IDiaRutina[];
}

interface RutinasJson {
  rutina: RutinasJsonRutina;
  bibliotecaEjercicios: RutinasJsonEjercicio[];
}

const RUTA_RUTINAS_JSON = path.join(__dirname, '..', '..', 'data', 'rutinas.json');

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

  const borradoEjercicios = await Ejercicio.deleteMany({});
  console.log(`[seedRutinas] Ejercicio: colección limpiada (${borradoEjercicios.deletedCount} eliminados)`);

  const ejerciciosInsertados = await Ejercicio.insertMany(rutinas.bibliotecaEjercicios, { ordered: true });
  console.log(`[seedRutinas] Ejercicio: ${ejerciciosInsertados.length} documentos insertados`);

  const borradoRutinas = await Rutina.deleteMany({});
  console.log(`[seedRutinas] Rutina: colección limpiada (${borradoRutinas.deletedCount} eliminados)`);

  const rutinasInsertadas = await Rutina.insertMany([rutinas.rutina], { ordered: true });
  console.log(`[seedRutinas] Rutina: ${rutinasInsertadas.length} programa(s) insertado(s)`);
}

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
