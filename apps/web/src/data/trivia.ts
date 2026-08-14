/**
 * trivia.ts
 * ---------
 * Contenido para distraer/entretener durante los descansos entre series
 * (FaseDescanso.tsx). Todo estático por ahora — el día que el chat con IA
 * esté conectado de verdad, esto puede volverse dinámico/generado, pero no
 * hace falta backend para un banco de datos curiosos y acertijos.
 *
 * 3 tipos:
 * - 'dato': un dato curioso, solo lectura.
 * - 'acertijo': pregunta abierta con respuesta revelable (sin validación).
 * - 'quiz': opción múltiple con respuesta correcta marcada.
 */

export type CategoriaTrivia = 'astronomia' | 'ingenieria' | 'matematicas' | 'fisica' | 'literatura' | 'biologia' | 'historia';

interface TriviaDatoBase {
  id: string;
  categoria: CategoriaTrivia;
}

export interface TriviaDato extends TriviaDatoBase {
  tipo: 'dato';
  texto: string;
}

export interface TriviaAcertijo extends TriviaDatoBase {
  tipo: 'acertijo';
  pregunta: string;
  respuesta: string;
}

export interface TriviaQuiz extends TriviaDatoBase {
  tipo: 'quiz';
  pregunta: string;
  opciones: string[];
  indiceCorrecto: number;
}

export type TriviaItem = TriviaDato | TriviaAcertijo | TriviaQuiz;

export const BANCO_TRIVIA: TriviaItem[] = [
  // --- Astronomía ---
  { id: 'a1', tipo: 'dato', categoria: 'astronomia', texto: 'Un día en Venus (243 días terrestres) dura más que un año en Venus (225 días terrestres).' },
  { id: 'a2', tipo: 'dato', categoria: 'astronomia', texto: 'La luz del Sol tarda unos 8 minutos y 20 segundos en llegar a la Tierra.' },
  { id: 'a3', tipo: 'quiz', categoria: 'astronomia', pregunta: '¿Cuál es el planeta más grande del sistema solar?', opciones: ['Saturno', 'Júpiter', 'Neptuno', 'Urano'], indiceCorrecto: 1 },
  { id: 'a4', tipo: 'dato', categoria: 'astronomia', texto: 'Hay más estrellas en el universo observable que granos de arena en todas las playas de la Tierra.' },
  { id: 'a5', tipo: 'quiz', categoria: 'astronomia', pregunta: '¿Cómo se llama la galaxia donde está la Tierra?', opciones: ['Andrómeda', 'Vía Láctea', 'Triángulo', 'Sombrero'], indiceCorrecto: 1 },
  { id: 'a6', tipo: 'acertijo', categoria: 'astronomia', pregunta: 'Soy el único planeta que no lleva el nombre de un dios grecorromano. ¿Quién soy?', respuesta: 'La Tierra.' },

  // --- Ingeniería ---
  { id: 'i1', tipo: 'dato', categoria: 'ingenieria', texto: 'La Torre Eiffel se hace unos 15 cm más alta en verano porque el hierro se dilata con el calor.' },
  { id: 'i2', tipo: 'quiz', categoria: 'ingenieria', pregunta: '¿Qué material se usa como refuerzo principal en el concreto armado?', opciones: ['Aluminio', 'Acero', 'Cobre', 'Fibra de vidrio'], indiceCorrecto: 1 },
  { id: 'i3', tipo: 'dato', categoria: 'ingenieria', texto: 'Un avión Boeing 747 tiene alrededor de 6 millones de piezas.' },
  { id: 'i4', tipo: 'acertijo', categoria: 'ingenieria', pregunta: 'Tengo dientes pero no muerdo, y hago girar todo lo que toco. ¿Qué soy?', respuesta: 'Un engrane (engranaje).' },
  { id: 'i5', tipo: 'dato', categoria: 'ingenieria', texto: 'Los puentes colgantes se diseñan para moverse: cierta flexibilidad los hace más resistentes al viento y los sismos.' },

  // --- Matemáticas ---
  { id: 'm1', tipo: 'dato', categoria: 'matematicas', texto: 'El número π tiene infinitos decimales y nunca se repite en un patrón.' },
  { id: 'm2', tipo: 'quiz', categoria: 'matematicas', pregunta: '¿Cuánto es 7 al cuadrado?', opciones: ['42', '49', '56', '36'], indiceCorrecto: 1 },
  { id: 'm3', tipo: 'acertijo', categoria: 'matematicas', pregunta: 'Soy un número: si me sumas a mí mismo obtienes lo mismo que si te multiplicas por mí. ¿Qué número soy?', respuesta: 'El 2 (2+2=4 y 2×2=4).' },
  { id: 'm4', tipo: 'dato', categoria: 'matematicas', texto: 'Cero no es ni positivo ni negativo, pero sí es un número par.' },
  { id: 'm5', tipo: 'quiz', categoria: 'matematicas', pregunta: '¿Cuál es la suma de los ángulos internos de un triángulo?', opciones: ['90°', '180°', '270°', '360°'], indiceCorrecto: 1 },

  // --- Física ---
  { id: 'f1', tipo: 'dato', categoria: 'fisica', texto: 'La velocidad de la luz en el vacío es de aproximadamente 299,792 km por segundo.' },
  { id: 'f2', tipo: 'quiz', categoria: 'fisica', pregunta: '¿Qué unidad se usa para medir la fuerza?', opciones: ['Watt', 'Joule', 'Newton', 'Pascal'], indiceCorrecto: 2 },
  { id: 'f3', tipo: 'dato', categoria: 'fisica', texto: 'En el espacio no hay fricción con el aire, por eso una nave puede seguir moviéndose sin motor encendido.' },
  { id: 'f4', tipo: 'acertijo', categoria: 'fisica', pregunta: 'Cuanto más me quitas, más grande me hago. ¿Qué soy?', respuesta: 'Un agujero.' },
  { id: 'f5', tipo: 'dato', categoria: 'fisica', texto: 'El sonido viaja unas 4 veces más rápido en el agua que en el aire.' },

  // --- Literatura ---
  { id: 'l1', tipo: 'dato', categoria: 'literatura', texto: '"Don Quijote de la Mancha" es el libro más traducido después de la Biblia.' },
  { id: 'l2', tipo: 'quiz', categoria: 'literatura', pregunta: '¿Quién escribió "Cien años de soledad"?', opciones: ['Julio Cortázar', 'Gabriel García Márquez', 'Mario Vargas Llosa', 'Jorge Luis Borges'], indiceCorrecto: 1 },
  { id: 'l3', tipo: 'dato', categoria: 'literatura', texto: 'Shakespeare inventó o popularizó más de 1,700 palabras que hoy usamos en inglés.' },
  { id: 'l4', tipo: 'acertijo', categoria: 'literatura', pregunta: 'Tengo hojas pero no soy árbol, tengo lomo pero no soy animal. ¿Qué soy?', respuesta: 'Un libro.' },

  // --- Biología ---
  { id: 'b1', tipo: 'dato', categoria: 'biologia', texto: 'El corazón humano late aproximadamente 100,000 veces al día.' },
  { id: 'b2', tipo: 'quiz', categoria: 'biologia', pregunta: '¿Cuál es el hueso más largo del cuerpo humano?', opciones: ['Húmero', 'Tibia', 'Fémur', 'Radio'], indiceCorrecto: 2 },
  { id: 'b3', tipo: 'dato', categoria: 'biologia', texto: 'Los músculos no crecen durante el entrenamiento: crecen durante el descanso, cuando se reparan.' },
  { id: 'b4', tipo: 'dato', categoria: 'biologia', texto: 'El músculo más fuerte del cuerpo en relación a su tamaño es el masetero (el de la mandíbula).' },

  // --- Historia ---
  { id: 'h1', tipo: 'dato', categoria: 'historia', texto: 'Las pirámides de Guiza son más antiguas respecto a Cleopatra de lo que Cleopatra lo es respecto a hoy.' },
  { id: 'h2', tipo: 'quiz', categoria: 'historia', pregunta: '¿En qué año llegó el ser humano a la Luna por primera vez?', opciones: ['1965', '1969', '1972', '1959'], indiceCorrecto: 1 },
  { id: 'h3', tipo: 'dato', categoria: 'historia', texto: 'La Gran Muralla China no se puede ver a simple vista desde el espacio, a pesar del mito popular.' }
];

export function obtenerTriviaAleatoria(excluirId?: string): TriviaItem {
  const disponibles = excluirId ? BANCO_TRIVIA.filter((t) => t.id !== excluirId) : BANCO_TRIVIA;
  const indice = Math.floor(Math.random() * disponibles.length);
  return disponibles[indice];
}
