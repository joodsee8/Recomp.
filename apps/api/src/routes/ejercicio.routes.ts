import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { listarEjercicios, obtenerEjercicio } from '../controllers/ejercicio.controller';

const router = Router();

router.use(requireAuth);

router.get('/', listarEjercicios);
router.get('/:ejercicioId', obtenerEjercicio);

export default router;
