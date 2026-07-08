import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * asyncHandler
 * ------------
 * Express no atrapa rechazos de promesas en handlers async por sí solo: si
 * un `await` truena dentro de un controller y no hay try/catch, la promesa
 * queda colgada y el request nunca responde. Envolver cada controller con
 * esto reenvía cualquier excepción a `next(error)`, donde la agarra
 * errorHandler.middleware.ts.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
}
