import { WorkoutLog } from '../models/WorkoutLog.model';
import { MacroLog } from '../models/MacroLog.model';
import { Logro, ILogro } from '../models/Logro.model';
import { MetricaLogro } from '../data/metricasLogros';

/**
 * logrosEvaluator.service.ts
 * ---------------------------
 * Calcula el progreso REAL de un logro releyendo Mongo — nunca vuelve a
 * llamar a Gemini para esto. Esto es lo que permite que abrir la pantalla
 * de Logros sea instantáneo y 100% reproducible (mismos datos -> mismo
 * resultado, siempre).
 */

/**
 * Límites [inicio, fin] (UTC, fin inclusive) del periodo CALENDARIO que
 * contiene `desde` — semana lunes-a-domingo, mes 1ro-a-último-día.
 *
 * Importante: esto es a propósito alineado al calendario y no una ventana
 * "hacia adelante" desde el momento de generación. Si fuera hacia adelante,
 * un logro semanal recién creado el miércoles no le daría ningún crédito a
 * las sesiones que ya hiciste lunes/martes — mataría la "dopamina
 * instantánea": generar un logro y que se desbloquee al toque porque ya
 * veías cumpliendo, es parte del gancho gamificado que se pidió.
 */
export function calcularLimitesPeriodo(
  periodo: 'diario' | 'semanal' | 'mensual',
  desde: Date = new Date()
): { inicio: Date; fin: Date } {
  const año = desde.getUTCFullYear();
  const mes = desde.getUTCMonth();
  const dia = desde.getUTCDate();

  if (periodo === 'diario') {
    const inicio = new Date(Date.UTC(año, mes, dia, 0, 0, 0, 0));
    const fin = new Date(Date.UTC(año, mes, dia, 23, 59, 59, 999));
    return { inicio, fin };
  }

  if (periodo === 'semanal') {
    // getUTCDay(): 0=domingo..6=sábado. Semana ISO: arranca lunes.
    const diaSemana = desde.getUTCDay();
    const offsetALunes = diaSemana === 0 ? 6 : diaSemana - 1;
    const inicio = new Date(Date.UTC(año, mes, dia - offsetALunes, 0, 0, 0, 0));
    const fin = new Date(inicio);
    fin.setUTCDate(fin.getUTCDate() + 6);
    fin.setUTCHours(23, 59, 59, 999);
    return { inicio, fin };
  }

  // mensual: día 0 del mes siguiente = último día del mes actual
  const inicio = new Date(Date.UTC(año, mes, 1, 0, 0, 0, 0));
  const fin = new Date(Date.UTC(año, mes + 1, 0, 23, 59, 59, 999));
  return { inicio, fin };
}

async function calcularProgreso(userId: string, metrica: MetricaLogro, desde: Date, hasta: Date): Promise<number> {
  switch (metrica) {
    case 'dias_con_macros_registrados': {
      const registros = await MacroLog.find({ userId, fecha: { $gte: desde, $lte: hasta } }).select(
        'alimentosConsumidos'
      );
      return registros.filter((r) => r.alimentosConsumidos.length > 0).length;
    }

    case 'dias_cumpliendo_meta_proteina': {
      const registros = await MacroLog.find({ userId, fecha: { $gte: desde, $lte: hasta } }).select(
        'totalesConsumidos metaDelDia'
      );
      return registros.filter((r) => r.totalesConsumidos.proteinaG >= r.metaDelDia.proteinaG).length;
    }

    case 'sesiones_entrenamiento': {
      return WorkoutLog.countDocuments({ userId, fecha: { $gte: desde, $lte: hasta } });
    }

    case 'records_personales': {
      const sesiones = await WorkoutLog.find({ userId, fecha: { $gte: desde, $lte: hasta } }).select(
        'ejerciciosRegistrados'
      );
      return sesiones.reduce(
        (total, s) =>
          total +
          s.ejerciciosRegistrados.reduce(
            (sub, ej) => sub + ej.series.filter((serie) => serie.esRecordPersonal).length,
            0
          ),
        0
      );
    }

    case 'series_completadas': {
      const sesiones = await WorkoutLog.find({ userId, fecha: { $gte: desde, $lte: hasta } }).select(
        'ejerciciosRegistrados'
      );
      return sesiones.reduce(
        (total, s) =>
          total + s.ejerciciosRegistrados.reduce((sub, ej) => sub + ej.series.filter((serie) => serie.completada).length, 0),
        0
      );
    }

    case 'volumen_total_kg': {
      const sesiones = await WorkoutLog.find({ userId, fecha: { $gte: desde, $lte: hasta } }).select(
        'ejerciciosRegistrados'
      );
      const total = sesiones.reduce(
        (acc, s) =>
          acc +
          s.ejerciciosRegistrados.reduce(
            (sub, ej) =>
              sub +
              ej.series.filter((serie) => serie.completada).reduce((v, serie) => v + serie.pesoKg * serie.repsLogradas, 0),
            0
          ),
        0
      );
      return Math.round(total);
    }

    case 'ejercicios_distintos_entrenados': {
      const sesiones = await WorkoutLog.find({ userId, fecha: { $gte: desde, $lte: hasta } }).select(
        'ejerciciosRegistrados'
      );
      const idsVistos = new Set<string>();
      for (const s of sesiones) {
        for (const ej of s.ejerciciosRegistrados) idsVistos.add(ej.ejercicioId);
      }
      return idsVistos.size;
    }

    case 'racha_dias_consecutivos_macros': {
      // MacroLog tiene índice único {userId, fecha}: cada documento YA es
      // un día distinto, no hace falta deduplicar por fecha.
      const registros = await MacroLog.find({ userId, fecha: { $gte: desde, $lte: hasta } }).select(
        'fecha alimentosConsumidos'
      );
      const diasOrdenados = registros
        .filter((r) => r.alimentosConsumidos.length > 0)
        .map((r) => new Date(r.fecha).getTime())
        .sort((a, b) => a - b);

      const UN_DIA_MS = 24 * 60 * 60 * 1000;
      let rachaMaxima = diasOrdenados.length > 0 ? 1 : 0;
      let rachaActual = rachaMaxima;

      for (let i = 1; i < diasOrdenados.length; i++) {
        if (diasOrdenados[i] - diasOrdenados[i - 1] === UN_DIA_MS) {
          rachaActual += 1;
        } else {
          rachaActual = 1;
        }
        rachaMaxima = Math.max(rachaMaxima, rachaActual);
      }
      return rachaMaxima;
    }

    default: {
      // Exhaustividad: si se agrega una métrica al catálogo y no se
      // implementa acá, esto rompe la compilación en vez de fallar en runtime.
      const _exhaustivo: never = metrica;
      throw new Error(`Métrica de logro no implementada en el evaluador: ${_exhaustivo}`);
    }
  }
}

function seCumpleCriterio(comparador: '>=' | '=', progreso: number, objetivo: number): boolean {
  return comparador === '>=' ? progreso >= objetivo : progreso === objetivo;
}

/**
 * Recalcula progresoActual de TODOS los logros activos (no desbloqueados,
 * dentro de su periodo vigente) de un usuario, y marca como desbloqueados
 * los que ya cumplieron su criterio. Se llama cada vez que el frontend pide
 * la lista de logros — es barato (unas pocas queries) y siempre da el
 * estado real más reciente.
 */
export async function evaluarYActualizarLogros(userId: string): Promise<ILogro[]> {
  const ahora = new Date();
  const logrosActivos = await Logro.find({ userId, desbloqueado: false, fechaFinPeriodo: { $gte: ahora } });

  for (const logro of logrosActivos) {
    const progreso = await calcularProgreso(userId, logro.criterio.metrica, logro.fechaInicioPeriodo, logro.fechaFinPeriodo);
    logro.progresoActual = progreso;

    if (seCumpleCriterio(logro.criterio.comparador, progreso, logro.criterio.objetivo)) {
      logro.desbloqueado = true;
      logro.fechaDesbloqueo = ahora;
    }

    await logro.save();
  }

  return logrosActivos;
}
