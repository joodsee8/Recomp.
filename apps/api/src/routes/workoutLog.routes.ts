import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  crearSesion,
  listarHistorial,
  obtenerSesion,
  obtenerProgresoEjercicio,
  eliminarSesion
} from '../controllers/workoutLog.controller';

const router = Router();

router.use(requireAuth);

router.post('/', crearSesion);
router.get('/', listarHistorial);
router.get('/progreso/:ejercicioId', obtenerProgresoEjercicio);
router.get('/:id', obtenerSesion);
router.delete('/:id', eliminarSesion);

export default router;
