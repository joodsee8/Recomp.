import { readFile } from 'node:fs/promises';
import path from 'node:path';

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

let catalogoCache: Map<string, AlimentoCatalogo> | null = null;
let metaCaloricaCache: MacrosBase | null = null;

const RUTA_DIETA_JSON = path.join(__dirname, '..', '..', 'data', 'dieta.json');

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

export function invalidarCacheDieta(): void {
  catalogoCache = null;
  metaCaloricaCache = null;
}

export async function obtenerMetaCaloricaVigente(): Promise<MacrosBase> {
  await cargarCatalogoAlimentos();
  if (!metaCaloricaCache) {
    throw new Error('No se pudo cargar la meta calórica desde dieta.json');
  }
  return metaCaloricaCache;
}

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
