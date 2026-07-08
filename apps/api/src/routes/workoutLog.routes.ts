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
// IMPORTANTE: esta ruta va ANTES de "/:id" — si no, Express interpretaría
// "progreso" como el valor del parámetro :id y nunca llegaría acá.
router.get('/progreso/:ejercicioId', obtenerProgresoEjercicio);
router.get('/:id', obtenerSesion);

export default router;
