import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  crearSesion,
  listarHistorial,
  obtenerSesion,
  obtenerProgresoEjercicio
} from '../controllers/workoutLog.controller';

const router = Router();

router.use(requireAuth);

router.post('/', crearSesion);
router.get('/', listarHistorial);
router.get('/progreso/:ejercicioId', obtenerProgresoEjercicio);
router.get('/:id', obtenerSesion);

export default router;
