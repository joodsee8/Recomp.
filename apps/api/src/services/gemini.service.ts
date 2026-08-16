import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

/**
 * gemini.service.ts
 * -----------------
 * Wrapper delgado sobre @google/generative-ai. Dos responsabilidades:
 *
 * 1. Inicializar el cliente de forma PEREZOSA (solo al primer uso real, no
 *    al importar el módulo) — así el server arranca bien aunque
 *    GEMINI_API_KEY todavía no esté configurada, y solo las rutas que de
 *    verdad la necesitan (chat, logros) fallan con un 503 claro.
 *
 * 2. Dos formas de generación:
 *    - generarTexto(): respuesta libre en texto (para la respuesta final
 *      del chat, ya con tono conversacional).
 *    - generarJSON<T>(): respuesta forzada a JSON contra un schema
 *      (generación controlada) — se usa para clasificar intención del chat
 *      y para generar las definiciones de logros, donde necesitamos un
 *      shape exacto y predecible, no prosa.
 *
 * NOTA para quien mantenga esto: `responseSchema` se arma acá con strings
 * planos ('OBJECT', 'STRING', etc.) en vez de importar el enum SchemaType
 * del SDK — son exactamente los mismos valores que espera la API REST de
 * Gemini por debajo, y evita atarnos a un nombre de export que puede
 * cambiar entre versiones del paquete.
 */

let clienteGemini: GoogleGenerativeAI | null = null;

function obtenerCliente(): GoogleGenerativeAI {
  if (!env.geminiApiKey) {
    throw new AppError(
      503,
      'GEMINI_API_KEY no está configurada. Agrégala a tu .env (ver .env.example) para usar el Chat o generar Logros.'
    );
  }
  if (!clienteGemini) {
    clienteGemini = new GoogleGenerativeAI(env.geminiApiKey);
  }
  return clienteGemini;
}

/**
 * Quita code fences (```json ... ```) por si el modelo los agrega a pesar
 * de responseMimeType: 'application/json' — pasa con algunos modelos/
 * versiones del SDK, mejor defenderse que confiar ciegamente.
 */
function limpiarPosiblesCodeFences(texto: string): string {
  return texto
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/```\s*$/, '')
    .trim();
}

export async function generarTexto(prompt: string): Promise<string> {
  const cliente = obtenerCliente();
  const modelo = cliente.getGenerativeModel({ model: env.geminiModelo });

  try {
    const resultado = await modelo.generateContent(prompt);
    return resultado.response.text();
  } catch (error) {
    throw new AppError(502, `Error al llamar a Gemini: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export interface OpcionesGenerarJSON {
  prompt: string;
  /** Schema en formato Gemini (OBJECT/STRING/ARRAY/NUMBER/BOOLEAN, con "properties"/"items"/"enum"/"required"). */
  schema: Record<string, unknown>;
}

export async function generarJSON<T>(opciones: OpcionesGenerarJSON): Promise<T> {
  const cliente = obtenerCliente();

  const modelo = cliente.getGenerativeModel({
    model: env.geminiModelo,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: opciones.schema
    }
  });

  let textoCrudo: string;
  try {
    const resultado = await modelo.generateContent(opciones.prompt);
    textoCrudo = resultado.response.text();
  } catch (error) {
    throw new AppError(502, `Error al llamar a Gemini: ${error instanceof Error ? error.message : String(error)}`);
  }

  const textoLimpio = limpiarPosiblesCodeFences(textoCrudo);

  try {
    return JSON.parse(textoLimpio) as T;
  } catch (error) {
    throw new AppError(502, `Gemini devolvió una respuesta que no es JSON válido: ${textoLimpio.slice(0, 300)}`);
  }
}
