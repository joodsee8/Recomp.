import { useState } from 'react';
import { obtenerTriviaAleatoria, type TriviaItem } from '../../data/trivia';
import './TriviaDuranteDescanso.css';

const ETIQUETA_CATEGORIA: Record<TriviaItem['categoria'], string> = {
  astronomia: 'Astronomía',
  ingenieria: 'Ingeniería',
  matematicas: 'Matemáticas',
  fisica: 'Física',
  literatura: 'Literatura',
  biologia: 'Biología',
  historia: 'Historia'
};

export function TriviaDuranteDescanso() {
  const [item, setItem] = useState<TriviaItem>(() => obtenerTriviaAleatoria());
  const [revelado, setRevelado] = useState(false);
  const [opcionElegida, setOpcionElegida] = useState<number | null>(null);

  function siguienteTrivia() {
    setItem((actual) => obtenerTriviaAleatoria(actual.id));
    setRevelado(false);
    setOpcionElegida(null);
  }

  return (
    <div className="trivia">
      <div className="trivia-encabezado">
        <span className="trivia-categoria">{ETIQUETA_CATEGORIA[item.categoria]}</span>
        <button className="trivia-otro" onClick={siguienteTrivia}>
          Otro ↻
        </button>
      </div>

      {item.tipo === 'dato' && <p className="trivia-texto">{item.texto}</p>}

      {item.tipo === 'acertijo' && (
        <div>
          <p className="trivia-texto">{item.pregunta}</p>
          {revelado ? (
            <p className="trivia-respuesta">{item.respuesta}</p>
          ) : (
            <button className="boton trivia-boton-revelar" onClick={() => setRevelado(true)}>
              Ver respuesta
            </button>
          )}
        </div>
      )}

      {item.tipo === 'quiz' && (
        <div>
          <p className="trivia-texto">{item.pregunta}</p>
          <div className="trivia-opciones">
            {item.opciones.map((opcion, i) => {
              const esCorrecta = i === item.indiceCorrecto;
              const claseEstado =
                opcionElegida == null
                  ? ''
                  : esCorrecta
                    ? ' trivia-opcion--correcta'
                    : i === opcionElegida
                      ? ' trivia-opcion--incorrecta'
                      : '';
              return (
                <button
                  key={i}
                  className={`trivia-opcion${claseEstado}`}
                  disabled={opcionElegida != null}
                  onClick={() => setOpcionElegida(i)}
                >
                  {opcion}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
