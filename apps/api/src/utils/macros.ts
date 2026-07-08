/**
 * macros.ts
 * ---------
 * Helpers puros de aritmética de macros, compartidos por cualquier
 * controller que necesite escalar macrosPor100g a una cantidad consumida, o
 * sumar dos objetos de macros. Centralizado acá para no repetir esta lógica
 * en comida.controller.ts y macroLog.controller.ts por separado.
 */

export interface IMacrosBase {
  calorias: number;
  proteinaG: number;
  carbohidratosG: number;
  grasasG: number;
  fibraG: number;
}

export const MACROS_EN_CERO: IMacrosBase = {
  calorias: 0,
  proteinaG: 0,
  carbohidratosG: 0,
  grasasG: 0,
  fibraG: 0
};

function redondear1Decimal(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Escala macrosPor100g a la cantidad real consumida (factor = cantidadG / 100). */
export function escalarMacrosPorGramos(macrosPor100g: IMacrosBase, cantidadG: number): IMacrosBase {
  const factor = cantidadG / 100;
  return {
    calorias: Math.round(macrosPor100g.calorias * factor),
    proteinaG: redondear1Decimal(macrosPor100g.proteinaG * factor),
    carbohidratosG: redondear1Decimal(macrosPor100g.carbohidratosG * factor),
    grasasG: redondear1Decimal(macrosPor100g.grasasG * factor),
    fibraG: redondear1Decimal(macrosPor100g.fibraG * factor)
  };
}

export function sumarMacros(a: IMacrosBase, b: IMacrosBase): IMacrosBase {
  return {
    calorias: a.calorias + b.calorias,
    proteinaG: redondear1Decimal(a.proteinaG + b.proteinaG),
    carbohidratosG: redondear1Decimal(a.carbohidratosG + b.carbohidratosG),
    grasasG: redondear1Decimal(a.grasasG + b.grasasG),
    fibraG: redondear1Decimal(a.fibraG + b.fibraG)
  };
}

/** Resta b de a, sin bajar de cero (por si hay drift de redondeo al eliminar un item). */
export function restarMacros(a: IMacrosBase, b: IMacrosBase): IMacrosBase {
  return {
    calorias: Math.max(0, a.calorias - b.calorias),
    proteinaG: Math.max(0, redondear1Decimal(a.proteinaG - b.proteinaG)),
    carbohidratosG: Math.max(0, redondear1Decimal(a.carbohidratosG - b.carbohidratosG)),
    grasasG: Math.max(0, redondear1Decimal(a.grasasG - b.grasasG)),
    fibraG: Math.max(0, redondear1Decimal(a.fibraG - b.fibraG))
  };
}

export const obtenerMetaCaloricaVigente = async (userId: string | any) => {
  return { calorias: 2300, proteinaG: 160, carbohidratosG: 220, grasasG: 65, fibraG: 30 };
};