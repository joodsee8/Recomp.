// Aumenta el tipo Request de Express para que TypeScript sepa que
// requireAuth (middlewares/auth.middleware.ts) le agrega `userId`.
// Sin este archivo, `req.userId` marcaría error de tipos en cada controller.
import 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};
