/**
 * AppError
 * --------
 * Error "esperado" con un statusCode HTTP asociado (400, 401, 404, 409...).
 * Los controllers hacen `throw new AppError(404, 'mensaje')` y el
 * errorHandler centralizado (middlewares/errorHandler.middleware.ts) lo
 * traduce directamente a la respuesta HTTP correcta, sin try/catch repetido
 * en cada controller.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly esOperacional: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.esOperacional = true; // distingue "error de negocio esperado" de un bug real
    Error.captureStackTrace(this, this.constructor);
  }
}
