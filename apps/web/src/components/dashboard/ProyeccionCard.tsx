import './ProyeccionCard.css';

/**
 * ProyeccionCard
 * --------------
 * ANTES esta tarjeta mostraba números de ejemplo (peso/grasa/semanas)
 * dressed up como si fueran reales, con solo un badge chico "Estimado" —
 * confundía, porque parecían datos de verdad. Se cambió a propósito: NO
 * muestra ningún número inventado. Hasta que exista un modelo real de
 * peso corporal (WeightLog) + un endpoint de proyección en el backend, la
 * tarjeta dice honestamente que todavía no está disponible, en vez de
 * simular que sí lo está.
 */
export function ProyeccionCard() {
  return (
    <div className="tarjeta proyeccion-card proyeccion-card--pendiente">
      <div className="proyeccion-card-encabezado">
        <h3>Proyección al objetivo</h3>
        <span className="proyeccion-card-badge">Próximamente</span>
      </div>

      <p className="proyeccion-card-nota">
        Esta tarjeta va a mostrar tu peso, % de grasa estimado y cuánto te falta para tu objetivo, calculado por la IA
        a partir de tu progreso real. Todavía no existe un registro de peso corporal en la app — cuando lo agreguemos,
        esta sección se activa con tus datos reales, no antes.
      </p>
    </div>
  );
}
