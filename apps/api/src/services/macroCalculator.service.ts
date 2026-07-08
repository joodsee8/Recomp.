import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * macroCalculator.service.ts
 * ---------------------------
 * Lee el catálogo de alimentos desde dieta.json y calcula los macros totales
 * de lo consumido en un día, comparándolos contra la meta calórica.
 *
 * Separación intencional en 3 capas:
 *  1. cargarCatalogoAlimentos -> I/O (lee disco, cachea en memoria)
 *  2. calcularMacrosDeConsumo -> función PURA (sin I/O, 100% testeable con datos en memoria)
 *  3. obtenerResumenDelDia    -> orquestador (junta 1 y 2, y arma la respuesta para el Dashboard)
 */

// ---------- Tipos ----------

export interface MacrosBase {
  calorias: number;
  proteinaG: number;
  carbohidratosG: number;
  grasasG: number;
  fibraG: number;
}

export interface AlimentoCatalogo {
  alimentoId: string;
  nombre: string;
  categoria: string;
  macrosPor100g: MacrosBase;
}

interface DietaJson {
  metaCalorica: MacrosBase & { perfil?: string };
  alimentos: AlimentoCatalogo[];
  comidas: unknown[];
  planesDiarios: unknown[];
}

export interface ItemConsumido {
  alimentoId: string;
  cantidadG: number;
}

export interface ResumenDelDia {
  totales: MacrosBase;
  meta: MacrosBase;
  restante: MacrosBase;
  porcentajeCumplido: { calorias: number; proteinaG: number; carbohidratosG: number; grasasG: number };
}

export class AlimentoNoEncontradoError extends Error {
  constructor(alimentoId: string) {
    super(`El alimento con id "${alimentoId}" no existe en el catálogo de dieta.json`);
    this.name = 'AlimentoNoEncontradoError';
  }
}

// ---------- Carga del catálogo (cacheada en memoria) ----------

let catalogoCache: Map<string, AlimentoCatalogo> | null = null;
let metaCaloricaCache: MacrosBase | null = null;

const RUTA_DIETA_JSON = path.join(__dirname, '..', '..', 'data', 'dieta.json');

/**
 * Lee dieta.json del disco y construye un Map indexado por alimentoId para
 * búsquedas O(1). Se cachea en memoria porque el catálogo es prácticamente
 * estático: solo cambia cuando el usuario sube un nuevo dieta.json, no en
 * cada request.
 */
export async function cargarCatalogoAlimentos(
  rutaArchivo: string = RUTA_DIETA_JSON
): Promise<Map<string, AlimentoCatalogo>> {
  if (catalogoCache) return catalogoCache;

  const contenidoRaw = await readFile(rutaArchivo, 'utf-8');
  const dieta = JSON.parse(contenidoRaw) as DietaJson;

  catalogoCache = new Map(dieta.alimentos.map((alimento) => [alimento.alimentoId, alimento]));
  metaCaloricaCache = {
    calorias: dieta.metaCalorica.calorias,
    proteinaG: dieta.metaCalorica.proteinaG,
    carbohidratosG: dieta.metaCalorica.carbohidratosG,
    grasasG: dieta.metaCalorica.grasasG,
    fibraG: dieta.metaCalorica.fibraG
  };

  return catalogoCache;
}

/** Invalida el caché en memoria. Útil en tests, o cuando el usuario resube dieta.json. */
export function invalidarCacheDieta(): void {
  catalogoCache = null;
  metaCaloricaCache = null;
}

// ---------- Cálculo puro (no toca el disco, fácil de testear) ----------

/**
 * Suma los macros de una lista de alimentos consumidos, escalando cada
 * macrosPor100g según los gramos realmente ingeridos (factor = cantidadG / 100).
 */
export function calcularMacrosDeConsumo(
  consumoDelDia: ItemConsumido[],
  catalogo: Map<string, AlimentoCatalogo>
): MacrosBase {
  const totales: MacrosBase = { calorias: 0, proteinaG: 0, carbohidratosG: 0, grasasG: 0, fibraG: 0 };

  for (const item of consumoDelDia) {
    const alimento = catalogo.get(item.alimentoId);
    if (!alimento) {
      throw new AlimentoNoEncontradoError(item.alimentoId);
    }

    const factorEscala = item.cantidadG / 100;

    totales.calorias += alimento.macrosPor100g.calorias * factorEscala;
    totales.proteinaG += alimento.macrosPor100g.proteinaG * factorEscala;
    totales.carbohidratosG += alimento.macrosPor100g.carbohidratosG * factorEscala;
    totales.grasasG += alimento.macrosPor100g.grasasG * factorEscala;
    totales.fibraG += alimento.macrosPor100g.fibraG * factorEscala;
  }

  return redondearMacros(totales);
}

function redondearMacros(macros: MacrosBase): MacrosBase {
  return {
    calorias: Math.round(macros.calorias),
    proteinaG: Math.round(macros.proteinaG * 10) / 10,
    carbohidratosG: Math.round(macros.carbohidratosG * 10) / 10,
    grasasG: Math.round(macros.grasasG * 10) / 10,
    fibraG: Math.round(macros.fibraG * 10) / 10
  };
}

// ---------- Orquestador: lee el JSON + calcula + compara contra la meta ----------

/**
 * Función principal: dado lo que el usuario consumió en un día (normalmente
 * proveniente de MacroLog.alimentosConsumidos ya guardado en Mongo), calcula
 * los totales y devuelve cuánto falta vs. la meta calórica de dieta.json.
 *
 * Nota: dieta.json es el CATÁLOGO de referencia, no el registro diario del
 * usuario. El registro diario vive en MongoDB (colección MacroLog); esta
 * función solo necesita los pares {alimentoId, cantidadG} de ese día.
 */
export async function obtenerResumenDelDia(consumoDelDia: ItemConsumido[]): Promise<ResumenDelDia> {
  const catalogo = await cargarCatalogoAlimentos();
  if (!metaCaloricaCache) {
    throw new Error('No se pudo cargar la meta calórica desde dieta.json');
  }

  const totales = calcularMacrosDeConsumo(consumoDelDia, catalogo);
  const meta = metaCaloricaCache;

  const restante: MacrosBase = {
    calorias: meta.calorias - totales.calorias,
    proteinaG: meta.proteinaG - totales.proteinaG,
    carbohidratosG: meta.carbohidratosG - totales.carbohidratosG,
    grasasG: meta.grasasG - totales.grasasG,
    fibraG: meta.fibraG - totales.fibraG
  };

  const porcentajeCumplido = {
    calorias: Math.round((totales.calorias / meta.calorias) * 100),
    proteinaG: Math.round((totales.proteinaG / meta.proteinaG) * 100),
    carbohidratosG: Math.round((totales.carbohidratosG / meta.carbohidratosG) * 100),
    grasasG: Math.round((totales.grasasG / meta.grasasG) * 100)
  };

  return { totales, meta, restante, porcentajeCumplido };
}

// ---------- Ejemplo de uso (referencia, no se ejecuta como parte del módulo) ----------
//
// const consumoDeHoy: ItemConsumido[] = [
//   { alimentoId: 'avena', cantidadG: 70 },
//   { alimentoId: 'whey_protein', cantidadG: 30 },
//   { alimentoId: 'pechuga_pollo', cantidadG: 180 }
// ];
//
// const resumen = await obtenerResumenDelDia(consumoDeHoy);
// console.log(resumen);
// {
//   totales:  { calorias: 683, proteinaG: 91.6, carbohidratosG: 48.3, grasasG: 12.8, fibraG: 7.7 },
//   meta:     { calorias: 2400, proteinaG: 190, carbohidratosG: 220, grasasG: 70, fibraG: 35 },
//   restante: { calorias: 1717, proteinaG: 98.4, carbohidratosG: 171.7, grasasG: 57.2, fibraG: 27.3 },
//   porcentajeCumplido: { calorias: 28, proteinaG: 48, carbohidratosG: 22, grasasG: 18 }
// }
