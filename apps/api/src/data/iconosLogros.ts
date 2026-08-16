/**
 * iconosLogros.ts
 * ----------------
 * Catálogo CERRADO de íconos disponibles para los logros. Gemini elige un
 * `icono` de esta lista (se le pasa como enum en el schema de respuesta
 * estructurada) — nunca puede inventar un nombre de archivo que no exista
 * en apps/web/public/assets/icons/. El backend además valida contra esta
 * misma lista antes de guardar cualquier logro, por si el modelo se sale
 * del schema (pasa, incluso con generación estructurada).
 *
 * Cada entrada trae una descripción corta en español para que el prompt le
 * dé a Gemini contexto de cuándo usar cada ícono (ej. "corona" para hitos
 * grandes, "racha_fuego" para constancia).
 */

export interface IconoLogro {
  id: string; // debe coincidir EXACTO con el nombre de archivo sin extensión en assets/icons/
  descripcionParaIA: string;
}

export const ICONOS_LOGROS: IconoLogro[] = [
  { id: 'trofeo', descripcionParaIA: 'Logro importante o de cierre de un periodo largo (mensual)' },
  { id: 'racha_fuego', descripcionParaIA: 'Constancia / días consecutivos sin fallar' },
  { id: 'medalla', descripcionParaIA: 'Logro de dificultad media, buen desempeño sostenido' },
  { id: 'estrella', descripcionParaIA: 'Logro simple o de entrada, metas diarias fáciles' },
  { id: 'corona', descripcionParaIA: 'Hito grande, el mejor resultado del mes' },
  { id: 'diana', descripcionParaIA: 'Precisión: cumplir una meta exacta (ej. macros al punto)' },
  { id: 'cohete', descripcionParaIA: 'Progreso rápido o mejora notable en poco tiempo' },
  { id: 'montana', descripcionParaIA: 'Reto grande superado, esfuerzo alto (PRs, volumen alto)' },
  { id: 'rayo', descripcionParaIA: 'Intensidad / sesión de entrenamiento fuerte' },
  { id: 'diamante', descripcionParaIA: 'Logro raro o excepcional, poco común de conseguir' },
  { id: 'calendario_check', descripcionParaIA: 'Consistencia semanal, cumplir varios días seguidos' },
  { id: 'mancuerna', descripcionParaIA: 'Relacionado directamente con entrenamiento' },
  { id: 'manzana', descripcionParaIA: 'Relacionado directamente con nutrición/dieta' },
  { id: 'amanecer', descripcionParaIA: 'Empezar algo nuevo / primer logro de un periodo' },
  { id: 'escudo', descripcionParaIA: 'Disciplina, no fallar la meta ni un día del periodo' },
  { id: 'candado_abierto', descripcionParaIA: 'Desbloqueo especial, logro sorpresa o poco esperado' }
];

export const IDS_ICONOS_LOGROS = ICONOS_LOGROS.map((i) => i.id);

export function esIconoValido(id: string): boolean {
  return IDS_ICONOS_LOGROS.includes(id);
}
