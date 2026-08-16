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

export function restarMacros(a: IMacrosBase, b: IMacrosBase): IMacrosBase {
  return {
    calorias: Math.max(0, a.calorias - b.calorias),
    proteinaG: Math.max(0, redondear1Decimal(a.proteinaG - b.proteinaG)),
    carbohidratosG: Math.max(0, redondear1Decimal(a.carbohidratosG - b.carbohidratosG)),
    grasasG: Math.max(0, redondear1Decimal(a.grasasG - b.grasasG)),
    fibraG: Math.max(0, redondear1Decimal(a.fibraG - b.fibraG))
  };
}
